import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Check, QrCode, Smartphone, ThumbsUp, Star, Mail, Phone, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

/* ─── palette (local to landing, not theme tokens since theme is dark) ─── */
const c = {
  cream: "#FDF6ED",
  pink: "#E8657A",
  pinkLight: "#F2A0AC",
  mint: "#5CB8A5",
  mintLight: "#A8DDD1",
  dark: "#2D2D2D",
  muted: "#8A8A8A",
};

const fontDisplay = "'Playfair Display', serif";
const fontBody = "'DM Sans', sans-serif";

/* ─── data ─── */
const steps = [
  { icon: QrCode, title: "1. Scan du QR Code", desc: "Accès immédiat à la carte interactive via un QR code." },
  { icon: Smartphone, title: "2. Visualisation du plat", desc: "Le client observe avec son téléphone le plat en réalité augmentée." },
  { icon: ThumbsUp, title: "3. Choix facilité", desc: "La décision devient évidente et le choix plus rapide." },
];

const plans = [
  {
    name: "STARTER",
    desc: "Commencez simplement. Révélez l'essentiel.",
    price: 40,
    features: ["Jusqu'à 5 plats en réalité augmentée", "Carte interactive sur téléphone", "Sous-domaine", "Hébergement inclus"],
    bg: c.mint,
    cta: "Choisir cette offre",
  },
  {
    name: "PRO",
    desc: "Digitalisez votre carte. Passez à la vitesse supérieure.",
    price: 70,
    features: ["Jusqu'à 15 plats en réalité augmentée", "Site internet dédié", "Carte interactive sur téléphone", "Nom de domaine inclus", "Hébergement inclus", "Statistiques & gestion des plats"],
    bg: c.pink,
    cta: "Choisir cette offre",
  },
  {
    name: "SIGNATURE",
    desc: "Une expérience entièrement personnalisée.",
    price: 100,
    features: ["Plats étendus ou illimités", "Site & design sur mesure", "Nom de domaine dédié", "Statistiques avancées", "Accompagnement premium"],
    bg: "#C06070",
    cta: "Obtenir un devis personnalisé",
  },
];

const faqs = [
  { q: "Faut-il télécharger une application ?", a: "Non. Platorama fonctionne directement depuis un navigateur via un lien ou un QR code. Aucune application n'est nécessaire." },
  { q: "Les plats sont-ils réellement en 3D ?", a: "Oui, chaque plat est modélisé en 3D et peut être visualisé en réalité augmentée directement sur la table du client." },
  { q: "Combien de temps faut-il pour le mettre en place ?", a: "La mise en place est rapide : comptez quelques jours pour la modélisation de vos plats et la configuration de votre menu." },
  { q: "Que comprennent les frais de mise en route ?", a: "Ils incluent la modélisation 3D de vos plats, la configuration de votre espace et la formation à l'outil." },
  { q: "Dois-je avoir déjà un site internet ?", a: "Non, Platorama fonctionne de manière autonome. Un site dédié peut être inclus selon votre offre." },
  { q: "Quel est l'objectif principal de Platorama ?", a: "Aider vos clients à se projeter avant de commander, pour une prise de décision plus rapide et une meilleure expérience." },
];

const testimonials = [
  { text: "Depuis l'installation de Platorama, nos clients se projettent immédiatement. C'est un vrai plus pour la prise de décision.", name: "Thomas Durand", role: "Restaurateur" },
  { text: "Nos clients adorent voir les plats en 3D avant de commander. Le taux de satisfaction a nettement augmenté.", name: "Sophie Martin", role: "Chef de salle" },
  { text: "Simple à mettre en place et impressionnant pour les clients. Je recommande sans hésiter.", name: "Marc Lefèvre", role: "Gérant de bistrot" },
];

