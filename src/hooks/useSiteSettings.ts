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
export function usePublishedSettings() {
  return useQuery({
    queryKey: ["site-settings", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("is_draft", false)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as SiteSettings | null) ?? DEFAULT_SETTINGS;
    },
  });
}

/** Fetch draft settings (admin only) */
export function useDraftSettings() {
  return useQuery({
    queryKey: ["site-settings", "draft"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("is_draft", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as SiteSettings | null) ?? null;
    },
  });
}

/** Save draft */
export function useSaveDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Omit<SiteSettings, "is_draft" | "id">) => {
      // Check if draft exists
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("is_draft", true)
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update({ ...settings, is_draft: true })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert({ ...settings, is_draft: true });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-settings"] }),
  });
}

/** Publish: copy draft to published row */
export function usePublishSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Omit<SiteSettings, "is_draft" | "id">) => {
      // Upsert published row
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("is_draft", false)
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update({ ...settings, is_draft: false })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert({ ...settings, is_draft: false });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-settings"] }),
  });
}
