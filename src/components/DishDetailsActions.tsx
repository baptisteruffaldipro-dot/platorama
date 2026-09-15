import { ChefHat, ShieldCheck } from "lucide-react";
import type { Dish } from "@/hooks/useDishes";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DishDetailsActionsProps {
  dish: Pick<Dish, "allergens" | "chef_note">;
  className?: string;
  contrast?: "default" | "inherit";
}

export default function DishDetailsActions({ dish, className, contrast = "default" }: DishDetailsActionsProps) {
  const { t } = useTranslation();
  const hasAllergens = Boolean(dish.allergens?.length);
  const hasChefNote = Boolean(dish.chef_note?.trim());

  if (!hasAllergens && !hasChefNote) return null;

  const buttonClass = cn(
    "h-7 w-7 rounded-full border p-0 shadow-none transition-colors active:scale-95",
    contrast === "inherit"
      ? "border-current/20 bg-transparent text-current hover:bg-current/10"
      : "border-border/70 bg-card/60 text-muted-foreground hover:border-accent hover:text-accent",
  );

  return (
    <div className={cn("flex items-center gap-1.5", className)} onClick={(event) => event.stopPropagation()}>
      {hasChefNote && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className={buttonClass} aria-label={t("Note du Chef")}>
              <ChefHat className="h-3.5 w-3.5" strokeWidth={1.7} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm border-border bg-card">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-2 text-center text-lg text-foreground">
                <ChefHat className="h-4 w-4 text-accent" />
                {t("Note du Chef")}
              </DialogTitle>
            </DialogHeader>
            <p className="pt-2 text-center text-sm italic leading-relaxed text-foreground">
              {t(dish.chef_note ?? "")}
            </p>
          </DialogContent>
        </Dialog>
      )}

      {hasAllergens && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className={buttonClass} aria-label={t("Allergènes")}>
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.7} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-center text-lg text-foreground">{t("Allergènes")}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {dish.allergens?.map((allergen) => (
                <span key={allergen} className="inline-flex items-center gap-1.5 rounded-full bg-secondary/50 px-3 py-1.5 text-sm text-foreground">
                  <ShieldCheck className="h-3 w-3 shrink-0 text-accent" />
                  {t(allergen)}
                </span>
              ))}
            </div>
            <p className="mt-3 text-center text-xs italic text-muted-foreground">
              {t("N'hésitez pas à informer votre serveur de toute allergie ou intolérance alimentaire.")}
            </p>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}