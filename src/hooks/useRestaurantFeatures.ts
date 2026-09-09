import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RestaurantFeatures {
  id: string;
  restaurant_id: string;
  reviews_enabled: boolean;
  google_review_url: string | null;
  reviews_threshold: number;
  reviews_prompt: string | null;
  loyalty_enabled: boolean;
  popups_enabled: boolean;
  daily_menu_enabled: boolean;
  allergens_enabled: boolean;
  diet_profiles_enabled: boolean;
  pick_for_me_enabled: boolean;
  top_dishes_enabled: boolean;
  trending_enabled: boolean;
}

export const defaultFeatures = (restaurantId: string): RestaurantFeatures => ({
  id: "",
  restaurant_id: restaurantId,
  reviews_enabled: false,
  google_review_url: null,
  reviews_threshold: 4,
  reviews_prompt: null,
  loyalty_enabled: false,
  popups_enabled: false,
  daily_menu_enabled: false,
  allergens_enabled: false,
  diet_profiles_enabled: false,
  pick_for_me_enabled: false,
  top_dishes_enabled: false,
  trending_enabled: false,
});

export const useRestaurantFeatures = (restaurantId?: string | null) => {
  return useQuery({
    queryKey: ["restaurant-features", restaurantId],
    enabled: !!restaurantId,
    queryFn: async (): Promise<RestaurantFeatures> => {
      const { data, error } = await supabase
        .from("restaurant_features")
        .select("*")
        .eq("restaurant_id", restaurantId!)
        .maybeSingle();
      if (error) throw error;
      return (data as RestaurantFeatures) ?? defaultFeatures(restaurantId!);
    },
  });
};

export const useSaveRestaurantFeatures = (restaurantId?: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<RestaurantFeatures>) => {
      if (!restaurantId) throw new Error("Restaurant manquant");
      const { data, error } = await supabase
        .from("restaurant_features")
        .upsert(
          { restaurant_id: restaurantId, ...patch },
          { onConflict: "restaurant_id" }
        )
        .select()
        .single();
      if (error) throw error;
      return data as RestaurantFeatures;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["restaurant-features", restaurantId], data);
    },
  });
};
