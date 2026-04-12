import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Dish {
  id: string;
  category: string;
  name: string;
  ingredients: string;
  price: number;
  thumbnail: string;
  model_ios: string;
  model_android: string;
  sort_order: number;
  allergens: string[];
  chef_note: string;
  restaurant_id?: string | null;
}

export const useDishes = (restaurantId?: string | null) => {
  return useQuery({
    queryKey: ["dishes", restaurantId ?? "all"],
    queryFn: async (): Promise<Dish[]> => {
      let query = supabase
        .from("dishes")
        .select("*")
        .order("sort_order");

      if (restaurantId) {
        query = query.eq("restaurant_id", restaurantId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};
