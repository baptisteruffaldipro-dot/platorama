import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

interface DishInfoProps {
  dish: {
    id: string;
    category: string;
    name: string;
    ingredients: string;
    price: number;
  };
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const DishInfo = ({ dish, isFavorite, onToggleFavorite }: DishInfoProps) => {
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
        <span className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-1">
          {dish.category}
        </span>

        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold text-foreground uppercase tracking-wide" style={{ fontFamily: "var(--font-serif)" }}>
            {dish.name}
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

        <p className="text-lg font-semibold text-accent mb-2" style={{ fontFamily: "var(--font-serif)" }}>
          {dish.price.toFixed(2)} €
        </p>
        <p className="text-sm italic text-muted-foreground leading-relaxed max-w-[280px]" style={{ fontFamily: "var(--font-serif)" }}>
          {dish.ingredients}
        </p>
      </motion.div>
    </AnimatePresence>
  );
};

export default DishInfo;
