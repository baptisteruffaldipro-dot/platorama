import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
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
  };
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

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
        {/* Category label */}
        <span className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-1">
          {t(dish.category)}
        </span>

        {/* Dish name + favorite */}
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground uppercase tracking-wide" style={{ fontFamily: "var(--font-serif)" }}>
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
        <p className="text-base italic text-muted-foreground leading-relaxed max-w-[340px] mb-2" style={{ fontFamily: "var(--font-serif)" }}>
          {t(dish.ingredients)}
        </p>

        {/* Price */}
        <p className="text-xl sm:text-2xl font-semibold text-accent" style={{ fontFamily: "var(--font-serif)" }}>
          {dish.price.toFixed(2)} €
        </p>
      </motion.div>
    </AnimatePresence>
  );
};

export default DishInfo;
