import { useState } from "react";
import { Gift, Sparkles, Check, Loader2, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useLoyalty } from "@/hooks/useLoyalty";

interface Props {
  restaurantId: string;
  programName?: string | null;
  welcomeText?: string | null;
  rewardThreshold?: number;
  lang?: string;
}

const LoyaltyCard = ({ restaurantId, programName, welcomeText, rewardThreshold = 10, lang }: Props) => {
  const { data, loading, join, updatePrefs, forget } = useLoyalty(restaurantId);
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [contact, setContact] = useState("");
  const [consentEmail, setConsentEmail] = useState(false);
  const [consentSms, setConsentSms] = useState(false);

  const member = data?.member;
  const threshold = data?.settings?.loyalty_reward_threshold ?? rewardThreshold;
  const title = data?.settings?.loyalty_program_name ?? programName ?? "Carte de fidélité";
  const points = member?.points ?? 0;
  const progress = threshold > 0 ? Math.min(100, Math.round((points / threshold) * 100)) : 0;
  const remaining = Math.max(0, threshold - points);

  const handleJoin = async () => {
    const value = contact.trim();
    const isEmail = value.includes("@");
    if (!value) {
      toast.error("Indiquez un email ou un téléphone");
      return;
    }
    try {
      await join({
        first_name: firstName.trim() || undefined,
        email: isEmail ? value : undefined,
        phone: !isEmail ? value : undefined,
        consent_email: consentEmail,
        consent_sms: consentSms,
        lang,
      });
      toast.success("Votre carte est prête !");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Inscription impossible");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed top-16 right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 border border-border backdrop-blur-md text-xs font-medium text-foreground hover:bg-card transition-all active:scale-95"
          aria-label="Ma carte de fidélité"
        >
          <Gift className="w-3.5 h-3.5 text-accent" />
          {member ? `${points} pts` : "Fidélité"}
        </button>
      </DialogTrigger>

      <DialogContent className="bg-card border-border max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">{title}</DialogTitle>
        </DialogHeader>

        {!member ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              {welcomeText ??
                `Cumulez des points à chaque visite et recevez une récompense tous les ${threshold} points.`}
            </p>
            <Input
              placeholder="Prénom (facultatif)"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              placeholder="Email ou téléphone"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            <label className="flex items-start gap-3 text-xs text-muted-foreground">
              <Switch checked={consentEmail} onCheckedChange={setConsentEmail} />
              <span>J'accepte de recevoir les nouveautés et offres par email.</span>
            </label>
            <label className="flex items-start gap-3 text-xs text-muted-foreground">
              <Switch checked={consentSms} onCheckedChange={setConsentSms} />
              <span>J'accepte de recevoir les offres par SMS.</span>
            </label>
            <Button className="w-full" onClick={handleJoin} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer ma carte"}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Vos données servent uniquement au programme de fidélité du restaurant. Vous pouvez vous
              désinscrire à tout moment depuis cette carte.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-accent/40 bg-accent/5 p-4 text-center">
              <p className="text-xs text-muted-foreground">
                {member.first_name ? `Bonjour ${member.first_name}` : "Votre carte"}
              </p>
              <p className="text-4xl font-bold text-accent mt-1">{points}</p>
              <p className="text-xs text-muted-foreground">points · {member.visits} visite(s)</p>

              <div className="h-2 rounded-full bg-muted mt-3 overflow-hidden">
                <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                {remaining === 0
                  ? "Récompense disponible, montrez cette carte !"
                  : `Encore ${remaining} point(s) avant votre récompense`}
              </p>

              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Code à présenter
                </p>
                <p className="text-2xl font-mono tracking-[0.3em] text-foreground">
                  {member.card_code}
                </p>
              </div>
            </div>

            {data.rewards.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Récompenses
                </p>
                {data.rewards.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                  >
                    <div>
                      <p className="text-sm text-foreground">{r.label}</p>
                      {r.description && (
                        <p className="text-xs text-muted-foreground">{r.description}</p>
                      )}
                    </div>
                    <span
                      className={`text-xs shrink-0 flex items-center gap-1 ${
                        points >= r.points_cost ? "text-accent" : "text-muted-foreground"
                      }`}
                    >
                      {points >= r.points_cost ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      {r.points_cost} pts
                    </span>
                  </div>
                ))}
              </div>
            )}

            {data.history.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Historique
                </p>
                {data.history.slice(0, 8).map((h) => (
                  <div key={h.id} className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {new Date(h.created_at).toLocaleDateString("fr-FR")} ·{" "}
                      {h.label ?? (h.kind === "redeem" ? "Récompense utilisée" : "Visite")}
                    </span>
                    <span className={h.points < 0 ? "text-destructive" : "text-accent"}>
                      {h.points > 0 ? `+${h.points}` : h.points}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-border">
              <label className="flex items-center justify-between text-xs text-muted-foreground">
                Offres par email
                <Switch
                  checked={member.consent_email && !member.unsubscribed_at}
                  onCheckedChange={(v) =>
                    updatePrefs({ consent_email: v, consent_sms: member.consent_sms })
                  }
                />
              </label>
              <label className="flex items-center justify-between text-xs text-muted-foreground">
                Offres par SMS
                <Switch
                  checked={member.consent_sms && !member.unsubscribed_at}
                  onCheckedChange={(v) =>
                    updatePrefs({ consent_email: member.consent_email, consent_sms: v })
                  }
                />
              </label>
              <button
                className="text-[11px] text-muted-foreground underline"
                onClick={() =>
                  updatePrefs({ consent_email: false, consent_sms: false, unsubscribe: true })
                }
              >
                Me désinscrire de toutes les communications
              </button>
              <button
                className="flex items-center gap-1 text-[11px] text-muted-foreground underline"
                onClick={forget}
              >
                <LogOut className="w-3 h-3" /> Retirer la carte de ce téléphone
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoyaltyCard;
