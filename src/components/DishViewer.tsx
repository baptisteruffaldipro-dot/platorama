import type { Dish } from "@/data/menu";

interface DishViewerProps {
  dish: Dish;
}

const DishViewer = ({ dish }: DishViewerProps) => {
  return (
    <div className="flex items-center justify-center flex-1 w-full" style={{ background: "transparent" }}>
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
        style={{
          width: "100%",
          height: "100%",
          minHeight: "300px",
          backgroundColor: "transparent",
          "--poster-color": "transparent",
        } as React.CSSProperties}
        poster={dish.thumbnail}
      />
    </div>
  );
};

export default DishViewer;
