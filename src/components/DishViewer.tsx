import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { Rotate3d } from "lucide-react";
import type { Dish } from "@/hooks/useDishes";
import { useIsMobile } from "@/hooks/use-mobile";

interface DishViewerProps {
  dish: Dish;
}

const viewerStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: "220px",
  backgroundColor: "transparent",
  "--poster-color": "transparent",
} as CSSProperties;

const DishViewer = ({ dish }: DishViewerProps) => {
  const isMobile = useIsMobile();
  const [hasError, setHasError] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsActivated(false);
  }, [dish.id]);

  const handleError = useCallback(() => {
    console.warn("model-viewer error for", dish.name);
    setHasError(true);
    setIsActivated(false);
  }, [dish.name]);

  const shouldRenderModel = !hasError && (!isMobile || isActivated);

  if (!shouldRenderModel) {
    return (
      <div className="relative flex items-center justify-center flex-1 w-full max-h-[40vh] px-4">
        <img
          src={dish.thumbnail}
          alt={dish.name}
          className="max-h-[220px] w-full object-contain rounded-xl"
          loading="lazy"
        />

        {isMobile && !hasError ? (
          <button
            type="button"
            onClick={() => setIsActivated(true)}
            className="absolute bottom-3 inline-flex items-center gap-2 rounded-full bg-card/90 px-4 py-2 text-sm font-semibold text-foreground shadow-sm backdrop-blur-md border border-border active:scale-95"
            aria-label="Activer l’aperçu 3D"
          >
            <Rotate3d className="h-4 w-4" />
            Activer l’aperçu 3D
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center flex-1 w-full max-h-[40vh]" style={{ background: "transparent" }}>
      {/* @ts-ignore */}
      <model-viewer
        key={dish.id}
        src={dish.model_android}
        ios-src={dish.model_ios}
        alt={dish.name}
        camera-controls
        interaction-prompt="none"
        shadow-intensity={isMobile ? "0" : "0.2"}
        exposure="1"
        loading="lazy"
        reveal="auto"
        style={viewerStyle}
        poster={dish.thumbnail}
        onError={handleError}
      />

      {isMobile ? (
        <button
          type="button"
          onClick={() => setIsActivated(false)}
          className="absolute bottom-3 rounded-full bg-card/90 px-4 py-2 text-sm font-semibold text-foreground shadow-sm backdrop-blur-md border border-border active:scale-95"
        >
          Fermer l’aperçu 3D
        </button>
      ) : null}
    </div>
  );
};

export default DishViewer;
