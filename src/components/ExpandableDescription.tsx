import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface Props {
  children: string;
  lines?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function ExpandableDescription({
  children,
  lines = 2,
  className = "",
  style,
}: Props) {
  const { t } = useTranslation();
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const [lineHeight, setLineHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      // On mesure la hauteur naturelle (sans contrainte)
      el.style.maxHeight = "none";
      const computedLh = parseFloat(getComputedStyle(el).lineHeight);
      const lh = Number.isFinite(computedLh) && computedLh > 0 ? computedLh : el.clientHeight;
      setLineHeight(lh);
      setOverflow(el.scrollHeight > lh * lines + 1);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [children, lines]);

  const collapsedStyle: React.CSSProperties =
    lineHeight > 0 && !expanded
      ? {
          maxHeight: lineHeight * lines,
          overflow: "hidden",
          lineHeight: `${lineHeight}px`,
        }
      : {};

  return (
    <div className={className}>
      <p ref={ref} style={collapsedStyle}>
        {children}
      </p>
      {overflow && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-0.5 mt-1 text-[11px] text-muted-foreground/70 hover:text-muted-foreground transition-colors"
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              {t("Voir moins")} <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              {t("Voir plus")} <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
