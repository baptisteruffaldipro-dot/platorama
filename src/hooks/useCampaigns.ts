import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Campaign {
  id: string;
  restaurant_id: string;
  channel: string;
  name: string;
  subject: string;
  body: string;
  image_url: string;
  cta_label: string;
  cta_url: string;
  target_lang: string | null;
  status: string;
  sent_count: number;
  failed_count: number;
  sent_at: string | null;
  error: string | null;
  created_at: string;
}

export interface MediaAsset {
  id: string;
  restaurant_id: string;
  label: string;
  url: string;
  storage_path: string | null;
  kind: string;
  created_at: string;
}

export const useCampaigns = (restaurantId?: string | null) =>
  useQuery({
    queryKey: ["campaigns", restaurantId],
    enabled: !!restaurantId,
    queryFn: async (): Promise<Campaign[]> => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("restaurant_id", restaurantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Campaign[];
    },
  });

export const useMediaAssets = (restaurantId?: string | null) =>
  useQuery({
    queryKey: ["media-assets", restaurantId],
    enabled: !!restaurantId,
    queryFn: async (): Promise<MediaAsset[]> => {
      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .eq("restaurant_id", restaurantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MediaAsset[];
    },
  });

/** Nombre de clients joignables par email (consentement en cours, non désinscrits). */
export const useEmailAudience = (restaurantId?: string | null, lang?: string | null) =>
  useQuery({
    queryKey: ["email-audience", restaurantId, lang ?? "all"],
    enabled: !!restaurantId,
    queryFn: async (): Promise<number> => {
      let query = supabase
        .from("loyalty_members")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId!)
        .eq("consent_email", true)
        .is("unsubscribed_at", null)
        .not("email", "is", null);
      if (lang) query = query.eq("lang", lang);
      const { count, error } = await query;
      if (error) throw error;
      return count ?? 0;
    },
  });

export const useInvalidateCampaigns = (restaurantId?: string | null) => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["campaigns", restaurantId] });
    qc.invalidateQueries({ queryKey: ["email-audience", restaurantId] });
  };
};
