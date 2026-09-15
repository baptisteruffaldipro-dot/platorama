import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface FormulaItem {
  label: string;
  price: string;
}

export type SplashStyle = "logo_text" | "text" | "logo";

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
  splash_style: SplashStyle;
  splash_bg_color: string;
  is_draft: boolean;
  restaurant_id?: string | null;
  formulas: FormulaItem[];
  template_id: string;
  custom_font_name: string;
  custom_font_url: string;
  custom_font_name_2: string;
  custom_font_url_2: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  background_color: "#0d0d0d",
  text_color: "#ece5d5",
  heading_font: "Cormorant Garamond",
  body_font: "Cormorant Garamond",
  button_bg_color: "#b8943e",
  button_text_color: "#ece5d5",
  logo_url: "",
  restaurant_name: "",
  subtitle: "",
  splash_style: "logo_text",
  splash_bg_color: "",
  is_draft: false,
  formulas: [],
  template_id: "dark-luxe",
  custom_font_name: "",
  custom_font_url: "",
  custom_font_name_2: "",
  custom_font_url_2: "",
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

function parseRow(row: any): SiteSettings {
  return {
    ...row,
    formulas: Array.isArray(row.formulas) ? row.formulas : [],
    template_id: row.template_id || "dark-luxe",
    splash_style: (row.splash_style || "logo_text") as SplashStyle,
    splash_bg_color: row.splash_bg_color || "",
    custom_font_name: row.custom_font_name || "",
    custom_font_url: row.custom_font_url || "",
    custom_font_name_2: row.custom_font_name_2 || "",
    custom_font_url_2: row.custom_font_url_2 || "",
  } as SiteSettings;
}

function toDbPayload(settings: Omit<SiteSettings, "is_draft" | "id">, isDraft: boolean, restaurantId: string) {
  const { formulas, ...rest } = settings;
  return {
    ...rest,
    formulas: formulas as unknown as Json,
    is_draft: isDraft,
    restaurant_id: restaurantId,
  };
}

/** Fetch published settings (public) */
export function usePublishedSettings(restaurantId?: string | null) {
  return useQuery({
    queryKey: ["site-settings", "published", restaurantId ?? "unscoped"],
    queryFn: async () => {
      if (!restaurantId) return DEFAULT_SETTINGS;

      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("is_draft", false)
        .eq("restaurant_id", restaurantId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data ? parseRow(data) : DEFAULT_SETTINGS;
    },
  });
}

/** Fetch draft settings (admin only) */
export function useDraftSettings(restaurantId?: string | null) {
  return useQuery({
    queryKey: ["site-settings", "draft", restaurantId ?? "unscoped"],
    queryFn: async () => {
      if (!restaurantId) return null;

      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("is_draft", true)
        .eq("restaurant_id", restaurantId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data ? parseRow(data) : null;
    },
  });
}

/** Save draft */
export function useSaveDraft(restaurantId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Omit<SiteSettings, "is_draft" | "id">) => {
      if (!restaurantId) throw new Error("Restaurant context is required to save settings.");

      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("is_draft", true)
        .eq("restaurant_id", restaurantId)
        .limit(1)
        .maybeSingle();

      const payload = toDbPayload(settings, true, restaurantId);

      if (existing) {
        const { error } = await supabase.from("site_settings").update(payload).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_settings").insert(payload);
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
      if (!restaurantId) throw new Error("Restaurant context is required to publish settings.");

      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("is_draft", false)
        .eq("restaurant_id", restaurantId)
        .limit(1)
        .maybeSingle();

      const payload = toDbPayload(settings, false, restaurantId);

      if (existing) {
        const { error } = await supabase.from("site_settings").update(payload).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_settings").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-settings"] }),
  });
}
