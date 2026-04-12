const CATEGORY_MAP: Record<string, { hsl: string; label: string }> = {
  entrée: { hsl: "var(--category-entree)", label: "Entrée" },
  entree: { hsl: "var(--category-entree)", label: "Entrée" },
  plat: { hsl: "var(--category-plat)", label: "Plat" },
  dessert: { hsl: "var(--category-dessert)", label: "Dessert" },
};

export function getCategoryStyle(category: string) {
  const key = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return CATEGORY_MAP[key] ?? { hsl: "var(--category-plat)", label: category };
}
