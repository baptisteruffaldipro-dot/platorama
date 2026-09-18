import { useMemo, useState } from "react";
import { Heart, ImageOff, Rotate3d, Search, X } from "lucide-react";
import type { Dish } from "@/hooks/useDishes";
import { useTranslation } from "@/hooks/useTranslation";
import { hasARModel } from "@/lib/dishHasAR";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DishBadges from "@/components/DishBadges";
import DishDetailsActions from "@/components/DishDetailsActions";
import ExpandableDescription from "@/components/ExpandableDescription";
import { DisclaimerFooter } from "@/components/MenuDisclaimer";
import GoldEleganceDishSheet from "@/components/menu-views/GoldEleganceDishSheet";

interface Props {
  dishes: Dish[];
  onLaunchAR: (dish: Dish) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  disclaimer?: string;
}

export default function GoldEleganceView({
  dishes,
  onLaunchAR,
  isFavorite,
  onToggleFavorite,
  disclaimer,
}: Props) {
  const { t } = useTranslation();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = useMemo(() => [...new Set(dishes.map((dish) => dish.category).filter(Boolean))], [dishes]);
  const visibleDishes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return dishes.filter((dish) => {
      const matchesCategory = category === "all" || dish.category === category;
      const matchesQuery = !normalizedQuery || [dish.name, dish.ingredients, dish.category]
        .some((value) => value?.toLocaleLowerCase().includes(normalizedQuery));
      return matchesCategory && matchesQuery;
    });
  }, [category, dishes, query]);

  return (
    <div className="gold-elegance-theme h-full overflow-y-auto bg-background text-foreground">
      <div className="relative inset-x-0 px-4 pt-4 sm:px-8">
        <label className="relative block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("Rechercher un plat")}
            className="h-12 w-full rounded-lg border border-accent/25 bg-card px-11 text-sm text-card-foreground shadow-lg outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setQuery("")}
              className="absolute right-1 top-1 h-10 w-10 rounded-full text-muted-foreground"
              aria-label={t("Effacer la recherche")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </label>
      </div>


      <nav className="sticky top-0 z-20 border-b border-accent/15 bg-background/95 px-4 pb-3 pt-4 backdrop-blur-lg sm:px-8" aria-label={t("Catégories")}>
        <div className="no-scrollbar flex gap-2 overflow-x-auto py-1">
          <Button
            type="button"
            size="sm"
            variant={category === "all" ? "default" : "outline"}
            onClick={() => setCategory("all")}
            className="shrink-0 rounded-full px-5 font-semibold"
          >
            {t("Tous")}
          </Button>
          {categories.map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={category === item ? "default" : "outline"}
              onClick={() => setCategory(item)}
              className="shrink-0 rounded-full border-accent/30 px-5 font-semibold"
            >
              {t(item)}
            </Button>
          ))}
        </div>
      </nav>

      <main className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-x-3 gap-y-8 px-4 py-7 sm:gap-x-5 sm:px-8 sm:py-9">
        {visibleDishes.map((dish, dishIndex) => {
          return (
            <article key={dish.id} className="min-w-0">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setOpenIndex(dishIndex)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setOpenIndex(dishIndex);
                  }
                }}
                aria-label={t("Voir la fiche du plat")}
                className="relative aspect-[4/5] cursor-pointer overflow-hidden rounded-lg border border-accent/20 bg-card shadow-md transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {dish.thumbnail ? (
                  <img src={dish.thumbnail} alt={t(dish.name)} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
                    <ImageOff className="h-7 w-7" />
                    <span className="text-xs">{t("Photo à venir")}</span>
                  </div>
                )}


                <DishBadges dish={dish} className="absolute left-3 top-3 max-w-[70%]" prominent />
                <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleFavorite(dish.id);
                    }}
                    className="h-10 w-10 rounded-full border border-accent/20 bg-card/90 shadow-md backdrop-blur-sm"
                    aria-label={t("Ajouter aux favoris")}
                  >
                    <Heart className={cn("h-4 w-4", isFavorite(dish.id) && "fill-accent text-accent")} />
                  </Button>
                  {hasARModel(dish) && (
                    <Button
                      type="button"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        onLaunchAR(dish);
                      }}
                      className="h-10 w-10 rounded-full border border-accent/40 bg-primary text-accent shadow-lg"
                      aria-label={t("Voir en réalité augmentée")}
                    >
                      <Rotate3d className="h-4 w-4" />
                    </Button>
                  )}

                </div>
              </div>

              <div className="mt-4 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 flex-1 break-words text-[15px] font-semibold leading-snug sm:text-lg" style={{ fontFamily: "var(--font-serif)" }}>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(dishIndex)}
                      className="text-left hover:text-accent focus-visible:underline focus-visible:outline-none"
                    >
                      {t(dish.name)}
                    </button>
                  </h2>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-accent sm:text-base" style={{ fontFamily: "var(--font-serif)" }}>
                    {dish.price.toFixed(2)} €
                  </span>
                </div>
                {dish.ingredients && (
                  <ExpandableDescription lines={2} className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t(dish.ingredients)}
                  </ExpandableDescription>
                )}
                <DishDetailsActions dish={dish} className="mt-3" />
              </div>
            </article>
          );
        })}

        {!visibleDishes.length && (
          <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
            {t("Aucun plat ne correspond à votre recherche.")}
          </div>
        )}
      </main>

      <footer className="flex h-20 items-center justify-center gap-4" aria-hidden="true">
        <span className="h-px w-12 bg-accent/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="h-px w-12 bg-accent/40" />
      </footer>

      {openIndex !== null && visibleDishes[openIndex] && (
        <GoldEleganceDishSheet
          dishes={visibleDishes}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
          onLaunchAR={onLaunchAR}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </div>
  );
}