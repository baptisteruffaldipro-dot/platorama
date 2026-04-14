import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Utensils, View, Sparkles, Mail, Phone } from "lucide-react";
import logoPlatorama from "@/assets/logo-platorama.png";

const c = {
  cream: "#FDF6ED",
  pink: "#E8657A",
  mint: "#5CB8A5",
  dark: "#2D2D2D",
  inputBg: "#F3EFF5",
  inputBorder: "#D0C9D6",
  muted: "#6B7280",
  white: "#FFFFFF",
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error("Identifiants incorrects");
        return;
      }

      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", u.id);

        if (roles?.some((r) => r.role === "super_admin")) {
          navigate("/dashboard");
          return;
        }

        const { data: memberships } = await supabase
          .from("restaurant_members")
          .select("restaurant_id")
          .eq("user_id", u.id)
          .order("created_at", { ascending: false });

        if (memberships && memberships.length >= 1) {
          navigate(`/admin?restaurant=${memberships[0].restaurant_id}`);
        } else {
          navigate("/admin");
        }
      } else {
        navigate("/admin");
      }
    } catch {
      toast.error("Erreur pendant la connexion");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 18px",
    fontSize: "15px",
    borderRadius: "12px",
    border: `1.5px solid ${c.inputBorder}`,
    background: c.inputBg,
    color: c.dark,
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: c.white }}>
      {/* Left — Login form */}
      <div
        style={{
          flex: "0 0 480px",
          maxWidth: "480px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px 40px",
          background: c.white,
        }}
        className="max-md:!flex-[1_1_100%] max-md:!max-w-none"
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: "360px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <img src={logoPlatorama} alt="Plat'O'rama" style={{ height: 44, objectFit: "contain" }} />

          <div style={{ width: "70%", height: 1, background: c.inputBorder }} />

          <h1 style={{ fontSize: 24, fontWeight: 400, color: c.dark, margin: 0 }}>
            Connexion
          </h1>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = c.pink)}
            onBlur={(e) => (e.currentTarget.style.borderColor = c.inputBorder)}
          />

          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ ...inputStyle, paddingRight: "48px" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = c.pink)}
              onBlur={(e) => (e.currentTarget.style.borderColor = c.inputBorder)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: c.muted,
                padding: 4,
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <a
            href="#"
            onClick={async (e) => {
              e.preventDefault();
              if (!email) {
                toast.error("Veuillez entrer votre email d'abord.");
                return;
              }
              try {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/reset-password`,
                });
                if (error) throw error;
                toast.success("Un email de réinitialisation a été envoyé.");
              } catch {
                toast.error("Erreur lors de l'envoi de l'email.");
              }
            }}
            style={{ color: c.dark, fontSize: 13, textDecoration: "underline", textUnderlineOffset: 4 }}
          >
            Réinitialiser mon mot de passe
          </a>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "80%",
              padding: "13px 0",
              borderRadius: "999px",
              border: "none",
              background: loading ? c.muted : c.pink,
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              boxShadow: "0 4px 14px rgba(232,101,122,0.25)",
            }}
          >
            {loading ? "Connexion..." : "Je me connecte"}
          </button>
        </form>
      </div>

      {/* Right — Promo panel (hidden on mobile) */}
      <div
        className="max-md:!hidden"
        style={{
          flex: 1,
          background: `linear-gradient(135deg, ${c.pink} 0%, #F4A261 100%)`,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 200, height: 200, borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
        }} />
        <div style={{
          position: "absolute", bottom: 60, left: -40,
          width: 160, height: 160, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }} />

        {/* Main content — centered */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px 48px 24px",
        }}>
          <div style={{ maxWidth: 420, textAlign: "center", color: c.white, position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>
              Votre menu en 3D,<br />accessible en un clic
            </h2>
            <p style={{ fontSize: 16, opacity: 0.9, lineHeight: 1.6, marginBottom: 40 }}>
              Offrez à vos clients une expérience immersive unique. Gérez vos plats, personnalisez votre carte et impressionnez vos convives.
            </p>

            <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
              {[
                { icon: <Utensils size={28} />, label: "Gestion des plats" },
                { icon: <View size={28} />, label: "Aperçu 3D" },
                { icon: <Sparkles size={28} />, label: "Personnalisation" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: "rgba(255,255,255,0.18)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.9 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact bar — pinned bottom */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          position: "relative",
          zIndex: 2,
          borderRadius: "16px 16px 0 0",
          margin: "0 16px",
        }}>
          <span style={{ fontWeight: 700, color: c.dark, fontSize: 13, letterSpacing: 0.5 }}>BESOIN D'AIDE ?</span>
          <a href="mailto:bonjour@platorama.fr" style={{
            display: "flex", alignItems: "center", gap: 8,
            color: c.dark, textDecoration: "none", fontSize: 13,
          }}>
            <Mail size={16} color={c.pink} /> bonjour@platorama.fr
          </a>
          <a href="tel:+33695199427" style={{
            display: "flex", alignItems: "center", gap: 8,
            color: c.dark, textDecoration: "none", fontSize: 13,
          }}>
            <Phone size={16} color={c.pink} /> 06 95 19 94 27
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
