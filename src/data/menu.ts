export interface Dish {
  id: number;
  category: string;
  name: string;
  ingredients: string;
  thumbnail: string;
  model_ios: string;
  model_android: string;
}

export const menuData: Dish[] = [
  {
    id: 1,
    category: "ENTRÉE",
    name: "La Tartelette",
    ingredients: "Pâte brisée, champignons de Paris, crème fraîche, thym, échalotes, beurre noisette",
    thumbnail: "/dishes/tartelette.jpg",
    model_ios: "/models/tartelette.usdz",
    model_android: "/models/tartelette.glb",
  },
  {
    id: 2,
    category: "ENTRÉE",
    name: "Le Quasi de Veau",
    ingredients: "Quasi de veau, jus corsé, carottes glacées, céleri, herbes du jardin",
    thumbnail: "/dishes/veau.jpg",
    model_ios: "/models/veau.usdz",
    model_android: "/models/veau.glb",
  },
  {
    id: 3,
    category: "ENTRÉE",
    name: "Houmous",
    ingredients: "Pois chiches, tahini, citron, ail, huile d'olive, sumac, herbes fraîches",
    thumbnail: "/dishes/houmous.jpg",
    model_ios: "/models/houmous.usdz",
    model_android: "/models/houmous.glb",
  },
  {
    id: 4,
    category: "PLAT",
    name: "L'Agneau en Tournedos",
    ingredients: "Filet d'agneau, jus au thym, pommes grenaille, légumes de saison",
    thumbnail: "/dishes/agneau.jpg",
    model_ios: "/models/agneau.usdz",
    model_android: "/models/agneau.glb",
  },
  {
    id: 5,
    category: "PLAT",
    name: "Bouillon d'Huîtres",
    ingredients: "Huîtres fraîches, bouillon dashi, champignons shiitake, ciboulette, yuzu",
    thumbnail: "/dishes/bouillon.jpg",
    model_ios: "/models/bouillon.usdz",
    model_android: "/models/bouillon.glb",
  },
  {
    id: 6,
    category: "DESSERT",
    name: "Le Chocolat Noir",
    ingredients: "Chocolat Valrhona 70%, feuille d'or, coulis de fruits rouges, crème anglaise",
    thumbnail: "/dishes/chocolat.jpg",
    model_ios: "/models/chocolat.usdz",
    model_android: "/models/chocolat.glb",
  },
];
