import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMostLovedDishes = (dishIds: string[]) => {
  const stableIds = [...dishIds].sort();

  return useQuery({
    queryKey: ["most-loved-dishes", stableIds],
    enabled: stableIds.length > 0,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("dish_events")
        .select("dish_id")
        .eq("event_type", "favorite")
        .in("dish_id", stableIds);

      if (error) throw error;

      const counts = new Map<string, number>();
      data?.forEach(({ dish_id }) => counts.set(dish_id, (counts.get(dish_id) ?? 0) + 1));
      const highest = Math.max(0, ...counts.values());
      if (highest === 0) return [];

      return [...counts.entries()]
        .filter(([, count]) => count === highest)
        .map(([dishId]) => dishId);
    },
    staleTime: 60_000,
  });
};