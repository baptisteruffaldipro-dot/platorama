import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface Props {
  children: string;
  lines?: number;
  className?: string;
}

export default function ExpandableDescription({
  children,
  lines = 2,
  className = "",
}: Props) {
  const { t } = useTranslation();
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || el.clientHeight;
      const max = lines * lineHeight;
      setOverflow(el.scrollHeight > max + 1); // +1 pour les arrondis
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

  const style: React.CSSProperties = expanded
    ? {}
    : {
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: lines,
        overflow: "hidden",
      };

  return (
    <div className={className}>
      <p
        ref={ref}
        style={style}
        className="leading-snug"
      >
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
