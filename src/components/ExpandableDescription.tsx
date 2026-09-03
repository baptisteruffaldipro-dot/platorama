import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface Props {
  children: string;
  lines?: number;
  className?: string;
  style?: React.CSSProperties;
}

function getLineHeight(el: HTMLElement): number {
  const computed = getComputedStyle(el);
  const explicit = parseFloat(computed.lineHeight);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;

  // line-height: normal -> mesure sur une ligne isolée avec les mêmes styles
  const probe = document.createElement("span");
  probe.textContent = "M";
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.whiteSpace = "nowrap";
  probe.style.lineHeight = computed.lineHeight;
  probe.style.fontSize = computed.fontSize;
  probe.style.fontFamily = computed.fontFamily;
  probe.style.fontWeight = computed.fontWeight;
  probe.style.letterSpacing = computed.letterSpacing;
  probe.style.textTransform = computed.textTransform;
  document.body.appendChild(probe);
  const height = probe.getBoundingClientRect().height;
  document.body.removeChild(probe);
  return height || el.clientHeight;
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

  const measure = () => {
    const el = ref.current;
    if (!el) return;
    const previousMaxHeight = el.style.maxHeight;
    el.style.maxHeight = "none";
    const lh = getLineHeight(el);
    setLineHeight(lh);
    setOverflow(el.scrollHeight > lh * lines + 1);
    el.style.maxHeight = previousMaxHeight;
  };

  useLayoutEffect(measure, [children, lines]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
      <p ref={ref} style={{ ...style, ...collapsedStyle }}>
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
