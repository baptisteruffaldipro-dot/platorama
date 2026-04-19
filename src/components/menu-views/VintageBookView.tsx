import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rotate3d, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { Dish } from "@/hooks/useDishes";
import { hasARModel } from "@/lib/dishHasAR";

interface Props {
  dishes: Dish[];
  onLaunchAR: (dish: Dish) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

/**
 * Vintage : carte papier dépliable.
 * Pages tournables comme un livre, une catégorie par page.
 */
export default function VintageBookView({
  dishes,
  onLaunchAR,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const { t } = useTranslation();
  const grouped = dishes.reduce<Record<string, Dish[]>>((acc, d) => {
    (acc[d.category] ??= []).push(d);
    return acc;
  }, {});
  const categories = Object.keys(grouped);
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(0);

  const goNext = () => {
    if (page < categories.length - 1) {
      setDir(1);
      setPage(page + 1);
    }
  };
  const goPrev = () => {
    if (page > 0) {
      setDir(-1);
      setPage(page - 1);
    }
  };

  const cat = categories[page];
  const items = grouped[cat] ?? [];

  return (
    <div className="h-full flex flex-col px-2 pt-20 pb-8 relative overflow-hidden">
      {/* Page tabs */}
      <div className="flex items-center justify-center gap-5 mb-4">
        {categories.map((c, i) => (
          <button
            key={c}
            onClick={() => {
              setDir(i > page ? 1 : -1);
              setPage(i);
            }}
            className={`text-sm tracking-[0.25em] uppercase px-3 py-2 transition-colors ${
              i === page
                ? "text-accent border-b-2 border-accent font-semibold"
                : "text-muted-foreground"
            }`}
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {t(c)}
          </button>
        ))}
      </div>

      {/* Page content with flip animation */}
      <div className="flex-1 min-h-0 relative" style={{ perspective: "1500px" }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={cat}
            custom={dir}
            initial={{ rotateY: dir * 80, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: dir * -80, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{
              transformStyle: "preserve-3d",
              backgroundImage:
                "radial-gradient(ellipse at top, hsl(var(--accent) / 0.06), transparent 60%)",
            }}
            className="absolute inset-0 overflow-y-auto rounded-lg border border-accent/20 shadow-inner px-4 py-5"
          >
            <div className="text-center mb-5">
              <div className="text-accent/50 text-xs tracking-[0.4em]">✦ ✦ ✦</div>
              <h2
                className="text-2xl mt-2 text-foreground"
                style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
              >
                {t(cat)}
              </h2>
              <div className="text-accent/50 text-xs tracking-[0.4em] mt-1">✦ ✦ ✦</div>
            </div>

            <ul className="space-y-5">
              {items.map((d, i) => (
                <motion.li
                  key={d.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="text-center"
                >
                  <div className="flex items-baseline justify-center gap-2 px-2">
                    <h3
                      className="text-lg text-foreground"
                      style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
                    >
                      {t(d.name)}
                    </h3>
                    <span className="flex-shrink min-w-[12px] flex-1 max-w-[80px] border-b border-dotted border-foreground/40 mb-1" />
                    <span
                      className="text-base font-semibold text-accent tabular-nums"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {d.price.toFixed(2)} €
                    </span>
                  </div>
                  <p
                    className="text-xs text-foreground/65 italic mt-1 max-w-[280px] mx-auto leading-relaxed"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {t(d.ingredients)}
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <button onClick={() => onToggleFavorite(d.id)} aria-label="favori">
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isFavorite(d.id)
                            ? "fill-accent text-accent"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                    {hasARModel(d) && (
                      <motion.button
                        onClick={() => onLaunchAR(d)}
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] px-4 py-2 rounded-full font-bold shadow-lg shadow-accent/30"
                        style={{
                          fontFamily: "var(--font-serif)",
                          background: "hsl(var(--accent))",
                          color: "hsl(var(--accent-foreground))",
                        }}
                      >
                        <Rotate3d className="w-3 h-3" />
                        {t("Voir le plat")}
                      </motion.button>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>

            <div className="text-center mt-8 text-accent/40 text-sm tracking-widest">
              ❦
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page navigation */}
      <div className="flex items-center justify-between mt-3 px-2">
        <button
          onClick={goPrev}
          disabled={page === 0}
          className="flex items-center gap-1 text-xs text-muted-foreground disabled:opacity-30"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          <ChevronLeft className="w-4 h-4" />
          {t("Précédent")}
        </button>
        <span
          className="text-[10px] tracking-widest text-muted-foreground"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {page + 1} / {categories.length}
        </span>
        <button
          onClick={goNext}
          disabled={page === categories.length - 1}
          className="flex items-center gap-1 text-xs text-muted-foreground disabled:opacity-30"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {t("Suivant")}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
