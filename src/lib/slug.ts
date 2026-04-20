/** Convert a free-text name into a URL-friendly slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Build the public URL for a restaurant menu given its slug. */
export function buildMenuUrl(slug: string, origin?: string): string {
  // Priorité : origin explicite > variable d'env (URL de prod fixe) > origin courant.
  // Définir VITE_PUBLIC_MENU_ORIGIN (ex. "https://menu.platorama.fr") pour forcer
  // les QR codes à pointer vers le domaine de production, même depuis la preview.
  const envOrigin = (import.meta.env?.VITE_PUBLIC_MENU_ORIGIN as string | undefined)?.replace(/\/+$/, "");
  const resolved = origin ?? envOrigin ?? window.location.origin;
  return `${resolved}/m/${slug}`;
}
