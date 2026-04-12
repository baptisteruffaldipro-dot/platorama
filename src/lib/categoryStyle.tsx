import React from "react";
import { Leaf, UtensilsCrossed, CakeSlice } from "lucide-react";

export function getCategoryIcon(category: string, size = 14): React.ReactNode {
  const key = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cls = "text-muted-foreground";
  switch (key) {
    case "entree":
      return <Leaf size={size} className={cls} />;
    case "plat":
      return <UtensilsCrossed size={size} className={cls} />;
    case "dessert":
      return <CakeSlice size={size} className={cls} />;
    default:
      return null;
  }
}
