import { useNavigate } from "react-router-dom";
import { Rotate3d, ChevronRight, Sparkles, Eye, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Rotate3d,
    title: "Modèles 3D immersifs",
    desc: "Vos plats prennent vie en 3D directement sur l'écran de vos clients.",
  },
  {
    icon: Smartphone,
    title: "Réalité augmentée",
    desc: "Vos clients visualisent chaque plat sur leur table avant de commander.",
  },
  {
    icon: Eye,
    title: "Menu digital élégant",
    desc: "Une expérience de carte raffinée, personnalisable aux couleurs de votre établissement.",
  },
  {
    icon: Sparkles,
    title: "Gestion simplifiée",
    desc: "Ajoutez, modifiez et publiez vos plats en quelques clics depuis votre tableau de bord.",
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[85vh] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Rotate3d className="w-10 h-10 text-accent" />
            <h1
              className="text-5xl md:text-6xl font-light tracking-[0.15em] uppercase text-foreground"
              style={{ fontFamily: "var(--font-serif, 'Playfair Display', serif)" }}
            >
              Platorama
            </h1>
          </div>

          <div className="w-16 h-px bg-accent mx-auto mb-6" />

          <p
            className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg mx-auto"
            style={{ fontFamily: "var(--font-serif, 'Cormorant Garamond', serif)" }}
          >
            Le menu 3D & réalité augmentée pour les restaurants d'exception.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-accent-foreground text-base font-bold tracking-wide transition-all hover:bg-accent/80 active:scale-95"
            >
              Accéder à mon espace
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Decorative gradient orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-6 rounded-2xl bg-card border border-border hover:border-accent/40 transition-colors"
            >
              <f.icon className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-border">
        <p className="text-xs text-muted-foreground tracking-wider uppercase">
          © {new Date().getFullYear()} Platorama — Tous droits réservés
        </p>
      </footer>
    </div>
  );
};

export default Landing;
