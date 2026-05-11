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

      {/* Halo pulse ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="rounded-full animate-ping-slow"
          style={{
            width: "92%",
            height: 78,
            background: "hsl(var(--accent) / 0.25)",
          }}
        />
      </div>

      {/* The CTA button */}
      <button
        onClick={handleClick}
        className={`relative flex items-center gap-3 w-full max-w-md bg-accent text-accent-foreground transition-transform active:scale-95 hover:scale-[1.02] shadow-2xl animate-ar-pulse pl-2 pr-5 py-2 ${radiusClass}`}
        style={{ boxShadow: "0 10px 30px -5px hsl(var(--accent) / 0.5)" }}
      >
        {/* Icon disc on the left */}
        <span
          className={`shrink-0 flex items-center justify-center bg-accent-foreground/10 ring-1 ring-accent-foreground/20 ${
            layout === "editorial" || layout === "vintage" ? "rounded-md" : "rounded-full"
          }`}
          style={{ width: 56, height: 56 }}
        >
          <img src={arIcon} alt="" className="w-9 h-9 object-contain" />
        </span>

        {/* Texts */}
        <span className="flex-1 text-left leading-tight">
          <span className="block font-extrabold uppercase tracking-wider text-base sm:text-lg">
            {t("Voir le plat sur la table")}
          </span>
          <span className="block text-[11px] sm:text-xs font-medium opacity-90 mt-0.5">
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
