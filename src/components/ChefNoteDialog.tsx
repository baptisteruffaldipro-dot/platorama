import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChefHat } from "lucide-react";

const ChefNoteDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-accent transition-colors">
          Note du Chef
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle
            className="text-xl text-foreground tracking-wide uppercase text-center flex items-center justify-center gap-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            <ChefHat className="w-5 h-5 text-accent" />
            Note du Chef
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2" style={{ fontFamily: "var(--font-serif)" }}>
          <p className="text-sm text-foreground leading-relaxed italic text-center">
            Ce plat est une invitation au voyage, entre tradition et liberté. Le houmous, travaillé dans une version
            plus épicée et chaleureuse, révèle des notes inattendues tout en conservant sa générosité.
          </p>
          <p className="text-sm text-foreground leading-relaxed italic text-center">
            Le pain pita, simplement grillé, accompagne ce moment de partage, pensé pour être dégusté du bout des
            doigts, dans la simplicité et le plaisir.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChefNoteDialog;
