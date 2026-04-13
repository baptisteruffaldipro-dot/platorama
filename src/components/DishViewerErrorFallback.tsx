import type { Dish } from "@/hooks/useDishes";

interface Props {
  dish: Dish;
}

const DishViewerErrorFallback = ({ dish }: Props) => (
  <div className="flex items-center justify-center flex-1 w-full max-h-[40vh]">
    <img
      src={dish.thumbnail}
      alt={dish.name}
      className="max-h-[220px] object-contain rounded-xl"
    />
  </div>
);

export default DishViewerErrorFallback;
