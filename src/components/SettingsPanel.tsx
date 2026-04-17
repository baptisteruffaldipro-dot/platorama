import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Save, Send, Eye, CreditCard, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import QRCodePanel from "@/components/QRCodePanel";
import TemplateGallery from "@/components/TemplateGallery";
import {
  useDraftSettings,
  usePublishedSettings,
  useSaveDraft,
  usePublishSettings,
  DEFAULT_SETTINGS,
  FONT_OPTIONS,
  type SiteSettings,
  type FormulaItem,
} from "@/hooks/useSiteSettings";

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer border border-border bg-transparent"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-xs"
        />
      </div>
    </div>
  );
}

function FontSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        style={{ fontFamily: value }}
      >
        {FONT_OPTIONS.map((f) => (
          <option key={f} value={f} style={{ fontFamily: f }}>
            {f}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function SettingsPanel({ restaurantId }: { restaurantId?: string | null }) {
  // Fetch active subscription for this restaurant
  const { data: subscriptionInfo } = useQuery({
    queryKey: ["restaurant-subscription", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("subscription_id")
        .eq("id", restaurantId)
        .single();
      if (!restaurant?.subscription_id) return null;
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", restaurant.subscription_id)
        .single();
      return sub;
    },
    enabled: !!restaurantId,
  });
  const { data: draft } = useDraftSettings(restaurantId);
  const { data: published } = usePublishedSettings(restaurantId);
  const saveDraft = useSaveDraft(restaurantId);
  const publishSettings = usePublishSettings(restaurantId);

  const initial = draft ?? published ?? DEFAULT_SETTINGS;

  const [form, setForm] = useState({
    background_color: initial.background_color,
    text_color: initial.text_color,
    heading_font: initial.heading_font,
    body_font: initial.body_font,
    button_bg_color: initial.button_bg_color,
    button_text_color: initial.button_text_color,
    logo_url: initial.logo_url,
    restaurant_name: initial.restaurant_name,
    subtitle: initial.subtitle,
    formulas: initial.formulas ?? [],
    template_id: initial.template_id ?? "dark-luxe",
  });

  // Sync when draft/published loads
  useEffect(() => {
    const src = draft ?? published ?? DEFAULT_SETTINGS;
    setForm({
      background_color: src.background_color,
      text_color: src.text_color,
      heading_font: src.heading_font,
      body_font: src.body_font,
      button_bg_color: src.button_bg_color,
      button_text_color: src.button_text_color,
      logo_url: src.logo_url,
      restaurant_name: src.restaurant_name,
      subtitle: src.subtitle,
      formulas: src.formulas ?? [],
      template_id: src.template_id ?? "dark-luxe",
    });
  }, [draft, published]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop();
    const path = `logos/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("dish-assets").upload(path, file);
    if (error) {
      toast.error("Erreur upload logo");
      return;
    }
    const { data } = supabase.storage.from("dish-assets").getPublicUrl(path);
    setForm((f) => ({ ...f, logo_url: data.publicUrl }));
    toast.success("Logo uploadé");
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft.mutateAsync(form);
      toast.success("Brouillon sauvegardé");
    } catch {
      toast.error("Erreur sauvegarde");
    }
  };

  const handlePublish = async () => {
    try {
      await publishSettings.mutateAsync(form);
      toast.success("Personnalisation publiée !");
    } catch {
      toast.error("Erreur publication");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      {/* Preview */}
      <div
        className="rounded-lg border border-border p-6 space-y-3"
        style={{
          backgroundColor: form.background_color,
          color: form.text_color,
        }}
      >
        <div className="flex items-center gap-3">
          <Eye className="w-4 h-4 opacity-50" />
          <span className="text-xs uppercase tracking-widest opacity-50">Aperçu</span>
        </div>
        {form.logo_url && (
          <img src={form.logo_url} alt="Logo" className="h-12 object-contain" />
        )}
        <h2 className="text-2xl" style={{ fontFamily: `'${form.heading_font}', serif` }}>
          {form.restaurant_name || "La Maison"}
        </h2>
        <p className="text-xs tracking-[0.3em] uppercase opacity-60">{form.subtitle || "Menu Virtuel"}</p>
        <p className="text-sm mt-2" style={{ fontFamily: `'${form.body_font}', serif` }}>
          Filet de bœuf, jus au thym, purée truffée
        </p>
        <button
          className="px-4 py-2 rounded-full text-sm font-semibold"
          style={{
            backgroundColor: form.button_bg_color,
            color: form.button_text_color,
          }}
        >
          Voir en réalité augmentée
        </button>
      </div>

      {/* Templates */}
      <TemplateGallery
        currentTemplateId={form.template_id}
        onApply={(tpl) => setForm((f) => ({ ...f, ...tpl.settings, template_id: tpl.id }))}
      />

      {/* Restaurant name */}
      <div>
        <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Restaurant</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Nom du restaurant</Label>
            <Input
              value={form.restaurant_name}
              onChange={(e) => setForm((f) => ({ ...f, restaurant_name: e.target.value }))}
              placeholder="La Maison"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sous-titre</Label>
            <Input
              value={form.subtitle}
              onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              placeholder="Menu Virtuel"
            />
          </div>
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Couleurs</h3>
        <div className="grid grid-cols-2 gap-4">
          <ColorInput label="Fond" value={form.background_color} onChange={(v) => setForm((f) => ({ ...f, background_color: v }))} />
          <ColorInput label="Texte" value={form.text_color} onChange={(v) => setForm((f) => ({ ...f, text_color: v }))} />
          <ColorInput label="Boutons (fond)" value={form.button_bg_color} onChange={(v) => setForm((f) => ({ ...f, button_bg_color: v }))} />
          <ColorInput label="Boutons (texte)" value={form.button_text_color} onChange={(v) => setForm((f) => ({ ...f, button_text_color: v }))} />
        </div>
      </div>

      {/* Fonts */}
      <div>
        <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Typographie</h3>
        <div className="grid grid-cols-2 gap-4">
          <FontSelect label="Titres" value={form.heading_font} onChange={(v) => setForm((f) => ({ ...f, heading_font: v }))} />
          <FontSelect label="Corps de texte" value={form.body_font} onChange={(v) => setForm((f) => ({ ...f, body_font: v }))} />
        </div>
      </div>

      {/* Logo */}
      <div>
        <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Logo</h3>
        <div className="flex items-center gap-3">
          {form.logo_url ? (
            <img src={form.logo_url} alt="Logo" className="h-14 object-contain rounded bg-muted/20 p-1" />
          ) : (
            <div className="h-14 w-14 rounded bg-muted/20 flex items-center justify-center text-muted-foreground text-xs">
              Aucun
            </div>
          )}
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="w-4 h-4 mr-1" />
                Uploader un logo
              </span>
            </Button>
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
          {form.logo_url && (
            <Button variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, logo_url: "" }))}>
              Supprimer
            </Button>
          )}
        </div>
      </div>

      {/* Formules tarifaires */}
      <div>
        <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Formules tarifaires</h3>
        <p className="text-xs text-muted-foreground mb-3">Ajoutez vos formules (ex: "Entrée / Plat / Dessert" → "56 €"). L'icône ℹ️ n'apparaîtra sur le menu que si au moins une formule est renseignée.</p>
        <div className="space-y-2">
          {form.formulas.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={f.label}
                onChange={(e) => {
                  const updated = [...form.formulas];
                  updated[i] = { ...updated[i], label: e.target.value };
                  setForm((prev) => ({ ...prev, formulas: updated }));
                }}
                placeholder="Entrée / Plat / Dessert"
                className="flex-1"
              />
              <Input
                value={f.price}
                onChange={(e) => {
                  const updated = [...form.formulas];
                  updated[i] = { ...updated[i], price: e.target.value };
                  setForm((prev) => ({ ...prev, formulas: updated }));
                }}
                placeholder="56 €"
                className="w-24"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  const updated = form.formulas.filter((_, j) => j !== i);
                  setForm((prev) => ({ ...prev, formulas: updated }));
                }}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setForm((prev) => ({ ...prev, formulas: [...prev.formulas, { label: "", price: "" }] }))}
          >
            <Plus className="w-4 h-4 mr-1" /> Ajouter une formule
          </Button>
        </div>
      </div>

      {/* QR Code */}
      {restaurantId && (
        <QRCodePanel restaurantId={restaurantId} restaurantName={form.restaurant_name} />
      )}

      {/* Abonnement actif */}
      <div>
        <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Abonnement</h3>
        {subscriptionInfo ? (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{subscriptionInfo.name}</p>
              <p className="text-sm text-muted-foreground">
                {subscriptionInfo.price_monthly}€/mois · Max {subscriptionInfo.max_dishes} plats
              </p>
              {Array.isArray(subscriptionInfo.features) && subscriptionInfo.features.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {subscriptionInfo.features.map((f: any, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">{String(f)}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm text-muted-foreground flex items-center gap-3">
            <CreditCard className="w-5 h-5 opacity-50" />
            <span>Aucun abonnement actif</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          disabled={saveDraft.isPending}
          className="flex-1"
        >
          <Save className="w-4 h-4 mr-1" />
          {saveDraft.isPending ? "Sauvegarde..." : "Sauvegarder brouillon"}
        </Button>
        <Button
          onClick={handlePublish}
          disabled={publishSettings.isPending}
          className="flex-1 bg-accent text-accent-foreground hover:bg-accent/80"
        >
          <Send className="w-4 h-4 mr-1" />
          {publishSettings.isPending ? "Publication..." : "Publier"}
        </Button>
      </div>
    </div>
  );
}
