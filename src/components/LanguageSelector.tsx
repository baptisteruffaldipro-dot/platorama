import { useTranslation } from "@/hooks/useTranslation";
import { Languages } from "lucide-react";

const LanguageSelector = () => {
  const { lang, setLang, isTranslating } = useTranslation();

  const toggle = () => {
    setLang(lang === "fr" ? "en" : "fr");
  };

  return (
    <button
      onClick={toggle}
      disabled={isTranslating}
      className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 border border-border backdrop-blur-md text-xs font-medium text-foreground hover:bg-card transition-all active:scale-95 disabled:opacity-50"
      aria-label="Changer de langue"
    >
      <Languages className="w-3.5 h-3.5" />
      {isTranslating ? "..." : lang.toUpperCase()}
    </button>
  );
};

export default LanguageSelector;
