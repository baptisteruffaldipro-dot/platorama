import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { useRestaurantBySlug } from "@/hooks/useRestaurantBySlug";
import { useDishes } from "@/hooks/useDishes";
import { usePublishedSettings } from "@/hooks/useSiteSettings";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import { useMostLovedDishes } from "@/hooks/useMostLovedDishes";
import { useTranslation } from "@/hooks/useTranslation";
import DishCarousel from "@/components/DishCarousel";
import DishInfo from "@/components/DishInfo";
import DishViewer from "@/components/DishViewer";
import DishViewerErrorFallback from "@/components/DishViewerErrorFallback";
import ErrorBoundary from "@/components/ErrorBoundary";
import SplashScreen from "@/components/SplashScreen";
import LanguageSelector from "@/components/LanguageSelector";
import ARButton from "@/components/ARButton";
import MenuListView from "@/components/MenuListView";
import GoldEleganceView from "@/components/menu-views/GoldEleganceView";
import type { Dish } from "@/hooks/useDishes";
import { getLayoutVariant } from "@/lib/menuTemplates";
import { isIOS, isInAppBrowser } from "@/lib/platform";
import { hasARModel } from "@/lib/dishHasAR";
import OpenInBrowserDialog from "@/components/OpenInBrowserDialog";
import { forceOpenOverlay, releaseOverlay } from "@/lib/popupQueue";
import ReviewFlow from "@/components/ReviewFlow";
import LoyaltyCard from "@/components/LoyaltyCard";
import PromoPopup from "@/components/PromoPopup";
import DailyMenuBanner from "@/components/DailyMenuBanner";
import SmartMenuAssistant from "@/components/SmartMenuAssistant";
import { DisclaimerPopup, DisclaimerFooter, DEFAULT_DISCLAIMER_TEXT } from "@/components/MenuDisclaimer";
import {
  filterDishes,
  loadPreferences,
  savePreferences,
  emptyPreferences,
  type MenuPreferences,
} from "@/lib/dietProfiles";

