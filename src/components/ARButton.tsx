import { useEffect, useState } from "react";
import { Hand, X, ScanEye, ArrowUp } from "lucide-react";
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

      {/* The CTA button — Glass sombre épuré */}
      <button
        onClick={handleClick}
        className="group relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-5 text-center backdrop-blur-xl transition-all duration-500 hover:border-accent/50 hover:bg-black/60 active:scale-[0.98]"
      >
        {/* Shimmer doré au hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-1000 group-hover:translate-x-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, hsl(var(--accent) / 0.08) 50%, transparent 100%)",
          }}
        />

        <div className="relative flex flex-col items-center gap-3.5">
          {/* Icône AR */}
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full border text-accent"
            style={{
              background: "hsl(var(--accent) / 0.1)",
              borderColor: "hsl(var(--accent) / 0.25)",
            }}
          >
            <ScanEye className="h-6 w-6" strokeWidth={1.5} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-[13px] font-medium uppercase tracking-[0.25em] text-accent">
              {t("Voir le plat sur la table")}
            </h2>
            <p
              className="text-[13px] font-light leading-relaxed text-neutral-300"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {t("Visualisez ce plat en taille réelle grâce à la réalité augmentée.")}
            </p>
          </div>

          {/* Indicateur bas */}
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="h-px w-8" style={{ background: "hsl(var(--accent) / 0.3)" }} />
            <ArrowUp className="h-3 w-3 text-accent animate-pulse" strokeWidth={2} />
            <span className="h-px w-8" style={{ background: "hsl(var(--accent) / 0.3)" }} />
          </div>
        </div>

        {/* Coins décoratifs */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l border-t border-transparent transition-colors duration-500 group-hover:border-accent/40"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b border-r border-transparent transition-colors duration-500 group-hover:border-accent/40"
        />

        {showTooltip && (
          <Hand className="w-5 h-5 absolute right-2 bottom-2 text-foreground bg-background rounded-full p-0.5 animate-bounce shadow-lg" />
        )}
      </button>
    </div>
  );
}
