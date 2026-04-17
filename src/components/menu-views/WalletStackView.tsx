import { useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Rotate3d, Star } from "lucide-react";
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

// Palette pastel cyclique inspirée d'Apple Wallet
const PASTEL_PALETTE = [
  { bg: "#F5E6D3", accent: "#8B6F47", text: "#3D2817" }, // beige sable
  { bg: "#D4DEF0", accent: "#3F5577", text: "#1F2D45" }, // bleu nuage
  { bg: "#D9E5D2", accent: "#4F6B43", text: "#243A1C" }, // vert tilleul
  { bg: "#F3D9DC", accent: "#9B4A55", text: "#4A1F26" }, // rose poudré
];

// Hauteur de la "tête" visible d'une carte fermée dans la pile
const CARD_PEEK_HEIGHT = 88;
// Hauteur d'une carte ouverte
const CARD_OPEN_HEIGHT = 460;

/**
 * Wallet : 3 cartes empilées (1 par catégorie), style Apple Wallet.
 * Tap sur une carte → elle s'ouvre, celles du dessous se décalent vers le bas.
 */
export default function WalletStackView({
  dishes,
  onLaunchAR,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const { t } = useTranslation();

  // Regroupe par catégorie en préservant l'ordre d'apparition
  const categories = useMemo(() => {
    const seen: string[] = [];
    const grouped: Record<string, Dish[]> = {};
    for (const d of dishes) {
      if (!grouped[d.category]) {
        grouped[d.category] = [];
        seen.push(d.category);
      }
      grouped[d.category].push(d);
    }
    return seen.map((name, i) => ({
      name,
      items: grouped[name],
      color: PASTEL_PALETTE[i % PASTEL_PALETTE.length],
    }));
  }, [dishes]);

  // Première catégorie ouverte par défaut
  const [openIdx, setOpenIdx] = useState<number>(0);

  if (categories.length === 0) return null;

  return (
    <div className="h-full flex flex-col pt-24 pb-6 px-4 relative overflow-hidden">
      {/* Header */}
      <div className="text-center mb-6">
        <p
          className="text-[10px] uppercase tracking-[0.4em] text-foreground/50"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {t("Notre carte")}
        </p>
        <h2
          className="text-2xl mt-1 text-foreground"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {t("Touchez une carte")}
        </h2>
      </div>

      {/* Stack of category cards */}
      <div className="flex-1 min-h-0 relative">
        <LayoutGroup>
          {categories.map((cat, i) => {
            const isOpen = i === openIdx;
            // Position verticale calculée : chaque carte précédente prend soit
            // CARD_OPEN_HEIGHT (si ouverte) soit CARD_PEEK_HEIGHT (si fermée).
            let top = 0;
            for (let k = 0; k < i; k++) {
              top += k === openIdx ? CARD_OPEN_HEIGHT : CARD_PEEK_HEIGHT;
            }

            return (
              <motion.div
                key={cat.name}
                layout
                initial={false}
                animate={{
                  top,
                  height: isOpen ? CARD_OPEN_HEIGHT : CARD_PEEK_HEIGHT + 24, // un peu plus haut pour overlap visuel
                }}
                transition={{ type: "spring", stiffness: 280, damping: 32 }}
                onClick={() => setOpenIdx(isOpen ? -1 : i)}
                className="absolute left-0 right-0 rounded-3xl overflow-hidden cursor-pointer"
                style={{
                  background: cat.color.bg,
                  color: cat.color.text,
                  zIndex: i + 1,
                  boxShadow: `0 -10px 24px -10px ${cat.color.accent}33, 0 18px 36px -18px rgba(0,0,0,0.28)`,
                }}
              >
                {/* En-tête (toujours visible, même fermée) */}
                <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[9px] uppercase tracking-[0.35em] opacity-70"
                      style={{ color: cat.color.accent, fontFamily: "var(--font-body)" }}
                    >
                      {cat.items.length}{" "}
                      {cat.items.length > 1 ? t("plats") : t("plat")}
                    </p>
                    <h3
                      className="text-xl font-bold mt-0.5 truncate"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {t(cat.name)}
                    </h3>
                  </div>
                  <span
                    className="text-xs font-semibold tabular-nums px-3 py-1.5 rounded-full"
                    style={{
                      background: `${cat.color.accent}1f`,
                      color: cat.color.accent,
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {isOpen ? t("Fermer") : t("Ouvrir")}
                  </span>
                </div>

                {/* Contenu déplié */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, delay: 0.1 }}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 pb-4 overflow-y-auto"
                      style={{ maxHeight: CARD_OPEN_HEIGHT - 80 }}
                    >
                      <ul className="space-y-3">
                        {cat.items.map((d) => (
                          <DishRow
                            key={d.id}
                            dish={d}
                            color={cat.color}
                            isFav={isFavorite(d.id)}
                            onToggleFavorite={() => onToggleFavorite(d.id)}
                            onLaunchAR={() => onLaunchAR(d)}
                            t={t}
                          />
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </LayoutGroup>
      </div>
    </div>
  );
}

interface DishRowProps {
  dish: Dish;
  color: { bg: string; accent: string; text: string };
  isFav: boolean;
  onToggleFavorite: () => void;
  onLaunchAR: () => void;
  t: (s: string) => string;
}

function DishRow({ dish, color, isFav, onToggleFavorite, onLaunchAR, t }: DishRowProps) {
  return (
    <li
      className="rounded-2xl p-3 flex gap-3 items-center"
      style={{ background: `${color.accent}10` }}
    >
      {/* Visuel : 3D si dispo, sinon thumbnail */}
      <div
        className="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
        style={{ background: `${color.accent}15` }}
      >
        {hasARModel(dish) ? (
          <ErrorBoundary
            key={dish.id}
            fallback={
              <img
                src={dish.thumbnail}
                alt={dish.name}
                className="w-full h-full object-contain p-1"
              />
            }
          >
            <div className="w-full h-full">
              <DishViewer dish={dish} />
            </div>
          </ErrorBoundary>
        ) : (
          <img
            src={dish.thumbnail}
            alt={dish.name}
            className="w-full h-full object-contain p-1"
          />
        )}
      </div>

      {/* Texte */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <h4
            className="text-sm font-bold truncate"
            style={{ fontFamily: "var(--font-serif)", color: color.text }}
          >
            {t(dish.name)}
          </h4>
          <span
            className="text-sm font-semibold tabular-nums whitespace-nowrap"
            style={{ color: color.accent, fontFamily: "var(--font-serif)" }}
          >
            {dish.price.toFixed(0)}€
          </span>
        </div>
        <p
          className="text-[11px] italic line-clamp-2 mt-0.5 opacity-75"
          style={{ fontFamily: "var(--font-body)", color: color.text }}
        >
          {t(dish.ingredients)}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <button
            onClick={onToggleFavorite}
            aria-label="favori"
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: `${color.accent}1f` }}
          >
            <Star
              className="w-3.5 h-3.5"
              style={{
                fill: isFav ? color.accent : "transparent",
                color: color.accent,
              }}
            />
          </button>
          {hasARModel(dish) && (
            <button
              onClick={onLaunchAR}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold"
              style={{ background: color.accent, color: color.bg }}
            >
              <Rotate3d className="w-3 h-3" />
              AR
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
