import React from "react";
import { Leaf, UtensilsCrossed, CakeSlice } from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  entree: <Leaf className="w-3.5 h-3.5 text-muted-foreground" />,
  plat: <UtensilsCrossed className="w-3.5 h-3.5 text-muted-foreground" />,
  dessert: <CakeSlice className="w-3.5 h-3.5 text-muted-foreground" />,
};

export function getCategoryIcon(category: string): React.ReactNode {
  const key = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return CATEGORY_ICONS[key] ?? null;
}
