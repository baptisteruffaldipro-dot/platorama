import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Rotate3d, Star } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { Dish } from "@/hooks/useDishes";
import { hasARModel } from "@/lib/dishHasAR";
import DishViewer from "@/components/DishViewer";
import ErrorBoundary from "@/components/ErrorBoundary";
import ExpandableDescription from "@/components/ExpandableDescription";
import DishDetailsActions from "@/components/DishDetailsActions";
import DishBadges from "@/components/DishBadges";

interface Props {
  dishes: Dish[];
  onLaunchAR: (dish: Dish) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

// Palette pastel par catégorie (3 couleurs douces)
const CATEGORY_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
  entrée: { bg: "#D9E5D2", accent: "#4F6B43", text: "#243A1C" }, // vert tilleul
  entree: { bg: "#D9E5D2", accent: "#4F6B43", text: "#243A1C" },
  plat: { bg: "#F5E6D3", accent: "#8B6F47", text: "#3D2817" }, // beige sable
  plats: { bg: "#F5E6D3", accent: "#8B6F47", text: "#3D2817" },
  dessert: { bg: "#F3D9DC", accent: "#9B4A55", text: "#4A1F26" }, // rose poudré
  desserts: { bg: "#F3D9DC", accent: "#9B4A55", text: "#4A1F26" },
};
const FALLBACK_COLOR = { bg: "#D4DEF0", accent: "#3F5577", text: "#1F2D45" };

const colorForCategory = (cat: string) => {
  const key = cat
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return CATEGORY_COLORS[key] ?? CATEGORY_COLORS[key.replace(/s$/, "")] ?? FALLBACK_COLOR;
};

// Hauteur de la "tête" visible d'une carte fermée dans la pile
const CARD_PEEK = 78;
// Hauteur d'une carte ouverte
const CARD_OPEN = 380;

/**
 * Wallet : 1 plat = 1 carte empilée style Apple Wallet.
 * Première carte ouverte par défaut.
 * Tap une carte → elle s'ouvre, celles du dessous descendent comme une carte tirée d'un paquet.
 */
