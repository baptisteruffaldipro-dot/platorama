import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, Plus, Trash2, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Member {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export default function UsersPanel({
  restaurantId,
  isSuperAdmin,
}: {
  restaurantId: string;
  isSuperAdmin: boolean;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("restaurant_members")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at");
    if (data) setMembers(data);
    if (error) toast.error("Erreur chargement membres");
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [restaurantId]);

  const handleAdd = async () => {
    if (!newEmail || !newPassword) {
      toast.error("Email et mot de passe requis");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setSaving(true);

    const { data, error } = await supabase.functions.invoke("create-restaurant-owner", {
      body: {
        email: newEmail,
        password: newPassword,
        restaurant_id: restaurantId,
      },
    });

    if (error || data?.error) {
      toast.error("Erreur : " + (error?.message || data?.error));
    } else {
      toast.success("Utilisateur ajouté");
      setAddOpen(false);
      setNewEmail("");
      setNewPassword("");
      fetchMembers();
    }
    setSaving(false);
  };

  const handleRemove = async (member: Member) => {
    if (!confirm("Retirer cet utilisateur du restaurant ?")) return;
    const { error } = await supabase
      .from("restaurant_members")
      .delete()
      .eq("id", member.id);
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Utilisateur retiré");
      fetchMembers();
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" />
          Utilisateurs ({members.length})
        </h2>
        {isSuperAdmin && (
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Ajouter
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : members.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucun utilisateur</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{member.user_id.slice(0, 8)}…</p>
                  <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(member.created_at).toLocaleDateString("fr-FR")}
                </span>
                {isSuperAdmin && (
                  <Button size="icon" variant="ghost" onClick={() => handleRemove(member)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="utilisateur@email.com"
              />
            </div>
            <div className="space-y-1">
              <Label>Mot de passe temporaire</Label>
              <Input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="motdepasse123"
              />
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={saving}>
              {saving ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
