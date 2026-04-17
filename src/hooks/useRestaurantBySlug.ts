import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RestaurantLite {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export const useRestaurantBySlug = (slug?: string | null) => {
  return useQuery({
    queryKey: ["restaurant-by-slug", slug],
    enabled: !!slug,
    queryFn: async (): Promise<RestaurantLite | null> => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, slug, is_active")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data as RestaurantLite | null;
    },
  });
};
