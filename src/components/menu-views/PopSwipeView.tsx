import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Rotate3d, Star, Flame, Heart } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { Dish } from "@/hooks/useDishes";
import { hasARModel } from "@/lib/dishHasAR";
import DishViewer from "@/components/DishViewer";
import ErrorBoundary from "@/components/ErrorBoundary";

interface Props {
  dishes: Dish[];
  onLaunchAR: (dish: Dish) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

const Badge = ({ badge }: { badge: string }) => {
  const map: Record<string, { Icon: any; label: string; cls: string }> = {
    bestseller: { Icon: Flame, label: "Best", cls: "bg-orange-500 text-white" },
    coup_de_coeur: { Icon: Heart, label: "Top", cls: "bg-pink-500 text-white" },
  };
  const c = map[badge];
  if (!c) return null;
  const { Icon } = c;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full ${c.cls}`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
};

/**
 * Pop : swipe horizontal à la Tinder.
 * Une carte par plat, on swipe gauche/droite pour explorer.
 */
export default function PopSwipeView({ dishes, onLaunchAR, isFavorite, onToggleFavorite }: Props) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = () => {
    if (index < dishes.length - 1) {
      setDirection(1);
      setIndex(index + 1);
    }
  };
  const prev = () => {
    if (index > 0) {
      setDirection(-1);
      setIndex(index - 1);
    }
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80) next();
    else if (info.offset.x > 80) prev();
  };

  const dish = dishes[index];
  if (!dish) return null;

  return (
    <div className="h-full flex flex-col items-center justify-start px-4 pt-32 pb-24 relative">
      {/* Counter */}
      <div className="flex gap-1.5 z-10 mb-3">
        {dishes.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all ${
              i === index ? "w-6 bg-accent" : "w-1.5 bg-foreground/20"
            }`}
          />
        ))}
      </div>

      <div className="relative w-full max-w-sm flex-1 max-h-[560px] min-h-[480px]">
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={dish.id}
            custom={direction}
            initial={{ x: direction * 300, opacity: 0, rotate: direction * 8 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: direction * -300, opacity: 0, rotate: direction * -8 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="absolute inset-0 rounded-3xl overflow-hidden select-none"
            style={{
              background: "hsl(var(--card))",
              boxShadow: "0 30px 60px -20px hsl(var(--accent) / 0.4), 0 0 0 4px hsl(var(--accent) / 0.15)",
            }}
          >
            <div className="relative h-1/2 overflow-hidden bg-muted/20 flex items-center justify-center">
              {hasARModel(dish) ? (
                <ErrorBoundary key={dish.id} fallback={
                  <img
                    src={dish.thumbnail}
                    alt={dish.name}
                    className="max-w-full max-h-full object-contain p-4"
                    draggable={false}
                  />
                }>
                  <div className="w-full h-full">
                    <DishViewer dish={dish} />
                  </div>
                </ErrorBoundary>
              ) : (
                <img
                  src={dish.thumbnail}
                  alt={dish.name}
                  className="max-w-full max-h-full object-contain p-4"
                  draggable={false}
                />
              )}
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
              {dish.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge badge={dish.badge} />
                </div>
              )}
              <button
                onClick={() => onToggleFavorite(dish.id)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-background/70 backdrop-blur-md flex items-center justify-center"
              >
                <Star
                  className={`w-4 h-4 ${
                    isFavorite(dish.id) ? "fill-accent text-accent" : "text-foreground"
                  }`}
                />
              </button>
            </div>
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={onDragEnd}
              className="px-5 pt-4 pb-5 h-1/2 flex flex-col cursor-grab active:cursor-grabbing"
            >
              <p className="text-[10px] font-black tracking-widest uppercase text-accent">
                {t(dish.category)}
              </p>
              <h2
                className="text-2xl font-black uppercase leading-tight mt-1 text-foreground"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {t(dish.name)}
              </h2>
              <p className="text-xs text-foreground/70 mt-1.5 line-clamp-3 flex-1">
                {t(dish.ingredients)}
              </p>
              <div className="flex items-center justify-between mt-3 gap-3">
                <span
                  className="text-xl font-black h-12 min-w-[64px] px-4 rounded-xl inline-flex items-center justify-center tabular-nums"
                  style={{
                    background: "hsl(var(--accent))",
                    color: "hsl(var(--accent-foreground))",
                  }}
                >
                  {dish.price.toFixed(0)}€
                </span>
                {hasARModel(dish) && (
                  <button
                    onClick={() => onLaunchAR(dish)}
                    className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full bg-foreground text-background text-sm font-bold uppercase tracking-wider active:scale-95 shadow-lg"
                  >
                    <Rotate3d className="w-4 h-4" />
                    Voir en AR
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows (alternative au swipe quand on tourne le 3D) */}
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={prev}
          disabled={index === 0}
          className="w-10 h-10 rounded-full bg-foreground/10 text-foreground flex items-center justify-center disabled:opacity-30 active:scale-95 text-xl"
          aria-label="Précédent"
        >
          ‹
        </button>
        <button
          onClick={next}
          disabled={index === dishes.length - 1}
          className="w-10 h-10 rounded-full bg-foreground/10 text-foreground flex items-center justify-center disabled:opacity-30 active:scale-95 text-xl"
          aria-label="Suivant"
        >
          ›
        </button>
      </div>

      {/* Hint */}
      <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {t("Touchez le plat pour le faire pivoter")}
      </p>
    </div>
  );
}
