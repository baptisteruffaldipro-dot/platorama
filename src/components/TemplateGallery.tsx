import { MENU_TEMPLATES, type MenuTemplate } from "@/lib/menuTemplates";
import { Check, Palette } from "lucide-react";

interface Props {
  currentTemplateId?: string;
  onApply: (template: MenuTemplate) => void;
}

export default function TemplateGallery({ currentTemplateId, onApply }: Props) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <Palette className="w-4 h-4" />
        Templates
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Chaque template change la palette, la typographie ET la disposition du menu. Vous pourrez ajuster les couleurs ensuite.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {MENU_TEMPLATES.map((tpl) => {
          const isActive = currentTemplateId === tpl.id;
          return (
            <button
              key={tpl.id}
              onClick={() => onApply(tpl)}
              className="relative group rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                borderColor: isActive ? tpl.preview.accent : "transparent",
              }}
            >
              <div
                className="p-3 space-y-2"
                style={{ background: tpl.preview.background, minHeight: 120 }}
              >
                <div
                  className="text-xs font-bold truncate"
                  style={{ color: tpl.preview.text, fontFamily: `'${tpl.settings.heading_font}', serif` }}
                >
                  La Maison
                </div>
                <div className="text-[9px] tracking-[0.2em] uppercase opacity-60" style={{ color: tpl.preview.text }}>
                  Menu
                </div>
                <div className="flex gap-1 mt-1">
                  <div className="h-1.5 rounded-full flex-1" style={{ background: tpl.preview.text, opacity: 0.2 }} />
                  <div className="h-1.5 rounded-full w-4" style={{ background: tpl.preview.text, opacity: 0.15 }} />
                </div>
                <div
                  className="text-[8px] px-2 py-1 rounded-full font-semibold text-center mt-2"
                  style={{ background: tpl.preview.accent, color: tpl.preview.accentText }}
                >
                  Voir en AR
                </div>
              </div>
              <div className="px-2 py-2 text-center" style={{ background: tpl.preview.background }}>
                <p className="text-xs font-semibold truncate" style={{ color: tpl.preview.text }}>{tpl.name}</p>
                <p className="text-[9px] truncate mt-0.5 opacity-60" style={{ color: tpl.preview.text }}>{tpl.description}</p>
              </div>
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
