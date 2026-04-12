import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, MapPin, Phone, Globe, Save, Pencil } from "lucide-react";

interface RestaurantInfo {
  contact_email: string;
  address: string;
  phone: string;
  website: string;
}

export default function InfoPanel({ restaurantId }: { restaurantId: string }) {
  const [info, setInfo] = useState<RestaurantInfo>({ contact_email: "", address: "", phone: "", website: "" });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<RestaurantInfo>({ contact_email: "", address: "", phone: "", website: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("restaurants")
        .select("contact_email, address, phone, website")
        .eq("id", restaurantId)
        .single();
      if (data) {
        const d = data as RestaurantInfo;
        setInfo(d);
        setForm(d);
      }
      if (error) toast.error("Erreur chargement infos");
      setLoading(false);
    };
    fetch();
  }, [restaurantId]);

  const handleSave = async () => {
    const { error } = await supabase
      .from("restaurants")
      .update(form)
      .eq("id", restaurantId);
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Informations mises à jour");
      setInfo(form);
      setEditing(false);
    }
  };

  if (loading) return <p className="p-4 text-muted-foreground">Chargement...</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Informations de contact</h2>
        {!editing ? (
          <Button size="sm" variant="outline" onClick={() => { setForm(info); setEditing(true); }}>
            <Pencil className="w-4 h-4 mr-1" /> Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" /> Sauvegarder
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
            <Input value={form.contact_email} onChange={(e) => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="contact@restaurant.com" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1"><Phone className="w-3 h-3" /> Téléphone</Label>
            <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+33 1 23 45 67 89" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> Adresse</Label>
            <Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 rue de Paris, 75001" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1"><Globe className="w-3 h-3" /> Site web</Label>
            <Input value={form.website} onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://mon-restaurant.com" />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {[
            { icon: Mail, label: "Email", value: info.contact_email },
            { icon: Phone, label: "Téléphone", value: info.phone },
            { icon: MapPin, label: "Adresse", value: info.address },
            { icon: Globe, label: "Site web", value: info.website, isLink: true },
          ].map((item) => (
            <div key={item.label} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                {item.value ? (
                  item.isLink ? (
                    <a href={item.value} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">{item.value}</a>
                  ) : (
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground italic">Non renseigné</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
