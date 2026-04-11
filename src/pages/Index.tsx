import { useState } from "react";
import { menuData } from "@/data/menu";
import DishCarousel from "@/components/DishCarousel";
import DishInfo from "@/components/DishInfo";
import DishViewer from "@/components/DishViewer";
import SplashScreen from "@/components/SplashScreen";
import CameraBackground from "@/components/CameraBackground";
import { isIOS } from "@/lib/platform";
import { Cuboid } from "lucide-react";

const Index = () => {
  const [activeIndex, setActiveIndex] = useState(2);
  const [showSplash, setShowSplash] = useState(true);
  const dish = menuData[activeIndex];

  const handleLaunchAR = () => {
    if (isIOS() && dish.model_ios) {
      // Create a temporary anchor to trigger Quick Look
      const a = document.createElement("a");
      a.rel = "ar";
      a.href = dish.model_ios;
      a.appendChild(document.createElement("img")); // Required for Quick Look
      a.click();
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      {/* Camera feed as background */}
      <CameraBackground />

      {/* Semi-transparent overlay for readability */}
      <div className="absolute inset-0 bg-background/30" style={{ zIndex: 1 }} />

      {/* 3D model viewer */}
      <div className="flex-1 flex items-center justify-center relative" style={{ zIndex: 2 }}>
        <DishViewer dish={dish} />
      </div>

      {/* Bottom overlay */}
      <div className="pb-safe relative" style={{ zIndex: 2 }}>
        <DishInfo dish={dish} />

        {/* AR button for iOS */}
        {isIOS() && dish.model_ios && (
          <div className="flex justify-center mt-3">
            <button
              onClick={handleLaunchAR}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold tracking-wide backdrop-blur-md transition-all active:scale-95"
            >
              <Cuboid className="w-4 h-4" />
              Voir en AR
            </button>
          </div>
        )}

        <div className="mt-4 pb-4">
          <DishCarousel
            dishes={menuData}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
