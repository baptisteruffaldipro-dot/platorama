import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Box, ChevronLeft, ChevronRight, Clock, Heart, ImageOff, Rotate3d, X } from "lucide-react";
import type { Dish } from "@/hooks/useDishes";
import { useTranslation } from "@/hooks/useTranslation";
import { hasARModel } from "@/lib/dishHasAR";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DishBadges from "@/components/DishBadges";
import DishDetailsActions from "@/components/DishDetailsActions";
import DishViewer from "@/components/DishViewer";
import DishViewerErrorFallback from "@/components/DishViewerErrorFallback";
import ErrorBoundary from "@/components/ErrorBoundary";

interface Props {
  dishes: Dish[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onLaunchAR: (dish: Dish) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 320;

export default function GoldEleganceDishSheet({
  dishes,
  index,
  onIndexChange,
  onClose,
  onLaunchAR,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const { t } = useTranslation();
  const [direction, setDirection] = useState(0);
  const [showViewer, setShowViewer] = useState(false);

  const dish = dishes[index];

  const goTo = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= dishes.length || nextIndex === index) return;
      setDirection(nextIndex > index ? 1 : -1);
      setShowViewer(false);
      onIndexChange(nextIndex);
    },
    [dishes.length, index, onIndexChange],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") goTo(index + 1);
      if (event.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [goTo, index, onClose]);

  if (!dish) return null;

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const goesNext = info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY;
    const goesPrev = info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY;
    if (goesNext) goTo(index + 1);
    else if (goesPrev) goTo(index - 1);
  };

  const showAR = hasARModel(dish);

  return createPortal(
    <div className="gold-elegance-theme fixed inset-0 z-[100] flex flex-col bg-background text-foreground" role="dialog" aria-modal="true" aria-label={t(dish.name)}>
      <header className="flex items-center justify-between gap-3 border-b border-accent/15 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-10 w-10 shrink-0 rounded-full border border-accent/25"
          aria-label={t("Retour à la carte")}
        >
          <X className="h-4 w-4" />
        </Button>
        <p className="min-w-0 flex-1 truncate text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
          {t(dish.category)}
        </p>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
          {index + 1}/{dishes.length}
        </span>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={dish.id}
            custom={direction}
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.22}
            onDragEnd={handleDragEnd}
            initial={{ x: direction * 220, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -220, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="absolute inset-0 overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom)+5.5rem)] touch-pan-y"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-card">
              {showViewer && showAR ? (
                <ErrorBoundary fallback={<DishViewerErrorFallback dish={dish} />}>
                  <DishViewer dish={dish} />
                </ErrorBoundary>
              ) : dish.thumbnail ? (
                <img src={dish.thumbnail} alt={t(dish.name)} className="h-full w-full object-cover" draggable={false} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
                  <ImageOff className="h-8 w-8" />
                  <span className="text-xs">{t("Photo à venir")}</span>
                </div>
              )}

              <DishBadges dish={dish} className="absolute left-4 top-4 max-w-[70%]" prominent />

              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => onToggleFavorite(dish.id)}
                  className="h-11 w-11 rounded-full border border-accent/20 bg-card/90 shadow-md backdrop-blur-sm"
                  aria-label={t("Ajouter aux favoris")}
                >
                  <Heart className={cn("h-4 w-4", isFavorite(dish.id) && "fill-accent text-accent")} />
                </Button>
                {showAR && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => setShowViewer((value) => !value)}
                    className="h-11 w-11 rounded-full border border-accent/30 bg-card/90 text-accent shadow-md backdrop-blur-sm"
                    aria-label={t(showViewer ? "Fermer la 3D" : "Voir en 3D")}
                  >
                    <Box className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="mx-auto w-full max-w-2xl px-5 pt-6 sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <h2 className="min-w-0 flex-1 break-words text-2xl font-semibold leading-tight sm:text-3xl" style={{ fontFamily: "var(--font-serif)" }}>
                  {t(dish.name)}
                </h2>
                <span className="shrink-0 text-xl font-semibold tabular-nums text-accent sm:text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
                  {dish.price.toFixed(2)} €
                </span>
              </div>

              {dish.prep_time ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> ~{dish.prep_time} min
                </p>
              ) : null}

              {dish.ingredients && (
                <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">
                  {t(dish.ingredients)}
                </p>
              )}

              <DishDetailsActions dish={dish} className="mt-5" />

              {showAR && (
                <Button
                  type="button"
                  onClick={() => onLaunchAR(dish)}
                  className="mt-6 h-12 w-full rounded-full border border-accent/40 text-sm font-semibold uppercase tracking-widest"
                >
                  <Rotate3d className="h-4 w-4" />
                  {t("Voir en réalité augmentée")}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-accent/15 bg-background/95 px-5 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-lg">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="h-11 w-11 rounded-full border-accent/30"
          aria-label={t("Plat précédent")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{t("Glissez pour changer de plat")}</p>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => goTo(index + 1)}
          disabled={index === dishes.length - 1}
          className="h-11 w-11 rounded-full border-accent/30"
          aria-label={t("Plat suivant")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </footer>
    </div>,
    document.body,
  );
}
