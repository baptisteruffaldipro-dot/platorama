import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Rotate3d, Star, Leaf, ChevronUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import ExpandableDescription from "@/components/ExpandableDescription";
import type { Dish } from "@/hooks/useDishes";
import { hasARModel } from "@/lib/dishHasAR";
import DishViewer from "@/components/DishViewer";
import ErrorBoundary from "@/components/ErrorBoundary";
import DishDetailsActions from "@/components/DishDetailsActions";

interface Props {
  dishes: Dish[];
  onLaunchAR: (dish: Dish) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

/**
 * Organic : feed plein écran style Stories.
 * Un plat = un écran complet, scroll vertical avec snap.
 */
export default function OrganicStoriesView({
  dishes,
  onLaunchAR,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / el.clientHeight);
      setActiveIdx(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative h-full">
      {/* Vertical progress on right */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5">
        {dishes.map((_, i) => (
          <span
            key={i}
            className={`w-1 rounded-full transition-all ${
              i === activeIdx ? "h-6 bg-accent" : "h-1.5 bg-foreground/30"
            }`}
          />
        ))}
      </div>

      <div
        ref={containerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {dishes.map((d, i) => (
          <section
            key={d.id}
            className="snap-start h-full w-full relative flex flex-col justify-end"
          >
            {/* 3D viewer (or contained PNG fallback) — remonté pour aérer le titre */}
            <div className="absolute inset-x-0 top-32 bottom-[48%] flex items-center justify-center px-2">
              {hasARModel(d) ? (
                <ErrorBoundary key={d.id} fallback={
                  <img
                    src={d.thumbnail}
                    alt={d.name}
                    className="max-w-full max-h-full object-contain scale-110"
                    loading={i < 2 ? "eager" : "lazy"}
                  />
                }>
                  <div className="w-full h-full scale-110">
                    <DishViewer dish={d} />
                  </div>
                </ErrorBoundary>
              ) : (
                <img
                  src={d.thumbnail}
                  alt={d.name}
                  className="max-w-full max-h-full object-contain scale-110"
                  loading={i < 2 ? "eager" : "lazy"}
                />
              )}
            </div>

            {/* Top — category (descendu pour ne pas overlap les icônes) */}
            <div className="absolute top-28 left-4 right-4 flex items-center justify-between z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/70 backdrop-blur-md">
                <Leaf className="w-3 h-3 text-accent" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-foreground">
                  {t(d.category)}
                </span>
              </div>
              <button
                onClick={() => onToggleFavorite(d.id)}
                className="w-10 h-10 rounded-full bg-background/70 backdrop-blur-md flex items-center justify-center"
              >
                <Star
                  className={`w-4 h-4 ${
                    isFavorite(d.id) ? "fill-accent text-accent" : "text-foreground"
                  }`}
                />
              </button>
            </div>

            {/* Bottom — content */}
            <motion.div
              key={`${d.id}-${activeIdx === i}`}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="relative z-10 px-6 pb-32 pt-10"
            >
              <h2
                className="text-4xl text-foreground leading-tight"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {t(d.name)}
              </h2>
              <ExpandableDescription
                lines={2}
                className="text-sm italic text-foreground/80 mt-2 max-w-sm leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {t(d.ingredients)}
              </ExpandableDescription>
              <DishDetailsActions dish={d} className="mt-3" />
              <div className="flex items-center gap-3 mt-5">
                <span
                  className="text-xl font-semibold px-4 py-2 rounded-full backdrop-blur-md"
                  style={{
                    background: "hsl(var(--accent) / 0.2)",
                    color: "hsl(var(--accent))",
                    border: "1px solid hsl(var(--accent) / 0.4)",
                  }}
                >
                  {d.price.toFixed(2)} €
                </span>
                {hasARModel(d) && (
                  <motion.button
                    onClick={() => onLaunchAR(d)}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider active:scale-95"
                    style={{
                      background: "hsl(var(--accent))",
                      color: "hsl(var(--accent-foreground))",
                      boxShadow: "0 10px 30px -8px hsl(var(--accent) / 0.6)",
                    }}
                  >
                    <Rotate3d className="w-4 h-4" />
                    {t("Voir le plat")}
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Scroll hint — persistant sur chaque carte sauf la dernière */}
            {i < dishes.length - 1 && (
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute bottom-6 inset-x-0 mx-auto w-fit flex flex-col items-center text-foreground/50 pointer-events-none"
              >
                <ChevronUp className="w-4 h-4" />
                <span className="text-[9px] uppercase tracking-widest">
                  {t("Faites défiler")}
                </span>
              </motion.div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
