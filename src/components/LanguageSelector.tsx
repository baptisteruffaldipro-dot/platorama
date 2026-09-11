import { useState } from "react";
import { useTranslation, ALL_LANGUAGES, type Lang } from "@/hooks/useTranslation";
import { Languages, ChevronDown } from "lucide-react";

interface LanguageSelectorProps {
  /** If true, show all languages (Premium). If false, only FR/EN */
  multilingual?: boolean;
}

const LanguageSelector = ({ multilingual = false }: LanguageSelectorProps) => {
  const { lang, setLang, isTranslating } = useTranslation();
  const [open, setOpen] = useState(false);

  const availableLanguages = multilingual
    ? ALL_LANGUAGES
    : ALL_LANGUAGES.filter((l) => l.code === "fr" || l.code === "en");

  // Simple toggle for 2 languages
  if (availableLanguages.length === 2) {
    const toggle = () => {
      setLang(lang === "fr" ? "en" : "fr");
    };
    return (
      <button
        onClick={toggle}
        disabled={isTranslating}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 border border-border backdrop-blur-md text-xs font-medium text-foreground hover:bg-card transition-all active:scale-95 disabled:opacity-50"
        aria-label="Changer de langue"
      >
        <Languages className="w-3.5 h-3.5" />
        {isTranslating ? "..." : lang.toUpperCase()}
      </button>
    );
  }

  // Dropdown for multilingual
  return (
    <div className="relative shrink-0 z-50">
      <button
        onClick={() => setOpen(!open)}
        disabled={isTranslating}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 border border-border backdrop-blur-md text-xs font-medium text-foreground hover:bg-card transition-all active:scale-95 disabled:opacity-50"
      >
        <Languages className="w-3.5 h-3.5" />
        {isTranslating ? "..." : lang.toUpperCase()}
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px] backdrop-blur-md">
            {availableLanguages.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code as Lang);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors ${
                  lang === l.code ? "text-accent font-semibold" : "text-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
