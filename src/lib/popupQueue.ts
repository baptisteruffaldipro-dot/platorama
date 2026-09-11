/**
 * Tiny coordinator so only ONE overlay (promo pop-up, daily menu, …)
 * is visible at a time. Without it, two auto-opening overlays stack
 * on top of each other and their backdrops swallow each other's clicks.
 */

type Entry = { id: string; close: () => void };

let current: Entry | null = null;
const listeners = new Set<() => void>();

/** Try to take the overlay slot. Returns false when another overlay owns it. */
export function tryOpenOverlay(entry: Entry): boolean {
  if (current && current.id !== entry.id) return false;
  current = entry;
  return true;
}

/** Take the slot no matter what (explicit user action), closing the current overlay. */
export function forceOpenOverlay(entry: Entry): void {
  if (current && current.id !== entry.id) {
    const previous = current;
    current = null;
    previous.close();
  }
  current = entry;
}

/** Release the slot; queued overlays are notified so they can retry. */
export function releaseOverlay(id: string): void {
  if (current?.id !== id) return;
  current = null;
  listeners.forEach((cb) => cb());
}

/** Get notified when the slot becomes free. */
export function onOverlayFree(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function isOverlayBusy(): boolean {
  return current !== null;
}
