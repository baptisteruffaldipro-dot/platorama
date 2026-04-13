import { motion } from "framer-motion";
import { usePublishedSettings } from "@/hooks/useSiteSettings";

const SplashScreen = ({
  onDone,
  restaurantId,
}: {
  onDone: () => void;
  restaurantId?: string | null;
}) => {
  const { data: settings } = usePublishedSettings(restaurantId);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
      onAnimationComplete={onDone}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {settings?.logo_url ? (
          <img src={settings.logo_url} alt="Logo" className="h-20 object-contain mx-auto mb-4" />
        ) : null}
        <h1 className="text-4xl font-light text-foreground tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-serif)" }}>
          {settings?.restaurant_name || "La Maison"}
        </h1>
        <div className="w-12 h-px bg-accent mx-auto mt-4" />
        <p className="text-sm tracking-[0.4em] uppercase text-muted-foreground mt-3">
          {settings?.subtitle || "Menu Virtuel"}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
