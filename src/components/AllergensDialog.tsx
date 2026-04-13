import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface AllergensDialogProps {
  allergens: string[];
}

const AllergensDialog = ({ allergens }: AllergensDialogProps) => {
  const { t } = useTranslation();

  if (!allergens || allergens.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-accent transition-colors">
          {t("Allergènes")}
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-xs">
        <DialogHeader>
          <DialogTitle
            className="text-xl text-foreground tracking-wide uppercase text-center"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {t("Allergènes")}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {allergens.map((a) => (
            <div
              key={a}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50"
            >
              <AlertTriangle className="w-3 h-3 text-accent shrink-0" />
              <span className="text-sm text-foreground" style={{ fontFamily: "var(--font-serif)" }}>
                {t(a)}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3 italic">
          {t("N'hésitez pas à informer votre serveur de toute allergie ou intolérance alimentaire.")}
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AllergensDialog;