export default function WalletStackView({
  dishes,
  onLaunchAR,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const { t } = useTranslation();
  // Première carte ouverte par défaut
  const [openIdx, setOpenIdx] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const headerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [headerHeights, setHeaderHeights] = useState<number[]>(() => Array(dishes.length).fill(CARD_PEEK));

  // Mesure la hauteur réelle de chaque en-tête (titres longs qui wrap)
  useLayoutEffect(() => {
    const heights = headerRefs.current.map((el) => (el ? el.getBoundingClientRect().height : CARD_PEEK));
    setHeaderHeights(heights);
  }, [dishes, openIdx]);

  const closedHeight = (i: number) => (headerHeights[i] ?? CARD_PEEK) + 18;

  // Recentre la carte ouverte dans la zone scrollable
  useEffect(() => {
    if (openIdx < 0) return;
    const card = cardRefs.current[openIdx];
    const scroller = scrollRef.current;
    if (!card || !scroller) return;
    const id = window.setTimeout(() => {
      const cardTop = card.offsetTop;
      const cardH = card.offsetHeight;
      const target = cardTop - (scroller.clientHeight - cardH) / 2;
      scroller.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    }, 320);
    return () => window.clearTimeout(id);
  }, [openIdx]);

  if (dishes.length === 0) return null;

  return (
    <div className="h-full flex flex-col pt-20 pb-4 px-4 relative overflow-hidden">
      {/* Header discret */}
      <div className="text-center mb-3">
        <p
          className="text-[9px] uppercase tracking-[0.4em] text-foreground/50"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {t("Notre carte")}
        </p>
      </div>

      {/* Stack de cartes plats */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto -mx-4 px-4 pb-12">
        <div className="relative">
          <LayoutGroup>
            {dishes.map((d, i) => {
              const isOpen = i === openIdx;
              const color = colorForCategory(d.category);
              // Position verticale : somme des hauteurs précédentes (ouverte ou peek)
              let top = 0;
              for (let k = 0; k < i; k++) {
                top += k === openIdx ? CARD_OPEN : closedHeight(k);
              }
              const height = isOpen ? CARD_OPEN : closedHeight(i);

              return (
                <motion.div
                  key={d.id}
                  ref={(el) => (cardRefs.current[i] = el)}
                  layout
                  initial={false}
                  animate={{ top, height }}
                  transition={{ type: "spring", stiffness: 280, damping: 32 }}
                  onClick={() => setOpenIdx(isOpen ? -1 : i)}
                  className="absolute left-0 right-0 rounded-3xl overflow-hidden cursor-pointer"
                  style={{
                    background: color.bg,
                    color: color.text,
                    zIndex: i + 1,
                    boxShadow: `0 -10px 24px -10px ${color.accent}33, 0 18px 36px -18px rgba(0,0,0,0.28)`,
                  }}
                >
                  {/* En-tête (toujours visible) */}
                  <div
                    ref={(el) => (headerRefs.current[i] = el)}
                    className="px-5 pt-4 pb-2 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[9px] uppercase tracking-[0.3em] opacity-70"
                        style={{ color: color.accent, fontFamily: "var(--font-body)" }}
                      >
                        {t(d.category)}
                      </p>
                      <h3
                        className="text-base font-bold mt-0.5 leading-snug"
                        style={{ fontFamily: "var(--font-serif)" }}
                      >
                        {t(d.name)}
                      </h3>
                      <DishBadges dish={d} className="mt-1" compact />
                    </div>
                    <span
                      className="text-sm font-bold tabular-nums px-3 py-1.5 rounded-full whitespace-nowrap"
                      style={{
                        background: `${color.accent}1f`,
                        color: color.accent,
                        fontFamily: "var(--font-serif)",
                      }}
                    >
                      {d.price.toFixed(0)}€
                    </span>
                  </div>

                  {/* Contenu déplié */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        key="open"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, delay: 0.1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-col"
                        style={{ height: `calc(100% - ${headerHeights[i] ?? CARD_PEEK}px)` }}
                      >
                        {/* Visuel 3D / image — padding réduit */}
                        <div className="flex-1 min-h-0 px-2 -my-1 flex items-center justify-center">
                          {hasARModel(d) ? (
                            <ErrorBoundary
                              key={d.id}
                              fallback={
                                <img
                                  src={d.thumbnail}
                                  alt={d.name}
                                  className="max-w-full max-h-full object-contain"
                                />
                              }
                            >
                              <div className="w-full h-full">
                                <DishViewer dish={d} />
                              </div>
                            </ErrorBoundary>
                          ) : (
                            <img
                              src={d.thumbnail}
                              alt={d.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          )}
                        </div>

                        {/* Infos + actions — compactes */}
                        <div className="px-5 pb-6 pt-1">
                          <ExpandableDescription
                            lines={2}
                            className="text-xs italic opacity-80"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            {t(d.ingredients)}
                          </ExpandableDescription>
                          <div className="flex items-center gap-2 mt-3">
                            <DishDetailsActions dish={d} contrast="inherit" />
                            <button
                              onClick={() => onToggleFavorite(d.id)}
                              aria-label="favori"
                              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: `${color.accent}1f` }}
                            >
                              <Star
                                className="w-4 h-4"
                                style={{
                                  fill: isFavorite(d.id) ? color.accent : "transparent",
                                  color: color.accent,
                                }}
                              />
                            </button>
                            {hasARModel(d) && (
                              <motion.button
                                onClick={() => onLaunchAR(d)}
                                animate={{
                                  scale: [1, 1.04, 1],
                                  boxShadow: [
                                    `0 0 0 0 ${color.accent}66`,
                                    `0 0 0 10px ${color.accent}00`,
                                    `0 0 0 0 ${color.accent}00`,
                                  ],
                                }}
                                transition={{
                                  duration: 1.8,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                                whileTap={{ scale: 0.95 }}
                                className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-full text-xs font-bold uppercase tracking-wider"
                                style={{ background: color.accent, color: color.bg }}
                              >
                                <motion.span
                                  animate={{ rotate: [0, 360] }}
                                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                  className="inline-flex"
                                >
                                  <Rotate3d className="w-4 h-4" />
                                </motion.span>
                                {t("Voir le plat")}
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </LayoutGroup>

          {/* Spacer pour permettre le scroll quand toutes les cartes sont empilées */}
          <div
            style={{
              height:
                (dishes.length - 1) * CARD_PEEK +
                (openIdx >= 0 ? CARD_OPEN : CARD_PEEK + 18) +
                40,
            }}
          />
        </div>
      </div>
    </div>
  );
}
