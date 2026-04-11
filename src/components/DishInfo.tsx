import { motion, AnimatePresence } from "framer-motion";

interface DishInfoProps {
  dish: {
    id: string;
    category: string;
    name: string;
    ingredients: string;
    price: number;
  };
}

const DishInfo = ({ dish }: DishInfoProps) => {
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
        <h1 className="text-3xl font-bold text-foreground uppercase tracking-wide mb-2" style={{ fontFamily: "var(--font-serif)" }}>
          {dish.name}
        </h1>
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
