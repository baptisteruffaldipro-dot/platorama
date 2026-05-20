import { useEffect, useState } from "react";
import { Hand, X, ScanEye } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { LayoutVariant } from "@/lib/menuTemplates";

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

  return (
    <div className="relative flex justify-center mt-3 mb-5 px-4 w-full">
      {/* Onboarding tooltip */}
      {showTooltip && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 animate-fade-in pointer-events-auto">
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
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45"
              style={{ background: "hsl(var(--foreground))" }}
            />
          </div>
        </div>
      )}

      {/* The CTA button — bouton plein "commander" avec effet zoom */}
      <button
        onClick={handleClick}
        className="group relative w-full max-w-md overflow-hidden rounded-full bg-accent px-6 py-4 text-accent-foreground shadow-[0_10px_30px_-8px_hsl(var(--accent)/0.6)] transition-all duration-300 hover:brightness-110 active:scale-[0.97] animate-ar-breathe"
      >
        {/* Shimmer au hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-1000 group-hover:translate-x-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.25) 50%, transparent 100%)",
          }}
        />

        <div className="relative flex items-center justify-center gap-2.5">
          <ScanEye className="h-5 w-5" strokeWidth={2} />
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">
            {t("Voir sur ma table")}
          </span>
        </div>

        {showTooltip && (
          <Hand className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-accent bg-background rounded-full p-0.5 animate-bounce shadow-lg" />
        )}
      </button>
    </div>
  );
}
