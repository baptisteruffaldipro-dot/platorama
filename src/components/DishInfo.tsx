import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, Leaf, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import ExpandableDescription from "@/components/ExpandableDescription";
import DishDetailsActions from "@/components/DishDetailsActions";
import DishBadges from "@/components/DishBadges";
import type { LayoutVariant } from "@/lib/menuTemplates";

interface DishInfoProps {
  dish: {
    id: string;
    category: string;
    name: string;
    ingredients: string;
    price: number;
    allergens?: string[];
    chef_note?: string;
    prep_time?: number | null;
    badge?: string | null;
    is_most_loved?: boolean;
  };
  isFavorite: boolean;
  onToggleFavorite: () => void;
  layout?: LayoutVariant;
}

const FavBtn = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
  <button onClick={onClick} className="transition-transform active:scale-90" aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}>
    <Star className={`w-5 h-5 transition-colors ${active ? "fill-accent text-accent" : "text-muted-foreground"}`} />
  </button>
);

const CollapsibleDescription = ({ text, layout = "classic" }: { text: string; layout?: LayoutVariant }) => {
  const [expanded, setExpanded] = useState(false);
  const isEditorial = layout === "editorial";
  const maxChars = isEditorial ? 80 : 55;
  const needsTruncation = text.length > maxChars;
  const displayed = expanded || !needsTruncation ? text : text.slice(0, maxChars).trimEnd() + "…";

  return (
    <div className={isEditorial ? "" : "flex flex-col items-center"}>
      <p
        className={
          isEditorial
            ? "text-sm text-muted-foreground leading-snug"
            : "text-base italic text-muted-foreground leading-relaxed max-w-[340px] mb-1"
        }
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {displayed}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-0.5 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
        >
          {expanded ? (
            <>Voir moins <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>Voir plus <ChevronDown className="w-3 h-3" /></>
          )}
        </button>
      )}
    </div>
  );
};

