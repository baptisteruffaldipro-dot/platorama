import { useState, useEffect } from "react";
import { compressGlb } from "@/lib/compressGlb";
import { useAuth } from "@/hooks/useAuth";
import { useDishes, type Dish } from "@/hooks/useDishes";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { LogOut, Plus, Pencil, Trash2, Upload, Star, Rotate3d, BarChart3, UtensilsCrossed, GripVertical, Settings, Eye, Users, Mail, ArrowLeft } from "lucide-react";
import SettingsPanel from "@/components/SettingsPanel";
import UsersPanel from "@/components/UsersPanel";
import InfoPanel from "@/components/InfoPanel";
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
import { BADGES, getBadge } from "@/lib/badges";

/* ─── Stats types ─── */
interface DishStats {
  dish_id: string;
  dish_name: string;
  favorites: number;
  ar_clicks: number;
  views: number;
  avg_time: number; // average seconds spent
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

      const counters: Record<string, { favorites: number; ar_clicks: number; views: number; totalTime: number; timeCount: number }> = {};
      dishes.forEach((d) => {
        counters[d.id] = { favorites: 0, ar_clicks: 0, views: 0, totalTime: 0, timeCount: 0 };
      });

      data?.forEach((ev) => {
        if (!counters[ev.dish_id]) counters[ev.dish_id] = { favorites: 0, ar_clicks: 0, views: 0, totalTime: 0, timeCount: 0 };
        if (ev.event_type === "favorite") counters[ev.dish_id].favorites++;
        else if (ev.event_type === "ar_click") counters[ev.dish_id].ar_clicks++;
        else if (ev.event_type === "view") counters[ev.dish_id].views++;
        else if (ev.event_type.startsWith("view_duration_")) {
          const secs = parseInt(ev.event_type.replace("view_duration_", ""));
          if (!isNaN(secs)) {
            counters[ev.dish_id].totalTime += secs;
            counters[ev.dish_id].timeCount++;
          }
        }
      });

      const result: DishStats[] = dishes.map((d) => ({
        dish_id: d.id,
        dish_name: d.name,
        favorites: counters[d.id]?.favorites ?? 0,
        ar_clicks: counters[d.id]?.ar_clicks ?? 0,
        views: counters[d.id]?.views ?? 0,
        avg_time: counters[d.id]?.timeCount ? Math.round(counters[d.id].totalTime / counters[d.id].timeCount) : 0,
      }));

