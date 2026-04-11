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
    name: "Les Ravioles",
    ingredients: "Ravioles du Dauphiné, crème légère, parmesan, ciboulette, beurre noisette",
    thumbnail: "/dishes/tartelette.jpg",
    model_ios: "/models/tartelette.usdz",
    model_android: "/models/ravioles.glb",
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
    model_ios: "/models/huitres.usdz",
    model_android: "/models/huitres.glb",
  },
  {
    id: 6,
    category: "PLAT",
    name: "Le Cabillaud",
    ingredients: "Cabillaud rôti, peau croustillante, beurre blanc, herbes fines, légumes croquants",
    thumbnail: "/dishes/cabillaud.jpg",
    model_ios: "/models/cabillaud.usdz",
    model_android: "/models/cabillaud.glb",
  },
  {
    id: 7,
    category: "PLAT",
    name: "Le Filet de Bœuf",
    ingredients: "Filet de bœuf maturé, jus au vin rouge, carottes glacées, pommes de terre fondantes",
    thumbnail: "/dishes/filet_boeuf.jpg",
    model_ios: "/models/filet_boeuf.usdz",
    model_android: "/models/filet_boeuf.glb",
  },
  {
    id: 8,
    category: "PLAT",
    name: "Le Verjus",
    ingredients: "Verjus frais, légumes de saison, vinaigrette acidulée, herbes du potager",
    thumbnail: "/dishes/bouillon.jpg",
    model_ios: "/models/verjus.usdz",
    model_android: "/models/verjus.glb",
  },
  {
    id: 9,
    category: "DESSERT",
    name: "Le Chocolat Noir",
    ingredients: "Chocolat Valrhona 70%, feuille d'or, coulis de fruits rouges, crème anglaise",
    thumbnail: "/dishes/chocolat.jpg",
    model_ios: "/models/chocolat.usdz",
    model_android: "/models/chocolat.glb",
  },
];
