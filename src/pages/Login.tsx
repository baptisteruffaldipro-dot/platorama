import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Phone } from "lucide-react";
import logoPlatorama from "@/assets/logo-platorama.png";
import loginHero from "@/assets/login-hero.jpg";

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
            onClick={(e) => {
              e.preventDefault();
              toast.info("Contactez votre administrateur pour réinitialiser votre mot de passe.");
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

      {/* Right — Photo panel (hidden on mobile) */}
      <div
        className="max-md:!hidden"
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Hero image */}
        <img
          src={loginHero}
          alt="Expérience restaurant"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Overlay gradient */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.05) 100%)",
        }} />

        {/* Text overlay */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "48px 40px 80px",
          position: "relative",
          zIndex: 1,
        }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, color: c.white, lineHeight: 1.2, marginBottom: 12 }}>
            Votre menu en 3D,<br />accessible en un clic
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.5, maxWidth: 380 }}>
            Offrez à vos clients une expérience immersive unique.
          </p>
        </div>

        {/* Contact bar — pinned bottom */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          position: "relative",
          zIndex: 2,
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
