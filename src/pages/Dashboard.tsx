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
  Settings,
  Plus,
  Search,
  Store,
  Trash2,
  Eye,
  Users,
  
  CreditCard,
  Power,
  PowerOff,
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  subscription_id: string | null;
  created_at: string;
}

interface Subscription {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  max_dishes: number;
  features: string[];
}

interface RestaurantMember {
  restaurant_id: string;
  user_id: string;
  role: string;
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

/* ─── Dashboard Page ─── */
const Dashboard = () => {
  const { user, isSuperAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [members, setMembers] = useState<RestaurantMember[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({ name: "", slug: "", subscription_id: "", owner_email: "", owner_password: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [resR, resS, resM] = await Promise.all([
      supabase.from("restaurants").select("*").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("*").order("sort_order"),
      supabase.from("restaurant_members").select("*"),
    ]);
    if (resR.data) setRestaurants(resR.data);
    if (resS.data) setSubscriptions(resS.data as Subscription[]);
    if (resM.data) setMembers(resM.data);
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

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

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

    // 1. Create restaurant
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

    // 2. Create owner account via edge function
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

    // 3. Create default site_settings for the restaurant
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

  const activeCount = restaurants.filter((r) => r.is_active).length;
  const totalRevenue = restaurants.reduce((sum, r) => {
    const sub = getSubscription(r.subscription_id);
    return sum + (r.is_active && sub ? sub.price_monthly : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
          Dashboard Admin
        </h1>
        <Button size="sm" variant="ghost" onClick={() => signOut()}>
          <LogOut className="w-4 h-4" />
        </Button>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Store} label="Restaurants" value={restaurants.length} />
          <StatCard icon={Power} label="Actifs" value={activeCount} />
          <StatCard icon={Users} label="Propriétaires" value={members.length} />
          <StatCard icon={CreditCard} label="Revenu mensuel" value={`${totalRevenue}€`} />
        </div>

        {/* Search + Create */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un restaurant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
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
              return (
                <div
                  key={restaurant.id}
                  className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4 hover:border-accent/40 transition-colors"
                >
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
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{restaurant.slug}.virtual-plate-show.lovable.app</span>
                        {sub && (
                          <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-semibold">
                            {sub.name} — {sub.price_monthly}€/mois
                          </span>
                        )}
                        <span>{memberCount} membre{memberCount !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
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
              );
            })}
          </div>
        )}
      </div>

      {/* Create Dialog */}
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
                <span className="text-xs text-muted-foreground whitespace-nowrap">.virtual-plate-show.lovable.app</span>
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
    </div>
  );
};

export default Dashboard;
