import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Box,
  Hand,
  X,
  Utensils,
  UtensilsCrossed,
  Soup,
  IceCreamCone,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import ExpandableDescription from "@/components/ExpandableDescription";
import { hasARModel } from "@/lib/dishHasAR";
import type { Dish } from "@/hooks/useDishes";
import { getBadge, BadgeMark } from "@/lib/badges";
import DishDetailsActions from "@/components/DishDetailsActions";

interface Props {
  dishes: Dish[];
  activeIndex: number;
  onSelect: (i: number) => void;
  onLaunchAR: (d: Dish) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  restaurantId: string;
}

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** Icône de la barre de catégories, façon maquette (couverts / plat / glace). */
function categoryIcon(cat: string) {
  const key = normalize(cat);
  if (key.startsWith("entree")) return UtensilsCrossed;
  if (key.startsWith("dessert")) return IceCreamCone;
  if (key.startsWith("plat")) return Soup;
  return Utensils;
}


/**
 * Layout "Carte Test" — inspiré de la maquette Figma :
 * photo ronde plein cadre avec repère RA, flèches circulaires,
 * typo sans-serif affirmée, prix doré, bouton pilule doré lumineux,
 * actions Infos / Allergènes, pastilles de progression et barre
 * de catégories en bas.
 */
export default function AmrCardView({
  dishes,
  activeIndex,
  onSelect,
  onLaunchAR,
  isFavorite,
  onToggleFavorite,
  restaurantId,
}: Props) {
  const { t } = useTranslation();
  const dish = dishes[activeIndex];
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const key = `ar_hint_v2_${restaurantId}`;
    if (!localStorage.getItem(key)) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        localStorage.setItem(key, "1");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [restaurantId]);

  // Catégories dans l'ordre d'apparition
  const categories = useMemo(() => {
    const seen: string[] = [];
    dishes.forEach((d) => {
      if (!seen.some((c) => normalize(c) === normalize(d.category))) seen.push(d.category);
    });
    return seen;
  }, [dishes]);

  const sameCategory = useMemo(
    () =>
      dishes
        .map((d, i) => ({ d, i }))
        .filter(({ d }) => normalize(d.category) === normalize(dish.category)),
    [dishes, dish.category]
  );

  const posInCategory = sameCategory.findIndex(({ i }) => i === activeIndex);

  const prev = () => onSelect((activeIndex - 1 + dishes.length) % dishes.length);
  const next = () => onSelect((activeIndex + 1) % dishes.length);

  const handleAR = () => {
    setShowTooltip(false);
    onLaunchAR(dish);
  };

  const arrowCls =
    "absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border border-foreground/20 flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-foreground/40 transition-colors active:scale-90 z-20";

  return (
    <div
      className="h-full flex flex-col relative z-10 overflow-hidden"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* ─── Photo ronde + flèches ─── */}
      <div className="relative flex justify-center pt-7 shrink-0">
        <button onClick={prev} aria-label="Plat précédent" className={`${arrowCls} left-3`}>
          <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
        </button>

        <div className="relative w-[66vw] h-[66vw] max-w-[300px] max-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full h-full rounded-full overflow-hidden"
              style={{ boxShadow: "0 30px 60px -20px hsl(0 0% 0% / 0.85)" }}
            >
              {dish.thumbnail ? (
                <img
                  src={dish.thumbnail}
                  alt={t(dish.name)}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm bg-card">
                  {t(dish.name)}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Repère RA au centre */}
          {hasARModel(dish) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <span className="absolute inset-0 rounded-lg border border-foreground/70 [clip-path:polygon(0_0,34%_0,34%_6%,6%_6%,6%_34%,0_34%,0_66%,6%_66%,6%_94%,34%_94%,34%_100%,0_100%,100%_100%,66%_100%,66%_94%,94%_94%,94%_66%,100%_66%,100%_34%,94%_34%,94%_6%,66%_6%,66%_0,100%_0)]" />
                <Box className="w-5 h-5 text-foreground/90" strokeWidth={1.5} />
              </div>
            </div>
          )}
        </div>

        <button onClick={next} aria-label="Plat suivant" className={`${arrowCls} right-3`}>
          <ChevronRight className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </div>

      {/* ─── Infos plat ─── */}
      <div className="flex-1 min-h-0 flex flex-col px-6 pt-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={dish.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center text-center overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center gap-2.5 mb-3 shrink-0">
              <span className="tracking-[0.28em] uppercase text-[12px] font-medium text-accent">
                {t(dish.category)}
              </span>
              {getBadge(dish.badge) && (
                <>
                  <span className="text-foreground/30 text-[13px]">•</span>
                  {getBadge(dish.badge)!.image ? (
                    <BadgeMark badge={getBadge(dish.badge)!} className="h-5" />
                  ) : (
                    <span className="text-foreground/70 text-[15px]">{t(getBadge(dish.badge)!.label)}</span>
                  )}
                </>
              )}
            </div>

            <div className="relative w-full shrink-0">
              <h1 className="font-sans text-[32px] leading-[1.12] font-bold tracking-[-0.01em] text-foreground px-8">
                {t(dish.name)}
              </h1>
              <button
                onClick={() => onToggleFavorite(dish.id)}
                className="absolute right-0 top-1 transition-transform active:scale-90"
                aria-label={isFavorite(dish.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    isFavorite(dish.id) ? "fill-accent text-accent" : "text-foreground/50"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
            </div>

            <p className="font-sans text-[30px] font-bold text-accent tabular-nums mt-3 mb-4 shrink-0">
              {dish.price.toFixed(2).replace(/\.00$/, "")}€
            </p>

            <ExpandableDescription lines={2} className="font-sans text-[17px] text-foreground/55 leading-[1.75] max-w-[320px] text-center">
              {t(dish.ingredients)}
            </ExpandableDescription>
          </motion.div>
        </AnimatePresence>

        {/* ─── CTA + actions ─── */}
        <div className="mt-auto pt-6 shrink-0">
          {hasARModel(dish) && (
            <div className="relative w-full max-w-sm mx-auto">
              {showTooltip && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
                  <div className="relative bg-foreground text-background px-4 py-2.5 rounded-xl shadow-2xl max-w-[260px]">
                    <button
                      onClick={() => setShowTooltip(false)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg"
                      aria-label="Fermer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-start gap-2">
                      <Hand className="w-4 h-4 mt-0.5 shrink-0 animate-bounce" />
                      <p className="text-xs font-medium leading-snug font-sans">
                        {t("Astuce : touchez ce bouton pour visualiser le plat sur votre table en réalité augmentée !")}
                      </p>
                    </div>
                    <div
                      className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45"
                      style={{ background: "hsl(var(--foreground))" }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleAR}
                className="relative w-full rounded-full py-[18px] animate-ar-glow transition-transform duration-300 active:scale-[0.97]"
                style={{ background: "hsl(43 88% 55%)" }}
              >
                <span
                  className="flex items-center justify-center gap-3 font-sans text-[19px] font-medium"
                  style={{ color: "hsl(30 45% 14%)" }}
                >
                  <Box className="w-[22px] h-[22px]" strokeWidth={1.75} />
                  {t("Projeter sur ma table")}
                </span>
              </button>
            </div>
          )}

          <DishDetailsActions dish={dish} className="mt-5 justify-center" />

          {/* Pastilles de progression dans la catégorie */}
          <div className="flex justify-center items-center gap-2 mt-5">
            {sameCategory.map(({ i }, k) => (
              <button
                key={i}
                onClick={() => onSelect(i)}
                aria-label={`Plat ${k + 1}`}
                className={`h-2 rounded-full transition-all ${
                  k === posInCategory ? "w-7 bg-accent" : "w-2 bg-foreground/25"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ─── Barre de catégories ─── */}
        <div className="shrink-0 border-t border-foreground/10 mt-5 pt-3 pb-safe">
          <div className="flex items-center justify-around gap-2 pb-2">
            {categories.map((cat) => {
              const active = normalize(cat) === normalize(dish.category);
              const firstIdx = dishes.findIndex((d) => normalize(d.category) === normalize(cat));
              const Icon = categoryIcon(cat);
              return (
                <button
                  key={cat}
                  onClick={() => onSelect(firstIdx)}
                  className={`flex flex-col items-center gap-1 px-7 py-2 rounded-full font-sans text-[14px] transition-colors ${
                    active ? "font-medium" : "text-foreground/45"
                  }`}
                  style={
                    active
                      ? { background: "hsl(43 88% 55%)", color: "hsl(30 45% 14%)" }
                      : undefined
                  }
                >
                  <Icon className="w-[22px] h-[22px]" strokeWidth={1.4} />
                  <span>{t(cat)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
