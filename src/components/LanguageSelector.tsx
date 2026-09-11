import { useState } from "react";
import { useTranslation, ALL_LANGUAGES, type Lang } from "@/hooks/useTranslation";
import { Languages } from "lucide-react";

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

  const circleBtn =
    "w-10 h-10 rounded-full bg-card/80 backdrop-blur-md border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors active:scale-95 disabled:opacity-50";

  // Simple toggle for 2 languages
  if (availableLanguages.length === 2) {
    const toggle = () => {
      setLang(lang === "fr" ? "en" : "fr");
    };
    return (
      <button
        onClick={toggle}
        disabled={isTranslating}
        className={`shrink-0 ${circleBtn}`}
        aria-label="Changer de langue"
        title={isTranslating ? "..." : lang.toUpperCase()}
      >
        <Languages className="w-5 h-5 text-muted-foreground" />
      </button>
    );
  }

  // Dropdown for multilingual
  return (
    <div className="relative shrink-0 z-50">
      <button
        onClick={() => setOpen(!open)}
        disabled={isTranslating}
        className={circleBtn}
        aria-label="Changer de langue"
        title={isTranslating ? "..." : lang.toUpperCase()}
      >
        <Languages className="w-5 h-5 text-muted-foreground" />
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
