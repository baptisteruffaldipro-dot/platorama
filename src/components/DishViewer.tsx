import { useState, useCallback } from "react";
import type { Dish } from "@/hooks/useDishes";

interface DishViewerProps {
  dish: Dish;
}

const DishViewer = ({ dish }: DishViewerProps) => {
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    console.warn("model-viewer error for", dish.name);
    setHasError(true);
  }, [dish.name]);

  if (hasError) {
    return (
      <div className="flex items-center justify-center flex-1 w-full max-h-[40vh]">
        <img
          src={dish.thumbnail}
          alt={dish.name}
          className="max-h-[220px] object-contain rounded-xl"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center flex-1 w-full max-h-[40vh]" style={{ background: "transparent" }}>
      {/* @ts-ignore */}
      <model-viewer
        key={dish.id}
        src={dish.model_android}
        ios-src={dish.model_ios}
        alt={dish.name}
        camera-controls
        auto-rotate
        auto-rotate-delay="0"
        rotation-per-second="12deg"
        interaction-prompt="none"
        shadow-intensity="0.4"
        exposure="1.2"
        loading="lazy"
        reveal="auto"
        style={{
          width: "100%",
          height: "100%",
          minHeight: "220px",
          backgroundColor: "transparent",
          "--poster-color": "transparent",
        } as React.CSSProperties}
        poster={dish.thumbnail}
        onError={handleError}
      />
    </div>
  );
};

export default DishViewer;
