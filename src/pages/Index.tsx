import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useRestaurantBySlug } from "@/hooks/useRestaurantBySlug";
import { useDishes } from "@/hooks/useDishes";
import { usePublishedSettings } from "@/hooks/useSiteSettings";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
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
import ARButton from "@/components/ARButton";
import MenuListView from "@/components/MenuListView";
import PopSwipeView from "@/components/menu-views/PopSwipeView";
import OrganicStoriesView from "@/components/menu-views/OrganicStoriesView";
import VintageBookView from "@/components/menu-views/VintageBookView";
import WalletStackView from "@/components/menu-views/WalletStackView";
import type { Dish } from "@/hooks/useDishes";
import { getLayoutVariant } from "@/lib/menuTemplates";
import { isIOS } from "@/lib/platform";
import { hasARModel } from "@/lib/dishHasAR";
import { Info, ChefHat, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Index = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: restaurantInfo, isLoading: loadingRestaurant, isError: restaurantErr } =
    useRestaurantBySlug(slug);
  const restaurantId = restaurantInfo?.id ?? null;
  const [activeIndex, setActiveIndex] = useState(2);
  const [showSplash, setShowSplash] = useState(true);
  const { data: allDishes, isLoading } = useDishes(restaurantId);
  // Filter out unavailable dishes for the public menu
  const dishes = allDishes?.filter(d => d.is_available);
  const { data: siteSettings } = usePublishedSettings(restaurantId);
  const formulas = siteSettings?.formulas?.filter(f => f.label && f.price) ?? [];
  const { isFavorite, toggle } = useFavorites();
  const features = useSubscriptionFeatures(restaurantId);
  const { lang, t, translateBatch } = useTranslation();

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
      "Voir le plat",
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

  const safeIndex = Math.min(activeIndex, (dishes?.length ?? 1) - 1);
  const currentDish = dishes?.[safeIndex];

  // Track dish view events for Business stats
  useEffect(() => {
    if (!currentDish) return;
    supabase.from("dish_events").insert({ dish_id: currentDish.id, event_type: "view" }).then();
  }, [currentDish?.id]);

  // Track time spent on each dish
  const viewStartRef = useRef<number>(Date.now());
  useEffect(() => {
    viewStartRef.current = Date.now();
    return () => {
      if (!currentDish) return;
      const duration = Math.round((Date.now() - viewStartRef.current) / 1000);
      if (duration >= 2) {
        // Only track if viewed for at least 2 seconds
        supabase.from("dish_events").insert({ dish_id: currentDish.id, event_type: `view_duration_${duration}` }).then();
      }
    };
  }, [currentDish?.id]);

  // Mettre à jour le title de la page avec le nom du restaurant une fois chargé
  useEffect(() => {
    if (siteSettings?.restaurant_name) {
      const sub = siteSettings.subtitle || "Menu";
      document.title = `${siteSettings.restaurant_name} — ${sub}`;
    }
  }, [siteSettings?.restaurant_name, siteSettings?.subtitle]);

  // Invalid slug or restaurant inactive/unknown
  if (!loadingRestaurant && (!slug || !restaurantInfo || restaurantErr)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Menu introuvable</h1>
        <p className="text-muted-foreground max-w-md">
          Ce lien n'est pas valide ou le restaurant est indisponible. Veuillez utiliser le lien fourni par votre restaurant.
        </p>
      </div>
    );
  }

  if (isLoading || !dishes?.length || !currentDish) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        {showSplash && <SplashScreen restaurantId={restaurantId} onDone={() => setShowSplash(false)} />}
      </div>
    );
  }

  const dish = currentDish;

  const handleLaunchAR = (target: Dish = dish) => {
    const hostname = window.location.hostname;
    const publishedOrigin = "https://virtual-plate-show.lovable.app";
    const shouldUsePublicOrigin =
      hostname.includes("lovableproject.com") || hostname.includes("id-preview");
    const assetOrigin = shouldUsePublicOrigin ? publishedOrigin : window.location.origin;

    if (isIOS() && target.model_ios) {
      const modelUrl = target.model_ios.startsWith("http")
        ? target.model_ios
        : `${assetOrigin}${target.model_ios}`;
      const a = document.createElement("a");
      a.rel = "ar";
      a.href = modelUrl;
      a.style.display = "none";
      const img = document.createElement("img");
      a.appendChild(img);
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 2000);
    } else if (target.model_android) {
      const modelUrl = target.model_android.startsWith("http")
        ? target.model_android
        : `${assetOrigin}${target.model_android}`;
      const url = `intent://arvr.google.com/scene-viewer/1.0?file=${modelUrl}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end;`;
      window.location.href = url;
    }

    supabase
      .from("dish_events")
      .insert({ dish_id: target.id, event_type: "ar_click" })
      .then();
  };

  const layout = getLayoutVariant(siteSettings?.template_id);
  const useListView = layout !== "classic";

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-background">
      {showSplash && <SplashScreen restaurantId={restaurantId} onDone={() => setShowSplash(false)} />}
      <LanguageSelector multilingual={features.hasMultilingual} />

      {/* Top-left icon buttons (horizontal row) */}
      <div className="absolute top-4 left-4 z-20 flex flex-row gap-2">
        {/* Formulas / Info — only show if formulas exist */}
        {formulas.length > 0 && (
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
                {formulas.map((f, i) => (
                  <div key={i}>
                    {i > 0 && <div className="border-t border-border mb-3" />}
                    <p className="text-sm text-foreground">{t(f.label)}</p>
                    <p className="text-lg font-semibold text-accent">{f.price}</p>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}

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

        {/* Storytelling */}
        {dish.story_text && (
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-md border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors active:scale-95"
                aria-label="Histoire du plat"
              >
                <BookOpen className="w-5 h-5 text-muted-foreground" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-sm">
              <DialogHeader>
                <DialogTitle
                  className="text-xl text-foreground tracking-wide uppercase text-center flex items-center justify-center gap-2"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  <BookOpen className="w-5 h-5 text-accent" />
                  {t("L'histoire du plat")}
                </DialogTitle>
              </DialogHeader>
              {dish.story_image && (
                <img src={dish.story_image} alt="" className="w-full h-40 object-cover rounded-lg" />
              )}
              <p className="text-sm text-foreground leading-relaxed italic text-center pt-2" style={{ fontFamily: "var(--font-serif)" }}>
                {t(dish.story_text)}
              </p>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {useListView ? (
        <div className="flex-1 min-h-0">
          {layout === "editorial" && (
            <MenuListView
              dishes={dishes}
              layout={layout}
              onLaunchAR={(d) => handleLaunchAR(d)}
              isFavorite={isFavorite}
              onToggleFavorite={toggle}
            />
          )}
          {layout === "vintage" && (
            <VintageBookView
              dishes={dishes}
              onLaunchAR={(d) => handleLaunchAR(d)}
              isFavorite={isFavorite}
              onToggleFavorite={toggle}
            />
          )}
          {layout === "pop" && (
            <PopSwipeView
              dishes={dishes}
              onLaunchAR={(d) => handleLaunchAR(d)}
              isFavorite={isFavorite}
              onToggleFavorite={toggle}
            />
          )}
          {layout === "organic" && (
            <OrganicStoriesView
              dishes={dishes}
              onLaunchAR={(d) => handleLaunchAR(d)}
              isFavorite={isFavorite}
              onToggleFavorite={toggle}
            />
          )}
          {layout === "wallet" && (
            <WalletStackView
              dishes={dishes}
              onLaunchAR={(d) => handleLaunchAR(d)}
              isFavorite={isFavorite}
              onToggleFavorite={toggle}
            />
          )}
        </div>
      ) : (
        // Vue classique Dark Luxe : 3D + carrousel
        <>
          <div className="flex-1 flex items-center justify-center relative">
            <ErrorBoundary key={dish.id} fallback={<DishViewerErrorFallback dish={dish} />}>
              <DishViewer key={dish.id} dish={dish} />
            </ErrorBoundary>
          </div>

          <div className="pb-safe relative">
            <DishInfo
              dish={dish}
              isFavorite={isFavorite(dish.id)}
              onToggleFavorite={() => toggle(dish.id)}
              layout={layout}
            />

            {/* CTA AR — animé + tooltip 1ère visite — masqué si pas de modèle 3D */}
            {hasARModel(dish) && (
              <ARButton
                onClick={() => handleLaunchAR()}
                layout={layout}
                restaurantId={restaurantId}
              />
            )}

            <div className="mt-2 pb-4">
              <DishCarousel
                dishes={dishes}
                activeIndex={safeIndex}
                onSelect={setActiveIndex}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
