import type { Dish } from "@/hooks/useDishes";

/**
 * Returns true when a dish has at least one 3D/AR model attached.
 * Used to conditionally hide AR buttons for dishes without a 3D asset.
 */
export function hasARModel(dish: Pick<Dish, "model_ios" | "model_android">): boolean {
  const ios = (dish.model_ios ?? "").trim();
  const android = (dish.model_android ?? "").trim();
  return ios.length > 0 || android.length > 0;
}
