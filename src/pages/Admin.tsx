import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDishes, type Dish } from "@/hooks/useDishes";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { LogOut, Plus, Pencil, Trash2, Upload, Star, Rotate3d, BarChart3, UtensilsCrossed, GripVertical, Settings } from "lucide-react";
import SettingsPanel from "@/components/SettingsPanel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ─── Stats types ─── */
interface DishStats {
  dish_id: string;
  dish_name: string;
  favorites: number;
  ar_clicks: number;
}

/* ─── Stats Panel ─── */
const StatsPanel = ({ dishes }: { dishes: Dish[] }) => {
  const [stats, setStats] = useState<DishStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from("dish_events")
        .select("dish_id, event_type");

      if (error) {
        toast.error("Erreur chargement stats");
        setLoading(false);
        return;
      }

      const counters: Record<string, { favorites: number; ar_clicks: number }> = {};
      dishes.forEach((d) => {
        counters[d.id] = { favorites: 0, ar_clicks: 0 };
      });

      data?.forEach((ev) => {
        if (!counters[ev.dish_id]) counters[ev.dish_id] = { favorites: 0, ar_clicks: 0 };
        if (ev.event_type === "favorite") counters[ev.dish_id].favorites++;
        if (ev.event_type === "ar_click") counters[ev.dish_id].ar_clicks++;
      });

      const result: DishStats[] = dishes.map((d) => ({
        dish_id: d.id,
        dish_name: d.name,
        favorites: counters[d.id]?.favorites ?? 0,
        ar_clicks: counters[d.id]?.ar_clicks ?? 0,
      }));

      setStats(result);
      setLoading(false);
    };

    fetchStats();
  }, [dishes]);

  if (loading) return <p className="text-muted-foreground p-4">Chargement des stats...</p>;

  const maxFav = Math.max(1, ...stats.map((s) => s.favorites));
  const maxAR = Math.max(1, ...stats.map((s) => s.ar_clicks));

  return (
    <div className="p-4 space-y-8">
      {/* Favorites chart */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-accent" />
          Favoris par plat
        </h2>
        <div className="space-y-3">
          {stats.map((s) => (
            <div key={s.dish_id + "-fav"} className="flex items-center gap-3">
              <span className="w-40 text-sm text-foreground truncate">{s.dish_name}</span>
              <div className="flex-1 bg-muted/30 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${Math.max(2, (s.favorites / maxFav) * 100)}%` }}
                >
                  <span className="text-xs font-semibold text-accent-foreground">{s.favorites}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AR clicks chart */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Rotate3d className="w-5 h-5 text-accent" />
          Clics AR par plat
        </h2>
        <div className="space-y-3">
          {stats.map((s) => (
            <div key={s.dish_id + "-ar"} className="flex items-center gap-3">
              <span className="w-40 text-sm text-foreground truncate">{s.dish_name}</span>
              <div className="flex-1 bg-muted/30 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${Math.max(2, (s.ar_clicks / maxAR) * 100)}%` }}
                >
                  <span className="text-xs font-semibold text-primary-foreground">{s.ar_clicks}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Sortable Row ─── */
const SortableRow = ({
  dish,
  onEdit,
  onDelete,
}: {
  dish: Dish;
  onEdit: (d: Dish) => void;
  onDelete: (d: Dish) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: dish.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-border/50 hover:bg-card/50">
      <td className="py-2 px-1 w-8">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none">
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="py-2 px-3 text-muted-foreground">{dish.sort_order}</td>
      <td className="py-2 px-3">
        {dish.thumbnail && (
          <img src={dish.thumbnail} alt={dish.name} className="w-10 h-10 rounded-full object-contain bg-muted/20" />
        )}
      </td>
      <td className="py-2 px-3 text-xs tracking-wider text-muted-foreground">{dish.category}</td>
      <td className="py-2 px-3 font-medium">{dish.name}</td>
      <td className="py-2 px-3">{dish.price.toFixed(2)} €</td>
      <td className="py-2 px-3">
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => onEdit(dish)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(dish)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

/* ─── Admin Page ─── */
const Admin = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { data: dishes, isLoading } = useDishes();
  const queryClient = useQueryClient();
  const [editDish, setEditDish] = useState<Dish | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"menu" | "stats" | "settings">("menu");
  

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Form state
  const [form, setForm] = useState({
    category: "",
    name: "",
    ingredients: "",
    price: "",
    thumbnail: "",
    model_ios: "",
    model_android: "",
    sort_order: "",
    allergens: "",
    chef_note: "",
  });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Chargement...</div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;

  const openNew = () => {
    setIsNew(true);
    setEditDish(null);
    setForm({ category: "ENTRÉE", name: "", ingredients: "", price: "", thumbnail: "", model_ios: "", model_android: "", sort_order: String((dishes?.length ?? 0) + 1), allergens: "", chef_note: "" });
    setDialogOpen(true);
  };

  const openEdit = (dish: Dish) => {
    setIsNew(false);
    setEditDish(dish);
    setForm({
      category: dish.category,
      name: dish.name,
      ingredients: dish.ingredients,
      price: String(dish.price),
      thumbnail: dish.thumbnail,
      model_ios: dish.model_ios,
      model_android: dish.model_android,
      sort_order: String(dish.sort_order),
      allergens: (dish.allergens ?? []).join(", "),
      chef_note: dish.chef_note ?? "",
    });
    setDialogOpen(true);
  };

  const uploadFile = async (file: File, folder: string) => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("dish-assets").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("dish-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "thumbnail" | "model_ios" | "model_android") => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const folder = field === "thumbnail" ? "thumbnails" : "models";
      const url = await uploadFile(file, folder);
      setForm((f) => ({ ...f, [field]: url }));
      toast.success("Fichier uploadé");
    } catch {
      toast.error("Erreur lors de l'upload");
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    setSaving(true);
    const payload = {
      category: form.category,
      name: form.name,
      ingredients: form.ingredients,
      price: parseFloat(form.price) || 0,
      thumbnail: form.thumbnail,
      model_ios: form.model_ios,
      model_android: form.model_android,
      sort_order: parseInt(form.sort_order) || 0,
      allergens: form.allergens.split(",").map((a) => a.trim()).filter(Boolean),
      chef_note: form.chef_note,
    };

    let error;
    if (isNew) {
      ({ error } = await supabase.from("dishes").insert(payload));
    } else if (editDish) {
      ({ error } = await supabase.from("dishes").update(payload).eq("id", editDish.id));
    }

    setSaving(false);
    if (error) {
      if (error.message.includes("dishes_sort_order_unique")) {
        toast.error("Ce numéro d'ordre est déjà utilisé par un autre plat");
      } else {
        toast.error("Erreur : " + error.message);
      }
    } else {
      toast.success(isNew ? "Plat ajouté" : "Plat modifié");
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !dishes) return;

    const oldIndex = dishes.findIndex((d) => d.id === active.id);
    const newIndex = dishes.findIndex((d) => d.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(dishes, oldIndex, newIndex);

    // Optimistic update
    queryClient.setQueryData(["dishes"], reordered.map((d, i) => ({ ...d, sort_order: i + 1 })));

    // Persist: temporarily drop unique constraint, update all, re-add
    // Use negative numbers first to avoid unique conflicts
    const updates = reordered.map((d, i) => ({ id: d.id, sort_order: i + 1 }));

    // Set all to negative first
    for (let i = 0; i < updates.length; i++) {
      await supabase.from("dishes").update({ sort_order: -(i + 1) }).eq("id", updates[i].id);
    }
    // Then set to final values
    for (const u of updates) {
      await supabase.from("dishes").update({ sort_order: u.sort_order }).eq("id", u.id);
    }

    queryClient.invalidateQueries({ queryKey: ["dishes"] });
    toast.success("Ordre mis à jour");
  };


  const handleDelete = async (dish: Dish) => {
    if (!confirm(`Supprimer "${dish.name}" ?`)) return;
    const { error } = await supabase.from("dishes").delete().eq("id", dish.id);
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Plat supprimé");
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-auto admin-layout">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
          Gestion du Menu
        </h1>
        <div className="flex items-center gap-2">
          {tab === "menu" && (
            <Button size="sm" onClick={openNew}>
              <Plus className="w-4 h-4 mr-1" /> Ajouter
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => signOut()}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("menu")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            tab === "menu"
              ? "text-accent border-b-2 border-accent"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          Menu
        </button>
        <button
          onClick={() => setTab("stats")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            tab === "stats"
              ? "text-accent border-b-2 border-accent"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Statistiques
        </button>
        <button
          onClick={() => setTab("settings")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            tab === "settings"
              ? "text-accent border-b-2 border-accent"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="w-4 h-4" />
          Réglages
        </button>
      </div>

      {/* Content */}
      {tab === "menu" ? (
        <div className="p-4">
          {isLoading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : (
            <div className="overflow-x-auto">
             <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 px-1 w-8"></th>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Image</th>
                    <th className="py-2 px-3">Catégorie</th>
                    <th className="py-2 px-3">Nom</th>
                    <th className="py-2 px-3">Prix</th>
                    <th className="py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <SortableContext items={dishes?.map((d) => d.id) ?? []} strategy={verticalListSortingStrategy}>
                    {dishes?.map((dish) => (
                      <SortableRow key={dish.id} dish={dish} onEdit={openEdit} onDelete={handleDelete} />
                    ))}
                  </SortableContext>
                </tbody>
              </table>
            </DndContext>
            </div>
          )}
        </div>
      ) : tab === "stats" ? (
        <StatsPanel dishes={dishes ?? []} />
      ) : (
        <SettingsPanel />
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Nouveau plat" : "Modifier le plat"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Catégorie</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="ENTRÉE">ENTRÉE</option>
                  <option value="PLAT">PLAT</option>
                  <option value="DESSERT">DESSERT</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Ordre</Label>
                <Input value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} type="number" />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Nom</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <Label>Ingrédients</Label>
              <Input value={form.ingredients} onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <Label>Prix (€)</Label>
              <Input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} type="number" step="0.01" />
            </div>

            <div className="space-y-2">
              <Label>Allergènes</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Gluten", "Crustacés", "Œufs", "Poissons", "Arachides", "Soja", "Lait", "Fruits à coque", "Céleri", "Moutarde", "Sésame", "Sulfites", "Lupin", "Mollusques"].map((a) => {
                  const checked = form.allergens.split(",").map((s) => s.trim()).filter(Boolean).includes(a);
                  return (
                    <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const current = form.allergens.split(",").map((s) => s.trim()).filter(Boolean);
                          const next = e.target.checked
                            ? [...current, a]
                            : current.filter((x) => x !== a);
                          setForm((f) => ({ ...f, allergens: next.join(", ") }));
                        }}
                        className="rounded border-input accent-accent"
                      />
                      {a}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Note du Chef</Label>
              <textarea
                value={form.chef_note}
                onChange={(e) => setForm((f) => ({ ...f, chef_note: e.target.value }))}
                placeholder="Description du chef pour ce plat…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-y"
              />
            </div>

            <div className="space-y-1">
              <Label>Thumbnail</Label>
              <div className="flex items-center gap-2">
                <Input value={form.thumbnail} onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))} placeholder="URL ou upload" className="flex-1" />
                <label className="cursor-pointer">
                  <Upload className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "thumbnail")} />
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Modèle iOS (.usdz)</Label>
              <div className="flex items-center gap-2">
                <Input value={form.model_ios} onChange={(e) => setForm((f) => ({ ...f, model_ios: e.target.value }))} placeholder="URL ou upload" className="flex-1" />
                <label className="cursor-pointer">
                  <Upload className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                  <input type="file" accept=".usdz" className="hidden" onChange={(e) => handleFileUpload(e, "model_ios")} />
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Modèle Android (.glb)</Label>
              <div className="flex items-center gap-2">
                <Input value={form.model_android} onChange={(e) => setForm((f) => ({ ...f, model_android: e.target.value }))} placeholder="URL ou upload" className="flex-1" />
                <label className="cursor-pointer">
                  <Upload className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                  <input type="file" accept=".glb" className="hidden" onChange={(e) => handleFileUpload(e, "model_android")} />
                </label>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
