import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Dish } from "@/hooks/useDishes";

interface DishCarouselProps {
  dishes: Dish[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

const DishCarousel = ({ dishes, activeIndex, onSelect }: DishCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const btn = itemRefs.current[activeIndex];
    if (btn) {
      btn.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
    }
  }, [activeIndex]);

  const prev = () => onSelect(activeIndex > 0 ? activeIndex - 1 : dishes.length - 1);
  const next = () => onSelect(activeIndex < dishes.length - 1 ? activeIndex + 1 : 0);

  return (
    <div className="flex items-center gap-1 px-2">
      <button onClick={prev} className="shrink-0 p-2 text-muted-foreground active:text-foreground transition-colors" aria-label="Previous dish">
        <ChevronLeft className="w-7 h-7" />
      </button>

      <div ref={scrollRef} className="flex gap-5 overflow-x-auto scrollbar-hide py-3 flex-1 items-center">
        {/* Spacer to allow first item to center */}
        <div className="shrink-0" style={{ minWidth: "calc(50% - 50px)" }} />

        {dishes.map((dish, i) => {
          const prevCategory = i > 0 ? dishes[i - 1].category : null;
          const showSeparator = prevCategory && prevCategory !== dish.category;

          return (
            <div key={dish.id} className="flex items-center gap-5 shrink-0">
              {showSeparator && (
                <div className="w-px h-14 bg-border shrink-0" />
              )}
              <button
                ref={(el) => { itemRefs.current[i] = el; }}
                onClick={() => onSelect(i)}
                className={`flex flex-col items-center gap-2 shrink-0 transition-all duration-300 ${
                  i === activeIndex ? "-translate-y-3" : "translate-y-0"
                }`}
              >
                <div
                  className={`rounded-full overflow-hidden transition-all duration-300 flex items-center justify-center bg-muted/20 ${
                    i === activeIndex
                      ? "w-[96px] h-[96px] border-2 border-foreground"
                      : "w-[72px] h-[72px] opacity-60"
                  }`}
                  style={i === activeIndex ? { boxShadow: "0 0 14px 3px rgba(255,255,255,0.25)" } : undefined}
                >
                  <img
                    src={dish.thumbnail}
                    alt={dish.name}
                    className="w-[85%] h-[85%] object-contain"
                    loading="lazy"
                  />
                </div>
                <span
                  className={`text-center leading-tight transition-all duration-300 max-w-[100px] ${
                    i === activeIndex
                      ? "text-base font-semibold text-foreground"
                      : "text-sm text-muted-foreground"
                  }`}
                >
                  {dish.name}
                </span>
              </button>
            </div>
          );
        })}

        {/* Spacer to allow last item to center */}
        <div className="shrink-0" style={{ minWidth: "calc(50% - 50px)" }} />
      </div>

      <button onClick={next} className="shrink-0 p-2 text-muted-foreground active:text-foreground transition-colors" aria-label="Next dish">
        <ChevronRight className="w-7 h-7" />
      </button>
    </div>
  );
};

export default DishCarousel;
