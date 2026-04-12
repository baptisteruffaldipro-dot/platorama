import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Save, Send, Eye, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  useDraftSettings,
  usePublishedSettings,
  useSaveDraft,
  usePublishSettings,
  DEFAULT_SETTINGS,
  FONT_OPTIONS,
  type SiteSettings,
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
          className="flex-1"
        >
          <Send className="w-4 h-4 mr-1" />
          {publishSettings.isPending ? "Publication..." : "Publier"}
        </Button>
      </div>
    </div>
  );
}
