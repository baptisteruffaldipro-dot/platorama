import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logoPlatorama from "@/assets/logo-platorama.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      const {
        data: { user: u },
      } = await supabase.auth.getUser();

      if (u) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", u.id);

        const isSA = roles?.some((r) => r.role === "super_admin");

        if (isSA) {
          navigate("/dashboard");
          return;
        }

        const { data: memberships } = await supabase
          .from("restaurant_members")
          .select("restaurant_id")
          .eq("user_id", u.id)
          .order("created_at", { ascending: false });

        if (memberships && memberships.length > 1) {
          // Multiple restaurants — redirect to most recently added
          navigate(`/admin?restaurant=${memberships[0].restaurant_id}`);
        } else if (memberships && memberships.length === 1) {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <img src={logoPlatorama} alt="Plat'O'rama" className="h-12 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mt-1">Connectez-vous pour gérer vos menus</p>
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
