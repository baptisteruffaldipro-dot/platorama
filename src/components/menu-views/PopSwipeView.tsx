import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Rotate3d, Star, Flame, Heart } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { Dish } from "@/hooks/useDishes";

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
    <div className="h-full flex flex-col items-center justify-center px-4 pt-20 pb-32 relative">
      {/* Counter */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {dishes.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all ${
              i === index ? "w-6 bg-accent" : "w-1.5 bg-foreground/20"
            }`}
          />
        ))}
      </div>

      <div className="relative w-full max-w-sm aspect-[3/4]">
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={dish.id}
            custom={direction}
            initial={{ x: direction * 300, opacity: 0, rotate: direction * 8 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: direction * -300, opacity: 0, rotate: direction * -8 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={onDragEnd}
            className="absolute inset-0 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
            style={{
              background: "hsl(var(--card))",
              boxShadow: "0 30px 60px -20px hsl(var(--accent) / 0.4), 0 0 0 4px hsl(var(--accent) / 0.15)",
            }}
          >
            <div className="relative h-3/5 overflow-hidden">
              <img
                src={dish.thumbnail}
                alt={dish.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              {dish.badge && (
                <div className="absolute top-4 left-4">
                  <Badge badge={dish.badge} />
                </div>
              )}
              <button
                onClick={() => onToggleFavorite(dish.id)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background/70 backdrop-blur-md flex items-center justify-center"
              >
                <Star
                  className={`w-4 h-4 ${
                    isFavorite(dish.id) ? "fill-accent text-accent" : "text-foreground"
                  }`}
                />
              </button>
            </div>
            <div className="px-5 pt-3 pb-5 h-2/5 flex flex-col">
              <p className="text-[10px] font-black tracking-widest uppercase text-accent">
                {t(dish.category)}
              </p>
              <h2
                className="text-2xl font-black uppercase leading-tight mt-1 text-foreground"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {t(dish.name)}
              </h2>
              <p className="text-xs text-foreground/70 mt-1 line-clamp-2 flex-1">
                {t(dish.ingredients)}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span
                  className="text-2xl font-black px-3 py-1 rounded-xl"
                  style={{
                    background: "hsl(var(--accent))",
                    color: "hsl(var(--accent-foreground))",
                  }}
                >
                  {dish.price.toFixed(0)}€
                </span>
                <button
                  onClick={() => onLaunchAR(dish)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-foreground text-background text-xs font-bold uppercase tracking-wider active:scale-95"
                >
                  <Rotate3d className="w-4 h-4" />
                  AR
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hint */}
      <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        ← {t("Glissez pour explorer")} →
      </p>
    </div>
  );
}
