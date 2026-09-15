import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, Plus, Trash2, Eye, MousePointerClick, Upload, Pencil, Play, X } from "lucide-react";
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

interface Popup {
  id: string;
  title: string;
  body: string;
  image_url: string;
  starts_at: string | null;
  ends_at: string | null;
  frequency: string;
  target_lang: string | null;
  is_active: boolean;
  sort_order: number;
}

const emptyPopup = (): Omit<Popup, "id"> => ({
  title: "",
  body: "",
  image_url: "",
  starts_at: null,
  ends_at: null,
  frequency: "once_per_day",
  target_lang: null,
  is_active: true,
  sort_order: 0,
});

const frequencies = [
  { value: "once_per_day", label: "Une fois par jour" },
  { value: "once_per_session", label: "Une fois par visite" },
  { value: "once_ever", label: "Une seule fois" },
  { value: "always", label: "À chaque ouverture" },
];

const langs = [
  { value: "all", label: "Toutes les langues" },
  { value: "fr", label: "Français" },
  { value: "en", label: "Anglais" },
  { value: "es", label: "Espagnol" },
  { value: "de", label: "Allemand" },
  { value: "it", label: "Italien" },
];

const toLocalInput = (iso: string | null) =>
  iso ? new Date(iso).toISOString().slice(0, 16) : "";

