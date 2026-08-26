import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Hand, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { hasARModel } from "@/lib/dishHasAR";
import type { Dish } from "@/hooks/useDishes";

interface Props {
  dishes: Dish[];
  activeIndex: number;
  onSelect: (i: number) => void;
  onLaunchAR: (d: Dish) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  restaurantId: string;
}

/**
 * Layout "Signature" — reproduit la maquette :
 * photo circulaire statique, flèches ‹ ›, catégorie, nom serif,
 * description italique complète, prix doré, gros bouton pilule or.
 */
export default function SignatureView({
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
    const key = `ar_hint_seen_${restaurantId}`;
    if (!localStorage.getItem(key)) {
      const timer = setTimeout(() => setShowTooltip(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [restaurantId]);

  const dismissTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem(`ar_hint_seen_${restaurantId}`, "1");
  };

  const prev = () => onSelect((activeIndex - 1 + dishes.length) % dishes.length);
  const next = () => onSelect((activeIndex + 1) % dishes.length);

  const handleAR = () => {
    dismissTooltip();
    onLaunchAR(dish);
  };

  return (
    <div className="h-full flex flex-col relative z-10">
      {/* ─── Photo circulaire + flèches aux bords de l'écran ─── */}
      <div className="relative flex justify-center pt-14">
        <button
          onClick={prev}
          aria-label="Plat précédent"
          className="absolute left-0 top-[58%] -translate-y-1/2 p-3 text-foreground/50 hover:text-foreground transition-colors active:scale-90 z-10"
        >
          <ChevronLeft className="w-14 h-14" strokeWidth={1} />
        </button>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={dish.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-[64vw] h-[64vw] max-w-[300px] max-h-[300px]"
            >
              {dish.thumbnail ? (
                <img
                  src={dish.thumbnail}
                  alt={t(dish.name)}
                  className="w-full h-full object-contain"
                  style={{ filter: "drop-shadow(0 18px 30px hsl(0 0% 0% / 0.65))" }}
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  {t(dish.name)}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={next}
          aria-label="Plat suivant"
          className="absolute right-0 top-[58%] -translate-y-1/2 p-3 text-foreground/50 hover:text-foreground transition-colors active:scale-90 z-10"
        >
          <ChevronRight className="w-14 h-14" strokeWidth={1} />
        </button>
      </div>


      {/* ─── Infos plat ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={dish.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center text-center px-6 mt-6"
        >
          <span className="text-[13px] tracking-[0.45em] uppercase text-foreground/70 mb-2">
            {t(dish.category)}
          </span>

          <div className="flex items-start justify-center gap-2 mb-3">
            <h1
              className="text-3xl sm:text-4xl font-medium text-foreground uppercase tracking-wide leading-snug"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {t(dish.name)}
            </h1>
            <button
              onClick={() => onToggleFavorite(dish.id)}
              className="transition-transform active:scale-90 shrink-0 mt-2"
              aria-label={isFavorite(dish.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  isFavorite(dish.id) ? "fill-accent text-accent" : "text-foreground/70"
                }`}
                strokeWidth={1.25}
              />
            </button>
          </div>

          <p
            className="text-lg italic text-foreground/75 leading-relaxed max-w-[380px] mb-3"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {t(dish.ingredients)}
          </p>

          <p
            className="text-2xl font-medium text-accent tabular-nums mb-6"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {dish.price.toFixed(2)} €
          </p>
        </motion.div>
      </AnimatePresence>

      {/* ─── Bouton AR pilule or ─── */}
      {hasARModel(dish) && (
        <div className="relative mt-auto mt-6 px-5 pb-safe mb-4 w-full max-w-md mx-auto">

          {showTooltip && (
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
              <div className="relative bg-foreground text-background px-4 py-2.5 rounded-xl shadow-2xl max-w-[260px]">
                <button
                  onClick={dismissTooltip}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg"
                  aria-label="Fermer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-start gap-2">
                  <Hand className="w-4 h-4 mt-0.5 shrink-0 animate-bounce" />
                  <p className="text-xs font-medium leading-snug">
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
            className="relative w-full rounded-full py-3.5 animate-ar-breathe transition-transform duration-300 active:scale-[0.97]"
            style={{
              background: "linear-gradient(180deg, hsl(43 52% 60%) 0%, hsl(41 48% 50%) 100%)",
              boxShadow: "0 10px 32px -8px hsl(41 60% 45% / 0.5)",
            }}
          >
            <span
              className="block text-center text-base font-medium uppercase tracking-[0.28em]"
              style={{ fontFamily: "var(--font-serif)", color: "hsl(40 30% 97%)" }}
            >
              {t("Voir sur ma table")}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
