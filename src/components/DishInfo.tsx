import { motion, AnimatePresence } from "framer-motion";
import { Star, Info, ChefHat } from "lucide-react";
import AllergensDialog from "@/components/AllergensDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

const FormulasDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <button
        className="w-5 h-5 rounded-full border border-muted-foreground/40 flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
        aria-label="Voir les formules"
      >
        <Info className="w-3 h-3 text-muted-foreground" />
      </button>
    </DialogTrigger>
    <DialogContent className="bg-card border-border max-w-xs">
      <DialogHeader>
        <DialogTitle
          className="text-xl text-foreground tracking-wide uppercase text-center"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Nos Formules
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-3 pt-2 text-center" style={{ fontFamily: "var(--font-serif)" }}>
        <div className="space-y-1">
          <p className="text-sm text-foreground">Entrée / Plat / Dessert</p>
          <p className="text-lg font-semibold text-accent">56 €</p>
        </div>
        <div className="border-t border-border" />
        <div className="space-y-1">
          <p className="text-sm text-foreground">Entrée / Plat ou Plat / Dessert</p>
          <p className="text-lg font-semibold text-accent">48 €</p>
        </div>
        <div className="border-t border-border" />
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div>
            <p className="text-xs text-muted-foreground">Entrée</p>
            <p className="text-sm font-semibold text-accent">17 €</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Plat</p>
            <p className="text-sm font-semibold text-accent">34 €</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Dessert</p>
            <p className="text-sm font-semibold text-accent">14 €</p>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

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

        <div className="flex items-center gap-2 mb-2">
          <p className="text-lg font-semibold text-accent" style={{ fontFamily: "var(--font-serif)" }}>
            {dish.price.toFixed(2)} €
          </p>
          <FormulasDialog />
          {dish.chef_note && (
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="w-5 h-5 rounded-full border border-muted-foreground/40 flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
                  aria-label="Note du chef"
                >
                  <ChefHat className="w-3 h-3 text-muted-foreground" />
                </button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-sm">
                <DialogHeader>
                  <DialogTitle
                    className="text-xl text-foreground tracking-wide uppercase text-center flex items-center justify-center gap-2"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    <ChefHat className="w-5 h-5 text-accent" />
                    Note du Chef
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-foreground leading-relaxed italic text-center pt-2" style={{ fontFamily: "var(--font-serif)" }}>
                  {dish.chef_note}
                </p>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <p className="text-sm italic text-muted-foreground leading-relaxed max-w-[280px]" style={{ fontFamily: "var(--font-serif)" }}>
          {dish.ingredients}
        </p>
        <div className="mt-2">
          <AllergensDialog allergens={dish.allergens ?? []} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DishInfo;
