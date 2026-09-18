import { motion } from "framer-motion";
import { Rotate3d, Clock, Star } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { Dish } from "@/hooks/useDishes";
import type { LayoutVariant } from "@/lib/menuTemplates";
import { hasARModel } from "@/lib/dishHasAR";
import ExpandableDescription from "@/components/ExpandableDescription";
import DishDetailsActions from "@/components/DishDetailsActions";
import DishBadges from "@/components/DishBadges";
import { DisclaimerFooter } from "@/components/MenuDisclaimer";

interface Props {
  dishes: Dish[];
  layout: LayoutVariant;
  onLaunchAR: (dish: Dish) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  disclaimer?: string;
}

/**
 * Vue scroll-vertical : remplace le carrousel pour les templates
 * editorial et pop. Chaque ligne expose un bouton AR direct.
 */
export default function MenuListView({ dishes, layout, onLaunchAR, isFavorite, onToggleFavorite, disclaimer }: Props) {
  const { t } = useTranslation();

  // Group by category, preserve sort_order
  const grouped = dishes.reduce<Record<string, Dish[]>>((acc, d) => {
    (acc[d.category] ??= []).push(d);
    return acc;
  }, {});
  const categories = Object.keys(grouped);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden px-4 pt-5 pb-32">
      {layout === "editorial" && (
        <EditorialList grouped={grouped} categories={categories} t={t} onLaunchAR={onLaunchAR} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
      )}
      {layout === "pop" && (
        <PopGrid grouped={grouped} categories={categories} t={t} onLaunchAR={onLaunchAR} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
      )}
      {disclaimer && <DisclaimerFooter text={disclaimer} className="!pb-28 !pt-0" />}
    </div>
  );
}

interface SubProps {
  grouped: Record<string, Dish[]>;
  categories: string[];
  t: (s: string) => string;
  onLaunchAR: (d: Dish) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

/* ─────────────────── EDITORIAL — magazine, ligne par ligne ─────────────────── */
function EditorialList({ grouped, categories, t, onLaunchAR, isFavorite, onToggleFavorite }: SubProps) {
  return (
    <div className="max-w-md mx-auto space-y-8">
      {categories.map((cat) => (
        <section key={cat}>
          <h2
            className="text-[10px] tracking-[0.5em] uppercase text-muted-foreground mb-4 pb-2 border-b border-foreground/10"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t(cat)}
          </h2>
          <ul className="divide-y divide-foreground/10">
            {grouped[cat].map((d, i) => (
              <motion.li
                key={d.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="py-4 flex gap-4 items-start"
              >
                <div className="w-16 h-16 rounded-md shrink-0 bg-muted/30 overflow-hidden flex items-center justify-center p-1">
                  <img
                    src={d.thumbnail}
                    alt={d.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-end gap-1 mb-2">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h3
                        className="relative inline text-base font-bold text-foreground leading-snug pr-2 after:content-[''] after:absolute after:bottom-[0.15em] after:left-full after:w-[100vw] after:border-b after:border-dotted after:border-foreground/30"
                        style={{ fontFamily: "var(--font-serif)", WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone" }}
                      >
                        {t(d.name)}
                      </h3>
                    </div>
                    <span className="shrink-0 text-base font-bold tabular-nums" style={{ fontFamily: "var(--font-serif)" }}>
                      {d.price.toFixed(2)}€
                    </span>
                  </div>

                  <ExpandableDescription lines={2} className="text-xs text-muted-foreground mt-1">
                    {t(d.ingredients)}
                  </ExpandableDescription>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <div className="flex items-center gap-2">
                      <DishBadges dish={d} compact />
                      {d.prep_time && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {d.prep_time}min
                        </span>
                      )}
                      <DishDetailsActions dish={d} />
                      <button onClick={() => onToggleFavorite(d.id)} aria-label="favori">
                        <Star className={`w-3.5 h-3.5 ${isFavorite(d.id) ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                      </button>
                    </div>
                    {hasARModel(d) && (
                      <button
                        onClick={() => onLaunchAR(d)}
                        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full bg-accent text-accent-foreground hover:opacity-90 active:scale-95 transition-all shadow-md"
                      >
                        <Rotate3d className="w-3.5 h-3.5" />
                        Voir le plat
                      </button>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* ─────────────────── POP — grille options numérotées ─────────────────── */
function PopGrid({ grouped, categories, t, onLaunchAR, isFavorite, onToggleFavorite }: SubProps) {
  // Flatten with global numbering (OPTION 1, 2, 3, …)
  const flat = categories.flatMap((c) => grouped[c]);
  return (
    <div className="max-w-md mx-auto">
      <h2
        className="text-3xl font-black text-center mb-6 uppercase tracking-tight"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Menu <span className="text-accent">options</span>
      </h2>
      <ul className="space-y-3">
        {flat.map((d, i) => (
          <motion.li
            key={d.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
          >
            <button
              onClick={hasARModel(d) ? () => onLaunchAR(d) : undefined}
              disabled={!hasARModel(d)}
              className="w-full text-left rounded-2xl border-2 border-accent/40 hover:border-accent transition-all px-3 py-3 flex items-center gap-3 active:scale-[0.98] disabled:cursor-default disabled:active:scale-100 disabled:hover:border-accent/40"
              style={{ background: "hsl(var(--background))" }}
            >
              <img
                src={d.thumbnail}
                alt={d.name}
                className="w-14 h-14 object-cover rounded-xl shrink-0 bg-muted/30"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-widest uppercase text-accent">
                    OPTION {String(i + 1).padStart(2, "0")}
                  </span>
                  <DishBadges dish={d} compact prominent />
                  <DishDetailsActions dish={d} />
                </div>
                <p
                  className="text-sm font-bold text-foreground leading-snug"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {t(d.name)}
                </p>
                <ExpandableDescription lines={2} className="text-[11px] text-foreground/60">
                  {t(d.ingredients)}
                </ExpandableDescription>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className="text-base font-black px-2 py-0.5 rounded-lg"
                  style={{ background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" }}
                >
                  {d.price.toFixed(0)}€
                </span>
                {hasARModel(d) && <Rotate3d className="w-4 h-4 text-accent" />}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(d.id);
                }}
                className="shrink-0 p-1"
                aria-label="favori"
              >
                <Star className={`w-4 h-4 ${isFavorite(d.id) ? "fill-accent text-accent" : "text-muted-foreground"}`} />
              </button>
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

