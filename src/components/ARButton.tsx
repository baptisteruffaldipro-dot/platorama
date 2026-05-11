import { useEffect, useState } from "react";
import { Hand, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { LayoutVariant } from "@/lib/menuTemplates";
import arIcon from "@/assets/ar-icon.png";

interface Props {
  onClick: () => void;
  layout?: LayoutVariant;
  restaurantId: string;
}

/**
 * AR CTA très visible : animation pulse + halo + tooltip d'onboarding
 * lors de la 1ère visite (stocké en localStorage par restaurant).
 */
export default function ARButton({ onClick, layout = "classic", restaurantId }: Props) {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const key = `ar_hint_seen_${restaurantId}`;
    if (!localStorage.getItem(key)) {
      // Slight delay so the user sees the dish first
      const timer = setTimeout(() => setShowTooltip(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [restaurantId]);

  const dismissTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem(`ar_hint_seen_${restaurantId}`, "1");
  };

  const handleClick = () => {
    dismissTooltip();
    onClick();
  };

  // Per-template outer shape (rounded-full for most, squarer for editorial/vintage)
  const radiusClass =
    layout === "vintage"
      ? "rounded-sm border-2 border-accent/30"
      : layout === "editorial"
        ? "rounded-none border-y-2 border-accent"
        : layout === "pop"
          ? "rounded-3xl"
          : "rounded-full";

  return (
    <div className="relative flex justify-center mt-3 mb-6 px-4 w-full">
      {/* Onboarding tooltip */}
      {showTooltip && (
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-30 animate-fade-in pointer-events-auto">
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
            {/* Arrow */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45"
              style={{ background: "hsl(var(--foreground))" }}
            />
          </div>
        </div>
      )}

      {/* The CTA button */}
      <button
        onClick={handleClick}
        className={`relative flex items-center gap-3 w-full max-w-md text-white transition-transform active:scale-95 hover:scale-[1.02] pl-3 pr-5 py-2.5 ${radiusClass}`}
        style={{
          background: "linear-gradient(180deg, hsl(40 55% 60%), hsl(38 50% 48%))",
          boxShadow:
            "0 0 0 6px hsl(38 40% 18% / 0.85), 0 0 0 10px hsl(38 35% 12% / 0.7), 0 14px 28px -6px hsl(38 50% 30% / 0.6)",
        }}
      >
        {/* Icon (white, no disc) */}
        <span
          className="shrink-0 flex items-center justify-center"
          style={{ width: 52, height: 52 }}
        >
          <img
            src={arIcon}
            alt=""
            className="w-12 h-12 object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </span>

        {/* Texts */}
        <span className="flex-1 text-left leading-tight">
          <span className="block font-extrabold uppercase tracking-wider text-sm sm:text-base text-white">
            {t("Voir le plat sur la table")}
          </span>
          <span className="block text-[10px] sm:text-[11px] font-medium text-white/90 mt-0.5">
            {t("Visualisez ce plat en taille réelle grâce à la réalité augmentée.")}
          </span>
        </span>

        {/* Tap hand indicator on first visit */}
        {showTooltip && (
          <Hand className="w-5 h-5 absolute -right-2 -bottom-2 text-foreground bg-background rounded-full p-0.5 animate-bounce shadow-lg" />
        )}
      </button>
    </div>
  );
}
