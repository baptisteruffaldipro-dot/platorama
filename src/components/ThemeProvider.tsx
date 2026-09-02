import { useEffect } from "react";
import { useLocation, matchPath } from "react-router-dom";
import { usePublishedSettings } from "@/hooks/useSiteSettings";
import { useRestaurantBySlug } from "@/hooks/useRestaurantBySlug";

function hexToHSL(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Default dashboard theme (Plat'O'rama branding)
const DASHBOARD_DEFAULTS = {
  background: "30 50% 97%",
  foreground: "0 0% 20%",
  card: "0 0% 100%",
  cardForeground: "0 0% 20%",
  accent: "352 72% 63%",
  accentForeground: "0 0% 100%",
  secondary: "160 35% 60%",
  muted: "30 20% 92%",
  mutedForeground: "0 0% 45%",
  border: "30 15% 88%",
};

function resetToDashboardTheme() {
  const root = document.documentElement;
  root.style.setProperty("--background", DASHBOARD_DEFAULTS.background);
  root.style.setProperty("--card", DASHBOARD_DEFAULTS.card);
  root.style.setProperty("--card-foreground", DASHBOARD_DEFAULTS.cardForeground);
  root.style.setProperty("--foreground", DASHBOARD_DEFAULTS.foreground);
  root.style.setProperty("--primary", DASHBOARD_DEFAULTS.accent);
  root.style.setProperty("--primary-foreground", DASHBOARD_DEFAULTS.accentForeground);
  root.style.setProperty("--accent", DASHBOARD_DEFAULTS.accent);
  root.style.setProperty("--accent-foreground", DASHBOARD_DEFAULTS.accentForeground);
  root.style.setProperty("--secondary", DASHBOARD_DEFAULTS.secondary);
  root.style.setProperty("--muted", DASHBOARD_DEFAULTS.muted);
  root.style.setProperty("--muted-foreground", DASHBOARD_DEFAULTS.mutedForeground);
  root.style.setProperty("--border", DASHBOARD_DEFAULTS.border);
  root.style.setProperty("--font-serif", "'Playfair Display', Georgia, serif");
  root.style.setProperty("--font-body", "'DM Sans', 'Inter', sans-serif");
  document.body.style.fontFamily = "'DM Sans', 'Inter', sans-serif";
}

function injectCustomFont(name: string, url: string) {
  const id = "custom-font-face";
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  if (!name || !url) return;
  const style = document.createElement("style");
  style.id = id;
  const format = url.endsWith(".woff2")
    ? "woff2"
    : url.endsWith(".woff")
      ? "woff"
      : url.endsWith(".otf")
        ? "opentype"
        : "truetype";
  style.textContent = `@font-face { font-family: '${name}'; src: url('${url}') format('${format}'); font-display: swap; }`;
  document.head.appendChild(style);
}

function applyRestaurantTheme(settings: { background_color: string; text_color: string; button_bg_color: string; button_text_color: string; heading_font: string; body_font: string; custom_font_name?: string; custom_font_url?: string }) {
  const customName = settings.custom_font_name || "";
  injectCustomFont(customName, settings.custom_font_url || "");
  const root = document.documentElement;
  root.style.setProperty("--background", hexToHSL(settings.background_color));
  root.style.setProperty("--card", hexToHSL(settings.background_color));
  root.style.setProperty("--foreground", hexToHSL(settings.text_color));
  root.style.setProperty("--card-foreground", hexToHSL(settings.text_color));
  root.style.setProperty("--primary", hexToHSL(settings.text_color));
  root.style.setProperty("--accent", hexToHSL(settings.button_bg_color));
  root.style.setProperty("--accent-foreground", hexToHSL(settings.button_text_color));
  root.style.setProperty("--muted", hexToHSL(settings.background_color));
  root.style.setProperty("--muted-foreground", hexToHSL(settings.text_color));
  root.style.setProperty("--border", hexToHSL(settings.text_color));
  root.style.setProperty("--font-serif", `'${settings.heading_font}', Georgia, serif`);
  root.style.setProperty("--font-body", `'${settings.body_font}', Georgia, serif`);
  document.body.style.fontFamily = `'${settings.body_font}', Georgia, serif`;

  const fonts = [...new Set([settings.heading_font, settings.body_font])].filter((f) => f && f !== customName);
  fonts.forEach((font) => {
    const id = `gfont-${font.replace(/\s+/g, "-")}`;
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@300;400;600;700&display=swap`;
      document.head.appendChild(link);
    }
  });
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  // Resolve restaurant from /m/:slug route
  const match = matchPath("/m/:slug", location.pathname);
  const slug = (match?.params as { slug?: string } | undefined)?.slug ?? null;
  const { data: restaurant } = useRestaurantBySlug(slug);
  const restaurantId = restaurant?.id ?? null;
  const isMenuRoute = !!slug;

  const { data: settings } = usePublishedSettings(isMenuRoute ? restaurantId : null);

  useEffect(() => {
    if (!isMenuRoute) {
      resetToDashboardTheme();
      return;
    }
    if (settings) {
      applyRestaurantTheme(settings);
    }
  }, [settings, isMenuRoute, location.pathname]);

  return <>{children}</>;
}
