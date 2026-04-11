import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDishes, type Dish } from "@/hooks/useDishes";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { LogOut, Plus, Pencil, Trash2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Admin = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { data: dishes, isLoading } = useDishes();
  const queryClient = useQueryClient();
  const [editDish, setEditDish] = useState<Dish | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

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
  });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Chargement...</div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;

  const openNew = () => {
    setIsNew(true);
    setEditDish(null);
    setForm({ category: "ENTRÉE", name: "", ingredients: "", price: "", thumbnail: "", model_ios: "", model_android: "", sort_order: String((dishes?.length ?? 0) + 1) });
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
    };

    let error;
    if (isNew) {
      ({ error } = await supabase.from("dishes").insert(payload));
    } else if (editDish) {
      ({ error } = await supabase.from("dishes").update(payload).eq("id", editDish.id));
    }

    setSaving(false);
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success(isNew ? "Plat ajouté" : "Plat modifié");
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    }
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
    <div className="min-h-screen bg-background text-foreground overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
          Gestion du Menu
        </h1>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={openNew}>
            <Plus className="w-4 h-4 mr-1" /> Ajouter
          </Button>
          <Button size="sm" variant="ghost" onClick={() => signOut()}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Table */}
      <div className="p-4">
        {isLoading ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Image</th>
                  <th className="py-2 px-3">Catégorie</th>
                  <th className="py-2 px-3">Nom</th>
                  <th className="py-2 px-3">Prix</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dishes?.map((dish) => (
                  <tr key={dish.id} className="border-b border-border/50 hover:bg-card/50">
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
                        <Button size="icon" variant="ghost" onClick={() => openEdit(dish)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(dish)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
