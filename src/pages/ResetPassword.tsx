import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import logoPlatorama from "@/assets/logo-platorama.png";

const c = {
  pink: "#E8657A",
  dark: "#2D2D2D",
  inputBg: "#F3EFF5",
  inputBorder: "#D0C9D6",
  muted: "#6B7280",
  white: "#FFFFFF",
};

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase sets the session automatically from the recovery link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Mot de passe mis à jour !");
      navigate("/");
    } catch {
      toast.error("Erreur lors de la mise à jour du mot de passe.");
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
  };

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: c.white }}>
        <p style={{ color: c.muted }}>Vérification du lien en cours…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: c.white }}>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: 40 }}>
        <img src={logoPlatorama} alt="Plat'O'rama" style={{ height: 44, objectFit: "contain" }} />
        <h1 style={{ fontSize: 24, fontWeight: 400, color: c.dark, margin: 0 }}>Nouveau mot de passe</h1>

        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nouveau mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ ...inputStyle, paddingRight: 48 }}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: c.muted, padding: 4 }}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirmer le mot de passe"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          style={inputStyle}
        />

        <button type="submit" disabled={loading} style={{ width: "80%", padding: "13px 0", borderRadius: 999, border: "none", background: loading ? c.muted : c.pink, color: "#fff", fontSize: 16, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(232,101,122,0.25)" }}>
          {loading ? "Mise à jour…" : "Mettre à jour"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
