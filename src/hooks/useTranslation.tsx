import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Lang = "fr" | "en" | "es" | "de" | "it" | "pt" | "zh" | "ja" | "ar" | "ru";

const LANG_LABELS: Record<Lang, string> = {
  fr: "Français",
  en: "English",
  es: "Español",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  zh: "中文",
  ja: "日本語",
  ar: "العربية",
  ru: "Русский",
};

const LANG_TARGETS: Record<Lang, string> = {
  fr: "French",
  en: "English",
  es: "Spanish",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  zh: "Chinese",
  ja: "Japanese",
  ar: "Arabic",
  ru: "Russian",
};

export const ALL_LANGUAGES: { code: Lang; label: string }[] = Object.entries(LANG_LABELS).map(
  ([code, label]) => ({ code: code as Lang, label })
);

interface TranslationContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (text: string) => string;
  translateBatch: (texts: string[]) => Promise<void>;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType>({
  lang: "fr",
  setLang: () => {},
  t: (text) => text,
  translateBatch: async () => {},
  isTranslating: false,
});

export const useTranslation = () => useContext(TranslationContext);

// In-memory cache to avoid re-translating
const cache: Record<string, Record<string, string>> = {};

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>("fr");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  const translateBatch = useCallback(async (texts: string[]) => {
    if (lang === "fr") return;

    // Filter out already cached
    const cacheKey = lang;
    if (!cache[cacheKey]) cache[cacheKey] = {};

    const uncached = texts.filter((t) => t && !cache[cacheKey][t]);
    if (uncached.length === 0) {
      setTranslations({ ...cache[cacheKey] });
      return;
    }

    setIsTranslating(true);
    try {
      const targetLang = lang;
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { texts: uncached, target_lang: targetLang },
      });

      if (error) throw error;

      const result = data?.translations ?? uncached;
      uncached.forEach((original, i) => {
        cache[cacheKey][original] = result[i] ?? original;
      });

      setTranslations({ ...cache[cacheKey] });
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setIsTranslating(false);
    }
  }, [lang]);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    if (newLang === "fr") {
      setTranslations({});
    }
  }, []);

  const t = useCallback(
    (text: string): string => {
      if (lang === "fr" || !text) return text;
      return translations[text] ?? text;
    },
    [lang, translations]
  );

  return (
    <TranslationContext.Provider value={{ lang, setLang, t, translateBatch, isTranslating }}>
      {children}
    </TranslationContext.Provider>
  );
};
