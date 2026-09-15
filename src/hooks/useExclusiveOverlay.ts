import { useEffect } from "react";
import { forceOpenOverlay, releaseOverlay } from "@/lib/popupQueue";

/**
 * Garantit qu'un seul overlay (pop-up promo, menu du jour, fidélité, aide au choix…)
 * est visible à la fois. Une ouverture manuelle ferme celui en cours.
 */
export function useExclusiveOverlay(
  id: string,
  open: boolean,
  setOpen: (value: boolean) => void,
) {
  useEffect(() => {
    if (open) {
      forceOpenOverlay({ id, close: () => setOpen(false) });
    } else {
      releaseOverlay(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, id]);

  useEffect(() => () => releaseOverlay(id), [id]);
}
