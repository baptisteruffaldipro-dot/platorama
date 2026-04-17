import { useState } from "react";
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
  { bg: "#EFE3CF", accent: "#7A6233", text: "#3A2D14" }, // crème miel
  { bg: "#E0D6E8", accent: "#5E477A", text: "#2C1F40" }, // lavande
];

// Hauteur de la "tête" visible d'une carte fermée dans la pile
const CARD_PEEK = 78;
// Hauteur d'une carte ouverte
const CARD_OPEN = 460;

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

  if (dishes.length === 0) return null;

  return (
    <div className="h-full flex flex-col pt-24 pb-6 px-4 relative overflow-hidden">
      {/* Header */}
      <div className="text-center mb-5">
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

      {/* Stack de cartes plats */}
      <div className="flex-1 min-h-0 overflow-y-auto -mx-4 px-4 pb-12">
        <div className="relative">
          <LayoutGroup>
            {dishes.map((d, i) => {
              const isOpen = i === openIdx;
              const color = PASTEL_PALETTE[i % PASTEL_PALETTE.length];
              // Position verticale : somme des hauteurs précédentes (ouverte ou peek)
              let top = 0;
              for (let k = 0; k < i; k++) {
                top += k === openIdx ? CARD_OPEN : CARD_PEEK;
              }
              const height = isOpen ? CARD_OPEN : CARD_PEEK + 18;

              return (
                <motion.div
                  key={d.id}
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
                  <div className="px-5 pt-4 pb-2 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[9px] uppercase tracking-[0.3em] opacity-70"
                        style={{ color: color.accent, fontFamily: "var(--font-body)" }}
                      >
                        {t(d.category)}
                      </p>
                      <h3
                        className="text-base font-bold mt-0.5 truncate"
                        style={{ fontFamily: "var(--font-serif)" }}
                      >
                        {t(d.name)}
                      </h3>
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
                        className="flex flex-col h-[calc(100%-64px)]"
                      >
                        {/* Visuel 3D / image */}
                        <div className="flex-1 min-h-0 px-4 flex items-center justify-center">
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

                        {/* Infos + actions */}
                        <div className="px-5 pb-4 pt-2">
                          <p
                            className="text-xs italic line-clamp-2 opacity-80"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            {t(d.ingredients)}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
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
                              <button
                                onClick={() => onLaunchAR(d)}
                                className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-full text-xs font-bold uppercase tracking-wider active:scale-95"
                                style={{ background: color.accent, color: color.bg }}
                              >
                                <Rotate3d className="w-4 h-4" />
                                {t("Voir en AR")}
                              </button>
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