      setStats(result);
      setLoading(false);
    };

    fetchStats();
  }, [dishes]);

  if (loading) return <p className="text-muted-foreground p-4 text-base">Chargement des stats...</p>;

  const maxFav = Math.max(1, ...stats.map((s) => s.favorites));
  const maxAR = Math.max(1, ...stats.map((s) => s.ar_clicks));
  const maxViews = Math.max(1, ...stats.map((s) => s.views));

  // Sort by views for heatmap
  const heatmapStats = [...stats].sort((a, b) => b.views - a.views);

  return (
    <div className="p-4 space-y-8">
      {/* Views chart (most consulted) */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-accent" />
          Plats les plus consultés
        </h2>
        <div className="flex items-end gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ minHeight: 200 }}>
          {stats.map((s) => (
            <div key={s.dish_id + "-views"} className="flex flex-col items-center gap-1 min-w-[48px] flex-1">
              <div className="w-full bg-muted/30 rounded-t-md flex flex-col justify-end items-center" style={{ height: 160 }}>
                <span className="text-sm font-semibold text-blue-400 mb-1">{s.views}</span>
                <div
                  className="w-full bg-blue-500 rounded-t-md transition-all duration-500"
                  style={{ height: `${Math.max(4, (s.views / maxViews) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground text-center leading-tight w-full truncate px-0.5">
                {s.dish_name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          🔥 Heatmap du menu
        </h2>
        <div className="flex items-end gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ minHeight: 200 }}>
          {heatmapStats.map((s) => {
            const ratio = s.views / maxViews;
            const hue = 120 * (1 - ratio);
            return (
              <div key={s.dish_id + "-heat"} className="flex flex-col items-center gap-1 min-w-[48px] flex-1">
                <div className="w-full bg-muted/30 rounded-t-md flex flex-col justify-end items-center" style={{ height: 160 }}>
                  <span className="text-sm font-semibold mb-1" style={{ color: `hsl(${hue}, 80%, 50%)` }}>{s.views}</span>
                  <div
                    className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${Math.max(4, ratio * 100)}%`,
                      backgroundColor: `hsl(${hue}, 80%, 50%)`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground text-center leading-tight w-full truncate px-0.5">
                  {s.dish_name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time spent per dish */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          ⏱️ Temps moyen passé par plat
        </h2>
        {(() => {
          const maxTime = Math.max(1, ...stats.map((x) => x.avg_time));
          const sorted = [...stats].sort((a, b) => b.avg_time - a.avg_time);
          return (
            <div className="flex items-end gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ minHeight: 200 }}>
              {sorted.map((s) => (
                <div key={s.dish_id + "-time"} className="flex flex-col items-center gap-1 min-w-[48px] flex-1">
                  <div className="w-full bg-muted/30 rounded-t-md flex flex-col justify-end items-center" style={{ height: 160 }}>
                    <span className="text-sm font-semibold text-accent mb-1">{s.avg_time}s</span>
                    <div
                      className="w-full bg-accent/70 rounded-t-md transition-all duration-500"
                      style={{ height: `${Math.max(4, (s.avg_time / maxTime) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground text-center leading-tight w-full truncate px-0.5">
                    {s.dish_name}
                  </span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-accent" />
          Favoris par plat
        </h2>
        <div className="flex items-end gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ minHeight: 200 }}>
          {stats.map((s) => (
            <div key={s.dish_id + "-fav"} className="flex flex-col items-center gap-1 min-w-[48px] flex-1">
              <div className="w-full bg-muted/30 rounded-t-md flex flex-col justify-end items-center" style={{ height: 160 }}>
                <span className="text-sm font-semibold text-accent mb-1">{s.favorites}</span>
                <div
                  className="w-full bg-accent rounded-t-md transition-all duration-500"
                  style={{ height: `${Math.max(4, (s.favorites / maxFav) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground text-center leading-tight w-full truncate px-0.5">
                {s.dish_name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AR clicks chart */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Rotate3d className="w-5 h-5 text-accent" />
          Clics AR par plat
        </h2>
        <div className="flex items-end gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ minHeight: 200 }}>
          {stats.map((s) => (
            <div key={s.dish_id + "-ar"} className="flex flex-col items-center gap-1 min-w-[48px] flex-1">
              <div className="w-full bg-muted/30 rounded-t-md flex flex-col justify-end items-center" style={{ height: 160 }}>
                <span className="text-sm font-semibold text-primary mb-1">{s.ar_clicks}</span>
                <div
                  className="w-full bg-primary rounded-t-md transition-all duration-500"
                  style={{ height: `${Math.max(4, (s.ar_clicks / maxAR) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground text-center leading-tight w-full truncate px-0.5">
                {s.dish_name}
              </span>
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
    <tr ref={setNodeRef} style={style} className={`border-b border-border/50 hover:bg-card/50 ${!dish.is_available ? "opacity-40" : ""}`}>
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
      <td className="py-2.5 px-3 text-sm tracking-wider text-muted-foreground">{dish.category}</td>
      <td className="py-2.5 px-3 font-medium text-sm">
        <div className="flex items-center gap-1.5">
          {dish.name}
          {getBadge(dish.badge) && <span title={getBadge(dish.badge)!.label}>{getBadge(dish.badge)!.emoji}</span>}
          {!dish.is_available && <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive font-semibold">Indispo</span>}
        </div>
      </td>
      <td className="py-2.5 px-3 text-sm">{dish.price.toFixed(2)} €</td>
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
  const { user, isAdmin, isSuperAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurant");
  const { data: dishes, isLoading } = useDishes(restaurantId);
  const features = useSubscriptionFeatures(restaurantId);
  const queryClient = useQueryClient();
  const [editDish, setEditDish] = useState<Dish | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"menu" | "stats" | "settings" | "users" | "info">("menu");
  const [isResolvingRestaurant, setIsResolvingRestaurant] = useState(false);
  const [scopeError, setScopeError] = useState<string | null>(null);
  

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (authLoading || !user || !isAdmin || restaurantId) {
      setIsResolvingRestaurant(false);
      setScopeError(null);
      return;
    }

    if (isSuperAdmin) {
      navigate("/", { replace: true });
      return;
    }

    let ignore = false;

    const resolveRestaurant = async () => {
      setIsResolvingRestaurant(true);
      setScopeError(null);

      const { data, error } = await supabase
        .from("restaurant_members")
        .select("restaurant_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (ignore) return;

      if (error || !data?.restaurant_id) {
        setScopeError("Aucun restaurant associé à ce compte.");
        setIsResolvingRestaurant(false);
        return;
      }

      navigate(`/admin?restaurant=${data.restaurant_id}`, { replace: true });
    };

    void resolveRestaurant();

    return () => {
      ignore = true;
    };
  }, [authLoading, isAdmin, isSuperAdmin, navigate, restaurantId, user]);

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
    prep_time: "",
    is_available: true,
    badge: "",
    time_slot: "both",
    story_text: "",
    story_image: "",
  });

  if (authLoading || isResolvingRestaurant) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Chargement...</div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  if (!restaurantId && scopeError) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">{scopeError}</div>;
  if (!restaurantId) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Chargement...</div>;

  const openNew = () => {
    setIsNew(true);
    setEditDish(null);
    const maxOrder = dishes?.length ? Math.max(...dishes.map((d) => d.sort_order)) : 0;
    setForm({ category: "ENTRÉE", name: "", ingredients: "", price: "", thumbnail: "", model_ios: "", model_android: "", sort_order: String(maxOrder + 1), allergens: "", chef_note: "", prep_time: "", is_available: true, badge: "", time_slot: "both", story_text: "", story_image: "" });
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
      prep_time: dish.prep_time != null ? String(dish.prep_time) : "",
      is_available: dish.is_available ?? true,
      badge: dish.badge ?? "",
      time_slot: dish.time_slot ?? "both",
      story_text: dish.story_text ?? "",
      story_image: dish.story_image ?? "",
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
    let file = e.target.files?.[0];
    if (!file) return;
    try {
      // Auto-compress GLB files with Draco before upload
      if (field === "model_android" && file.name.endsWith(".glb")) {
        toast.info("Compression du modèle 3D en cours...");
        file = await compressGlb(file);
        toast.success("Modèle compressé avec succès");
      }
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
      prep_time: form.prep_time ? parseInt(form.prep_time) : null,
      is_available: form.is_available,
      badge: form.badge || null,
      time_slot: form.time_slot,
      story_text: form.story_text,
      story_image: form.story_image,
    };

    let error;
    if (isNew) {
      ({ error } = await supabase.from("dishes").insert({ ...payload, restaurant_id: restaurantId }));
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
      <header
        className="sticky top-0 z-10 border-b border-border bg-card px-3 pb-2 sm:px-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)" }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex items-center gap-2 sm:gap-3">
            {isSuperAdmin && (
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}
            <h1 className="truncate text-lg font-bold leading-none sm:text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
              <span className="sm:hidden">Menu</span>
              <span className="hidden sm:inline">Gestion du Menu</span>
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {tab === "menu" && (
              <Button size="sm" onClick={openNew} className="h-9 bg-accent px-2 text-accent-foreground hover:bg-accent/90 sm:px-3">
                <Plus className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Ajouter</span>
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-9 px-2 sm:px-3" onClick={async () => {
              if (!restaurantId) return;
              // Open the tab synchronously to keep the user-gesture (avoids popup blockers)
              const win = window.open("about:blank", "_blank");
              const { data, error } = await supabase
                .from("restaurants")
                .select("slug")
                .eq("id", restaurantId)
                .maybeSingle();
              if (data?.slug) {
                if (win) win.location.href = `/m/${data.slug}`;
                else window.location.href = `/m/${data.slug}`;
              } else {
                if (win) win.close();
                toast.error("Slug introuvable pour ce restaurant. " + (error?.message ?? ""));
              }
            }}>
              <Eye className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Voir le menu</span>
            </Button>
            <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => signOut()}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {([
          { key: "menu", icon: UtensilsCrossed, label: "Menu", superOnly: false, needsFeature: null },
          { key: "stats", icon: BarChart3, label: "Stats", superOnly: false, needsFeature: "hasStats" as const },
          { key: "settings", icon: Settings, label: "Réglages", superOnly: false, needsFeature: null },
          { key: "users", icon: Users, label: "Utilisateurs", superOnly: true, needsFeature: null },
          { key: "info", icon: Mail, label: "Infos", superOnly: true, needsFeature: null },
        ] as const)
          .filter((t) => (!t.superOnly || isSuperAdmin) && (!t.needsFeature || (features as any)[t.needsFeature]))
          .map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center justify-center gap-2 px-4 py-3 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
              tab === t.key
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "menu" ? (
        <div className="p-4">
          {isLoading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : (
            <div className="overflow-x-auto">
             <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <table className="w-full text-sm sm:text-base">
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
      ) : tab === "users" ? (
        <UsersPanel restaurantId={restaurantId} isSuperAdmin={isSuperAdmin} />
      ) : tab === "info" ? (
        <InfoPanel restaurantId={restaurantId} />
      ) : (
        <SettingsPanel restaurantId={restaurantId} />
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

            {/* New fields separator */}
            <div className="border-t border-border pt-4 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Options avancées</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Temps de préparation (min)</Label>
                  <Input value={form.prep_time} onChange={(e) => setForm((f) => ({ ...f, prep_time: e.target.value }))} type="number" placeholder="15" />
                </div>
                <div className="space-y-1">
                  <Label>Badge</Label>
                  <select
                    value={form.badge}
                    onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Aucun</option>
                    {BADGES.map((b) => (
                      <option key={b.value} value={b.value}>{b.emoji} {b.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {features.hasTimeSlots && (
                  <div className="space-y-1">
                    <Label>Créneau horaire</Label>
                    <select
                      value={form.time_slot}
                      onChange={(e) => setForm((f) => ({ ...f, time_slot: e.target.value }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="both">Midi & Soir</option>
                      <option value="midi">Midi uniquement</option>
                      <option value="soir">Soir uniquement</option>
                    </select>
                  </div>
                )}
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_available}
                      onChange={(e) => setForm((f) => ({ ...f, is_available: e.target.checked }))}
                      className="rounded border-input accent-accent w-4 h-4"
                    />
                    <span className="text-sm font-medium">Disponible</span>
                  </label>
                </div>
              </div>

              {features.hasStorytelling && (
                <div className="space-y-1">
                  <Label>Storytelling (histoire du plat)</Label>
                  <textarea
                    value={form.story_text}
                    onChange={(e) => setForm((f) => ({ ...f, story_text: e.target.value }))}
                    placeholder="L'histoire de ce plat, son origine, l'inspiration du chef…"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-y"
                  />
                </div>
              )}
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
