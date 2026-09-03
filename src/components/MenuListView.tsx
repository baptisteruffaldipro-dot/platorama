import { motion } from "framer-motion";
import { Rotate3d, Clock, Leaf, Star } from "lucide-react";
import { getBadge, BadgeMark } from "@/lib/badges";
import { useTranslation } from "@/hooks/useTranslation";
import type { Dish } from "@/hooks/useDishes";
import type { LayoutVariant } from "@/lib/menuTemplates";
import { hasARModel } from "@/lib/dishHasAR";
import ExpandableDescription from "@/components/ExpandableDescription";

interface Props {
  dishes: Dish[];
  layout: LayoutVariant;
  onLaunchAR: (dish: Dish) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

const BADGE_CLS: Record<string, string> = {
  bestseller: "bg-orange-500/20 text-orange-500",
  coup_de_coeur: "bg-pink-500/20 text-pink-500",
  nouveau: "bg-emerald-500/20 text-emerald-500",
  viande_bovine_francaise: "bg-foreground/10 text-foreground/80",
};

const BadgeChip = ({ badge }: { badge: string }) => {
  const c = getBadge(badge);
  if (!c) return null;
  if (c.image) return <BadgeMark badge={c} className="h-4" />;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${BADGE_CLS[badge] ?? "bg-foreground/10 text-foreground/80"}`}>
      <BadgeMark badge={c} className="w-2.5 h-2.5" />
      {c.shortLabel}
    </span>
  );
};

/**
 * Vue scroll-vertical : remplace le carrousel pour les templates
 * editorial, vintage, pop et organic. Chaque ligne expose un bouton AR direct.
 */
export default function MenuListView({ dishes, layout, onLaunchAR, isFavorite, onToggleFavorite }: Props) {
  const { t } = useTranslation();

  // Group by category, preserve sort_order
  const grouped = dishes.reduce<Record<string, Dish[]>>((acc, d) => {
    (acc[d.category] ??= []).push(d);
    return acc;
  }, {});
  const categories = Object.keys(grouped);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden px-4 pt-20 pb-32">
      {layout === "editorial" && (
        <EditorialList grouped={grouped} categories={categories} t={t} onLaunchAR={onLaunchAR} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
      )}
      {layout === "vintage" && (
        <VintageList grouped={grouped} categories={categories} t={t} onLaunchAR={onLaunchAR} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
      )}
      {layout === "pop" && (
        <PopGrid grouped={grouped} categories={categories} t={t} onLaunchAR={onLaunchAR} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
      )}
      {layout === "organic" && (
        <OrganicFeed grouped={grouped} categories={categories} t={t} onLaunchAR={onLaunchAR} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
      )}
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
                  <div className="relative overflow-hidden mb-2">
                    <h3
                      className="relative inline text-base font-bold text-foreground leading-snug pr-2 bg-background after:content-[''] after:absolute after:bottom-[0.15em] after:left-full after:w-[100vw] after:border-b after:border-dotted after:border-foreground/30"
                      style={{ fontFamily: "var(--font-serif)", WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone" }}
                    >
                      {t(d.name)}
                    </h3>
                    <span className="absolute right-0 bottom-0 text-base font-bold tabular-nums pl-2 bg-background" style={{ fontFamily: "var(--font-serif)" }}>
                      {d.price.toFixed(2)}€
                    </span>
                  </div>
                  <ExpandableDescription lines={2} className="text-xs text-muted-foreground mt-1">
                    {t(d.ingredients)}
                  </ExpandableDescription>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <div className="flex items-center gap-2">
                      {d.badge && <BadgeChip badge={d.badge} />}
                      {d.prep_time && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {d.prep_time}min
                        </span>
                      )}
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

/* ─────────────────── VINTAGE — carte papier ornée ─────────────────── */
function VintageList({ grouped, categories, t, onLaunchAR, isFavorite, onToggleFavorite }: SubProps) {
  return (
    <div className="max-w-md mx-auto space-y-10">
      {categories.map((cat) => (
        <section key={cat}>
          <div className="flex items-center gap-3 mb-5 text-accent/70">
            <span className="flex-1 h-px bg-current" />
            <span className="text-xs tracking-[0.4em] uppercase" style={{ fontFamily: "var(--font-serif)" }}>
              {t(cat)}
            </span>
            <span className="flex-1 h-px bg-current" />
          </div>
          <ul className="space-y-6">
            {grouped[cat].map((d, i) => (
              <motion.li
                key={d.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h3
                    className="text-xl text-foreground"
                    style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
                  >
                    {t(d.name)}
                  </h3>
                  <button onClick={() => onToggleFavorite(d.id)} aria-label="favori">
                    <Star className={`w-3.5 h-3.5 ${isFavorite(d.id) ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                  </button>
                </div>
                <p
                  className="text-xs text-foreground/70 leading-relaxed max-w-[300px] mx-auto mb-2 italic"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {t(d.ingredients)}
                </p>
                <div className="inline-flex items-center gap-3 px-3 py-1 border border-accent/40 rounded-sm mb-2">
                  <span className="text-sm font-bold text-accent tabular-nums" style={{ fontFamily: "var(--font-serif)" }}>
                    {d.price.toFixed(2)} €
                  </span>
                  {d.badge && <BadgeChip badge={d.badge} />}
                </div>
                {hasARModel(d) && (
                  <div className="mt-1">
                    <motion.button
                      onClick={() => onLaunchAR(d)}
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      whileTap={{ scale: 0.96 }}
                      className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] px-5 py-2.5 rounded-full font-bold shadow-lg shadow-accent/30"
                      style={{
                        fontFamily: "var(--font-serif)",
                        background: "hsl(var(--accent))",
                        color: "hsl(var(--accent-foreground))",
                      }}
                    >
                      <Rotate3d className="w-3.5 h-3.5" />
                      Voir le plat
                    </motion.button>
                  </div>
                )}
                {i < grouped[cat].length - 1 && (
                  <div className="mt-6 text-accent/40 text-sm tracking-widest">✦ ✦ ✦</div>
                )}
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
                  {d.badge && <BadgeChip badge={d.badge} />}
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

/* ─────────────────── ORGANIC — feed grandes photos ─────────────────── */
function OrganicFeed({ grouped, categories, t, onLaunchAR, isFavorite, onToggleFavorite }: SubProps) {
  return (
    <div className="max-w-md mx-auto space-y-8">
      {categories.map((cat) => (
        <section key={cat}>
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-3.5 h-3.5 text-accent" />
            <span className="text-[11px] tracking-[0.3em] uppercase text-accent" style={{ fontFamily: "var(--font-body)" }}>
              {t(cat)}
            </span>
          </div>
          <div className="space-y-6">
            {grouped[cat].map((d, i) => (
              <motion.article
                key={d.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-3xl overflow-hidden bg-card/40"
              >
                <div className="relative">
                  <img
                    src={d.thumbnail}
                    alt={d.name}
                    className="w-full aspect-[4/3] object-cover"
                    loading="lazy"
                  />
                  {/* Floating price pill */}
                  <span
                    className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold tabular-nums backdrop-blur-md"
                    style={{ background: "hsl(var(--accent) / 0.9)", color: "hsl(var(--accent-foreground))" }}
                  >
                    {d.price.toFixed(2)} €
                  </span>
                  {d.prep_time && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-medium bg-background/80 backdrop-blur-md text-foreground flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {d.prep_time}min
                    </span>
                  )}
                  {/* AR CTA on image — masqué si pas de modèle 3D */}
                  {hasARModel(d) && (
                    <button
                      onClick={() => onLaunchAR(d)}
                      className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-foreground text-background text-xs font-semibold shadow-xl active:scale-95"
                    >
                      <Rotate3d className="w-3.5 h-3.5" />
                      Voir le plat
                    </button>
                  )}
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3
                      className="text-lg text-foreground"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {t(d.name)}
                    </h3>
                    <div className="flex items-center gap-2">
                      {d.badge && <BadgeChip badge={d.badge} />}
                      <button onClick={() => onToggleFavorite(d.id)} aria-label="favori">
                        <Star className={`w-4 h-4 ${isFavorite(d.id) ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs italic text-foreground/70 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    {t(d.ingredients)}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
