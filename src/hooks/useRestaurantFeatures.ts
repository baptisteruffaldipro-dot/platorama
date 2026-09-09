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
  loyalty_points_per_visit: number;
  loyalty_reward_threshold: number;
  loyalty_welcome_text: string | null;
  loyalty_program_name: string | null;
  popups_enabled: boolean;
  daily_menu_enabled: boolean;
  allergens_enabled: boolean;
  diet_profiles_enabled: boolean;
  pick_for_me_enabled: boolean;
  top_dishes_enabled: boolean;
  trending_enabled: boolean;
  crm_enabled: boolean;
  crm_sender_name: string | null;
  crm_sender_email: string | null;
}

export const defaultFeatures = (restaurantId: string): RestaurantFeatures => ({
  id: "",
  restaurant_id: restaurantId,
  reviews_enabled: false,
  google_review_url: null,
  reviews_threshold: 4,
  reviews_prompt: null,
  loyalty_enabled: false,
  loyalty_points_per_visit: 1,
  loyalty_reward_threshold: 10,
  loyalty_welcome_text: null,
  loyalty_program_name: null,
  popups_enabled: false,
  daily_menu_enabled: false,
  allergens_enabled: false,
  diet_profiles_enabled: false,
  pick_for_me_enabled: false,
  top_dishes_enabled: false,
  trending_enabled: false,
  crm_enabled: false,
  crm_sender_name: null,
  crm_sender_email: null,
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
