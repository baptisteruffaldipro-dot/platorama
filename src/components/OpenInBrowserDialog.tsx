import { useState } from "react";
import { Check, Copy, ExternalLink, MoreHorizontal } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { inAppBrowserName, isIOS, openInSystemBrowser } from "@/lib/platform";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Affiché quand la page est ouverte dans un navigateur intégré (Instagram,
 * Facebook…) : ces webviews ne peuvent pas lancer la réalité augmentée.
 */
export default function OpenInBrowserDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const appName = inAppBrowserName();
  const ios = isIOS();

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Fallback silencieux
      const el = document.createElement("textarea");
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle
            className="text-xl text-foreground tracking-wide uppercase text-center"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {t("Ouvrir dans le navigateur")}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          {t("La réalité augmentée ne fonctionne pas dans le navigateur intégré de")}{" "}
          {appName}. {t("Ouvrez le menu dans Safari ou Chrome pour voir le plat sur votre table.")}
        </p>

        <button
          onClick={() => openInSystemBrowser()}
          className="w-full rounded-full px-5 py-3 flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-background active:scale-[0.98] transition-transform"
          style={{
            background: "linear-gradient(180deg, hsl(43 55% 62%) 0%, hsl(41 50% 52%) 100%)",
            fontFamily: "var(--font-serif)",
          }}
        >
          <ExternalLink className="w-4 h-4" />
          {t("Ouvrir dans le navigateur")}
        </button>

        <button
          onClick={copyLink}
          className="w-full rounded-full px-5 py-3 flex items-center justify-center gap-2 text-sm border border-border text-foreground hover:border-accent transition-colors active:scale-[0.98]"
        >
          {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
          {copied ? t("Lien copié") : t("Copier le lien")}
        </button>

        {ios && (
          <p className="text-xs text-muted-foreground text-center leading-relaxed flex items-center justify-center gap-1.5 pt-1">
            <MoreHorizontal className="w-4 h-4 shrink-0" />
            {t("Sinon : touchez « … » en haut à droite puis « Ouvrir dans Safari ».")}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
