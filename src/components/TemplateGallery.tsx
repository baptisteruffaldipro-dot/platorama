import { MENU_TEMPLATES, type MenuTemplate } from "@/lib/menuTemplates";
import { Check, Palette } from "lucide-react";

interface Props {
  currentSettings: {
    background_color: string;
    text_color: string;
    button_bg_color: string;
    button_text_color: string;
    heading_font: string;
    body_font: string;
  };
  onApply: (settings: MenuTemplate["settings"]) => void;
}

export default function TemplateGallery({ currentSettings, onApply }: Props) {
  // Detect which template is closest to current settings
  const activeId = MENU_TEMPLATES.find(
    (t) =>
      t.settings.background_color === currentSettings.background_color &&
      t.settings.text_color === currentSettings.text_color &&
      t.settings.button_bg_color === currentSettings.button_bg_color
  )?.id;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <Palette className="w-4 h-4" />
        Templates
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Choisissez un style prédéfini comme point de départ. Vous pourrez personnaliser ensuite.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {MENU_TEMPLATES.map((tpl) => {
          const isActive = activeId === tpl.id;
          return (
            <button
              key={tpl.id}
              onClick={() => onApply(tpl.settings)}
              className="relative group rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                borderColor: isActive ? tpl.preview.accent : "transparent",
              }}
            >
              {/* Mini preview */}
              <div
                className="p-3 space-y-2"
                style={{
                  background: tpl.preview.background,
                  minHeight: 120,
                }}
              >
                <div
                  className="text-xs font-bold truncate"
                  style={{
                    color: tpl.preview.text,
                    fontFamily: `'${tpl.settings.heading_font}', serif`,
                  }}
                >
                  La Maison
                </div>
                <div
                  className="text-[9px] tracking-[0.2em] uppercase opacity-60"
                  style={{ color: tpl.preview.text }}
                >
                  Menu
                </div>
                <div className="flex gap-1 mt-1">
                  <div
                    className="h-1.5 rounded-full flex-1"
                    style={{ background: tpl.preview.text, opacity: 0.2 }}
                  />
                  <div
                    className="h-1.5 rounded-full w-4"
                    style={{ background: tpl.preview.text, opacity: 0.15 }}
                  />
                </div>
                <div
                  className="text-[8px] px-2 py-1 rounded-full font-semibold text-center mt-2"
                  style={{
                    background: tpl.preview.accent,
                    color: tpl.preview.accentText,
                  }}
                >
                  Voir en AR
                </div>
              </div>

              {/* Label */}
              <div
                className="px-2 py-2 text-center"
                style={{ background: tpl.preview.background }}
              >
                <p
                  className="text-xs font-semibold truncate"
                  style={{ color: tpl.preview.text }}
                >
                  {tpl.name}
                </p>
                <p
                  className="text-[9px] truncate mt-0.5 opacity-60"
                  style={{ color: tpl.preview.text }}
                >
                  {tpl.description}
                </p>
              </div>

              {/* Active badge */}
              {isActive && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: tpl.preview.accent }}
                >
                  <Check className="w-3 h-3" style={{ color: tpl.preview.accentText }} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
