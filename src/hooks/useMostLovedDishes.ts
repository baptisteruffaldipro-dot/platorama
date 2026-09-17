import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMostLovedDishes = (restaurantId?: string | null) => {
  return useQuery({
    queryKey: ["most-loved-dishes", restaurantId],
    enabled: Boolean(restaurantId),
    queryFn: async (): Promise<string[]> => {
      if (!restaurantId) return [];
      const { data, error } = await supabase.rpc("get_most_loved_dish_ids", {
        _restaurant_id: restaurantId,
      });

      if (error) throw error;
      return data?.map(({ dish_id }) => dish_id) ?? [];
    },
    staleTime: 60_000,
  });
};