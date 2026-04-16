import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, Flame, Heart } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

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
  };
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const BadgeChip = ({ badge }: { badge: string }) => {
  const config: Record<string, { icon: React.ElementType; label: string; className: string }> = {
    bestseller: { icon: Flame, label: "Best seller", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    coup_de_coeur: { icon: Heart, label: "Coup de cœur", className: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  };
  const c = config[badge];
  if (!c) return null;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${c.className}`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
};

const DishInfo = ({ dish, isFavorite, onToggleFavorite }: DishInfoProps) => {
  const { t } = useTranslation();

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
        {/* Badge */}
        {dish.badge && (
          <div className="mb-1.5">
            <BadgeChip badge={dish.badge} />
          </div>
        )}

        {/* Category label */}
        <span className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-1">
          {t(dish.category)}
        </span>

        {/* Dish name + favorite */}
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground uppercase tracking-wide" style={{ fontFamily: "var(--font-serif)" }}>
            {t(dish.name)}
          </h1>
          <button
            onClick={onToggleFavorite}
            className="transition-transform active:scale-90"
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                isFavorite
                  ? "fill-accent text-accent"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        </div>

        {/* Ingredients */}
        <p className="text-base italic text-muted-foreground leading-relaxed max-w-[340px] mb-1" style={{ fontFamily: "var(--font-serif)" }}>
          {t(dish.ingredients)}
        </p>

        {/* Price + prep time */}
        <div className="flex items-center gap-3">
          <p className="text-xl sm:text-2xl font-semibold text-accent" style={{ fontFamily: "var(--font-serif)" }}>
            {dish.price.toFixed(2)} €
          </p>
          {dish.prep_time && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              ~{dish.prep_time} min
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DishInfo;
