import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Plus, Send, Trash2, Pencil, Users, BarChart3, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useRestaurantFeatures,
  useSaveRestaurantFeatures,
} from "@/hooks/useRestaurantFeatures";
import {
  useCampaigns,
  useEmailAudience,
  useInvalidateCampaigns,
  type Campaign,
} from "@/hooks/useCampaigns";
import MediaLibrary from "@/components/admin/MediaLibrary";

const langs = [
  { value: "all", label: "Tous les clients" },
  { value: "fr", label: "Français" },
  { value: "en", label: "Anglais" },
  { value: "es", label: "Espagnol" },
  { value: "de", label: "Allemand" },
  { value: "it", label: "Italien" },
];

type Draft = {
  id?: string;
  name: string;
  subject: string;
  body: string;
  image_url: string;
  cta_label: string;
  cta_url: string;
  target_lang: string | null;
};

const emptyDraft = (): Draft => ({
  name: "",
  subject: "",
  body: "",
  image_url: "",
  cta_label: "",
  cta_url: "",
  target_lang: null,
});

const statusLabel: Record<string, string> = {
  draft: "Brouillon",
  sending: "Envoi en cours",
  sent: "Envoyée",
  failed: "Échec",
};

const CampaignsPanel = ({ restaurantId }: { restaurantId: string | null }) => {
  const { data: features } = useRestaurantFeatures(restaurantId);
  const saveFeatures = useSaveRestaurantFeatures(restaurantId);
  const { data: campaigns } = useCampaigns(restaurantId);
  const [draft, setDraft] = useState<Draft | null>(null);
  const audienceLang = draft?.target_lang ?? null;
  const { data: audience } = useEmailAudience(restaurantId, audienceLang);
  const invalidate = useInvalidateCampaigns(restaurantId);
  const [busy, setBusy] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [sender, setSender] = useState<{ name: string; email: string } | null>(null);

  if (!restaurantId) {
    return <p className="p-4 text-muted-foreground">Sélectionnez un restaurant.</p>;
  }

  const senderName = sender?.name ?? features?.crm_sender_name ?? "";
  const senderEmail = sender?.email ?? features?.crm_sender_email ?? "";

  const saveSender = () => {
    saveFeatures.mutate(
      { crm_sender_name: senderName || null, crm_sender_email: senderEmail || null },
      {
        onError: (e: any) => toast.error(e?.message ?? "Erreur"),
        onSuccess: () => {
          setSender(null);
          toast.success("Expéditeur enregistré");
        },
      },
    );
  };

  const saveDraft = async () => {
    if (!draft) return;
    if (!draft.name.trim() || !draft.subject.trim() || !draft.body.trim()) {
      toast.error("Nom, objet et message sont obligatoires");
      return;
    }
    setBusy("save");
    const payload = {
      restaurant_id: restaurantId,
      channel: "email",
      name: draft.name.trim(),
      subject: draft.subject.trim(),
      body: draft.body,
      image_url: draft.image_url,
      cta_label: draft.cta_label,
      cta_url: draft.cta_url,
      target_lang: draft.target_lang,
    };
    const { error } = draft.id
      ? await supabase.from("campaigns").update(payload).eq("id", draft.id)
      : await supabase.from("campaigns").insert(payload);
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Campagne enregistrée");
    setDraft(null);
    invalidate();
  };

  const remove = async (c: Campaign) => {
    if (!confirm(`Supprimer « ${c.name} » ?`)) return;
    const { error } = await supabase.from("campaigns").delete().eq("id", c.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    invalidate();
  };

  const invokeSend = async (campaignId: string, test?: string) => {
    setBusy(test ? `test-${campaignId}` : `send-${campaignId}`);
    const { data, error } = await supabase.functions.invoke("send-campaign", {
      body: test ? { campaign_id: campaignId, test_email: test } : { campaign_id: campaignId },
    });
    setBusy(null);
    invalidate();
    if (error) {
      toast.error("Envoi impossible. Vérifiez l'expéditeur et le service d'emails.");
      return;
    }
    if ((data as any)?.error) {
      toast.error(String((data as any).error));
      return;
    }
    const sent = (data as any)?.sent ?? 0;
    const failed = (data as any)?.failed ?? 0;
    toast.success(
      test ? "Email de test envoyé" : `${sent} email(s) envoyé(s)${failed ? `, ${failed} échec(s)` : ""}`,
    );
  };

  const confirmSend = (c: Campaign) => {
    if (!senderEmail) {
      toast.error("Renseignez d'abord l'adresse d'expédition");
      return;
    }
    if (!confirm(`Envoyer « ${c.name} » à ${audience ?? 0} client(s) ?`)) return;
    invokeSend(c.id);
  };

  return (
    <div className="p-4 space-y-6 max-w-3xl">
      {/* Activation */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-accent mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Campagnes email</p>
            <p className="text-xs text-muted-foreground">
              Écrivez à vos clients fidèles qui ont accepté de recevoir vos messages. Un lien de
              désinscription est ajouté automatiquement à chaque email.
            </p>
          </div>
        </div>
        <Switch
          checked={!!features?.crm_enabled}
          onCheckedChange={(v) =>
            saveFeatures.mutate(
              { crm_enabled: v },
              {
                onError: (e: any) => toast.error(e?.message ?? "Erreur"),
                onSuccess: () => toast.success("Réglage enregistré"),
              },
            )
          }
        />
      </div>

      {/* Expéditeur */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="font-semibold text-sm">Expéditeur</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Nom affiché</Label>
            <Input
              value={senderName}
              placeholder="Ex. : Le Comptoir du Marché"
              onChange={(e) => setSender({ name: e.target.value, email: senderEmail })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Adresse d'envoi</Label>
            <Input
              type="email"
              value={senderEmail}
              placeholder="contact@votre-domaine.fr"
              onChange={(e) => setSender({ name: senderName, email: e.target.value })}
            />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          L'adresse doit appartenir à un domaine vérifié auprès du service d'envoi d'emails.
        </p>
        <Button size="sm" variant="outline" onClick={saveSender} disabled={!sender}>
          Enregistrer l'expéditeur
        </Button>
      </div>

      {/* Audience */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm">
        <Users className="w-4 h-4 text-accent" />
        <span>
          <strong>{audience ?? 0}</strong> client(s) joignable(s) par email
          {audienceLang ? ` (langue : ${audienceLang})` : ""}
        </span>
      </div>

      {/* Éditeur */}
      {draft ? (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="font-semibold text-sm">{draft.id ? "Modifier la campagne" : "Nouvelle campagne"}</p>
          <div className="space-y-1">
            <Label className="text-xs">Nom interne</Label>
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Objet de l'email</Label>
            <Input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Message</Label>
            <Textarea
              rows={6}
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              placeholder={"Bonne nouvelle !\n\nNotre nouvelle carte arrive samedi…"}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Texte du bouton</Label>
              <Input value={draft.cta_label} onChange={(e) => setDraft({ ...draft, cta_label: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Lien du bouton</Label>
              <Input
                value={draft.cta_url}
                placeholder="https://…"
                onChange={(e) => setDraft({ ...draft, cta_url: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Destinataires</Label>
            <Select
              value={draft.target_lang ?? "all"}
              onValueChange={(v) => setDraft({ ...draft, target_lang: v === "all" ? null : v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {langs.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {draft.image_url && (
            <img src={draft.image_url} alt="" className="w-full h-40 object-cover rounded-lg" />
          )}
          <MediaLibrary
            restaurantId={restaurantId}
            selectedUrl={draft.image_url}
            onPick={(a) => setDraft({ ...draft, image_url: a.url })}
          />
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={saveDraft} disabled={busy === "save"}>
              {busy === "save" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>
              Annuler
            </Button>
            {draft.image_url && (
              <Button size="sm" variant="ghost" onClick={() => setDraft({ ...draft, image_url: "" })}>
                Retirer le visuel
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Button size="sm" onClick={() => setDraft(emptyDraft())}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle campagne
          </Button>
          <MediaLibrary restaurantId={restaurantId} />
        </div>
      )}

      {/* Liste */}
      <div className="space-y-3">
        {!campaigns?.length ? (
          <p className="text-xs text-muted-foreground">Aucune campagne pour le moment.</p>
        ) : (
          campaigns.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.subject}</p>
                </div>
                <span className="text-[11px] rounded-full border border-border px-2 py-0.5 shrink-0">
                  {statusLabel[c.status] ?? c.status}
                </span>
              </div>
              {c.status !== "draft" && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5" />
                  {c.sent_count} envoyé(s){c.failed_count ? `, ${c.failed_count} échec(s)` : ""}
                  {c.sent_at ? ` — ${new Date(c.sent_at).toLocaleDateString("fr-FR")}` : ""}
                </p>
              )}
              {c.error && <p className="text-xs text-destructive">{c.error}</p>}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setDraft({
                      id: c.id,
                      name: c.name,
                      subject: c.subject,
                      body: c.body,
                      image_url: c.image_url,
                      cta_label: c.cta_label,
                      cta_url: c.cta_url,
                      target_lang: c.target_lang,
                    })
                  }
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <div className="flex items-center gap-1">
                  <Input
                    className="h-9 w-44"
                    type="email"
                    placeholder="email de test"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!testEmail || busy === `test-${c.id}`}
                    onClick={() => invokeSend(c.id, testEmail)}
                  >
                    {busy === `test-${c.id}` ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Test"
                    )}
                  </Button>
                </div>
                {c.status === "draft" && (
                  <Button size="sm" disabled={busy === `send-${c.id}`} onClick={() => confirmSend(c)}>
                    {busy === `send-${c.id}` ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Envoyer
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => remove(c)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CampaignsPanel;
