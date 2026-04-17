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
export function buildMenuUrl(slug: string, origin: string = window.location.origin): string {
  return `${origin}/m/${slug}`;
}
