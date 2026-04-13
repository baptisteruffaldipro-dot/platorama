import { useEffect } from "react";
import { usePublishedSettings } from "@/hooks/useSiteSettings";

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
  background: "30 50% 97%",       // cream #FFF8F2
  foreground: "0 0% 20%",         // dark text
  card: "0 0% 100%",              // white cards
  cardForeground: "0 0% 20%",
  accent: "352 72% 63%",          // pink #E8637A
  accentForeground: "0 0% 100%",
  secondary: "160 35% 60%",       // mint #6BBFA3
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
  root.style.setProperty("--font-serif", "'HF Gesco', 'Inter', sans-serif");
  document.body.style.fontFamily = "'HF Gesco', 'Inter', sans-serif";
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const restaurantId = new URLSearchParams(window.location.search).get("restaurant");
  const isDashboard = window.location.pathname === "/" || window.location.pathname === "/login";

  const { data: settings } = usePublishedSettings(isDashboard ? null : restaurantId);

  useEffect(() => {
    // Dashboard and login always use default theme
    if (isDashboard) {
      resetToDashboardTheme();
      return;
    }

    if (!settings) return;
    const root = document.documentElement;

    root.style.setProperty("--background", hexToHSL(settings.background_color));
    root.style.setProperty("--card", hexToHSL(settings.background_color));
    root.style.setProperty("--foreground", hexToHSL(settings.text_color));
    root.style.setProperty("--card-foreground", hexToHSL(settings.text_color));
    root.style.setProperty("--primary", hexToHSL(settings.text_color));
    root.style.setProperty("--accent", hexToHSL(settings.button_bg_color));
    root.style.setProperty("--accent-foreground", hexToHSL(settings.button_text_color));
    root.style.setProperty("--font-serif", `'${settings.heading_font}', Georgia, serif`);
    document.body.style.fontFamily = `'${settings.body_font}', Georgia, serif`;

    const fonts = [...new Set([settings.heading_font, settings.body_font])];
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
  }, [settings, isDashboard]);

  return <>{children}</>;
}
