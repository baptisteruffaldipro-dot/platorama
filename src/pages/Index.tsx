import { useState, useEffect } from "react";
import { useDishes } from "@/hooks/useDishes";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import DishCarousel from "@/components/DishCarousel";
import DishInfo from "@/components/DishInfo";
import DishViewer from "@/components/DishViewer";
import SplashScreen from "@/components/SplashScreen";

import AllergensDialog from "@/components/AllergensDialog";
import ChefNoteDialog from "@/components/ChefNoteDialog";
import { isIOS } from "@/lib/platform";
import { Rotate3d } from "lucide-react";

/** Prefetch all 3D model files so they're cached when user taps AR */
function usePrefetchModels(dishes: ReturnType<typeof useDishes>["data"]) {
  useEffect(() => {
    if (!dishes?.length) return;
    const ios = isIOS();
    dishes.forEach((d) => {
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
  }, [dishes]);
}

const Index = () => {
  const [activeIndex, setActiveIndex] = useState(2);
  const [showSplash, setShowSplash] = useState(true);
  const { data: dishes, isLoading } = useDishes();
  const { isFavorite, toggle } = useFavorites();
  usePrefetchModels(dishes);

  if (isLoading || !dishes?.length) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      </div>
    );
  }

  const safeIndex = Math.min(activeIndex, dishes.length - 1);
  const dish = dishes[safeIndex];

  const handleLaunchAR = () => {
    // Track AR click
    supabase
      .from("dish_events")
      .insert({ dish_id: dish.id, event_type: "ar_click" })
      .then();

    if (isIOS() && dish.model_ios) {
      const a = document.createElement("a");
      a.rel = "ar";
      a.href = dish.model_ios;
      a.appendChild(document.createElement("img"));
      a.click();
    } else if (dish.model_android) {
      const url = `intent://arvr.google.com/scene-viewer/1.0?file=${window.location.origin}${dish.model_android}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end;`;
      window.location.href = url;
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-background">
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      <div className="flex-1 flex items-center justify-center relative">
        <DishViewer dish={dish} />
      </div>

      <div className="pb-safe relative">
        <DishInfo dish={dish} isFavorite={isFavorite(dish.id)} onToggleFavorite={() => toggle(dish.id)} />

        <div className="flex justify-center mt-3">
          <button
            onClick={handleLaunchAR}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold tracking-wide backdrop-blur-md transition-all active:scale-95"
          >
            <Rotate3d className="w-4 h-4" />
            Voir en réalité augmentée
          </button>
        </div>

        

        <div className="flex justify-center gap-6 pb-1">
          <AllergensDialog />
          <ChefNoteDialog />
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
