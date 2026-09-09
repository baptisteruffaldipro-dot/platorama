import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, MessageSquare, TrendingUp, ExternalLink, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  useRestaurantFeatures,
  useSaveRestaurantFeatures,
} from "@/hooks/useRestaurantFeatures";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  first_name: string | null;
  email: string | null;
  phone: string | null;
  redirected_to_google: boolean;
  created_at: string;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: any;
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="flex items-center gap-2 text-muted-foreground text-xs">
      <Icon className="w-4 h-4" />
      {label}
    </div>
    <p className="text-2xl font-bold mt-1">{value}</p>
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const ReviewsPanel = ({ restaurantId }: { restaurantId: string | null }) => {
  const { data: features } = useRestaurantFeatures(restaurantId);
  const save = useSaveRestaurantFeatures(restaurantId);
  const [googleUrl, setGoogleUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [threshold, setThreshold] = useState(4);

  useEffect(() => {
    if (!features) return;
    setGoogleUrl(features.google_review_url ?? "");
    setPrompt(features.reviews_prompt ?? "");
    setThreshold(features.reviews_threshold ?? 4);
  }, [features?.id, features?.google_review_url, features?.reviews_prompt, features?.reviews_threshold]);

  const { data: reviews, refetch } = useQuery({
    queryKey: ["reviews", restaurantId],
    enabled: !!restaurantId,
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment, first_name, email, phone, redirected_to_google, created_at")
        .eq("restaurant_id", restaurantId!)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Review[];
    },
  });

  const list = reviews ?? [];
  const total = list.length;
  const avg = total ? list.reduce((s, r) => s + r.rating, 0) / total : 0;
  const negatives = list.filter((r) => r.rating < (features?.reviews_threshold ?? 4));
  const redirected = list.filter((r) => r.redirected_to_google).length;
  const positives = total - negatives.length;
  const redirectRate = positives ? Math.round((redirected / positives) * 100) : 0;

  const handleSave = async (patch: Record<string, any>) => {
    try {
      await save.mutateAsync(patch);
      toast.success("Enregistré");
    } catch (e: any) {
      toast.error("Erreur : " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) toast.error("Erreur : " + error.message);
    else {
      toast.success("Retour supprimé");
      refetch();
    }
  };

  if (!restaurantId) {
    return <p className="p-4 text-muted-foreground">Aucun restaurant sélectionné.</p>;
  }

  return (
    <div className="p-4 space-y-6 max-w-3xl">
      {/* Réglages */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Parcours « Votre expérience vous a plu ? »</p>
            <p className="text-xs text-muted-foreground">
              Invitation discrète affichée sur le menu après quelques instants.
            </p>
          </div>
          <Switch
            checked={!!features?.reviews_enabled}
            onCheckedChange={(v) => handleSave({ reviews_enabled: v })}
          />
        </div>

        <div className="space-y-2">
          <Label>Lien de votre page d'avis Google</Label>
          <Input
            value={googleUrl}
            onChange={(e) => setGoogleUrl(e.target.value)}
            placeholder="https://g.page/r/…/review"
          />
          <p className="text-xs text-muted-foreground">
            Sur Google Maps : votre fiche → Avis → Demander des avis, puis copiez le lien.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Texte de l'invitation</Label>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, 90))}
            placeholder="Votre expérience vous a plu ?"
          />
        </div>

        <div className="space-y-2">
          <Label>Note minimale pour proposer Google</Label>
          <div className="flex gap-2">
            {[3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => setThreshold(v)}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  threshold === v
                    ? "border-accent text-accent"
                    : "border-border text-muted-foreground"
                }`}
              >
                {v} étoiles et +
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            En dessous, le client voit un formulaire de retour privé, sans redirection.
          </p>
        </div>

        <Button
          onClick={() =>
            handleSave({
              google_review_url: googleUrl.trim() || null,
              reviews_prompt: prompt.trim() || null,
              reviews_threshold: threshold,
            })
          }
          disabled={save.isPending}
        >
          Enregistrer
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={MessageSquare} label="Retours reçus" value={String(total)} />
        <StatCard icon={Star} label="Note moyenne" value={total ? avg.toFixed(1) : "—"} />
        <StatCard icon={MessageSquare} label="Retours négatifs" value={String(negatives.length)} />
        <StatCard
          icon={TrendingUp}
          label="Redirection Google"
          value={`${redirectRate} %`}
          hint={`${redirected} sur ${positives} avis positifs`}
        />
      </div>

      {/* Retours privés */}
      <div className="space-y-3">
        <h3 className="font-semibold">Retours privés</h3>
        {negatives.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun retour négatif pour le moment.</p>
        ) : (
          negatives.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < r.rating ? "fill-accent text-accent" : "text-muted-foreground"}`}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(r.created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {r.comment && <p className="text-sm">{r.comment}</p>}
              {(r.first_name || r.email || r.phone) && (
                <p className="text-xs text-muted-foreground">
                  {[r.first_name, r.email, r.phone].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {googleUrl && (
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-accent underline"
        >
          <ExternalLink className="w-4 h-4" /> Tester le lien Google
        </a>
      )}
    </div>
  );
};

export default ReviewsPanel;
