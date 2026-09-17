import { useMemo, useState } from "react";
import { Box, Heart, ImageOff, Rotate3d, Search, X } from "lucide-react";
import type { Dish } from "@/hooks/useDishes";
import { useTranslation } from "@/hooks/useTranslation";
import { hasARModel } from "@/lib/dishHasAR";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DishBadges from "@/components/DishBadges";
import DishDetailsActions from "@/components/DishDetailsActions";
import DishViewer from "@/components/DishViewer";
import DishViewerErrorFallback from "@/components/DishViewerErrorFallback";
import ErrorBoundary from "@/components/ErrorBoundary";
import ExpandableDescription from "@/components/ExpandableDescription";

interface Props {
  dishes: Dish[];
  restaurantName?: string;
  subtitle?: string;
  logoUrl?: string;
  onLaunchAR: (dish: Dish) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

export default function GoldEleganceView({
  dishes,
  restaurantName,
  subtitle,
  logoUrl,
  onLaunchAR,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const { t } = useTranslation();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [viewerDishId, setViewerDishId] = useState<string | null>(null);

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

  const coverImage = dishes.find((dish) => dish.thumbnail)?.thumbnail;

  return (
    <div className="gold-elegance-theme h-full overflow-y-auto bg-background text-foreground">
      <section className="relative h-52 overflow-hidden border-b border-accent/20 sm:h-64">
        {coverImage ? (
          <img src={coverImage} alt="" className="h-full w-full object-cover opacity-70" />
        ) : (
          <div className="h-full w-full bg-secondary" />
        )}
        <div className="gold-elegance-cover absolute inset-0" />
        <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-4 sm:inset-x-8 sm:top-8">
          <div className="min-w-0 pt-2">
            <h1 className="break-words text-3xl font-semibold leading-tight text-primary sm:text-4xl" style={{ fontFamily: "var(--font-serif)" }}>
              {restaurantName || t("Notre carte")}
            </h1>
            {subtitle && <p className="mt-1 text-xs font-medium uppercase text-accent">{t(subtitle)}</p>}
          </div>
          {logoUrl && <img src={logoUrl} alt="" className="h-16 w-24 shrink-0 object-contain sm:h-20 sm:w-32" />}
        </div>

        <div className="absolute inset-x-4 bottom-0 translate-y-1/2 sm:inset-x-8">
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
      </section>

      <nav className="sticky top-0 z-20 border-b border-accent/15 bg-background/95 px-4 pb-3 pt-9 backdrop-blur-lg sm:px-8" aria-label={t("Catégories")}>
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

      <main className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-x-5 gap-y-9 px-4 py-7 sm:grid-cols-2 sm:px-8 sm:py-9">
        {visibleDishes.map((dish) => {
          const showViewer = viewerDishId === dish.id;
          return (
            <article key={dish.id} className="min-w-0">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-accent/20 bg-card shadow-md">
                {showViewer ? (
                  <ErrorBoundary fallback={<DishViewerErrorFallback dish={dish} />}>
                    <DishViewer dish={dish} />
                  </ErrorBoundary>
                ) : dish.thumbnail ? (
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
                    onClick={() => onToggleFavorite(dish.id)}
                    className="h-10 w-10 rounded-full border border-accent/20 bg-card/90 shadow-md backdrop-blur-sm"
                    aria-label={t("Ajouter aux favoris")}
                  >
                    <Heart className={cn("h-4 w-4", isFavorite(dish.id) && "fill-accent text-accent")} />
                  </Button>
                  {hasARModel(dish) && (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={() => setViewerDishId(showViewer ? null : dish.id)}
                        className="h-10 w-10 rounded-full border border-accent/30 bg-card/90 text-accent shadow-md backdrop-blur-sm"
                        aria-label={t(showViewer ? "Fermer la 3D" : "Voir en 3D")}
                      >
                        <Box className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => onLaunchAR(dish)}
                        className="h-10 w-10 rounded-full border border-accent/40 bg-primary text-accent shadow-lg"
                        aria-label={t("Voir en réalité augmentée")}
                      >
                        <Rotate3d className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 flex-1 break-words text-lg font-semibold leading-snug" style={{ fontFamily: "var(--font-serif)" }}>
                    {t(dish.name)}
                  </h2>
                  <span className="shrink-0 text-base font-semibold tabular-nums text-accent" style={{ fontFamily: "var(--font-serif)" }}>
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
    </div>
  );
}