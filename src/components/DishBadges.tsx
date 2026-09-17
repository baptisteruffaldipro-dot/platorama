import type { Dish } from "@/hooks/useDishes";
import { BadgeMark, getBadge } from "@/lib/badges";
import { cn } from "@/lib/utils";

interface DishBadgesProps {
  dish: Partial<Pick<Dish, "badge" | "is_most_loved">>;
  className?: string;
  compact?: boolean;
  prominent?: boolean;
}

export default function DishBadges({ dish, className, compact = false, prominent = false }: DishBadgesProps) {
  const values = [dish.badge, dish.is_most_loved ? "le_plus_aime" : null].filter(
    (value, index, items): value is string => Boolean(value) && items.indexOf(value) === index,
  );

  if (!values.length) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {values.map((value) => {
        const badge = getBadge(value);
        if (!badge) return null;
        if (badge.image) {
          return <BadgeMark key={value} badge={badge} className={compact ? "h-4" : "h-5"} />;
        }

        return (
          <span
            key={value}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/75 font-semibold text-foreground backdrop-blur-sm",
              compact ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
              prominent && "border-accent/40 bg-accent/15 text-accent",
            )}
          >
            <BadgeMark badge={badge} className={compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5"} />
            {compact ? badge.shortLabel : badge.label}
          </span>
        );
      })}
    </div>
  );
}