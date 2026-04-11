import { motion } from "framer-motion";

const SplashScreen = ({ onDone }: { onDone: () => void }) => {
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
        <h1 className="text-4xl font-light text-foreground tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-serif)" }}>
          La Maison
        </h1>
        <div className="w-12 h-px bg-accent mx-auto mt-4" />
        <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mt-3">
          Menu Virtuel
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
