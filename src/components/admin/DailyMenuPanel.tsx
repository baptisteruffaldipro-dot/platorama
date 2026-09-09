import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, Plus, Trash2, Upload, Pencil, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  useRestaurantFeatures,
  useSaveRestaurantFeatures,
} from "@/hooks/useRestaurantFeatures";
import {
  useDailyMenus,
  dailyMenuToday,
  type DailyMenu,
  type DailyMenuItem,
} from "@/hooks/useDailyMenu";

type Draft = Omit<DailyMenu, "id" | "restaurant_id"> & { id?: string };

const emptyDraft = (): Draft => ({
  menu_date: dailyMenuToday(),
  title: "",
  caption: "",
  formula_label: "",
  formula_price: null,
  items: [{ label: "", description: "", price: null }],
  image_square: "",
  image_story: "",
  is_published: true,
});

const DailyMenuPanel = ({ restaurantId }: { restaurantId: string | null }) => {
  const { data: features } = useRestaurantFeatures(restaurantId);
  const save = useSaveRestaurantFeatures(restaurantId);
  const { data: menus, refetch } = useDailyMenus(restaurantId);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [uploading, setUploading] = useState<"square" | "story" | null>(null);

  const uploadImage = async (file: File, kind: "square" | "story") => {
    if (!restaurantId) return;
    setUploading(kind);
    const path = `daily-menus/${restaurantId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("dish-assets").upload(path, file);
    setUploading(null);
    if (error) return toast.error("Erreur d'envoi de l'image");
    const { data } = supabase.storage.from("dish-assets").getPublicUrl(path);
    setEditing((e) =>
      e ? { ...e, [kind === "square" ? "image_square" : "image_story"]: data.publicUrl } : e
    );
    toast.success("Visuel ajouté");
  };

  const setItem = (i: number, patch: Partial<DailyMenuItem>) =>
    setEditing((e) =>
      e ? { ...e, items: e.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) } : e
    );

  const handleSave = async () => {
    if (!editing || !restaurantId) return;
    const items = editing.items.filter((it) => it.label.trim());
    if (!editing.title.trim() && items.length === 0) {
      toast.error("Ajoutez un titre ou au moins un plat");
      return;
    }
    const payload = {
      restaurant_id: restaurantId,
      menu_date: editing.menu_date,
      title: editing.title,
      caption: editing.caption,
      formula_label: editing.formula_label,
      formula_price: editing.formula_price,
      items: items as any,
      image_square: editing.image_square,
      image_story: editing.image_story,
      is_published: editing.is_published,
    };
    const { error } = editing.id
      ? await supabase.from("daily_menus").update(payload).eq("id", editing.id)
      : await supabase.from("daily_menus").upsert(payload, { onConflict: "restaurant_id,menu_date" });
    if (error) return toast.error("Erreur : " + error.message);
    toast.success("Menu du jour enregistré");
    setEditing(null);
    refetch();
  };

  const togglePublished = async (m: DailyMenu) => {
    const { error } = await supabase
      .from("daily_menus")
      .update({ is_published: !m.is_published })
      .eq("id", m.id);
    if (error) return toast.error("Erreur : " + error.message);
    refetch();
  };

  const remove = async (m: DailyMenu) => {
    const { error } = await supabase.from("daily_menus").delete().eq("id", m.id);
    if (error) return toast.error("Erreur : " + error.message);
    toast.success("Menu supprimé");
    refetch();
  };

  const today = dailyMenuToday();

  return (
    <div className="space-y-6 p-4">
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-medium">
            <CalendarDays className="w-4 h-4 text-accent" />
            Menu du jour
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Affiche discrètement la suggestion du jour en haut de la carte, avec visuels prêts pour
            les réseaux.
          </p>
        </div>
        <Switch
          checked={features?.daily_menu_enabled ?? false}
          onCheckedChange={async (v) => {
            try {
              await save.mutateAsync({ daily_menu_enabled: v });
              toast.success(v ? "Menu du jour activé" : "Menu du jour désactivé");
            } catch (e: any) {
              toast.error("Erreur : " + e.message);
            }
          }}
        />
      </div>

      {editing ? (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="font-medium text-sm">
            {editing.id ? "Modifier le menu du jour" : "Nouveau menu du jour"}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={editing.menu_date}
                onChange={(e) => setEditing({ ...editing, menu_date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Titre</Label>
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Suggestion du chef"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Légende</Label>
            <Textarea
              rows={2}
              value={editing.caption}
              onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
              placeholder="Servi midi et soir, jusqu'à épuisement."
            />
          </div>

          <div className="space-y-2">
            <Label>Plats du jour</Label>
            {editing.items.map((it, i) => (
              <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={it.label}
                    onChange={(e) => setItem(i, { label: e.target.value })}
                    placeholder="Entrecôte grillée"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    className="w-24"
                    value={it.price ?? ""}
                    onChange={(e) =>
                      setItem(i, { price: e.target.value === "" ? null : Number(e.target.value) })
                    }
                    placeholder="€"
                  />
                  <button
                    className="text-destructive px-1"
                    aria-label="Retirer le plat"
                    onClick={() =>
                      setEditing({ ...editing, items: editing.items.filter((_, idx) => idx !== i) })
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  value={it.description ?? ""}
                  onChange={(e) => setItem(i, { description: e.target.value })}
                  placeholder="Description courte (optionnelle)"
                />
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setEditing({
                  ...editing,
                  items: [...editing.items, { label: "", description: "", price: null }],
                })
              }
            >
              <Plus className="w-4 h-4 mr-1" /> Ajouter un plat
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Formule</Label>
              <Input
                value={editing.formula_label}
                onChange={(e) => setEditing({ ...editing, formula_label: e.target.value })}
                placeholder="Entrée + plat + dessert"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Prix de la formule</Label>
              <Input
                type="number"
                step="0.01"
                value={editing.formula_price ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    formula_price: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                placeholder="19.90"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([
              { kind: "square" as const, label: "Visuel carré (post)", value: editing.image_square },
              { kind: "story" as const, label: "Visuel story (9:16)", value: editing.image_story },
            ]).map((f) => (
              <div key={f.kind} className="space-y-1.5">
                <Label>{f.label}</Label>
                {f.value && (
                  <img src={f.value} alt={f.label} className="w-full h-28 object-cover rounded-lg" />
                )}
                <label className="flex items-center gap-2 text-sm cursor-pointer text-muted-foreground">
                  <Upload className="w-4 h-4" />
                  {uploading === f.kind ? "Envoi..." : "Choisir une image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], f.kind)}
                  />
                </label>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <span className="text-sm">Publié</span>
            <Switch
              checked={editing.is_published}
              onCheckedChange={(v) => setEditing({ ...editing, is_published: v })}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} className="flex-1">Enregistrer</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setEditing(emptyDraft())} className="w-full">
          <Plus className="w-4 h-4 mr-1" /> Créer le menu du jour
        </Button>
      )}

      <div className="space-y-3">
        {(menus ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aucun menu du jour pour le moment.
          </p>
        )}
        {(menus ?? []).map((m) => (
          <div key={m.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-start gap-3">
              {m.image_square && (
                <img
                  src={m.image_square}
                  alt={m.title}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {new Date(m.menu_date + "T12:00:00").toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                  {m.menu_date === today && " — aujourd'hui"}
                </p>
                <p className="font-medium text-sm break-words">{m.title || "Sans titre"}</p>
                <p className="text-xs text-muted-foreground break-words">
                  {m.items.map((it) => it.label).filter(Boolean).join(" · ")}
                </p>
              </div>
              <Switch checked={m.is_published} onCheckedChange={() => togglePublished(m)} />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {m.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {m.is_published ? "Visible" : "Brouillon"}
              </span>
              {m.formula_price != null && <span>{Number(m.formula_price).toFixed(2)} €</span>}
              <span className="ml-auto flex gap-2">
                <button
                  aria-label="Modifier"
                  onClick={() => setEditing({ ...m, items: m.items.length ? m.items : [{ label: "" }] })}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button aria-label="Supprimer" className="text-destructive" onClick={() => remove(m)}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyMenuPanel;
