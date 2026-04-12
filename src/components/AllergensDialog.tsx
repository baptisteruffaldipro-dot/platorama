import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Wheat, Shell, Egg, Fish, Milk, Bean, TreeDeciduous, Citrus } from "lucide-react";

const allergens = [
  { name: "Gluten", icon: Wheat },
  { name: "Crustacés", icon: Shell },
  { name: "Œufs", icon: Egg },
  { name: "Poissons", icon: Fish },
  { name: "Arachides", icon: Bean },
  { name: "Soja", icon: Bean },
  { name: "Lait", icon: Milk },
  { name: "Fruits à coque", icon: TreeDeciduous },
  { name: "Céleri", icon: Citrus },
  { name: "Moutarde", icon: AlertTriangle },
  { name: "Sésame", icon: AlertTriangle },
  { name: "Sulfites", icon: AlertTriangle },
  { name: "Lupin", icon: AlertTriangle },
  { name: "Mollusques", icon: Shell },
];

const AllergensDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-accent transition-colors">
          Allergènes
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-sm max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className="text-xl text-foreground tracking-wide uppercase text-center"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Allergènes
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground text-center mb-4 italic" style={{ fontFamily: "var(--font-serif)" }}>
          Les 14 allergènes à déclaration obligatoire
        </p>
        <div className="grid grid-cols-2 gap-3">
          {allergens.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.name}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50"
              >
                <Icon className="w-4 h-4 text-accent shrink-0" />
                <span className="text-sm text-foreground" style={{ fontFamily: "var(--font-serif)" }}>
                  {a.name}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-4 italic">
          N'hésitez pas à informer votre serveur de toute allergie ou intolérance alimentaire.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AllergensDialog;