const CollapsibleDetails = ({
  description,
  price,
  prepTime,
}: {
  description: string;
  price: number;
  prepTime?: number | null;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col items-center w-full">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground/80 hover:text-muted-foreground transition-colors mb-1"
        aria-expanded={expanded}
      >
        {expanded ? (
          <>Masquer les détails <ChevronUp className="w-3.5 h-3.5" /></>
        ) : (
          <>Voir les détails et le prix <ChevronDown className="w-3.5 h-3.5" /></>
        )}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden flex flex-col items-center"
          >
            <p
              className="text-base italic text-muted-foreground leading-relaxed max-w-[340px] mb-2 mt-1"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {description}
            </p>
            <div className="flex items-center gap-3">
              <p
                className="text-xl sm:text-2xl font-semibold text-accent"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {price.toFixed(2)} €
              </p>
              {prepTime && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  ~{prepTime} min
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DishInfo = ({ dish, isFavorite, onToggleFavorite, layout = "classic" }: DishInfoProps) => {
  const { t } = useTranslation();

  /* ─── EDITORIAL : nom + prix sur la même ligne, séparés par pointillés ─── */
  if (layout === "editorial") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={dish.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="px-6 max-w-md mx-auto"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground">{t(dish.category)}</span>
            <DishBadges dish={dish} compact />
          </div>
          <div className="flex items-end gap-1 mb-2">
            <div className="flex-1 min-w-0 overflow-hidden">
              <h1
                className="relative inline text-2xl font-bold text-foreground tracking-tight leading-tight pr-2 after:content-[''] after:absolute after:bottom-[0.12em] after:left-full after:w-[100vw] after:border-b after:border-dotted after:border-foreground/30"
                style={{ fontFamily: "var(--font-serif)", WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone" }}
              >
                {t(dish.name)}
              </h1>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <p className="text-2xl font-bold text-accent tabular-nums" style={{ fontFamily: "var(--font-serif)" }}>
                {dish.price.toFixed(2)}€
              </p>
              <FavBtn active={isFavorite} onClick={onToggleFavorite} />
            </div>
          </div>


          <ExpandableDescription lines={2} className="text-sm text-muted-foreground leading-snug" style={{ fontFamily: "var(--font-body)" }}>
            {t(dish.ingredients)}
          </ExpandableDescription>
          {dish.prep_time && (
            <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> ~{dish.prep_time} min
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ─── VINTAGE : carte avec ornements, prix encadré ─── */
  if (layout === "vintage") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={dish.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col items-center text-center px-6"
        >
          <DishBadges dish={dish} className="mb-1.5 justify-center" />
          {/* Ornement */}
          <div className="flex items-center gap-2 mb-1.5 text-accent/60">
            <span className="block w-8 h-px bg-current" />
            <span className="text-[10px] tracking-[0.3em] uppercase">{t(dish.category)}</span>
            <span className="block w-8 h-px bg-current" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl text-foreground" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
              {t(dish.name)}
            </h1>
            <FavBtn active={isFavorite} onClick={onToggleFavorite} />
          </div>
          <ExpandableDescription lines={2} className="text-sm text-foreground/80 leading-relaxed max-w-[320px] mb-2" style={{ fontFamily: "var(--font-body)" }}>
            {t(dish.ingredients)}
          </ExpandableDescription>
          <div className="inline-flex items-center gap-3 px-4 py-1 border-2 border-accent/40 rounded-sm">
            <p className="text-xl font-bold text-accent tabular-nums" style={{ fontFamily: "var(--font-serif)" }}>
              {dish.price.toFixed(2)} €
            </p>
            {dish.prep_time && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground border-l border-accent/20 pl-3">
                <Clock className="w-3 h-3" /> ~{dish.prep_time}min
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ─── POP : gros prix coloré encadré, badges arrondis, énergique ─── */
  if (layout === "pop") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={dish.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="px-5 max-w-md mx-auto"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-accent bg-accent/10 px-2 py-0.5 rounded-full mb-1.5">
                {t(dish.category)}
              </span>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
                  {t(dish.name)}
                </h1>
                <FavBtn active={isFavorite} onClick={onToggleFavorite} />
              </div>
              <ExpandableDescription lines={2} className="text-sm text-foreground/70 leading-snug" style={{ fontFamily: "var(--font-body)" }}>
                {t(dish.ingredients)}
              </ExpandableDescription>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <DishBadges dish={dish} compact prominent />
                {dish.prep_time && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" /> {dish.prep_time}min
                  </span>
                )}
              </div>
            </div>
            {/* Big price chip */}
            <div className="shrink-0 flex flex-col items-center justify-center rounded-2xl px-3 py-2 shadow-lg" style={{ background: "hsl(var(--accent))" }}>
              <p className="text-2xl font-black tabular-nums leading-none" style={{ color: "hsl(var(--accent-foreground))", fontFamily: "var(--font-serif)" }}>
                {dish.price.toFixed(0)}
              </p>
              <p className="text-[9px] font-bold opacity-80" style={{ color: "hsl(var(--accent-foreground))" }}>EUROS</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ─── ORGANIC : aéré, prix en pastille, icône feuille ─── */
  if (layout === "organic") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={dish.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center text-center px-6"
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wider uppercase text-accent mb-1.5">
            <Leaf className="w-3 h-3" />
            {t(dish.category)}
          </span>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-normal text-foreground" style={{ fontFamily: "var(--font-serif)" }}>
              {t(dish.name)}
            </h1>
            <FavBtn active={isFavorite} onClick={onToggleFavorite} />
          </div>
          <ExpandableDescription lines={2} className="text-sm text-foreground/70 italic leading-relaxed max-w-[320px] mb-2.5" style={{ fontFamily: "var(--font-body)" }}>
            {t(dish.ingredients)}
          </ExpandableDescription>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center px-4 py-1 rounded-full text-sm font-semibold tabular-nums"
              style={{ background: "hsl(var(--accent) / 0.15)", color: "hsl(var(--accent))" }}
            >
              {dish.price.toFixed(2)} €
            </span>
            <DishBadges dish={dish} compact />
            {dish.prep_time && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="w-3 h-3" /> ~{dish.prep_time}min
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ─── CLASSIC (Dark Luxe — original, inchangé) ─── */
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={dish.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col items-center text-center px-6"
      >
        <DishBadges dish={dish} className="mb-1.5 justify-center" />
        <span className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-1">
          {t(dish.category)}
        </span>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground uppercase tracking-wide" style={{ fontFamily: "var(--font-serif)" }}>
            {t(dish.name)}
          </h1>
          <FavBtn active={isFavorite} onClick={onToggleFavorite} />
        </div>
        <CollapsibleDetails
          description={t(dish.ingredients)}
          price={dish.price}
          prepTime={dish.prep_time}
        />
        <DishDetailsActions dish={dish} className="mt-2" />
      </motion.div>
    </AnimatePresence>
  );
};

export default DishInfo;
