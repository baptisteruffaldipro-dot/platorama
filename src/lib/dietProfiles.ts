import type { Dish } from "@/hooks/useDishes";

export type DietProfileKey =
  | "vegetarian"
  | "vegan"
  | "gluten_free"
  | "lactose_free"
  | "pork_free"
  | "light";

export interface DietProfile {
  key: DietProfileKey;
  label: string;
  emoji: string;
  hint: string;
}

export const DIET_PROFILES: DietProfile[] = [
  { key: "vegetarian", label: "Végétarien", emoji: "🥗", hint: "Sans viande ni poisson" },
  { key: "vegan", label: "Végétalien", emoji: "🌱", hint: "Sans produit animal" },
  { key: "gluten_free", label: "Sans gluten", emoji: "🌾", hint: "Sans blé ni gluten" },
  { key: "lactose_free", label: "Sans lactose", emoji: "🥛", hint: "Sans produits laitiers" },
  { key: "pork_free", label: "Sans porc", emoji: "🐖", hint: "Sans porc ni charcuterie" },
  { key: "light", label: "Léger", emoji: "🍃", hint: "Entrées, salades et poissons" },
];

/* Mots-clés (accents retirés, minuscules) */
const MEAT = [
  "boeuf", "bœuf", "veau", "agneau", "porc", "poulet", "volaille", "canard", "dinde",
  "jambon", "bacon", "lardon", "chorizo", "saucisse", "andouillette", "magret",
  "entrecote", "faux-filet", "bavette", "onglet", "tartare", "steak", "burger",
  "cote de", "confit", "foie gras", "rillette", "charcuterie", "viande", "pave de rumsteck",
];
const FISH = ["poisson", "saumon", "thon", "cabillaud", "dorade", "crevette", "gambas", "moule", "huitre", "calamar", "anchois", "truite", "bar ", "seiche", "poulpe", "surimi"];
const DAIRY = ["fromage", "creme", "beurre", "lait", "mozzarella", "parmesan", "chevre", "raclette", "reblochon", "comte", "mascarpone", "yaourt", "glace", "burrata", "cheddar", "gruyere", "roquefort", "bleu"];
const GLUTEN = ["pain", "brioche", "pate", "pates", "farine", "panure", "pane", "bun", "wrap", "croustillant", "biscuit", "crumble", "tarte", "feuillete", "gnocchi", "semoule", "boulgour", "orge", "bruschetta", "toast", "croute"];
const PORK = ["porc", "jambon", "bacon", "lardon", "chorizo", "saucisse", "andouillette", "boudin", "travers", "echine", "cochon", "coppa", "pancetta"];
const EGG = ["oeuf", "œuf", "mayonnaise", "aioli", "meringue", "sabayon"];
const HONEY = ["miel"];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const contains = (haystack: string, needles: string[]) =>
  needles.some((n) => haystack.includes(normalize(n)));

const dishText = (dish: Pick<Dish, "name" | "ingredients" | "category" | "allergens">) =>
  normalize([dish.name, dish.ingredients, dish.category, ...(dish.allergens ?? [])].join(" "));

const LIGHT_CATEGORIES = ["entree", "salade", "poisson"];

export const matchesProfile = (
  dish: Pick<Dish, "name" | "ingredients" | "category" | "allergens">,
  profile: DietProfileKey
): boolean => {
  const text = dishText(dish);
  switch (profile) {
    case "vegetarian":
      return !contains(text, MEAT) && !contains(text, FISH);
    case "vegan":
      return (
        !contains(text, MEAT) &&
        !contains(text, FISH) &&
        !contains(text, DAIRY) &&
        !contains(text, EGG) &&
        !contains(text, HONEY)
      );
    case "gluten_free":
      return !contains(text, GLUTEN) && !contains(text, ["gluten"]);
    case "lactose_free":
      return !contains(text, DAIRY) && !contains(text, ["lactose"]);
    case "pork_free":
      return !contains(text, PORK);
    case "light":
      return (
        contains(normalize(dish.category), LIGHT_CATEGORIES) ||
        contains(text, ["salade", "carpaccio", "tartare de legumes", "vapeur", "grille"])
      );
    default:
      return true;
  }
};

/** Le plat contient-il l'un des allergènes exclus ? */
export const hasExcludedAllergen = (
  dish: Pick<Dish, "allergens" | "ingredients" | "name">,
  excluded: string[]
) => {
  if (!excluded.length) return false;
  const text = normalize([dish.name, dish.ingredients, ...(dish.allergens ?? [])].join(" "));
  return excluded.some((a) => text.includes(normalize(a)));
};

export interface MenuPreferences {
  profiles: DietProfileKey[];
  excludedAllergens: string[];
}

export const emptyPreferences: MenuPreferences = { profiles: [], excludedAllergens: [] };

export const filterDishes = <T extends Pick<Dish, "name" | "ingredients" | "category" | "allergens">>(
  dishes: T[],
  prefs: MenuPreferences
): T[] =>
  dishes.filter(
    (d) =>
      prefs.profiles.every((p) => matchesProfile(d, p)) &&
      !hasExcludedAllergen(d, prefs.excludedAllergens)
  );

export const preferencesKey = (restaurantId: string) => `menu_prefs_${restaurantId}`;

export const loadPreferences = (restaurantId: string): MenuPreferences => {
  try {
    const raw = localStorage.getItem(preferencesKey(restaurantId));
    if (!raw) return emptyPreferences;
    const parsed = JSON.parse(raw) as MenuPreferences;
    return {
      profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
      excludedAllergens: Array.isArray(parsed.excludedAllergens) ? parsed.excludedAllergens : [],
    };
  } catch {
    return emptyPreferences;
  }
};

export const savePreferences = (restaurantId: string, prefs: MenuPreferences) => {
  try {
    localStorage.setItem(preferencesKey(restaurantId), JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
};
