import { useState, useCallback } from "react";

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
      const next = prev.includes(dishId)
        ? prev.filter((id) => id !== dishId)
        : [...prev, dishId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (dishId: string) => favorites.includes(dishId),
    [favorites]
  );

  return { favorites, toggle, isFavorite };
};
