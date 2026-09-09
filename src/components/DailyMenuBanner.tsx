import { useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { useTodayDailyMenu } from "@/hooks/useDailyMenu";
import { useTranslation } from "@/hooks/useTranslation";

const DailyMenuBanner = ({ restaurantId }: { restaurantId: string }) => {
  const { data: menu } = useTodayDailyMenu(restaurantId);
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  if (!menu) return null;

  const label = menu.title?.trim() || t("Menu du jour");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-md border border-border text-xs font-medium hover:border-accent hover:text-accent transition-colors active:scale-95 max-w-[60vw]"
      >
        <CalendarDays className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-card rounded-t-3xl border-t border-border max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {menu.image_square && (
              <img
                src={menu.image_square}
                alt={label}
                className="w-full aspect-square object-cover rounded-t-3xl"
              />
            )}
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    {t("Menu du jour")}
                  </p>
                  <h2 className="text-xl font-semibold break-words">{label}</h2>
                  {menu.caption && (
                    <p className="text-sm text-muted-foreground mt-1 break-words whitespace-pre-line">
                      {menu.caption}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label={t("Fermer")}
                  className="shrink-0 w-8 h-8 rounded-full border border-border flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {menu.items.length > 0 && (
                <ul className="space-y-3">
                  {menu.items.map((it, i) => (
                    <li key={i} className="flex items-baseline gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium break-words">{it.label}</p>
                        {it.description && (
                          <p className="text-xs text-muted-foreground break-words">{it.description}</p>
                        )}
                      </div>
                      {it.price != null && (
                        <span className="text-sm text-accent shrink-0">
                          {Number(it.price).toFixed(2)} €
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {(menu.formula_label || menu.formula_price != null) && (
                <div className="rounded-xl border border-accent/40 bg-accent/5 px-4 py-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium break-words">
                    {menu.formula_label || t("Formule du jour")}
                  </span>
                  {menu.formula_price != null && (
                    <span className="text-base font-semibold text-accent shrink-0">
                      {Number(menu.formula_price).toFixed(2)} €
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DailyMenuBanner;
