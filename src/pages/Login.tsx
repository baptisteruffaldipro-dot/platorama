import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import logoPlatorama from "@/assets/logo-platorama.png";

const c = {
  cream: "#FDF6ED",
  pink: "#E8657A",
  dark: "#2D2D2D",
  inputBg: "#EDE8F0",
  inputBorder: "#D0C9D6",
  muted: "#6B7280",
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
    padding: "16px 20px",
    fontSize: "16px",
    borderRadius: "999px",
    border: `1.5px solid ${c.inputBorder}`,
    background: c.inputBg,
    color: c.dark,
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: c.cream,
        padding: "24px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "440px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "28px",
        }}
      >
        {/* Logo */}
        <img src={logoPlatorama} alt="Plat'O'rama" style={{ height: 48, objectFit: "contain" }} />

        {/* Separator */}
        <div style={{ width: "60%", height: 1, background: c.inputBorder }} />

        {/* Title */}
        <h1 style={{ fontSize: 28, fontWeight: 400, color: c.dark, margin: 0, fontFamily: "inherit" }}>
          Connexion
        </h1>

        {/* Email */}
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

        {/* Password */}
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ ...inputStyle, paddingRight: "52px" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = c.pink)}
            onBlur={(e) => (e.currentTarget.style.borderColor = c.inputBorder)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: c.muted,
              padding: 4,
            }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Reset link */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            toast.info("Contactez votre administrateur pour réinitialiser votre mot de passe.");
          }}
          style={{
            color: c.dark,
            fontSize: 14,
            textDecoration: "underline",
            textUnderlineOffset: 4,
          }}
        >
          Réinitialiser mon mot de passe
        </a>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "70%",
            padding: "14px 0",
            borderRadius: "999px",
            border: "none",
            background: loading ? c.muted : c.pink,
            color: "#fff",
            fontSize: 17,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s, transform 0.1s",
            boxShadow: "0 4px 12px rgba(232,101,122,0.3)",
          }}
        >
          {loading ? "Connexion..." : "Je me connecte"}
        </button>
      </form>
    </div>
  );
};

export default Login;
