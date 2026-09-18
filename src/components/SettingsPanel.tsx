import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Save, Send, Eye, CreditCard, Plus, Trash2, Info, Palette, FileText, Share2, Mail, MapPin, Phone, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import QRCodePanel from "@/components/QRCodePanel";
import TemplateGallery from "@/components/TemplateGallery";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_DISCLAIMER_TEXT } from "@/components/MenuDisclaimer";
import {
  useDraftSettings,
  usePublishedSettings,
  useSaveDraft,
  usePublishSettings,
  DEFAULT_SETTINGS,
  FONT_OPTIONS,
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

function FontSelect({
  label,
  value,
  onChange,
  customFonts = [],
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  customFonts?: string[];
}) {
  const options = [...customFonts, ...FONT_OPTIONS];
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        style={{ fontFamily: value }}
      >
        {options.map((f) => (
          <option key={f} value={f} style={{ fontFamily: f }}>
            {customFonts.includes(f) ? `${f} (personnalisée)` : f}
          </option>
        ))}
      </select>
    </div>
  );
}

type CustomFontSlot = {
  nameKey: "custom_font_name" | "custom_font_name_2";
  urlKey: "custom_font_url" | "custom_font_url_2";
};

const FONT_SLOTS: { slot: CustomFontSlot; title: string }[] = [
  { slot: { nameKey: "custom_font_name", urlKey: "custom_font_url" }, title: "Police personnalisée 1 (titres)" },
  { slot: { nameKey: "custom_font_name_2", urlKey: "custom_font_url_2" }, title: "Police personnalisée 2 (corps de texte)" },
];

type SettingsTab = "design" | "infos" | "abonnement" | "partage";

const TABS: { id: SettingsTab; label: string; icon: typeof Palette }[] = [
  { id: "design", label: "Design", icon: Palette },
  { id: "infos", label: "Informations", icon: FileText },
  { id: "abonnement", label: "Abonnement", icon: CreditCard },
  { id: "partage", label: "Partage", icon: Share2 },
];

