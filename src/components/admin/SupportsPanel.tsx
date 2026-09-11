import { useState } from "react";
import { Printer, CreditCard, Sticker, Table2, Check } from "lucide-react";
import QRCodePanel from "@/components/QRCodePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const PRODUCTS = [
  {
    key: "chevalet",
    icon: Table2,
    title: "Chevalets QR de table",
    desc: "Support rigide recto/verso avec votre QR code et votre logo.",
    from: "à partir de 3,90 € / unité",
  },
  {
    key: "adhesif",
    icon: Sticker,
    title: "Adhésifs & vitrophanies",
    desc: "Stickers QR pour tables, vitrines et comptoir.",
    from: "à partir de 1,50 € / unité",
  },
  {
    key: "carte",
    icon: CreditCard,
    title: "Cartes de visite QR",
    desc: "Cartes à remettre aux clients, format 85 × 55 mm.",
    from: "à partir de 39 € / 100",
  },
  {
    key: "affiche",
    icon: Printer,
    title: "Affiches & sets de table",
    desc: "Impressions grand format pour vos offres et menus du jour.",
    from: "sur devis",
  },
] as const;

const SupportsPanel = ({ restaurantId }: { restaurantId: string }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [quantity, setQuantity] = useState("20");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");

  const toggle = (key: string) =>
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const handleRequest = () => {
    if (selected.length === 0) {
      toast.error("Choisissez au moins un support.");
      return;
    }
    if (!contact.trim()) {
      toast.error("Indiquez un email ou un téléphone pour le devis.");
      return;
    }
    const labels = PRODUCTS.filter((p) => selected.includes(p.key)).map((p) => p.title);
    const body = [
      `Demande de devis supports Platorama`,
      `Établissement : ${restaurantId}`,
      `Supports : ${labels.join(", ")}`,
      `Quantité : ${quantity}`,
      `Contact : ${contact}`,
      note ? `Précisions : ${note}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    window.location.href = `mailto:contact@platorama.fr?subject=${encodeURIComponent(
      "Demande de devis supports"
    )}&body=${encodeURIComponent(body)}`;
    toast.success("Votre demande de devis est prête à être envoyée.");
  };

  return (
    <div className="space-y-8 p-4">
      <section>
        <h2 className="mb-1 text-lg font-semibold">Votre QR code</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Téléchargez-le pour vos impressions, ou commandez directement vos supports ci-dessous.
        </p>
        <QRCodePanel restaurantId={restaurantId} />
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold">Commander des supports imprimés</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Sélectionnez ce qui vous intéresse, nous revenons vers vous avec un devis.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {PRODUCTS.map((p) => {
            const active = selected.includes(p.key);
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => toggle(p.key)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                  active ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
                }`}
              >
                <span className="rounded-lg bg-muted p-2">
                  <p.icon className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2 font-medium">
                    {p.title}
                    {active && <Check className="h-4 w-4 text-accent" />}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{p.desc}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{p.from}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="supports-qty">Quantité souhaitée</Label>
            <Input
              id="supports-qty"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ex. : 20 chevalets"
            />
          </div>
          <div>
            <Label htmlFor="supports-contact">Email ou téléphone</Label>
            <Input
              id="supports-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="vous@restaurant.fr"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="supports-note">Précisions (optionnel)</Label>
            <Textarea
              id="supports-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Couleurs, délais, format souhaité…"
              rows={3}
            />
          </div>
        </div>

        <Button className="mt-4" onClick={handleRequest}>
          Demander un devis
        </Button>
      </section>
    </div>
  );
};

export default SupportsPanel;
