import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Info, TriangleAlert, Box, Hand, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { hasARModel } from "@/lib/dishHasAR";
import type { Dish } from "@/hooks/useDishes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

/**
 * Layout "Carte AMR" — inspiré de la maquette Figma :
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
  const [openInfo, setOpenInfo] = useState(false);
  const [openAllergens, setOpenAllergens] = useState(false);

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
    "absolute top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-foreground/25 flex items-center justify-center text-foreground/70 hover:text-foreground hover:border-foreground/50 transition-colors active:scale-90 z-20 bg-background/20 backdrop-blur-sm";

  return (
    <div className="h-full flex flex-col relative z-10 overflow-hidden">
      {/* ─── Photo ronde + flèches ─── */}
      <div className="relative flex justify-center pt-6 shrink-0">
        <button onClick={prev} aria-label="Plat précédent" className={`${arrowCls} left-2`}>
          <ChevronLeft className="w-7 h-7" strokeWidth={1.5} />
        </button>

        <div className="relative w-[62vw] h-[62vw] max-w-[290px] max-h-[290px]">
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

        <button onClick={next} aria-label="Plat suivant" className={`${arrowCls} right-2`}>
          <ChevronRight className="w-7 h-7" strokeWidth={1.5} />
        </button>
      </div>

      {/* ─── Infos plat ─── */}
      <div className="flex-1 min-h-0 flex flex-col px-6 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={dish.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center text-center overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center gap-2 text-[11px] mb-2 shrink-0">
              <span className="tracking-[0.3em] uppercase text-foreground/80 font-medium">
                {t(dish.category)}
              </span>
              {dish.badge && (
                <>
                  <span className="text-accent">•</span>
                  <span className="text-foreground/60 text-[13px]">{t(dish.badge)}</span>
                </>
              )}
            </div>

            <div className="flex items-start justify-center gap-2 shrink-0">
              <h1 className="font-sans text-[28px] leading-tight font-bold text-foreground">
                {t(dish.name)}
              </h1>
              <button
                onClick={() => onToggleFavorite(dish.id)}
                className="transition-transform active:scale-90 shrink-0 mt-1"
                aria-label={isFavorite(dish.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Star
                  className={`w-5 h-5 transition-colors ${
                    isFavorite(dish.id) ? "fill-accent text-accent" : "text-foreground/60"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
            </div>

            <p className="font-sans text-2xl font-bold text-accent tabular-nums mt-2 mb-3 shrink-0">
              {dish.price.toFixed(2).replace(/\.00$/, "")} €
            </p>

            <p className="font-sans text-[15px] text-foreground/60 leading-relaxed max-w-[320px]">
              {t(dish.ingredients)}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* ─── CTA + actions ─── */}
        <div className="mt-auto pt-5 shrink-0">
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
                className="relative w-full rounded-full py-4 animate-ar-glow transition-transform duration-300 active:scale-[0.97]"
                style={{ background: "hsl(43 88% 62%)" }}
              >
                <span className="flex items-center justify-center gap-3 font-sans text-lg font-medium" style={{ color: "hsl(30 40% 12%)" }}>
                  <Box className="w-5 h-5" strokeWidth={1.75} />
                  {t("Projeter sur ma table")}
                </span>
              </button>
            </div>
          )}

          {/* Infos / Allergènes */}
          <div className="flex justify-center gap-8 mt-5">
            <button
              onClick={() => setOpenInfo(true)}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <span className="w-12 h-12 rounded-full border border-foreground/25 flex items-center justify-center text-foreground/70">
                <Info className="w-5 h-5" strokeWidth={1.5} />
              </span>
              <span className="font-sans text-[12px] text-foreground/55">{t("Infos")}</span>
            </button>
            {dish.allergens?.length > 0 && (
              <button
                onClick={() => setOpenAllergens(true)}
                className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
              >
                <span className="w-12 h-12 rounded-full border border-foreground/25 flex items-center justify-center text-foreground/70">
                  <TriangleAlert className="w-5 h-5" strokeWidth={1.5} />
                </span>
                <span className="font-sans text-[12px] text-foreground/55">{t("Allergènes")}</span>
              </button>
            )}
          </div>

          {/* Pastilles de progression dans la catégorie */}
          <div className="flex justify-center items-center gap-2 mt-4">
            {sameCategory.map(({ i }, k) => (
              <button
                key={i}
                onClick={() => onSelect(i)}
                aria-label={`Plat ${k + 1}`}
                className={`h-2 rounded-full transition-all ${
                  k === posInCategory ? "w-6 bg-accent" : "w-2 bg-foreground/25"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ─── Barre de catégories ─── */}
        <div className="shrink-0 border-t border-foreground/10 mt-4 pt-3 pb-safe">
          <div className="flex items-center justify-around gap-2 pb-2">
            {categories.map((cat) => {
              const active = normalize(cat) === normalize(dish.category);
              const firstIdx = dishes.findIndex((d) => normalize(d.category) === normalize(cat));
              return (
                <button
                  key={cat}
                  onClick={() => onSelect(firstIdx)}
                  className={`px-6 py-2 rounded-full font-sans text-[13px] transition-colors ${
                    active ? "font-semibold" : "text-foreground/50"
                  }`}
                  style={
                    active
                      ? { background: "hsl(43 88% 62%)", color: "hsl(30 40% 12%)" }
                      : undefined
                  }
                >
                  {t(cat)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={openInfo} onOpenChange={setOpenInfo}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-sans text-lg text-foreground text-center">
              {t(dish.name)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 font-sans text-sm text-foreground/75 text-center">
            <p>{t(dish.ingredients)}</p>
            {dish.chef_note && <p className="italic text-accent">{t(dish.chef_note)}</p>}
            {dish.prep_time ? (
              <p className="text-foreground/50">{dish.prep_time} min</p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openAllergens} onOpenChange={setOpenAllergens}>
        <DialogContent className="bg-card border-border max-w-xs">
          <DialogHeader>
            <DialogTitle className="font-sans text-lg text-foreground text-center">
              {t("Allergènes")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap justify-center gap-2">
            {dish.allergens?.map((a) => (
              <span
                key={a}
                className="px-3 py-1 rounded-full border border-border font-sans text-xs text-foreground/80"
              >
                {t(a)}
              </span>
            ))}
          </div>
          <p className="font-sans text-xs text-foreground/50 text-center pt-1">
            {t("N'hésitez pas à informer votre serveur de toute allergie ou intolérance alimentaire.")}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
