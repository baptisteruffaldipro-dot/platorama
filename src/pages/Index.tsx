import { useState } from "react";
import { menuData } from "@/data/menu";
import DishCarousel from "@/components/DishCarousel";
import DishInfo from "@/components/DishInfo";
import DishViewer from "@/components/DishViewer";
import SplashScreen from "@/components/SplashScreen";

const Index = () => {
  const [activeIndex, setActiveIndex] = useState(2); // Start on Houmous
  const [showSplash, setShowSplash] = useState(true);
  const dish = menuData[activeIndex];

  return (
    <div className="h-full flex flex-col bg-background relative">
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      {/* Dish viewer area */}
      <div className="flex-1 flex items-center justify-center">
        <DishViewer dish={dish} />
      </div>

      {/* Bottom overlay */}
      <div className="pb-safe">
        <DishInfo dish={dish} />
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
