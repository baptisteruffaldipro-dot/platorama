import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LogOut,
  Plus,
  Search,
  Store,
  Trash2,
  Eye,
  Users,
  CreditCard,
  Power,
  PowerOff,
  Settings,
  UtensilsCrossed,
  Rotate3d,
  ChevronDown,
  ChevronUp,
  Pencil,
  Mail,
  MapPin,
  Phone,
  Globe,
  Package,
} from "lucide-react";

/* ─── Types ─── */
interface Restaurant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  subscription_id: string | null;
  created_at: string;
  contact_email: string;
  address: string;
  phone: string;
  website: string;
}

interface Subscription {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  max_dishes: number;
  features: string[];
  sort_order: number;
}

interface RestaurantMember {
  restaurant_id: string;
  user_id: string;
  role: string;
}

interface DishCount {
  restaurant_id: string;
  total: number;
  with_3d: number;
}

/* ─── Stats card ─── */
const StatCard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) => (
  <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
      <Icon className="w-5 h-5 text-accent" />
    </div>
    <div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

/* ─── Restaurant Info Panel ─── */
const RestaurantInfoPanel = ({
  restaurant,
  subscriptions,
  onSave,
}: {
  restaurant: Restaurant;
  subscriptions: Subscription[];
  onSave: (id: string, data: Partial<Restaurant>) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    contact_email: restaurant.contact_email || "",
    address: restaurant.address || "",
    phone: restaurant.phone || "",
    website: restaurant.website || "",
    subscription_id: restaurant.subscription_id || "",
  });

  const handleSave = () => {
    onSave(restaurant.id, { ...form, subscription_id: form.subscription_id || null });
    setEditing(false);
  };

  return (
    <div className="mt-3 bg-muted/30 rounded-lg p-4 space-y-3 border border-border/50">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Informations client</h4>
        {!editing ? (
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            <Pencil className="w-3 h-3 mr-1" /> Modifier
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
            <Button size="sm" onClick={handleSave}>Sauvegarder</Button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input value={form.contact_email} onChange={(e) => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="contact@restaurant.com" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Téléphone</Label>
            <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+33 1 23 45 67 89" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Adresse</Label>
            <Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 rue de Paris" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Site web</Label>
            <Input value={form.website} onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://restaurant.com" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-3.5 h-3.5" />
            <span>{restaurant.contact_email || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-3.5 h-3.5" />
            <span>{restaurant.phone || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>{restaurant.address || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="w-3.5 h-3.5" />
            {restaurant.website ? (
              <a href={restaurant.website} target="_blank" rel="noreferrer" className="text-accent hover:underline">{restaurant.website}</a>
            ) : <span>—</span>}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Subscription Management Dialog ─── */
const SubscriptionDialog = ({
  open,
  onOpenChange,
  subscription,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: Subscription | null;
  onSave: (data: Partial<Subscription>, isNew: boolean) => void;
}) => {
  const isNew = !subscription;
  const [form, setForm] = useState({
    name: subscription?.name || "",
    slug: subscription?.slug || "",
    price_monthly: String(subscription?.price_monthly ?? "0"),
    max_dishes: String(subscription?.max_dishes ?? "10"),
    sort_order: String(subscription?.sort_order ?? "0"),
    features: (subscription?.features || []).join(", "),
  });

  useEffect(() => {
    if (subscription) {
      setForm({
        name: subscription.name,
        slug: subscription.slug,
        price_monthly: String(subscription.price_monthly),
        max_dishes: String(subscription.max_dishes),
        sort_order: String(subscription.sort_order),
        features: (subscription.features || []).join(", "),
      });
    } else {
      setForm({ name: "", slug: "", price_monthly: "0", max_dishes: "10", sort_order: "0", features: "" });
    }
  }, [subscription]);

  const slugify = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Nouveau forfait" : `Modifier "${subscription?.name}"`}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>Nom</Label>
            <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} placeholder="Starter" />
          </div>
          <div className="space-y-1">
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="starter" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Prix/mois (€)</Label>
              <Input type="number" value={form.price_monthly} onChange={(e) => setForm(f => ({ ...f, price_monthly: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Max plats</Label>
              <Input type="number" value={form.max_dishes} onChange={(e) => setForm(f => ({ ...f, max_dishes: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Ordre</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm(f => ({ ...f, sort_order: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Features (séparées par des virgules)</Label>
            <Input value={form.features} onChange={(e) => setForm(f => ({ ...f, features: e.target.value }))} placeholder="AR, Menu personnalisé, Stats" />
          </div>
          <Button className="w-full" onClick={() => {
            if (!form.name.trim() || !form.slug.trim()) {
              toast.error("Nom et slug requis");
              return;
            }
            onSave({
              ...(subscription ? { id: subscription.id } : {}),
              name: form.name,
              slug: form.slug,
              price_monthly: parseFloat(form.price_monthly) || 0,
              max_dishes: parseInt(form.max_dishes) || 10,
              sort_order: parseInt(form.sort_order) || 0,
              features: form.features.split(",").map(f => f.trim()).filter(Boolean) as any,
            }, isNew);
          }}>
            {isNew ? "Créer" : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Dashboard Page ─── */
const Dashboard = () => {
  const { user, isSuperAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [members, setMembers] = useState<RestaurantMember[]>([]);
  const [dishCounts, setDishCounts] = useState<DishCount[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({ name: "", slug: "", subscription_id: "", owner_email: "", owner_password: "" });
  const [saving, setSaving] = useState(false);
  const [expandedRestaurant, setExpandedRestaurant] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"restaurants" | "subscriptions">("restaurants");
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [resR, resS, resM, resD] = await Promise.all([
      supabase.from("restaurants").select("*").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("*").order("sort_order"),
      supabase.from("restaurant_members").select("*"),
      supabase.from("dishes").select("id, restaurant_id, model_ios, model_android"),
    ]);
    if (resR.data) setRestaurants(resR.data as Restaurant[]);
    if (resS.data) setSubscriptions(resS.data as Subscription[]);
    if (resM.data) setMembers(resM.data);

    // Compute dish counts per restaurant
    if (resD.data) {
      const counts: Record<string, DishCount> = {};
      resD.data.forEach((d: any) => {
        const rid = d.restaurant_id || "none";
        if (!counts[rid]) counts[rid] = { restaurant_id: rid, total: 0, with_3d: 0 };
        counts[rid].total++;
        if (d.model_ios || d.model_android) counts[rid].with_3d++;
      });
      setDishCounts(Object.values(counts));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isSuperAdmin) fetchData();
  }, [isSuperAdmin]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Chargement...</div>;
  if (!user || !isSuperAdmin) return <Navigate to="/login" replace />;

  const filtered = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.slug.toLowerCase().includes(search.toLowerCase())
  );

  const getSubscription = (id: string | null) => subscriptions.find((s) => s.id === id);
  const getMemberCount = (restaurantId: string) => members.filter((m) => m.restaurant_id === restaurantId).length;
  const getDishCount = (restaurantId: string) => dishCounts.find(d => d.restaurant_id === restaurantId) || { total: 0, with_3d: 0 };

  const slugify = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleCreate = async () => {
    if (!newRestaurant.name.trim() || !newRestaurant.slug.trim()) {
      toast.error("Nom et slug requis");
      return;
    }
    if (!newRestaurant.owner_email || !newRestaurant.owner_password) {
      toast.error("Email et mot de passe du propriétaire requis");
      return;
    }
    if (newRestaurant.owner_password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setSaving(true);

    const { data: restaurant, error: restError } = await supabase
      .from("restaurants")
      .insert({
        name: newRestaurant.name,
        slug: newRestaurant.slug,
        subscription_id: newRestaurant.subscription_id || null,
      })
      .select()
      .single();

    if (restError) {
      toast.error("Erreur : " + restError.message);
      setSaving(false);
      return;
    }

    const { data: ownerData, error: ownerError } = await supabase.functions.invoke("create-restaurant-owner", {
      body: {
        email: newRestaurant.owner_email,
        password: newRestaurant.owner_password,
        restaurant_id: restaurant.id,
      },
    });

    if (ownerError || ownerData?.error) {
      toast.error("Restaurant créé mais erreur compte : " + (ownerError?.message || ownerData?.error));
    } else {
      toast.success(`Restaurant "${newRestaurant.name}" créé avec succès`);
    }

    await supabase.from("site_settings").insert({
      restaurant_id: restaurant.id,
      restaurant_name: newRestaurant.name,
      is_draft: false,
    });

    setSaving(false);
    setCreateOpen(false);
    setNewRestaurant({ name: "", slug: "", subscription_id: "", owner_email: "", owner_password: "" });
    fetchData();
  };

  const handleToggleActive = async (restaurant: Restaurant) => {
    const { error } = await supabase
      .from("restaurants")
      .update({ is_active: !restaurant.is_active })
      .eq("id", restaurant.id);

    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success(restaurant.is_active ? "Restaurant désactivé" : "Restaurant activé");
      fetchData();
    }
  };

  const handleDelete = async (restaurant: Restaurant) => {
    if (!confirm(`Supprimer "${restaurant.name}" et tous ses plats ? Cette action est irréversible.`)) return;
    const { error } = await supabase.from("restaurants").delete().eq("id", restaurant.id);
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Restaurant supprimé");
      fetchData();
    }
  };

  const handleUpdateRestaurantInfo = async (id: string, data: Partial<Restaurant>) => {
    const { error } = await supabase.from("restaurants").update(data).eq("id", id);
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Informations mises à jour");
      fetchData();
    }
  };

  /* ─── Subscription CRUD ─── */
  const handleSaveSub = async (data: Partial<Subscription>, isNew: boolean) => {
    if (isNew) {
      const { error } = await supabase.from("subscriptions").insert({
        name: data.name!,
        slug: data.slug!,
        price_monthly: data.price_monthly ?? 0,
        max_dishes: data.max_dishes ?? 10,
        sort_order: data.sort_order ?? 0,
        features: data.features ?? [],
      });
      if (error) { toast.error("Erreur : " + error.message); return; }
      toast.success("Forfait créé");
    } else {
      const { id, ...rest } = data;
      const { error } = await supabase.from("subscriptions").update(rest).eq("id", id!);
      if (error) { toast.error("Erreur : " + error.message); return; }
      toast.success("Forfait mis à jour");
    }
    setSubDialogOpen(false);
    setEditingSub(null);
    fetchData();
  };

  const handleDeleteSub = async (sub: Subscription) => {
    if (!confirm(`Supprimer le forfait "${sub.name}" ?`)) return;
    const { error } = await supabase.from("subscriptions").delete().eq("id", sub.id);
    if (error) { toast.error("Erreur : " + error.message); return; }
    toast.success("Forfait supprimé");
    fetchData();
  };

  const activeCount = restaurants.filter((r) => r.is_active).length;
  const totalDishes = dishCounts.reduce((sum, d) => sum + d.total, 0);
  const totalWith3D = dishCounts.reduce((sum, d) => sum + d.with_3d, 0);
  const totalRevenue = restaurants.reduce((sum, r) => {
    const sub = getSubscription(r.subscription_id);
    return sum + (r.is_active && sub ? sub.price_monthly : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
          Dashboard Super Admin
        </h1>
        <Button size="sm" variant="ghost" onClick={() => signOut()}>
          <LogOut className="w-4 h-4" />
        </Button>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={Store} label="Restaurants" value={restaurants.length} />
          <StatCard icon={Power} label="Actifs" value={activeCount} />
          <StatCard icon={Users} label="Propriétaires" value={members.length} />
          <StatCard icon={UtensilsCrossed} label="Total plats" value={totalDishes} />
          <StatCard icon={Rotate3d} label="Plats en 3D" value={totalWith3D} />
          <StatCard icon={CreditCard} label="Revenu/mois" value={`${totalRevenue}€`} />
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveSection("restaurants")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeSection === "restaurants" ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Store className="w-4 h-4" /> Restaurants
          </button>
          <button
            onClick={() => setActiveSection("subscriptions")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeSection === "subscriptions" ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="w-4 h-4" /> Abonnements
          </button>
        </div>

        {activeSection === "restaurants" ? (
          <>
            {/* Search + Create */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Rechercher un restaurant..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Nouveau restaurant
              </Button>
            </div>

            {/* Restaurant list */}
            {loading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun restaurant trouvé</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((restaurant) => {
                  const sub = getSubscription(restaurant.subscription_id);
                  const memberCount = getMemberCount(restaurant.id);
                  const dc = getDishCount(restaurant.id);
                  const isExpanded = expandedRestaurant === restaurant.id;
                  return (
                    <div key={restaurant.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-accent/40 transition-colors">
                      <div className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${restaurant.is_active ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}>
                            {restaurant.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground truncate">{restaurant.name}</h3>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${restaurant.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                {restaurant.is_active ? "Actif" : "Inactif"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                              <span>{restaurant.slug}</span>
                              {sub && (
                                <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-semibold">
                                  {sub.name} — {sub.price_monthly}€/mois
                                </span>
                              )}
                              <span>{memberCount} membre{memberCount !== 1 ? "s" : ""}</span>
                              <span>{dc.total} plat{dc.total !== 1 ? "s" : ""}</span>
                              <span>{dc.with_3d} en 3D</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button size="icon" variant="ghost" title="Détails" onClick={() => setExpandedRestaurant(isExpanded ? null : restaurant.id)}>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" title="Voir le menu" onClick={() => window.open(`/?restaurant=${restaurant.id}`, '_blank')}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Personnaliser" onClick={() => navigate(`/admin?restaurant=${restaurant.id}`)}>
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title={restaurant.is_active ? "Désactiver" : "Activer"} onClick={() => handleToggleActive(restaurant)}>
                            {restaurant.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4 text-green-400" />}
                          </Button>
                          <Button size="icon" variant="ghost" title="Supprimer" onClick={() => handleDelete(restaurant)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {/* Expanded info panel */}
                      {isExpanded && (
                        <div className="px-4 pb-4">
                          <RestaurantInfoPanel restaurant={restaurant} onSave={handleUpdateRestaurantInfo} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* ─── Subscriptions Section ─── */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Forfaits d'abonnement</h2>
              <Button onClick={() => { setEditingSub(null); setSubDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Nouveau forfait
              </Button>
            </div>

            {subscriptions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun forfait</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subscriptions.map((sub) => {
                  const usedBy = restaurants.filter(r => r.subscription_id === sub.id).length;
                  return (
                    <div key={sub.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground text-lg">{sub.name}</h3>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => { setEditingSub(sub); setSubDialogOpen(true); }}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteSub(sub)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-accent">{sub.price_monthly}€<span className="text-sm font-normal text-muted-foreground">/mois</span></p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Max {sub.max_dishes} plats</p>
                        <p>{usedBy} restaurant{usedBy !== 1 ? "s" : ""} abonné{usedBy !== 1 ? "s" : ""}</p>
                      </div>
                      {Array.isArray(sub.features) && sub.features.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {sub.features.map((f, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">{String(f)}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Restaurant Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau restaurant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Nom du restaurant</Label>
              <Input
                value={newRestaurant.name}
                onChange={(e) =>
                  setNewRestaurant((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: slugify(e.target.value),
                  }))
                }
                placeholder="La Maison"
              />
            </div>
            <div className="space-y-1">
              <Label>Slug (sous-domaine)</Label>
              <div className="flex items-center gap-1">
                <Input
                  value={newRestaurant.slug}
                  onChange={(e) => setNewRestaurant((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="la-maison"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Abonnement</Label>
              <select
                value={newRestaurant.subscription_id}
                onChange={(e) => setNewRestaurant((f) => ({ ...f, subscription_id: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Sans abonnement</option>
                {subscriptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.price_monthly}€/mois
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-sm font-medium text-foreground">Compte propriétaire</p>
              <div className="space-y-1">
                <Label>Email du propriétaire</Label>
                <Input
                  type="email"
                  value={newRestaurant.owner_email}
                  onChange={(e) => setNewRestaurant((f) => ({ ...f, owner_email: e.target.value }))}
                  placeholder="owner@restaurant.com"
                />
              </div>
              <div className="space-y-1">
                <Label>Mot de passe temporaire</Label>
                <Input
                  type="text"
                  value={newRestaurant.owner_password}
                  onChange={(e) => setNewRestaurant((f) => ({ ...f, owner_password: e.target.value }))}
                  placeholder="motdepasse123"
                />
              </div>
            </div>

            <Button className="w-full" onClick={handleCreate} disabled={saving}>
              {saving ? "Création..." : "Créer le restaurant"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscription Dialog */}
      <SubscriptionDialog
        open={subDialogOpen}
        onOpenChange={(open) => { setSubDialogOpen(open); if (!open) setEditingSub(null); }}
        subscription={editingSub}
        onSave={handleSaveSub}
      />
    </div>
  );
};

export default Dashboard;
