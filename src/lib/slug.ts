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
  // Priorité : origin explicite > URL de prod fixe (hardcodée) > variable d'env > origin courant.
  // PRODUCTION_ORIGIN garantit que les QR codes pointent toujours vers le domaine
  // de prod, même quand l'admin est ouvert depuis la preview Lovable.
  const PRODUCTION_ORIGIN = "https://app.platorama.fr";
  const envOrigin = (import.meta.env?.VITE_PUBLIC_MENU_ORIGIN as string | undefined)?.replace(/\/+$/, "");
  const resolved = origin ?? PRODUCTION_ORIGIN ?? envOrigin ?? window.location.origin;
  return `${resolved}/m/${slug}`;
}
