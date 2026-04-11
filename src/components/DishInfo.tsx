import { motion, AnimatePresence } from "framer-motion";
import type { Dish } from "@/data/menu";
import { isIOS } from "@/lib/platform";

interface DishInfoProps {
  dish: Dish;
}

const DishInfo = ({ dish }: DishInfoProps) => {
  const ios = isIOS();

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
        <h1 className="text-3xl font-bold text-foreground uppercase tracking-wide mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          {dish.name}
        </h1>
        <p className="text-sm italic text-muted-foreground leading-relaxed max-w-[280px] mb-5" style={{ fontFamily: "var(--font-serif)" }}>
          {dish.ingredients}
        </p>

        {ios ? (
          <a
            href={dish.model_ios}
            rel="ar"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-foreground/30 text-foreground text-sm tracking-widest uppercase hover:bg-foreground/5 active:bg-foreground/10 transition-colors"
          >
            <img src={dish.thumbnail} alt="" className="w-0 h-0" />
            Voir en AR
          </a>
        ) : (
          <button
            onClick={() => {
              const viewer = document.querySelector("model-viewer") as any;
              if (viewer?.activateAR) viewer.activateAR();
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-foreground/30 text-foreground text-sm tracking-widest uppercase hover:bg-foreground/5 active:bg-foreground/10 transition-colors"
          >
            Voir en AR
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default DishInfo;
