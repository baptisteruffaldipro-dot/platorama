// Templates de menu virtuel pré-configurés.
// Chaque template définit une palette + typographie + LAYOUT.
// Sert de point de départ : couleurs/polices restent éditables ensuite.

export type LayoutVariant = "classic" | "editorial" | "pop" | "gold";

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
    name: "Moderne (AR)",
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
    name: "Classique (AR)",
    description: "Menu réalité augmentée — épuré et lumineux",
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
    id: "gold-elegance",
    name: "Carrousel (Photo + AR)",
    description: "Menu photo + réalité augmentée si disponible",
    layout: "gold",
    preview: {
      background: "#f7f4ec",
      text: "#171717",
      accent: "#c8a96b",
      accentText: "#171717",
    },
    settings: {
      background_color: "#f7f4ec",
      text_color: "#171717",
      button_bg_color: "#171717",
      button_text_color: "#ffffff",
      heading_font: "Outfit",
      body_font: "Figtree",
    },
  },
];

export function getTemplateById(id: string): MenuTemplate | undefined {
  return MENU_TEMPLATES.find((t) => t.id === id);
}

export function getLayoutVariant(templateId: string | undefined | null): LayoutVariant {
  return getTemplateById(templateId ?? "dark-luxe")?.layout ?? "classic";
}
