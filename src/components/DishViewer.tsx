import { isIOS } from "@/lib/platform";
import type { Dish } from "@/data/menu";

interface DishViewerProps {
  dish: Dish;
}

const DishViewer = ({ dish }: DishViewerProps) => {
  if (isIOS()) {
    // iOS: show dish image; AR is triggered via <a rel="ar"> in DishInfo
    return (
      <div className="flex items-center justify-center flex-1">
        <img
          src={dish.thumbnail}
          alt={dish.name}
          className="w-64 h-64 rounded-full object-cover shadow-2xl"
          width={256}
          height={256}
        />
      </div>
    );
  }

  // Android: use model-viewer
  return (
    <div className="flex items-center justify-center flex-1">
      {/* @ts-ignore */}
      <model-viewer
        src={dish.model_android}
        alt={dish.name}
        ar
        ar-modes="scene-viewer webxr quick-look"
        camera-controls
        auto-rotate
        style={{ width: "100%", height: "300px" }}
        poster={dish.thumbnail}
      />
    </div>
  );
};

export default DishViewer;
