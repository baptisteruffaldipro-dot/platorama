import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDishes } from "@/hooks/useDishes";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import { useTranslation } from "@/hooks/useTranslation";
import DishCarousel from "@/components/DishCarousel";
import DishInfo from "@/components/DishInfo";
import DishViewer from "@/components/DishViewer";
import DishViewerErrorFallback from "@/components/DishViewerErrorFallback";
import ErrorBoundary from "@/components/ErrorBoundary";
import SplashScreen from "@/components/SplashScreen";
import LanguageSelector from "@/components/LanguageSelector";
import AllergensDialog from "@/components/AllergensDialog";
import { isIOS } from "@/lib/platform";
import { Rotate3d, Info, ChefHat } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Prefetch only the next/prev model, not all at once */
function usePrefetchAdjacentModels(dishes: ReturnType<typeof useDishes>["data"], activeIndex: number) {
  useEffect(() => {
    if (!dishes?.length) return;
    const ios = isIOS();
    const indices = [activeIndex - 1, activeIndex + 1].filter(i => i >= 0 && i < dishes.length);
    indices.forEach((i) => {
      const d = dishes[i];
      const url = ios ? d.model_ios : d.model_android;
      if (url) {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = url;
        link.as = "fetch";
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
      }
    });
  }, [dishes, activeIndex]);
}

const Index = () => {
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurant");
  const [activeIndex, setActiveIndex] = useState(2);
  const [showSplash, setShowSplash] = useState(true);
  const { data: dishes, isLoading } = useDishes(restaurantId);
  const { isFavorite, toggle } = useFavorites();
  const { lang, t, translateBatch } = useTranslation();
  usePrefetchAdjacentModels(dishes, activeIndex);

  // Trigger translation when language or dishes change
  useEffect(() => {
    if (lang === "fr" || !dishes?.length) return;
    const allTexts: string[] = [];
    dishes.forEach((d) => {
      allTexts.push(d.category, d.name, d.ingredients);
      if (d.chef_note) allTexts.push(d.chef_note);
      if (d.allergens?.length) allTexts.push(...d.allergens);
    });
    // Add static UI texts
    allTexts.push(
      "Voir sur ma table",
      "Allergènes",
      "Note du Chef",
      "Nos Formules",
      "Entrée / Plat / Dessert",
      "Entrée / Plat ou Plat / Dessert",
      "Entrée",
      "Plat",
      "Dessert",
      "N'hésitez pas à informer votre serveur de toute allergie ou intolérance alimentaire."
    );
    const unique = [...new Set(allTexts.filter(Boolean))];
    translateBatch(unique);
  }, [lang, dishes, translateBatch]);

  if (isLoading || !dishes?.length) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        {showSplash && <SplashScreen restaurantId={restaurantId} onDone={() => setShowSplash(false)} />}
      </div>
    );
  }

  const safeIndex = Math.min(activeIndex, dishes.length - 1);
  const dish = dishes[safeIndex];

  const handleLaunchAR = () => {
    const hostname = window.location.hostname;
    const publishedOrigin = "https://virtual-plate-show.lovable.app";
    const shouldUsePublicOrigin =
      hostname.includes("lovableproject.com") || hostname.includes("id-preview");
    const assetOrigin = shouldUsePublicOrigin ? publishedOrigin : window.location.origin;

    if (isIOS() && dish.model_ios) {
      const modelUrl = dish.model_ios.startsWith("http")
        ? dish.model_ios
        : `${assetOrigin}${dish.model_ios}`;
      const a = document.createElement("a");
      a.rel = "ar";
      a.href = modelUrl;
      a.style.display = "none";
      const img = document.createElement("img");
      a.appendChild(img);
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 2000);
    } else if (dish.model_android) {
      const modelUrl = dish.model_android.startsWith("http")
        ? dish.model_android
        : `${assetOrigin}${dish.model_android}`;
      const url = `intent://arvr.google.com/scene-viewer/1.0?file=${modelUrl}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end;`;
      window.location.href = url;
    }

    supabase
      .from("dish_events")
      .insert({ dish_id: dish.id, event_type: "ar_click" })
      .then();
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-background">
      {showSplash && <SplashScreen restaurantId={restaurantId} onDone={() => setShowSplash(false)} />}
      <LanguageSelector />

      {/* Top-left icon buttons */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {/* Formulas / Info */}
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-md border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors active:scale-95"
              aria-label="Voir les formules"
            >
              <Info className="w-5 h-5 text-muted-foreground" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-xs">
            <DialogHeader>
              <DialogTitle
                className="text-xl text-foreground tracking-wide uppercase text-center"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {t("Nos Formules")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2 text-center" style={{ fontFamily: "var(--font-serif)" }}>
              <div className="space-y-1">
                <p className="text-sm text-foreground">{t("Entrée / Plat / Dessert")}</p>
                <p className="text-lg font-semibold text-accent">56 €</p>
              </div>
              <div className="border-t border-border" />
              <div className="space-y-1">
                <p className="text-sm text-foreground">{t("Entrée / Plat ou Plat / Dessert")}</p>
                <p className="text-lg font-semibold text-accent">48 €</p>
              </div>
              <div className="border-t border-border" />
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <p className="text-xs text-muted-foreground">{t("Entrée")}</p>
                  <p className="text-sm font-semibold text-accent">17 €</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("Plat")}</p>
                  <p className="text-sm font-semibold text-accent">34 €</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("Dessert")}</p>
                  <p className="text-sm font-semibold text-accent">14 €</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Chef note */}
        {dish.chef_note && (
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-md border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors active:scale-95"
                aria-label="Note du chef"
              >
                <ChefHat className="w-5 h-5 text-muted-foreground" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-sm">
              <DialogHeader>
                <DialogTitle
                  className="text-xl text-foreground tracking-wide uppercase text-center flex items-center justify-center gap-2"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  <ChefHat className="w-5 h-5 text-accent" />
                  {t("Note du Chef")}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-foreground leading-relaxed italic text-center pt-2" style={{ fontFamily: "var(--font-serif)" }}>
                {t(dish.chef_note)}
              </p>
            </DialogContent>
          </Dialog>
        )}

        {/* Allergens */}
        {dish.allergens && dish.allergens.length > 0 && (
          <AllergensDialog allergens={dish.allergens} />
        )}
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        <ErrorBoundary fallback={<DishViewerErrorFallback dish={dish} />}>
          <DishViewer dish={dish} />
        </ErrorBoundary>
      </div>

      <div className="pb-safe relative">
        <DishInfo dish={dish} isFavorite={isFavorite(dish.id)} onToggleFavorite={() => toggle(dish.id)} />

        {/* CTA button */}
        <div className="flex justify-center mt-3">
          <button
            onClick={handleLaunchAR}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-accent text-accent-foreground text-base font-bold tracking-wide backdrop-blur-md transition-all active:scale-95 animate-ar-pulse"
          >
            <Rotate3d className="w-6 h-6" />
            {t("Voir sur ma table")}
          </button>
        </div>

        <div className="mt-2 pb-4">
          <DishCarousel
            dishes={dishes}
            activeIndex={safeIndex}
            onSelect={setActiveIndex}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
