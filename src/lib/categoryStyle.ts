const CATEGORY_MAP: Record<string, { hsl: string }> = {
  entree: { hsl: "142 40% 45%" },
  plat: { hsl: "38 50% 50%" },
  dessert: { hsl: "340 45% 55%" },
};

export function getCategoryStyle(category: string) {
  const key = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return CATEGORY_MAP[key] ?? { hsl: "38 50% 50%" };
}
