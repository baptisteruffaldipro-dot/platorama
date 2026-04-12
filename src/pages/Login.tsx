import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, isSuperAdmin } = useAuth();
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

      // We need to re-check roles after sign in
      // The auth state change will update isSuperAdmin, but we need to wait
      // Simple approach: check roles manually after login
      const { data: { user: u } } = await (await import("@/integrations/supabase/client")).supabase.auth.getUser();
      if (u) {
        const { data: roles } = await (await import("@/integrations/supabase/client")).supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", u.id);
        const isSA = roles?.some((r) => r.role === "super_admin");
        navigate(isSA ? "/dashboard" : "/admin");
      } else {
        navigate("/admin");
      }
    } catch {
      toast.error("Erreur pendant la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-serif)" }}>
            Back-office
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Connectez-vous pour gérer le menu</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </div>
  );
};

export default Login;