/* ─── components ─── */
const SectionLabel = ({ children }: { children: string }) => (
  <p style={{ fontFamily: fontBody, color: c.mint, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", fontSize: 14, marginBottom: 12 }}>
    {children}
  </p>
);

const SectionTitle = ({ children, color = c.pink }: { children: string; color?: string }) => (
  <h2 style={{ fontFamily: fontDisplay, color, fontWeight: 900, fontSize: "clamp(28px,5vw,48px)", lineHeight: 1.15, marginBottom: 24 }}>
    {children}
  </h2>
);

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${c.mintLight}` }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left" style={{ fontFamily: fontBody, fontWeight: 600, color: c.dark, fontSize: 16 }}>
        <span>{q}</span>
        <ChevronDown className="shrink-0 ml-2 transition-transform" style={{ color: c.mint, transform: open ? "rotate(180deg)" : "rotate(0)" }} size={20} />
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pb-4" style={{ fontFamily: fontBody, color: c.muted, fontSize: 14, lineHeight: 1.7 }}>
          {a}
        </motion.div>
      )}
    </div>
  );
};

/* ─── page ─── */
const Landing = () => {
  const navigate = useNavigate();
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const t = testimonials[testimonialIdx];

  return (
    <div style={{ background: c.cream, color: c.dark, fontFamily: fontBody }}>
      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <div style={{ fontFamily: fontDisplay, fontWeight: 800, fontSize: 24, color: c.pink }}>
          Plat<span style={{ color: c.mint }}>O</span>rama
        </div>
        <div className="hidden md:flex items-center gap-8" style={{ fontFamily: fontBody, fontWeight: 600, fontSize: 14 }}>
          {["Solution", "Tarifs", "FAQ", "Contact"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: c.dark }} className="hover:opacity-70 transition-opacity">{l}</a>
          ))}
        </div>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: c.mint, fontFamily: fontBody }}
        >
          Connexion
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <SectionLabel>Notre promesse</SectionLabel>
          <SectionTitle>Vos plats, comme s'ils étaient déjà sur la table</SectionTitle>
          <p style={{ color: c.muted, fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
            Plat'O'rama révèle le plat avant la commande pour faciliter le choix avec la{" "}
            <span style={{ color: c.pink, fontWeight: 600 }}>réalité augmentée, un menu virtuel et sans application !</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-7 py-3 rounded-full text-white font-bold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: c.pink }}
            >
              Tester l'expérience
            </button>
            <button
              className="px-7 py-3 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: c.mint, color: "white" }}
            >
              Voir une démo
            </button>
          </div>
          <div className="flex items-center gap-3 mt-8">
            <div className="flex -space-x-2">
              {[c.pink, c.mint, c.pinkLight].map((bg, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2" style={{ background: bg, borderColor: c.cream }} />
              ))}
            </div>
            <p style={{ fontSize: 13, color: c.mint, fontWeight: 600 }}>+ de 150 restaurants l'utilisent déjà</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative flex justify-center">
          <div className="w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br" style={{ background: `linear-gradient(135deg, ${c.mintLight}, ${c.pinkLight})` }}>
            <div className="flex items-center justify-center h-full">
              <Smartphone size={120} style={{ color: "white", opacity: 0.4 }} />
            </div>
          </div>
          {/* floating badge */}
          <div className="absolute top-4 right-0 md:-right-4 bg-white rounded-xl shadow-lg px-5 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: c.mint }}>
              <Smartphone size={16} className="text-white" />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 18, color: c.mint }}>100 +</p>
              <p style={{ fontSize: 11, color: c.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Menus virtualisés</p>
            </div>
          </div>
          {/* rating badge */}
          <div className="absolute bottom-4 left-0 md:-left-4 bg-white rounded-xl shadow-lg px-5 py-3 flex items-center gap-3">
            <p style={{ fontWeight: 800, fontSize: 28, color: c.mint }}>4.9</p>
            <div>
              <div className="flex gap-0.5">{Array(5).fill(0).map((_, i) => <Star key={i} size={14} fill="#F5C542" color="#F5C542" />)}</div>
              <p style={{ fontSize: 11, color: c.muted }}>+100 avis</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── LE PROBLÈME ── */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="flex justify-center">
          <div className="w-64 h-80 rounded-2xl" style={{ background: `linear-gradient(135deg, ${c.mintLight}40, ${c.pinkLight}40)` }} />
        </div>
        <div>
          <SectionLabel>Le problème</SectionLabel>
          <SectionTitle>Vos clients hésitent ! Et c'est normal…</SectionTitle>
          <ul className="space-y-3 mb-8">
            {[
              "Une photo ne montre pas les volumes",
              "Une description ne suffit pas à se projeter",
              "Le doute ralentit la décision",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3" style={{ fontSize: 15, color: c.muted }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: c.pink }}>
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                {item}
              </li>
            ))}
          </ul>
          <div className="rounded-full px-8 py-3 text-white font-bold text-center text-sm" style={{ background: c.pink }}>
            Quand on manque d'informations, on choisit moins vite !
          </div>
        </div>
      </section>

      {/* ── LA SOLUTION ── */}
      <section id="solution" className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <SectionLabel>La solution</SectionLabel>
            <SectionTitle>Révélez le plat avant la commande.</SectionTitle>
            <p style={{ color: c.muted, fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
              Plat'O'rama permet à vos clients de voir vos plats en réalité augmentée, comprendre les proportions et se projeter avant même de commander.
            </p>
            <button className="rounded-full px-8 py-3 text-white font-bold text-sm" style={{ background: c.pink }}>
              Moins d'hésitation. Plus de décisions
            </button>
          </div>
          <div className="flex justify-center">
            <div className="w-64 h-96 rounded-2xl" style={{ background: `linear-gradient(135deg, ${c.pinkLight}60, ${c.pink}40)` }} />
          </div>
        </div>

        {/* Comment ça marche */}
        <div className="rounded-3xl px-6 md:px-12 py-14 text-center" style={{ background: c.pink }}>
          <h2 style={{ fontFamily: fontDisplay, fontWeight: 900, fontSize: "clamp(24px,4vw,40px)", color: "white", marginBottom: 32 }}>
            Comment ça marche ?
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            {steps.map((s) => (
              <div key={s.title} className="bg-white rounded-2xl p-6 text-center">
                <s.icon size={48} style={{ color: c.mint, margin: "0 auto 16px" }} />
                <h3 style={{ fontFamily: fontDisplay, fontWeight: 800, fontSize: 16, color: c.dark, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: c.muted, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <button className="rounded-full px-8 py-3 font-bold text-sm border-2 border-white" style={{ color: c.pink, background: "white" }}>
            Essayer !
          </button>
        </div>
      </section>

      {/* ── POUR QUI ── */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto text-center">
        <SectionLabel>Pour qui ?</SectionLabel>
        <SectionTitle>Pensé pour les professionnels de la restauration</SectionTitle>
        <div className="grid sm:grid-cols-3 gap-6 mt-8">
          {[
            { title: "Restaurants indépendants", desc: "Vous misez sur la qualité de vos plats et l'expérience en salle. Plat'O'rama valorise votre travail en révélant vos assiettes avant la commande.", bg: c.mint },
            { title: "Bistrots & restaurants concepts", desc: "Carte courte, plat signature, spécialités maison… Faites ressortir ce qui vous différencie et captez l'attention dès les premières secondes.", bg: c.pink },
            { title: "Restaurants en transition digitale", desc: "Vous voulez proposer une expérience innovante sans application à télécharger. Plat'O'rama apporte une solution simple, immédiate et accessible.", bg: "#C06070" },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl overflow-hidden text-white" style={{ background: item.bg }}>
              <div className="h-48 rounded-xl m-3" style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))` }} />
              <div className="px-5 pb-6 pt-2">
                <h3 style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TARIFS ── */}
      <section id="tarifs" className="px-6 md:px-12 py-20 max-w-7xl mx-auto text-center">
        <SectionLabel>Les offres</SectionLabel>
        <SectionTitle>Des offres simples et évolutives</SectionTitle>
        <div className="grid sm:grid-cols-3 gap-6 mt-8">
          {plans.map((p) => (
            <div key={p.name} className="rounded-2xl text-white p-8 flex flex-col" style={{ background: p.bg }}>
              <h3 style={{ fontFamily: fontDisplay, fontWeight: 800, fontSize: 22, marginBottom: 8 }}>{p.name}</h3>
              <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 20 }}>{p.desc}</p>
              <div className="mb-6">
                <span style={{ fontSize: 12, opacity: 0.8 }}>À partir de </span>
                <span style={{ fontFamily: fontDisplay, fontWeight: 900, fontSize: 42 }}>{p.price}€</span>
                <span style={{ fontSize: 13, opacity: 0.8 }}> / Mois</span>
              </div>
              <ul className="space-y-2.5 text-left mb-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ opacity: 0.95 }}>
                    <Check size={16} className="shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className="rounded-full px-6 py-2.5 font-bold text-sm w-full transition-all hover:opacity-90" style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)" }}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="px-6 md:px-12 py-20 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-start">
        <div>
          <SectionLabel>FAQ</SectionLabel>
          <SectionTitle>Questions fréquentes</SectionTitle>
          <div className="rounded-2xl p-6 mt-6" style={{ background: "white" }}>
            <div className="flex items-center gap-3 mb-2">
              <Mail size={18} style={{ color: c.mint }} />
              <span style={{ fontWeight: 700, color: c.mint }}>Service client</span>
            </div>
            <p style={{ fontSize: 14, color: c.muted }}>contact@platorama.fr</p>
            <p style={{ fontSize: 14, color: c.muted }}>06 95 19 94 27</p>
          </div>
        </div>
        <div>
          {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* ── TÉMOIGNAGE ── */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto text-center">
        <p style={{ fontFamily: fontDisplay, fontWeight: 800, fontSize: 48, color: c.mint, marginBottom: 16 }}>"</p>
        <p style={{ fontFamily: fontBody, fontSize: 18, color: c.muted, fontStyle: "italic", maxWidth: 600, margin: "0 auto 20px", lineHeight: 1.7 }}>
          {t.text}
        </p>
        <div className="flex justify-center gap-0.5 mb-3">{Array(5).fill(0).map((_, i) => <Star key={i} size={16} fill="#F5C542" color="#F5C542" />)}</div>
        <div className="w-14 h-14 rounded-full mx-auto mb-2" style={{ background: c.mintLight }} />
        <p style={{ fontWeight: 700, color: c.dark, fontSize: 15 }}>{t.name}</p>
        <p style={{ color: c.pink, fontSize: 13 }}>{t.role}</p>
        <div className="flex justify-center gap-6 mt-6">
          <button onClick={() => setTestimonialIdx((testimonialIdx - 1 + testimonials.length) % testimonials.length)}>
            <ChevronLeft size={28} style={{ color: c.dark }} />
          </button>
          <button onClick={() => setTestimonialIdx((testimonialIdx + 1) % testimonials.length)}>
            <ChevronRight size={28} style={{ color: c.dark }} />
          </button>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative px-6 py-24 text-center text-white" style={{ background: `linear-gradient(135deg, ${c.pink}, ${c.pinkLight})` }}>
        <p style={{ fontFamily: fontBody, fontSize: 12, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.8, marginBottom: 12 }}>
          Vivez l'expérience
        </p>
        <h2 style={{ fontFamily: fontDisplay, fontWeight: 900, fontSize: "clamp(28px,5vw,44px)", marginBottom: 16 }}>
          Prêt à révéler vos plats ?
        </h2>
        <p style={{ opacity: 0.85, fontSize: 15, maxWidth: 500, margin: "0 auto 32px" }}>
          Offrez à vos clients une nouvelle façon de voir, comprendre et choisir avant la commande.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="rounded-full px-8 py-3 font-bold text-sm" style={{ background: "white", color: c.pink }}>
            👉 Planifier une démonstration
          </button>
          <button className="rounded-full px-8 py-3 font-bold text-sm border-2 border-white" style={{ color: "white", background: "transparent" }}>
            👉 Discuter de mon projet
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 md:px-12 py-12 max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          <div>
            <p style={{ fontFamily: fontDisplay, fontWeight: 800, fontSize: 20, color: c.pink, marginBottom: 8 }}>
              Plat<span style={{ color: c.mint }}>O</span>rama
            </p>
            <p style={{ fontSize: 13, color: c.muted, lineHeight: 1.6 }}>Platorama révèle le plat avant la commande pour faciliter le choix.</p>
          </div>
          <div>
            <h4 style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Contact</h4>
            <p style={{ fontSize: 13, color: c.muted }}>contact@platorama.fr</p>
            <p style={{ fontSize: 13, color: c.muted }}>06 95 19 94 27</p>
          </div>
          <div>
            <h4 style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Support</h4>
            <p style={{ fontSize: 13, color: c.muted }}>Politique de confidentialité</p>
            <p style={{ fontSize: 13, color: c.muted }}>FAQ</p>
            <p style={{ fontSize: 13, color: c.muted }}>Contact</p>
          </div>
        </div>
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: `${c.muted}30` }}>
          <p style={{ fontSize: 12, color: c.muted }}>Copyright © {new Date().getFullYear()} Platorama</p>
          <div className="flex gap-4">
            <span style={{ fontSize: 12, color: c.muted }}>Politique de confidentialité</span>
            <span style={{ fontSize: 12, color: c.muted }}>CGV</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
