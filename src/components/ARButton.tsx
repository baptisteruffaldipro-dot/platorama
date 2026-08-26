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

      {/* The CTA — pilule dorée avec disque d'icône débordant en haut */}
      <div className="relative w-full max-w-md pt-6">
        {/* Contour fin extérieur */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[-6px] top-[18px] bottom-[-6px] rounded-full border"
          style={{ borderColor: "hsl(43 55% 50% / 0.5)" }}
        />

        <button
          onClick={handleClick}
          className="group relative w-full rounded-full px-6 py-4 transition-transform duration-300 active:scale-[0.97] animate-ar-breathe"
          style={{
            background: "linear-gradient(180deg, hsl(43 55% 62%) 0%, hsl(41 50% 52%) 100%)",
          }}
        >
          {/* Halo pulsant */}
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full animate-ar-glow" />

          {/* Shimmer au hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          >
            <span
              className="absolute inset-y-0 -left-full w-full transition-transform duration-1000 group-hover:translate-x-[200%]"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.35) 50%, transparent 100%)",
              }}
            />
          </span>

          <span className="relative block text-center text-[15px] font-medium uppercase tracking-[0.28em] text-background" style={{ fontFamily: "var(--font-serif)" }}>
            {t("Voir sur ma table")}
          </span>
        </button>

        {/* Disque d'icône centré au-dessus */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(180deg, hsl(43 55% 62%) 0%, hsl(41 50% 54%) 100%)" }}
        >
          <ScanEye className="h-6 w-6 text-background animate-ar-icon-float" strokeWidth={1.75} />
        </span>
      </div>

    </div>
  );
}
