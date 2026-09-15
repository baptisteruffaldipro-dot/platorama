import { motion } from "framer-motion";
import { usePublishedSettings } from "@/hooks/useSiteSettings";

const SplashScreen = ({
  onDone,
  restaurantId,
}: {
  onDone: () => void;
  restaurantId?: string | null;
}) => {
  const { data: settings, isLoading } = usePublishedSettings(restaurantId);

  // Tant que les settings ne sont pas chargés, on affiche un fond neutre
  // pour éviter tout flash de contenu obsolète.
  const ready = !isLoading && !!settings;

  const style = settings?.splash_style ?? "logo_text";
  const hasLogo = !!settings?.logo_url;
  // Si aucun logo n'est disponible, on retombe sur le nom + baseline.
  const mode = style === "logo" && !hasLogo ? "text" : style;

  const showLogo = hasLogo && (mode === "logo" || mode === "logo_text");
  const showText = mode !== "logo";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-6"
      initial={{ opacity: 1 }}
      animate={{ opacity: ready ? 0 : 1 }}
      transition={{ delay: ready ? 1.2 : 0, duration: 0.6 }}
      onAnimationComplete={() => {
        if (ready) onDone();
      }}
    >
      {ready && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center w-full"
        >
          {showLogo && (
            <img
              src={settings!.logo_url}
              alt={settings?.restaurant_name || "Logo"}
              className={
                mode === "logo"
                  ? "w-full max-w-[22rem] max-h-[55vh] object-contain mx-auto"
                  : "h-20 object-contain mx-auto mb-4"
              }
            />
          )}
          {showText && (
            <>
              <h1
                className="text-4xl font-light text-foreground tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {settings?.restaurant_name}
              </h1>
              {settings?.subtitle && (
                <>
                  <div className="w-12 h-px bg-accent mx-auto mt-4" />
                  <p className="text-sm tracking-[0.4em] uppercase text-muted-foreground mt-3">
                    {settings.subtitle}
                  </p>
                </>
              )}
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SplashScreen;
