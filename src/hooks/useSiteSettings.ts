import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  id?: string;
  background_color: string;
  text_color: string;
  heading_font: string;
  body_font: string;
  button_bg_color: string;
  button_text_color: string;
  logo_url: string;
  restaurant_name: string;
  subtitle: string;
  is_draft: boolean;
  restaurant_id?: string | null;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  background_color: "#0d0d0d",
  text_color: "#ece5d5",
  heading_font: "Cormorant Garamond",
  body_font: "Cormorant Garamond",
  button_bg_color: "#b8943e",
  button_text_color: "#ece5d5",
  logo_url: "",
  restaurant_name: "La Maison",
  subtitle: "Menu Virtuel",
  is_draft: false,
};

export const FONT_OPTIONS = [
  "Cormorant Garamond",
  "Playfair Display",
  "Lora",
  "Merriweather",
  "Libre Baskerville",
  "EB Garamond",
  "Crimson Text",
  "Inter",
  "Montserrat",
  "Raleway",
  "Poppins",
  "Roboto",
];

/** Fetch published settings (public) */
export function usePublishedSettings(restaurantId?: string | null) {
  return useQuery({
    queryKey: ["site-settings", "published", restaurantId ?? "unscoped"],
    queryFn: async () => {
      if (!restaurantId) {
        return DEFAULT_SETTINGS;
      }

      let query = supabase
        .from("site_settings")
        .select("*")
        .eq("is_draft", false)
        .order("updated_at", { ascending: false })
        .limit(1);

      query = query.eq("restaurant_id", restaurantId);

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return (data as SiteSettings | null) ?? DEFAULT_SETTINGS;
    },
  });
}

/** Fetch draft settings (admin only) */
export function useDraftSettings(restaurantId?: string | null) {
  return useQuery({
    queryKey: ["site-settings", "draft", restaurantId ?? "unscoped"],
    queryFn: async () => {
      if (!restaurantId) {
        return null;
      }

      let query = supabase
        .from("site_settings")
        .select("*")
        .eq("is_draft", true)
        .order("updated_at", { ascending: false })
        .limit(1);

      query = query.eq("restaurant_id", restaurantId);

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return (data as SiteSettings | null) ?? null;
    },
  });
}

/** Save draft */
export function useSaveDraft(restaurantId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Omit<SiteSettings, "is_draft" | "id">) => {
      if (!restaurantId) {
        throw new Error("Restaurant context is required to save settings.");
      }

      let query = supabase
        .from("site_settings")
        .select("id")
        .eq("is_draft", true)
        .eq("restaurant_id", restaurantId)
        .limit(1);

      const { data: existing } = await query.maybeSingle();

      const payload = { ...settings, is_draft: true, restaurant_id: restaurantId };

      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-settings"] }),
  });
}

/** Publish: copy draft to published row */
export function usePublishSettings(restaurantId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Omit<SiteSettings, "is_draft" | "id">) => {
      if (!restaurantId) {
        throw new Error("Restaurant context is required to publish settings.");
      }

      let query = supabase
        .from("site_settings")
        .select("id")
        .eq("is_draft", false)
        .eq("restaurant_id", restaurantId)
        .limit(1);

      const { data: existing } = await query.maybeSingle();

      const payload = { ...settings, is_draft: false, restaurant_id: restaurantId };

      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-settings"] }),
  });
}