const PopupsPanel = ({ restaurantId }: { restaurantId: string | null }) => {
  const { data: features } = useRestaurantFeatures(restaurantId);
  const save = useSaveRestaurantFeatures(restaurantId);
  const [editing, setEditing] = useState<(Omit<Popup, "id"> & { id?: string }) | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewData, setPreviewData] = useState<Omit<Popup, "id"> | null>(null);

  const shown = previewData ?? editing;

  const { data: popups, refetch } = useQuery({
    queryKey: ["popups", restaurantId],
    enabled: !!restaurantId,
    queryFn: async (): Promise<Popup[]> => {
      const { data, error } = await supabase
        .from("popups")
        .select("*")
        .eq("restaurant_id", restaurantId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Popup[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["popup-stats", restaurantId, (popups ?? []).length],
    enabled: !!popups && popups.length > 0,
    queryFn: async () => {
      const ids = (popups ?? []).map((p) => p.id);
      const { data, error } = await supabase
        .from("popup_events")
        .select("popup_id, event_type")
        .in("popup_id", ids)
        .limit(10000);
      if (error) throw error;
      const map: Record<string, { impression: number; click: number }> = {};
      (data ?? []).forEach((e: any) => {
        map[e.popup_id] = map[e.popup_id] ?? { impression: 0, click: 0 };
        if (e.event_type === "impression") map[e.popup_id].impression += 1;
        if (e.event_type === "click") map[e.popup_id].click += 1;
      });
      return map;
    },
  });

  const uploadImage = async (file: File) => {
    setUploading(true);
    const path = `popups/${restaurantId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("dish-assets").upload(path, file);
    setUploading(false);
    if (error) {
      toast.error("Erreur d'envoi de l'image");
      return;
    }
    const { data } = supabase.storage.from("dish-assets").getPublicUrl(path);
    setEditing((e) => (e ? { ...e, image_url: data.publicUrl } : e));
    toast.success("Image ajoutée");
  };

  const handleSavePopup = async () => {
    if (!editing || !restaurantId) return;
    if (!editing.title.trim() && !editing.image_url) {
      toast.error("Ajoutez au moins un titre ou une image");
      return;
    }
    const payload = { ...editing, restaurant_id: restaurantId };
    const { error } = editing.id
      ? await supabase.from("popups").update(payload).eq("id", editing.id)
      : await supabase.from("popups").insert(payload);
    if (error) {
      toast.error("Erreur : " + error.message);
      return;
    }
    toast.success("Pop-up enregistré");
    setEditing(null);
    refetch();
  };

  const toggleActive = async (p: Popup) => {
    const { error } = await supabase.from("popups").update({ is_active: !p.is_active }).eq("id", p.id);
    if (error) return toast.error("Erreur : " + error.message);
    refetch();
  };

  const remove = async (p: Popup) => {
    const { error } = await supabase.from("popups").delete().eq("id", p.id);
    if (error) return toast.error("Erreur : " + error.message);
    toast.success("Pop-up supprimé");
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-medium">
            <Megaphone className="w-4 h-4 text-accent" />
            Pop-ups promotionnels
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Affiche une offre élégante et fermable à l'ouverture de la carte.
          </p>
        </div>
        <Switch
          checked={features?.popups_enabled ?? false}
          onCheckedChange={async (v) => {
            try {
              await save.mutateAsync({ popups_enabled: v });
              toast.success(v ? "Pop-ups activés" : "Pop-ups désactivés");
            } catch (e: any) {
              toast.error("Erreur : " + e.message);
            }
          }}
        />
      </div>

      {editing ? (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="font-medium text-sm">{editing.id ? "Modifier le pop-up" : "Nouveau pop-up"}</p>

          <div className="space-y-1.5">
            <Label>Titre</Label>
            <Input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="Happy hour jusqu'à 19h"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Texte</Label>
            <Textarea
              value={editing.body}
              rows={3}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              placeholder="-30% sur toutes les planches à partager."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Image</Label>
            {editing.image_url && (
              <img src={editing.image_url} alt="Aperçu du pop-up" className="w-full h-32 object-cover rounded-lg" />
            )}
            <label className="flex items-center gap-2 text-sm cursor-pointer text-muted-foreground">
              <Upload className="w-4 h-4" />
              {uploading ? "Envoi..." : "Choisir une image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Début</Label>
              <Input
                type="datetime-local"
                value={toLocalInput(editing.starts_at)}
                onChange={(e) =>
                  setEditing({ ...editing, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Fin</Label>
              <Input
                type="datetime-local"
                value={toLocalInput(editing.ends_at)}
                onChange={(e) =>
                  setEditing({ ...editing, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Fréquence</Label>
              <Select
                value={editing.frequency}
                onValueChange={(v) => setEditing({ ...editing, frequency: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {frequencies.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Langue</Label>
              <Select
                value={editing.target_lang ?? "all"}
                onValueChange={(v) => setEditing({ ...editing, target_lang: v === "all" ? null : v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {langs.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button onClick={handleSavePopup} className="flex-1">Enregistrer</Button>
            <Button variant="secondary" onClick={() => setPreview(true)}>
              <Play className="w-4 h-4 mr-1" /> Aperçu
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setEditing(emptyPopup())} className="w-full">
          <Plus className="w-4 h-4 mr-1" /> Créer un pop-up
        </Button>
      )}

      <div className="space-y-3">
        {(popups ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">Aucun pop-up pour le moment.</p>
        )}
        {(popups ?? []).map((p) => {
          const s = stats?.[p.id] ?? { impression: 0, click: 0 };
          const ctr = s.impression ? Math.round((s.click / s.impression) * 100) : 0;
          return (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-start gap-3">
                {p.image_url && (
                  <img src={p.image_url} alt={p.title} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm break-words">{p.title || "Sans titre"}</p>
                  <p className="text-xs text-muted-foreground break-words">{p.body}</p>
                </div>
                <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {s.impression}</span>
                <span className="flex items-center gap-1"><MousePointerClick className="w-3.5 h-3.5" /> {s.click}</span>
                <span>{ctr}% de clics</span>
                <span className="ml-auto flex gap-2">
                  <button
                    onClick={() => {
                      setPreviewData({ ...p });
                      setPreview(true);
                    }}
                    aria-label="Aperçu"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditing({ ...p })} aria-label="Modifier">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(p)} aria-label="Supprimer" className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {preview && shown && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <button
            className="absolute inset-0"
            aria-label="Fermer l'aperçu"
            onClick={() => {
              setPreview(false);
              setPreviewData(null);
            }}
          />
          <div className="relative w-full max-w-sm">
            <p className="text-center text-xs text-white/70 mb-2">
              Aperçu — tel que vos clients le verront
            </p>
            {/* Phone frame */}
            <div className="mx-auto w-full rounded-[2rem] border-4 border-white/20 bg-background overflow-hidden shadow-2xl">
              <div className="relative min-h-[420px] flex items-end justify-center p-4 bg-muted/40">
                <div className="relative w-full rounded-2xl overflow-hidden bg-card border border-border shadow-2xl">
                  <span className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-background/70 backdrop-blur flex items-center justify-center text-foreground">
                    <X className="w-4 h-4" />
                  </span>
                  {shown.image_url && (
                    <img src={shown.image_url} alt={shown.title || "Aperçu"} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-5 space-y-2 text-center">
                    {shown.title && <h2 className="text-lg font-semibold leading-snug">{shown.title}</h2>}
                    {shown.body && (
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{shown.body}</p>
                    )}
                    <div className="pt-2">
                      <span className="block w-full py-2 text-xs text-muted-foreground">
                        Continuer vers la carte
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              className="w-full mt-3"
              onClick={() => {
                setPreview(false);
                setPreviewData(null);
              }}
            >
              Fermer l'aperçu
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupsPanel;