export default function SettingsPanel({ restaurantId }: { restaurantId?: string | null }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("design");

  // Fetch restaurant contact info
  const { data: restaurantInfo } = useQuery({
    queryKey: ["restaurant-info", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
      const { data } = await supabase
        .from("restaurants")
        .select("address, phone, contact_email, website")
        .eq("id", restaurantId)
        .single();
      return data;
    },
    enabled: !!restaurantId,
  });
  const [infoForm, setInfoForm] = useState({
    address: "",
    phone: "",
    contact_email: "",
    website: "",
  });
  const [savingInfo, setSavingInfo] = useState(false);

  useEffect(() => {
    setInfoForm({
      address: restaurantInfo?.address ?? "",
      phone: restaurantInfo?.phone ?? "",
      contact_email: restaurantInfo?.contact_email ?? "",
      website: restaurantInfo?.website ?? "",
    });
  }, [restaurantInfo]);

  const handleSaveRestaurantInfo = async () => {
    if (!restaurantId) return;
    setSavingInfo(true);
    const { error } = await supabase
      .from("restaurants")
      .update({
        address: infoForm.address.trim() || null,
        phone: infoForm.phone.trim() || null,
        contact_email: infoForm.contact_email.trim() || null,
        website: infoForm.website.trim() || null,
      })
      .eq("id", restaurantId);
    setSavingInfo(false);
    if (error) {
      toast.error("Erreur lors de l'enregistrement");
      return;
    }
    toast.success("Informations restaurant enregistrées");
  };


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
    splash_style: initial.splash_style ?? "logo_text",
    splash_bg_color: initial.splash_bg_color ?? "",
    formulas: initial.formulas ?? [],
    template_id: initial.template_id ?? "dark-luxe",
    custom_font_name: initial.custom_font_name ?? "",
    custom_font_url: initial.custom_font_url ?? "",
    custom_font_name_2: initial.custom_font_name_2 ?? "",
    custom_font_url_2: initial.custom_font_url_2 ?? "",
    disclaimer_enabled: initial.disclaimer_enabled ?? false,
    disclaimer_mode: initial.disclaimer_mode ?? "footer",
    disclaimer_text: initial.disclaimer_text ?? "",
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
      splash_style: src.splash_style ?? "logo_text",
      splash_bg_color: src.splash_bg_color ?? "",
      formulas: src.formulas ?? [],
      template_id: src.template_id ?? "dark-luxe",
      custom_font_name: src.custom_font_name ?? "",
      custom_font_url: src.custom_font_url ?? "",
      custom_font_name_2: src.custom_font_name_2 ?? "",
      custom_font_url_2: src.custom_font_url_2 ?? "",
      disclaimer_enabled: src.disclaimer_enabled ?? false,
      disclaimer_mode: src.disclaimer_mode ?? "footer",
      disclaimer_text: src.disclaimer_text ?? "",
    });
  }, [draft, published]);

  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

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

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: CustomFontSlot, target: "heading" | "body") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!["woff2", "woff", "ttf", "otf"].includes(ext)) {
      toast.error("Format non supporté (woff2, woff, ttf ou otf)");
      return;
    }
    setUploadingSlot(slot.nameKey);
    const path = `fonts/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("dish-assets").upload(path, file);
    setUploadingSlot(null);
    if (error) {
      toast.error("Erreur upload police");
      return;
    }
    const { data } = supabase.storage.from("dish-assets").getPublicUrl(path);
    const name = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9 _-]/g, " ").trim() || "Police personnalisée";
    setForm((f) => ({
      ...f,
      [slot.urlKey]: data.publicUrl,
      [slot.nameKey]: name,
      ...(target === "heading" ? { heading_font: name } : { body_font: name }),
    }));
    toast.success("Police importée");
  };

  const customFonts = FONT_SLOTS.map(({ slot }) => form[slot.nameKey]).filter((n): n is string => !!n);

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

  const changeRequestUrl = `mailto:contact@platorama.fr?subject=${encodeURIComponent(
    `Demande de changement d'abonnement — ${form.restaurant_name || "Restaurant"}`
  )}&body=${encodeURIComponent(
    `Bonjour,\n\nJe souhaite changer d'abonnement pour mon restaurant "${form.restaurant_name || ""}".\nAbonnement actuel : ${subscriptionInfo?.name ?? "aucun"}\nAbonnement souhaité : \n\nMerci de me recontacter.\n`
  )}`;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <style>
        {FONT_SLOTS.map(({ slot }) =>
          form[slot.nameKey] && form[slot.urlKey]
            ? `@font-face { font-family: '${form[slot.nameKey]}'; src: url('${form[slot.urlKey]}'); font-display: swap; }`
            : ""
        ).join("\n")}
      </style>

      {/* Sous-parties */}
      <div className="grid grid-cols-4 gap-1 rounded-lg border border-border bg-muted/30 p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-md px-2 py-2 text-xs sm:text-sm font-medium transition ${
              activeTab === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {/* ═══════════ DESIGN ═══════════ */}
      {activeTab === "design" && (
        <div className="space-y-6">
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
              {form.restaurant_name || "Votre restaurant"}
            </h2>
            <p className="text-xs tracking-[0.3em] uppercase opacity-60">{form.subtitle || "Votre signature"}</p>
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
                  placeholder="Votre restaurant"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sous-titre</Label>
                <Input
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  placeholder="Votre signature"
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
              <FontSelect
                label="Titres"
                value={form.heading_font}
                onChange={(v) => setForm((f) => ({ ...f, heading_font: v }))}
                customFonts={customFonts}
              />
              <FontSelect
                label="Corps de texte"
                value={form.body_font}
                onChange={(v) => setForm((f) => ({ ...f, body_font: v }))}
                customFonts={customFonts}
              />
            </div>

            {/* Polices personnalisées */}
            <div className="mt-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Importez jusqu'à 2 polices (.woff2, .woff, .ttf ou .otf) — par exemple une pour les titres et une pour le corps de texte. Elles apparaissent ensuite dans les menus déroulants ci-dessus.
              </p>
              {FONT_SLOTS.map(({ slot, title }, idx) => {
                const name = form[slot.nameKey];
                const url = form[slot.urlKey];
                const target = idx === 0 ? "heading" : "body";
                return (
                  <div key={slot.nameKey} className="rounded-lg border border-border p-3 space-y-2">
                    <Label className="text-xs">{title}</Label>
                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild disabled={uploadingSlot === slot.nameKey}>
                          <span>
                            <Upload className="w-4 h-4 mr-1" />
                            {uploadingSlot === slot.nameKey ? "Import..." : url ? "Remplacer" : "Importer une police"}
                          </span>
                        </Button>
                        <input
                          type="file"
                          accept=".woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf"
                          className="hidden"
                          onChange={(e) => handleFontUpload(e, slot, target as "heading" | "body")}
                        />
                      </label>
                      {url && (
                        <>
                          <span className="text-sm" style={{ fontFamily: `'${name}'` }}>
                            {name} — Aa Bb Cc 123
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                [slot.urlKey]: "",
                                [slot.nameKey]: "",
                                heading_font: f.heading_font === f[slot.nameKey] ? DEFAULT_SETTINGS.heading_font : f.heading_font,
                                body_font: f.body_font === f[slot.nameKey] ? DEFAULT_SETTINGS.body_font : f.body_font,
                              }))
                            }
                          >
                            Supprimer
                          </Button>
                        </>
                      )}
                    </div>
                    {name && (
                      <Input
                        value={name}
                        onChange={(e) => {
                          const next = e.target.value;
                          setForm((f) => ({
                            ...f,
                            [slot.nameKey]: next,
                            heading_font: f.heading_font === f[slot.nameKey] ? next : f.heading_font,
                            body_font: f.body_font === f[slot.nameKey] ? next : f.body_font,
                          }));
                        }}
                        placeholder="Nom de la police"
                        className="text-xs"
                      />
                    )}
                  </div>
                );
              })}
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

            {/* Écran d'accueil */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Écran d'accueil</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Ce qui s'affiche à l'ouverture du menu, avant la carte.
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { value: "logo_text", title: "Logo + nom", desc: "Logo, nom du restaurant et sous-titre" },
                  { value: "text", title: "Nom + sous-titre", desc: "Sans logo" },
                  { value: "logo", title: "Logo seul", desc: "Logo en très grand" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, splash_style: opt.value as typeof f.splash_style }))}
                    className={`text-left rounded-lg border p-3 transition ${
                      form.splash_style === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="text-sm font-medium">{opt.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <ColorInput
                  label="Couleur de fond de l'écran d'accueil"
                  value={form.splash_bg_color || form.background_color}
                  onChange={(v) => setForm((f) => ({ ...f, splash_bg_color: v }))}
                />
                {form.splash_bg_color && (
                  <Button variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, splash_bg_color: "" }))}>
                    Utiliser la couleur du menu
                  </Button>
                )}
              </div>
              {form.splash_style === "logo" && !form.logo_url && (
                <p className="text-xs text-amber-600 mt-2">
                  Ajoutez un logo ci-dessus, sinon le nom du restaurant sera affiché.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ INFORMATIONS ═══════════ */}
      {activeTab === "infos" && (
        <div className="space-y-6">
          {/* Informations restaurant */}
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Informations restaurant</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Coordonnées de votre établissement (adresse, téléphone, email, site web).
            </p>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Adresse</Label>
                <Input
                  value={infoForm.address}
                  onChange={(e) => setInfoForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="12 rue des Lilas, 75011 Paris"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Téléphone</Label>
                  <Input
                    value={infoForm.phone}
                    onChange={(e) => setInfoForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="01 23 45 67 89"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</Label>
                  <Input
                    type="email"
                    value={infoForm.contact_email}
                    onChange={(e) => setInfoForm((f) => ({ ...f, contact_email: e.target.value }))}
                    placeholder="contact@votre-restaurant.fr"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Site web</Label>
                <Input
                  value={infoForm.website}
                  onChange={(e) => setInfoForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="https://www.votre-restaurant.fr"
                />
              </div>
              <Button size="sm" onClick={handleSaveRestaurantInfo} disabled={savingInfo || !restaurantId}>
                <Save className="w-4 h-4 mr-1" />
                {savingInfo ? "Enregistrement..." : "Enregistrer les informations"}
              </Button>
            </div>
          </div>

          {/* Message de prévention */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Message de prévention</h3>
              <Switch
                checked={form.disclaimer_enabled}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, disclaimer_enabled: checked }))}
                aria-label="Activer le message de prévention"
              />
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Informez vos clients que les photos virtuelles peuvent légèrement différer du plat servi (saisons, approvisionnement).
            </p>

            {form.disclaimer_enabled && (
              <>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { value: "footer", title: "Pied de menu", desc: "En bas de la carte" },
                    { value: "popup", title: "Pop-up au début", desc: "Une fois par jour" },
                    { value: "both", title: "Les deux", desc: "Pied + pop-up" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, disclaimer_mode: opt.value as typeof f.disclaimer_mode }))}
                      className={`text-left rounded-lg border p-3 transition ${
                        form.disclaimer_mode === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="text-sm font-medium">{opt.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{opt.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-1">
                  <Label className="text-xs">Texte du message</Label>
                  <Textarea
                    value={form.disclaimer_text}
                    onChange={(e) => setForm((f) => ({ ...f, disclaimer_text: e.target.value }))}
                    placeholder={DEFAULT_DISCLAIMER_TEXT}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Laissez vide pour utiliser le message par défaut.
                  </p>
                </div>

                <div className="mt-3 rounded-lg border border-border p-4 bg-muted/20">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                    <Info className="w-3.5 h-3.5" />
                    Aperçu
                  </div>
                  <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                    <Info className="mt-0.5 h-3 w-3 shrink-0 opacity-60" />
                    <p>{form.disclaimer_text.trim() || DEFAULT_DISCLAIMER_TEXT}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Formules tarifaires */}
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Formules tarifaires</h3>
            <p className="text-xs text-muted-foreground mb-3">Ajoutez vos formules (ex: "Entrée / Plat / Dessert" → "56 €"). L'icône n'apparaîtra sur le menu que si au moins une formule est renseignée.</p>
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
        </div>
      )}

      {/* ═══════════ ABONNEMENT ═══════════ */}
      {activeTab === "abonnement" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Abonnement en cours</h3>
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

          <div className="rounded-lg border border-border p-4 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Changer d'abonnement</h3>
            <p className="text-xs text-muted-foreground">
              Besoin de plus de plats, d'établissements ou de fonctionnalités ? Envoyez-nous une demande, nous vous répondons rapidement.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href={changeRequestUrl}>
                <Mail className="w-4 h-4 mr-1" />
                Demander un changement d'abonnement
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* ═══════════ PARTAGE ═══════════ */}
      {activeTab === "partage" && restaurantId && (
        <QRCodePanel restaurantId={restaurantId} restaurantName={form.restaurant_name} />
      )}

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
