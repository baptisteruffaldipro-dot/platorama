import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Gift, Users, Trophy, Plus, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  useRestaurantFeatures,
  useSaveRestaurantFeatures,
} from "@/hooks/useRestaurantFeatures";

interface Member {
  id: string;
  first_name: string | null;
  email: string | null;
  phone: string | null;
  card_code: string;
  points: number;
  visits: number;
  consent_email: boolean;
  consent_sms: boolean;
  unsubscribed_at: string | null;
  created_at: string;
}

interface Reward {
  id: string;
  label: string;
  description: string | null;
  points_cost: number;
  is_active: boolean;
}

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="flex items-center gap-2 text-muted-foreground text-xs">
      <Icon className="w-4 h-4" />
      {label}
    </div>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

const LoyaltyPanel = ({ restaurantId }: { restaurantId: string | null }) => {
  const qc = useQueryClient();
  const { data: features } = useRestaurantFeatures(restaurantId);
  const save = useSaveRestaurantFeatures(restaurantId);

  const [programName, setProgramName] = useState("");
  const [welcome, setWelcome] = useState("");
  const [perVisit, setPerVisit] = useState(1);
  const [threshold, setThreshold] = useState(10);

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const [newReward, setNewReward] = useState({ label: "", description: "", points_cost: 10 });

  useEffect(() => {
    if (!features) return;
    setProgramName(features.loyalty_program_name ?? "");
    setWelcome(features.loyalty_welcome_text ?? "");
    setPerVisit(features.loyalty_points_per_visit ?? 1);
    setThreshold(features.loyalty_reward_threshold ?? 10);
  }, [features?.id]);

  const { data: members } = useQuery({
    queryKey: ["loyalty-members", restaurantId],
    enabled: !!restaurantId,
    queryFn: async (): Promise<Member[]> => {
      const { data, error } = await supabase
        .from("loyalty_members")
        .select("*")
        .eq("restaurant_id", restaurantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Member[];
    },
  });

  const { data: rewards } = useQuery({
    queryKey: ["loyalty-rewards", restaurantId],
    enabled: !!restaurantId,
    queryFn: async (): Promise<Reward[]> => {
      const { data, error } = await supabase
        .from("loyalty_rewards")
        .select("*")
        .eq("restaurant_id", restaurantId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Reward[];
    },
  });

  const totalMembers = members?.length ?? 0;
  const totalPoints = members?.reduce((s, m) => s + m.points, 0) ?? 0;
  const eligible = members?.filter((m) => m.points >= threshold).length ?? 0;

  const saveSettings = () => {
    save.mutate(
      {
        loyalty_program_name: programName || null,
        loyalty_welcome_text: welcome || null,
        loyalty_points_per_visit: perVisit,
        loyalty_reward_threshold: threshold,
      },
      {
        onSuccess: () => toast.success("Réglages fidélité enregistrés"),
        onError: (e: any) => toast.error(e?.message ?? "Erreur"),
      },
    );
  };

  const addPoints = async (member: Member, points: number, label: string) => {
    setBusy(true);
    try {
      const { error: txError } = await supabase.from("loyalty_transactions").insert({
        restaurant_id: restaurantId,
        member_id: member.id,
        kind: points >= 0 ? "earn" : "redeem",
        points,
        label,
      });
      if (txError) throw txError;
      const { error } = await supabase
        .from("loyalty_members")
        .update({
          points: Math.max(0, member.points + points),
          visits: points > 0 ? member.visits + 1 : member.visits,
          updated_at: new Date().toISOString(),
        })
        .eq("id", member.id);
      if (error) throw error;
      toast.success(points > 0 ? `+${points} point(s) pour ${member.card_code}` : "Récompense utilisée");
      qc.invalidateQueries({ queryKey: ["loyalty-members", restaurantId] });
      setCode("");
    } catch (e: any) {
      toast.error(e?.message ?? "Opération impossible");
    } finally {
      setBusy(false);
    }
  };

  const validateCode = async () => {
    const c = code.trim().toUpperCase();
    if (!c) return;
    const member = members?.find((m) => m.card_code === c);
    if (!member) {
      toast.error("Code introuvable");
      return;
    }
    await addPoints(member, perVisit, "Visite validée");
  };

  const createReward = async () => {
    if (!newReward.label.trim()) return;
    const { error } = await supabase.from("loyalty_rewards").insert({
      restaurant_id: restaurantId,
      label: newReward.label.trim(),
      description: newReward.description.trim() || null,
      points_cost: newReward.points_cost,
      sort_order: rewards?.length ?? 0,
    });
    if (error) return toast.error(error.message);
    setNewReward({ label: "", description: "", points_cost: 10 });
    qc.invalidateQueries({ queryKey: ["loyalty-rewards", restaurantId] });
  };

  const deleteReward = async (id: string) => {
    const { error } = await supabase.from("loyalty_rewards").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["loyalty-rewards", restaurantId] });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Activation */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold flex items-center gap-2">
            <Gift className="w-4 h-4 text-accent" /> Carte de fidélité
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Vos clients créent leur carte depuis le menu, avec le même QR code.
          </p>
        </div>
        <Switch
          checked={!!features?.loyalty_enabled}
          onCheckedChange={(v) =>
            save.mutate(
              { loyalty_enabled: v },
              { onError: (e: any) => toast.error(e?.message ?? "Erreur") },
            )
          }
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Users} label="Membres" value={String(totalMembers)} />
        <StatCard icon={Trophy} label="Récompense prête" value={String(eligible)} />
        <StatCard icon={Gift} label="Points cumulés" value={String(totalPoints)} />
      </div>

      {/* Validation caisse */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="font-semibold text-sm">Valider une visite</p>
        <p className="text-xs text-muted-foreground">
          Demandez le code à 6 caractères affiché sur la carte du client.
        </p>
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex. K7P2XR"
            className="font-mono tracking-widest"
            maxLength={6}
          />
          <Button onClick={validateCode} disabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : `+${perVisit} pt`}
          </Button>
        </div>
      </div>

      {/* Réglages */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="font-semibold text-sm">Règles du programme</p>
        <div>
          <Label className="text-xs">Nom du programme</Label>
          <Input
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="Le Club La Boucherie"
          />
        </div>
        <div>
          <Label className="text-xs">Message d'accueil</Label>
          <Input
            value={welcome}
            onChange={(e) => setWelcome(e.target.value)}
            placeholder="Cumulez des points à chaque visite…"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Points par visite</Label>
            <Input
              type="number"
              min={1}
              value={perVisit}
              onChange={(e) => setPerVisit(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
          <div>
            <Label className="text-xs">Récompense à partir de</Label>
            <Input
              type="number"
              min={1}
              value={threshold}
              onChange={(e) => setThreshold(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
        </div>
        <Button onClick={saveSettings} disabled={save.isPending} className="w-full">
          Enregistrer
        </Button>
      </div>

      {/* Récompenses */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="font-semibold text-sm">Récompenses</p>
        {(rewards ?? []).map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <div>
              <p className="text-sm">{r.label}</p>
              {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
              <p className="text-xs text-accent">{r.points_cost} points</p>
            </div>
            <button onClick={() => deleteReward(r.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-border">
          <Input
            placeholder="Récompense (ex. Dessert offert)"
            value={newReward.label}
            onChange={(e) => setNewReward({ ...newReward, label: e.target.value })}
          />
          <Input
            placeholder="Détail (facultatif)"
            value={newReward.description}
            onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
          />
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              value={newReward.points_cost}
              onChange={(e) =>
                setNewReward({ ...newReward, points_cost: Math.max(1, Number(e.target.value) || 1) })
              }
            />
            <Button onClick={createReward} variant="outline" className="shrink-0">
              <Plus className="w-4 h-4 mr-1" /> Ajouter
            </Button>
          </div>
        </div>
      </div>

      {/* Membres */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <p className="font-semibold text-sm">Membres ({totalMembers})</p>
        {totalMembers === 0 && (
          <p className="text-xs text-muted-foreground">Aucun membre pour l'instant.</p>
        )}
        {(members ?? []).map((m) => (
          <div key={m.id} className="rounded-lg border border-border p-3 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm">
                  {m.first_name ?? "Client"}{" "}
                  <span className="font-mono text-xs text-muted-foreground">{m.card_code}</span>
                </p>
                <p className="text-xs text-muted-foreground">{m.email ?? m.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-accent">{m.points} pts</p>
                <p className="text-[11px] text-muted-foreground">{m.visits} visite(s)</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => addPoints(m, perVisit, "Visite validée")}>
                +{perVisit} pt
              </Button>
              {m.points >= threshold && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addPoints(m, -threshold, "Récompense utilisée")}
                >
                  Utiliser récompense
                </Button>
              )}
              <span className="text-[11px] text-muted-foreground">
                {m.unsubscribed_at
                  ? "Désinscrit"
                  : `${m.consent_email ? "Email OK" : "Email non"} · ${m.consent_sms ? "SMS OK" : "SMS non"}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoyaltyPanel;
