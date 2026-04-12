import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Dish } from "@/hooks/useDishes";
import { getCategoryIcon } from "@/lib/categoryStyle";

interface DishCarouselProps {
  dishes: Dish[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

const DishCarousel = ({ dishes, activeIndex, onSelect }: DishCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const active = el.children[activeIndex] as HTMLElement;
    if (active) {
      const offset = active.offsetLeft - el.clientWidth / 2 + active.clientWidth / 2;
      el.scrollTo({ left: offset, behavior: "smooth" });
    }
  }, [activeIndex]);

  const prev = () => onSelect(activeIndex > 0 ? activeIndex - 1 : dishes.length - 1);
  const next = () => onSelect(activeIndex < dishes.length - 1 ? activeIndex + 1 : 0);

  return (
    <div className="flex items-center gap-1 px-2">
      <button onClick={prev} className="shrink-0 p-2 text-muted-foreground active:text-foreground transition-colors" aria-label="Previous dish">
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-2 px-1 flex-1">
        {dishes.map((dish, i) => (
          <button
            key={dish.id}
            onClick={() => onSelect(i)}
            className="flex flex-col items-center gap-1.5 shrink-0 snap-center transition-all duration-300"
          >
            <div
              className={`rounded-full overflow-hidden transition-all duration-300 flex items-center justify-center bg-muted/20 ${
                i === activeIndex
                  ? "w-[72px] h-[72px] ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : "w-[56px] h-[56px] opacity-60"
              }`}
            >
              <img
                src={dish.thumbnail}
                alt={dish.name}
                className="w-[85%] h-[85%] object-contain"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              {getCategoryIcon(dish.category, 10)}
              <span
                className={`text-center leading-tight transition-all duration-300 max-w-[80px] ${
                  i === activeIndex
                    ? "text-[11px] font-semibold text-foreground"
                    : "text-[10px] text-muted-foreground"
                }`}
              >
                {dish.name}
              </span>
            </div>
          </button>
        ))}
      </div>

      <button onClick={next} className="shrink-0 p-2 text-muted-foreground active:text-foreground transition-colors" aria-label="Next dish">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default DishCarousel;
