import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rotate3d, Star, X } from "lucide-react";
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

/**
 * Wallet : cartes empilées style Apple Wallet.
 * On tape une carte pour la déplier (3D + détails + AR).
 * Couleurs pastel cycliques par carte.
 */

// Palette pastel cyclique inspirée de la photo de référence
const PASTEL_PALETTE = [
  { bg: "#F5E6D3", accent: "#8B6F47", text: "#3D2817" }, // beige sable
  { bg: "#D4DEF0", accent: "#3F5577", text: "#1F2D45" }, // bleu nuage
  { bg: "#D9E5D2", accent: "#4F6B43", text: "#243A1C" }, // vert tilleul
  { bg: "#F3D9DC", accent: "#9B4A55", text: "#4A1F26" }, // rose poudré
  { bg: "#EFE3CF", accent: "#7A6233", text: "#3A2D14" }, // crème miel
  { bg: "#E0D6E8", accent: "#5E477A", text: "#2C1F40" }, // lavande
];

export default function WalletStackView({
  dishes,
  onLaunchAR,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(null);

  const open = dishes.find((d) => d.id === openId) ?? null;
  const openIdx = open ? dishes.findIndex((d) => d.id === open.id) : -1;
  const openColor = open ? PASTEL_PALETTE[openIdx % PASTEL_PALETTE.length] : null;

  return (
    <div className="h-full flex flex-col pt-24 pb-6 px-4 relative overflow-hidden">
      {/* Header */}
      <div className="text-center mb-4">
        <p
          className="text-[10px] uppercase tracking-[0.4em] text-foreground/50"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {t("Cartes du menu")}
        </p>
        <h2
          className="text-2xl mt-1 text-foreground"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {t("Touchez pour déplier")}
        </h2>
      </div>

      {/* Stack of cards */}
      <div className="flex-1 min-h-0 overflow-y-auto -mx-4 px-4 pb-32 pt-2">
        <ul className="relative">
          {dishes.map((d, i) => {
            const c = PASTEL_PALETTE[i % PASTEL_PALETTE.length];
            return (
              <motion.li
                key={d.id}
                layout
                onClick={() => setOpenId(d.id)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 24 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-3xl px-5 py-5 mb-[-32px] cursor-pointer relative shadow-xl active:shadow-md transition-shadow"
                style={{
                  background: c.bg,
                  color: c.text,
                  zIndex: i + 1,
                  boxShadow: `0 -8px 24px -8px ${c.accent}33, 0 14px 30px -16px rgba(0,0,0,0.25)`,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[9px] uppercase tracking-[0.3em] opacity-70"
                      style={{ color: c.accent, fontFamily: "var(--font-body)" }}
                    >
                      {t(d.category)}
                    </p>
                    <h3
                      className="text-lg font-bold mt-1 truncate"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {t(d.name)}
                    </h3>
                  </div>
                  <span
                    className="text-base font-bold tabular-nums px-3 py-1.5 rounded-full"
                    style={{
                      background: `${c.accent}1f`,
                      color: c.accent,
                      fontFamily: "var(--font-serif)",
                    }}
                  >
                    {d.price.toFixed(0)}€
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* Expanded card overlay */}
      <AnimatePresence>
        {open && openColor && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpenId(null)}
            className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm"
          />
        )}
        {open && openColor && (
          <motion.div
            key={open.id}
            layoutId={undefined}
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="absolute inset-x-3 bottom-3 top-20 z-40 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            style={{ background: openColor.bg, color: openColor.text }}
          >
            {/* Close handle */}
            <div className="flex items-center justify-between px-5 pt-4">
              <div className="flex-1">
                <p
                  className="text-[9px] uppercase tracking-[0.3em]"
                  style={{ color: openColor.accent, fontFamily: "var(--font-body)" }}
                >
                  {t(open.category)}
                </p>
              </div>
              <button
                onClick={() => onToggleFavorite(open.id)}
                aria-label="favori"
                className="w-9 h-9 rounded-full flex items-center justify-center mr-2"
                style={{ background: `${openColor.accent}1f` }}
              >
                <Star
                  className="w-4 h-4"
                  style={{
                    fill: isFavorite(open.id) ? openColor.accent : "transparent",
                    color: openColor.accent,
                  }}
                />
              </button>
              <button
                onClick={() => setOpenId(null)}
                aria-label="fermer"
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: `${openColor.accent}1f`, color: openColor.accent }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3D / image */}
            <div className="flex-1 min-h-0 flex items-center justify-center px-4">
              {hasARModel(open) ? (
                <ErrorBoundary
                  key={open.id}
                  fallback={
                    <img
                      src={open.thumbnail}
                      alt={open.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  }
                >
                  <div className="w-full h-full">
                    <DishViewer dish={open} />
                  </div>
                </ErrorBoundary>
              ) : (
                <img
                  src={open.thumbnail}
                  alt={open.name}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            {/* Info */}
            <div className="px-5 pb-5">
              <h2
                className="text-2xl font-bold leading-tight"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {t(open.name)}
              </h2>
              <p
                className="text-sm italic mt-1.5 opacity-80 line-clamp-3"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {t(open.ingredients)}
              </p>
              <div className="flex items-center justify-between mt-4 gap-3">
                <span
                  className="text-xl font-bold px-4 py-2 rounded-2xl tabular-nums"
                  style={{
                    background: `${openColor.accent}25`,
                    color: openColor.accent,
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  {open.price.toFixed(2)} €
                </span>
                {hasARModel(open) && (
                  <button
                    onClick={() => onLaunchAR(open)}
                    className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-2xl text-sm font-bold uppercase tracking-wider active:scale-95"
                    style={{
                      background: openColor.accent,
                      color: openColor.bg,
                    }}
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
    </div>
  );
}
