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
}

export const useDishes = () => {
  return useQuery({
    queryKey: ["dishes"],
    queryFn: async (): Promise<Dish[]> => {
      const { data, error } = await supabase
        .from("dishes")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
};
