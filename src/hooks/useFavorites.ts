import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "dish-favorites";

const readFavorites = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>(readFavorites);

  const toggle = useCallback((dishId: string) => {
    setFavorites((prev) => {
      const wasFavorite = prev.includes(dishId);
      const next = wasFavorite
        ? prev.filter((id) => id !== dishId)
        : [...prev, dishId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

      // Track "favorite" event only when adding
      if (!wasFavorite) {
        supabase
          .from("dish_events")
          .insert({ dish_id: dishId, event_type: "favorite" })
          .then();
      }

      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (dishId: string) => favorites.includes(dishId),
    [favorites]
  );

  return { favorites, toggle, isFavorite };
};
