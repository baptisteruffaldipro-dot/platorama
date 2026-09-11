import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Dices, ShieldAlert, RotateCcw } from "lucide-react";
import type { Dish } from "@/hooks/useDishes";
import {
  DIET_PROFILES,
  filterDishes,
  type DietProfileKey,
  type MenuPreferences,
} from "@/lib/dietProfiles";
import { useTranslation } from "@/hooks/useTranslation";

interface SmartMenuAssistantProps {
  dishes: Dish[];
  prefs: MenuPreferences;
  onChange: (prefs: MenuPreferences) => void;
  /** Appelé avec le plat tiré au sort */
  onPick: (dish: Dish) => void;
  showProfiles: boolean;
  showAllergens: boolean;
  showPickForMe: boolean;
}

const SmartMenuAssistant = ({
  dishes,
  prefs,
  onChange,
  onPick,
  showProfiles,
  showAllergens,
  showPickForMe,
}: SmartMenuAssistantProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Dish | null>(null);

  const allergenOptions = useMemo(() => {
    const set = new Set<string>();
    dishes.forEach((d) => (d.allergens ?? []).forEach((a) => a && set.add(a)));
    return [...set].sort((a, b) => a.localeCompare(b, "fr"));
  }, [dishes]);

  if (!showProfiles && !showAllergens && !showPickForMe) return null;

  const matching = filterDishes(dishes, prefs);
  const activeCount = prefs.profiles.length + prefs.excludedAllergens.length;

  const toggleProfile = (key: DietProfileKey) =>
    onChange({
      ...prefs,
      profiles: prefs.profiles.includes(key)
        ? prefs.profiles.filter((p) => p !== key)
        : [...prefs.profiles, key],
    });

  const toggleAllergen = (a: string) =>
    onChange({
      ...prefs,
      excludedAllergens: prefs.excludedAllergens.includes(a)
        ? prefs.excludedAllergens.filter((x) => x !== a)
        : [...prefs.excludedAllergens, a],
    });

  const pickForMe = () => {
    const pool = matching.length ? matching : dishes;
    if (!pool.length) return;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    setPicked(choice);
    onPick(choice);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 border border-border backdrop-blur-md text-xs font-medium text-foreground hover:bg-card transition-all active:scale-95"
        aria-label="Aide au choix"
      >
        <Sparkles className="w-3.5 h-3.5 text-accent" />
        {t("Aide au choix")}
        {activeCount > 0 && (
          <span className="ml-0.5 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
            {activeCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl bg-card border-t border-border p-5 pb-8 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2
                    className="text-lg font-bold text-foreground flex items-center gap-2"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    <Sparkles className="w-4 h-4 text-accent" />
                    {t("Aide au choix")}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {matching.length} {matching.length > 1 ? t("plats correspondent") : t("plat correspond")}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-full hover:bg-secondary/60"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {showProfiles && (
                <section className="mb-5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {t("Vos préférences")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DIET_PROFILES.map((p) => {
                      const active = prefs.profiles.includes(p.key);
                      return (
                        <button
                          key={p.key}
                          onClick={() => toggleProfile(p.key)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors active:scale-95 ${
                            active
                              ? "border-accent bg-accent/15 text-accent"
                              : "border-border bg-secondary/40 text-foreground"
                          }`}
                          title={p.hint}
                        >
                          <span aria-hidden>{p.emoji}</span>
                          {t(p.label)}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {showAllergens && allergenOptions.length > 0 && (
                <section className="mb-5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {t("Mode allergies — masquer les plats contenant")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {allergenOptions.map((a) => {
                      const active = prefs.excludedAllergens.includes(a);
                      return (
                        <button
                          key={a}
                          onClick={() => toggleAllergen(a)}
                          className={`px-3 py-1.5 rounded-full border text-sm transition-colors active:scale-95 ${
                            active
                              ? "border-destructive bg-destructive/15 text-destructive"
                              : "border-border bg-secondary/40 text-foreground"
                          }`}
                        >
                          {t(a)}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground italic mt-2">
                    {t("Information indicative : signalez toujours votre allergie au personnel.")}
                  </p>
                </section>
              )}

              {showPickForMe && (
                <section className="mb-2">
                  <button
                    onClick={pickForMe}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-accent text-accent-foreground font-semibold active:scale-[0.98] transition-transform"
                  >
                    <Dices className="w-4 h-4" />
                    {t("Choisis pour moi")}
                  </button>
                  {picked && (
                    <div className="mt-3 rounded-2xl border border-border bg-secondary/30 p-3 flex items-center gap-3">
                      {picked.thumbnail && (
                        <img src={picked.thumbnail} alt="" className="w-14 h-14 rounded-xl object-cover" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{t(picked.name)}</p>
                        <p className="text-xs text-muted-foreground truncate">{t(picked.category)}</p>
                      </div>
                      <span className="ml-auto text-sm font-bold text-accent shrink-0">
                        {picked.price ? `${picked.price.toFixed(2)} €` : ""}
                      </span>
                    </div>
                  )}
                </section>
              )}

              {activeCount > 0 && (
                <button
                  onClick={() => onChange({ profiles: [], excludedAllergens: [] })}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t("Tout réinitialiser")}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SmartMenuAssistant;