import { useRestaurantFeatures } from "@/hooks/useRestaurantFeatures";
import { BadgeEuro, BookOpen } from "lucide-react";
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
  const [showBrowserHint, setShowBrowserHint] = useState(false);
  const [browserHintReason, setBrowserHintReason] = useState<"arrival" | "ar">("ar");

  // Arrivée depuis Instagram/Facebook… : proposer tout de suite d'ouvrir
  // dans le vrai navigateur (une fois par visite), avant les autres pop-ups.
  useEffect(() => {
    if (showSplash || !isInAppBrowser()) return;
    try {
      if (sessionStorage.getItem("inapp_prompt_shown")) return;
      sessionStorage.setItem("inapp_prompt_shown", "1");
    } catch { /* ignore */ }
    forceOpenOverlay({ id: "inapp-browser", close: () => setShowBrowserHint(false) });
    setBrowserHintReason("arrival");
    setShowBrowserHint(true);
  }, [showSplash]);

  const handleBrowserHintChange = (open: boolean) => {
    setShowBrowserHint(open);
    if (!open) releaseOverlay("inapp-browser");
  };
  const { data: allDishes, isLoading } = useDishes(restaurantId);
  // Filter out unavailable dishes for the public menu
  const availableDishes = allDishes?.filter(d => d.is_available);
  // Menu intelligent : préférences alimentaires / allergies du client
  const [prefs, setPrefs] = useState<MenuPreferences>(emptyPreferences);
  useEffect(() => {
    if (restaurantId) setPrefs(loadPreferences(restaurantId));
  }, [restaurantId]);
  const updatePrefs = (next: MenuPreferences) => {
    setPrefs(next);
    if (restaurantId) savePreferences(restaurantId, next);
    setActiveIndex(0);
  };
  const { data: mostLovedDishIds = [] } = useMostLovedDishes(restaurantId);
  const decoratedDishes = useMemo(() => {
    const mostLoved = new Set(mostLovedDishIds);
    return availableDishes?.map((dish) => ({ ...dish, is_most_loved: mostLoved.has(dish.id) }));
  }, [availableDishes, mostLovedDishIds]);
  const filteredDishes = decoratedDishes ? filterDishes(decoratedDishes, prefs) : undefined;
  const dishes = filteredDishes?.length ? filteredDishes : decoratedDishes;
  const { data: siteSettings } = usePublishedSettings(restaurantId);
  const formulas = siteSettings?.formulas?.filter(f => f.label && f.price) ?? [];
  const disclaimerEnabled = siteSettings?.disclaimer_enabled ?? false;
  const disclaimerMode = siteSettings?.disclaimer_mode ?? "footer";
  const disclaimerText = siteSettings?.disclaimer_text?.trim() || DEFAULT_DISCLAIMER_TEXT;
  const showDisclaimerFooter = disclaimerEnabled && (disclaimerMode === "footer" || disclaimerMode === "both");
  const showDisclaimerPopup = disclaimerEnabled && (disclaimerMode === "popup" || disclaimerMode === "both");
  const { isFavorite, toggle } = useFavorites();
  const features = useSubscriptionFeatures(restaurantId);
  const { data: restoFeatures } = useRestaurantFeatures(restaurantId);
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
      "Le plus aimé",
      "Nos Formules",
      "Entrée / Plat / Dessert",
      "Entrée / Plat ou Plat / Dessert",
      "Entrée",
      "Plat",
      "Dessert",
      "N'hésitez pas à informer votre serveur de toute allergie ou intolérance alimentaire."
    );
    if (disclaimerEnabled) allTexts.push(disclaimerText, "J'ai compris");
    const unique = [...new Set(allTexts.filter(Boolean))];
    translateBatch(unique);
  }, [lang, dishes, translateBatch, disclaimerEnabled, disclaimerText]);

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
    // Les webviews intégrées (Instagram, Facebook…) ne peuvent pas lancer
    // AR Quick Look / Scene Viewer : on invite à ouvrir dans Safari/Chrome.
    if (isInAppBrowser()) {
      setBrowserHintReason("ar");
      setShowBrowserHint(true);
      supabase
        .from("dish_events")
        .insert({ dish_id: target.id, event_type: "ar_blocked_inapp" })
        .then();
      return;
    }

    // Release any active camera streams (e.g. Vision AR background)
    // so iOS Quick Look / Scene Viewer can grab the camera for AR mode.
    document.querySelectorAll("video").forEach((v) => {
      const stream = v.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
      v.srcObject = null;
    });

    // Notify CameraBackground to restart once the user comes back from AR.
    const notifyReturn = () => {
      if (document.visibilityState === "visible") {
        window.dispatchEvent(new Event("ar-returned"));
      }
    };
    document.addEventListener("visibilitychange", notifyReturn, { once: false });
    window.addEventListener("pageshow", notifyReturn, { once: true });
    // Safety net: stop listening after 5 minutes
    setTimeout(() => {
      document.removeEventListener("visibilitychange", notifyReturn);
      window.removeEventListener("pageshow", notifyReturn);
    }, 5 * 60 * 1000);

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
      const url = `intent://arvr.google.com/scene-viewer/1.0?file=${modelUrl}&mode=ar_only#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end;`;
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
      <OpenInBrowserDialog open={showBrowserHint} onOpenChange={handleBrowserHintChange} reason={browserHintReason} />
      {restaurantId && restoFeatures && (
        <ReviewFlow restaurantId={restaurantId} features={restoFeatures} lang={lang} />
      )}
      {restaurantId && restoFeatures?.popups_enabled && !showSplash && (
        <PromoPopup restaurantId={restaurantId} lang={lang} />
      )}
      {restaurantId && showDisclaimerPopup && !showSplash && (
        <DisclaimerPopup restaurantId={restaurantId} text={disclaimerText} />
      )}

      {/* Header ancré en haut */}
      <header
        className="shrink-0 relative z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl"
      >
        <div className="px-4 pt-3 pb-1 relative flex items-start justify-between gap-2">
          {/* Icônes contextuelles (gauche) */}
          <div className="flex items-center gap-2 shrink-0 pt-1">

              {formulas.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-md border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors active:scale-95"
                      aria-label="Voir les formules"
                    >
                      <BadgeEuro className="w-5 h-5 text-muted-foreground" />
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

          </div>

          {/* Logo centré */}
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center px-1">
            {siteSettings?.logo_url ? (
              <img
                src={siteSettings.logo_url}
                alt={siteSettings?.restaurant_name ? `${siteSettings.restaurant_name} logo` : "Logo"}
                className="h-24 w-auto max-w-[15rem] object-contain"
              />
            ) : siteSettings?.restaurant_name ? (
              <span
                className="text-2xl tracking-wide uppercase text-center text-foreground"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {siteSettings.restaurant_name}
              </span>
            ) : null}
          </div>

          {/* Icônes contextuelles (droite) + langue */}
          <div className="flex items-center gap-2 shrink-0 pt-1">
            <div className="flex items-center gap-2">
              {/* Storytelling */}
              {dish?.story_text && (
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

            <LanguageSelector multilingual={features.hasMultilingual} />
          </div>
        </div>

        {/* Quick actions : Menu du jour · Aide au choix · Fidélité */}
        {!showSplash && (
          <div className="px-4 pb-3 flex items-center justify-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">

            {restaurantId && restoFeatures?.daily_menu_enabled && (
              <DailyMenuBanner restaurantId={restaurantId} />
            )}
            {availableDishes && restoFeatures && (
              <SmartMenuAssistant
                dishes={availableDishes}
                prefs={prefs}
                onChange={updatePrefs}
                onPick={(picked) => {
                  const list = filteredDishes?.length ? filteredDishes : availableDishes;
                  const idx = list.findIndex((d) => d.id === picked.id);
                  if (idx >= 0) setActiveIndex(idx);
                }}
                showProfiles={restoFeatures.diet_profiles_enabled}
                showAllergens={restoFeatures.allergens_enabled}
                showPickForMe={restoFeatures.pick_for_me_enabled}
              />
            )}
            {restaurantId && restoFeatures?.loyalty_enabled && (
              <LoyaltyCard
                restaurantId={restaurantId}
                programName={restoFeatures.loyalty_program_name}
                welcomeText={restoFeatures.loyalty_welcome_text}
                rewardThreshold={restoFeatures.loyalty_reward_threshold}
                lang={lang}
              />
            )}
          </div>
        )}
      </header>

      {useListView ? (
        <div className="flex-1 min-h-0">
          {(layout === "editorial" || layout === "pop") && (
            <MenuListView
              dishes={dishes}
              layout={layout}
              onLaunchAR={(d) => handleLaunchAR(d)}
              isFavorite={isFavorite}
              onToggleFavorite={toggle}
              disclaimer={showDisclaimerFooter ? disclaimerText : undefined}
            />
          )}
          {layout === "gold" && (
            <GoldEleganceView
              dishes={dishes}
              onLaunchAR={(d) => handleLaunchAR(d)}
              isFavorite={isFavorite}
              onToggleFavorite={toggle}
              disclaimer={showDisclaimerFooter ? disclaimerText : undefined}
            />
          )}

        </div>
      ) : (
        // Vue classique Dark Luxe : 3D + carrousel
        <>
          <div className="flex-1 flex items-end justify-center relative z-10 pb-2">
            <ErrorBoundary key={dish.id} fallback={<DishViewerErrorFallback dish={dish} />}>
              <DishViewer key={dish.id} dish={dish} />
            </ErrorBoundary>
          </div>

          <div className="pb-safe relative z-10">
            <DishInfo
              dish={dish}
              isFavorite={isFavorite(dish.id)}
              onToggleFavorite={() => toggle(dish.id)}
              layout={layout}
            />

            <div className="mt-2">
              <DishCarousel
                dishes={dishes}
                activeIndex={safeIndex}
                onSelect={setActiveIndex}
              />
            </div>

            {/* CTA AR — sous le carrousel, style bouton "commander" */}
            {hasARModel(dish) && (
              <ARButton
                onClick={() => handleLaunchAR()}
                layout={layout}
                restaurantId={restaurantId}
              />
            )}

            {showDisclaimerFooter && <DisclaimerFooter text={disclaimerText} className="!px-4 !pb-2 !pt-1" />}
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
