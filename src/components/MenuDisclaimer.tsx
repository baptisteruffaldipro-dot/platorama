import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { onOverlayFree, releaseOverlay, tryOpenOverlay } from "@/lib/popupQueue";

export const DEFAULT_DISCLAIMER_TEXT =
  "Les photos et plats virtuels sont issus de photos réelles ; cependant, les saisons et l'approvisionnement peuvent avoir un impact sur le rendu final du plat. Merci de votre compréhension.";

const OVERLAY_ID = "disclaimer-popup";
const today = () => new Date().toISOString().slice(0, 10);
const seenKey = (restaurantId: string) => `disclaimer_seen_${restaurantId}`;

/** Bloc discret affiché tout en bas du menu (dans la zone de défilement). */
export function DisclaimerFooter({ text, className }: { text: string; className?: string }) {
  const { t } = useTranslation();
  return (
    <div className={`px-6 pb-5 pt-2 text-center ${className ?? ""}`}>
      <div className="mx-auto flex max-w-md items-start justify-center gap-2 text-[11px] leading-relaxed text-muted-foreground/80">
        <Info className="mt-0.5 h-3 w-3 shrink-0 opacity-60" />
        <p className="break-words">{t(text)}</p>
      </div>
    </div>
  );
}

/**
 * Pop-up de prévention affichée une fois par jour et par restaurant,
 * en respectant la file d'attente des overlays (Menu du jour, offres…).
 */
export function DisclaimerPopup({ restaurantId, text }: { restaurantId: string; text: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  const hide = useCallback(() => {
    openRef.current = false;
    setOpen(false);
  }, []);

  const close = useCallback(() => {
    hide();
    releaseOverlay(OVERLAY_ID);
  }, [hide]);

  useEffect(() => {
    if (!restaurantId) return;
    if (localStorage.getItem(seenKey(restaurantId)) === today()) return;

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    const attempt = () => {
      if (cancelled || openRef.current) return true;
      if (!tryOpenOverlay({ id: OVERLAY_ID, close: hide })) return false;
      openRef.current = true;
      setOpen(true);
      localStorage.setItem(seenKey(restaurantId), today());
      unsubscribe?.();
      return true;
    };

    const timer = setTimeout(() => {
      if (!attempt() && !cancelled) {
        unsubscribe = onOverlayFree(() => {
          attempt();
        });
      }
    }, 2600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsubscribe?.();
    };
  }, [restaurantId, hide]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center p-4 animate-in fade-in duration-300"
      onClick={close}
    >
      <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label={t("Fermer")} />
      <div
        className="relative w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-5 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label={t("Fermer")}
          className="absolute top-2 right-2 w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Info className="h-5 w-5" />
          </span>
          <p className="text-sm leading-relaxed text-foreground break-words">{t(text)}</p>
          <button
            onClick={close}
            className="mt-1 w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground active:scale-[0.98] transition-transform"
          >
            {t("J'ai compris")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
