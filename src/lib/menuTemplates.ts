// 5 templates de menu virtuel pré-configurés.
// Chaque template définit une palette + typographie + LAYOUT.
// Sert de point de départ : couleurs/polices restent éditables ensuite.

export type LayoutVariant = "classic" | "editorial" | "vintage" | "pop" | "organic" | "wallet" | "vision" | "signature";

export interface MenuTemplate {
  id: string;
  name: string;
  description: string;
  layout: LayoutVariant;
  preview: {
    background: string;
    text: string;
    accent: string;
    accentText: string;
  };
  settings: {
    background_color: string;
    text_color: string;
    button_bg_color: string;
    button_text_color: string;
    heading_font: string;
    body_font: string;
  };
}

export const MENU_TEMPLATES: MenuTemplate[] = [
  {
    id: "dark-luxe",
    name: "Dark Luxe",
    description: "Élégant et raffiné — gastronomie haut de gamme",
    layout: "classic",
    preview: {
      background: "#0d0d0d",
      text: "#ece5d5",
      accent: "#b8943e",
      accentText: "#ece5d5",
    },
    settings: {
      background_color: "#0d0d0d",
      text_color: "#ece5d5",
      button_bg_color: "#b8943e",
      button_text_color: "#ece5d5",
      heading_font: "Cormorant Garamond",
      body_font: "Cormorant Garamond",
    },
  },
  {
    id: "light-minimal",
    name: "Light Minimal",
    description: "Épuré et lumineux — bistronomie moderne",
    layout: "editorial",
    preview: {
      background: "#fafaf7",
      text: "#1a1a1a",
      accent: "#1a1a1a",
      accentText: "#fafaf7",
    },
    settings: {
      background_color: "#fafaf7",
      text_color: "#1a1a1a",
      button_bg_color: "#1a1a1a",
      button_text_color: "#fafaf7",
      heading_font: "Playfair Display",
      body_font: "Inter",
    },
  },
  {
    id: "vintage-bistro",
    name: "Vintage Bistro",
    description: "Chaleureux et authentique — cuisine de tradition",
    layout: "vintage",
    preview: {
      background: "#f4ead5",
      text: "#3d2817",
      accent: "#9c3a1a",
      accentText: "#f4ead5",
    },
    settings: {
      background_color: "#f4ead5",
      text_color: "#3d2817",
      button_bg_color: "#9c3a1a",
      button_text_color: "#f4ead5",
      heading_font: "Libre Baskerville",
      body_font: "Lora",
    },
  },
  {
    id: "modern-pop",
    name: "Modern Pop",
    description: "Coloré et joyeux — street food, brunch, café",
    layout: "pop",
    preview: {
      background: "#fff5ec",
      text: "#2d2d2d",
      accent: "#e8657a",
      accentText: "#ffffff",
    },
    settings: {
      background_color: "#fff5ec",
      text_color: "#2d2d2d",
      button_bg_color: "#e8657a",
      button_text_color: "#ffffff",
      heading_font: "Poppins",
      body_font: "DM Sans",
    },
  },
  {
    id: "nature-bio",
    name: "Nature Bio",
    description: "Frais et organique — bio, végétal, healthy",
    layout: "organic",
    preview: {
      background: "#f1f0e6",
      text: "#2c3a25",
      accent: "#5b8c5a",
      accentText: "#ffffff",
    },
    settings: {
      background_color: "#f1f0e6",
      text_color: "#2c3a25",
      button_bg_color: "#5b8c5a",
      button_text_color: "#ffffff",
      heading_font: "Merriweather",
      body_font: "Lora",
    },
  },
  {
    id: "pastel-wallet",
    name: "Pastel Wallet",
    description: "Cartes empilées colorées — moderne et ludique",
    layout: "wallet",
    preview: {
      background: "#f5efe6",
      text: "#2d2418",
      accent: "#8b6f47",
      accentText: "#ffffff",
    },
    settings: {
      background_color: "#f5efe6",
      text_color: "#2d2418",
      button_bg_color: "#8b6f47",
      button_text_color: "#ffffff",
      heading_font: "Playfair Display",
      body_font: "Inter",
    },
  },
  {
    id: "vision-ar",
    name: "Vision AR",
    description: "Caméra live en arrière-plan — façon Apple Vision, immersif et premium",
    layout: "vision",
    preview: {
      background: "#0a0a0a",
      text: "#f5f5f7",
      accent: "#ffffff",
      accentText: "#0a0a0a",
    },
    settings: {
      background_color: "#0a0a0a",
      text_color: "#f5f5f7",
      button_bg_color: "#ffffff",
      button_text_color: "#0a0a0a",
      heading_font: "Cormorant Garamond",
      body_font: "Inter",
    },
  },
  {
    id: "signature-or",
    name: "Signature Or",
    description: "Photo circulaire, flèches de navigation, bouton doré — épuré et haut de gamme",
    layout: "signature",
    preview: {
      background: "#0d0d0d",
      text: "#ece5d5",
      accent: "#b8943e",
      accentText: "#ece5d5",
    },
    settings: {
      background_color: "#0d0d0d",
      text_color: "#ece5d5",
      button_bg_color: "#b8943e",
      button_text_color: "#ece5d5",
      heading_font: "Cormorant Garamond",
      body_font: "Cormorant Garamond",
    },
  },
];

export function getTemplateById(id: string): MenuTemplate | undefined {
  return MENU_TEMPLATES.find((t) => t.id === id);
}

export function getLayoutVariant(templateId: string | undefined | null): LayoutVariant {
  return getTemplateById(templateId ?? "dark-luxe")?.layout ?? "classic";
}
