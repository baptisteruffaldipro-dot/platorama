import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

export interface Popup {
  id: string;
  title: string;
  body: string;
  image_url: string;
  cta_label: string;
  cta_url: string;
  frequency: string;
  target_lang: string | null;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
}

const seenKey = (id: string) => `popup_seen_${id}`;
const today = () => new Date().toISOString().slice(0, 10);

const wasSeen = (p: Popup) => {
  if (p.frequency === "always") return false;
  if (p.frequency === "once_per_session") return sessionStorage.getItem(seenKey(p.id)) === "1";
  const stored = localStorage.getItem(seenKey(p.id));
  if (!stored) return false;
  if (p.frequency === "once_ever") return true;
  return stored === today();
};

const markSeen = (p: Popup) => {
  if (p.frequency === "always") return;
  if (p.frequency === "once_per_session") {
    sessionStorage.setItem(seenKey(p.id), "1");
    return;
  }
  localStorage.setItem(seenKey(p.id), p.frequency === "once_ever" ? "1" : today());
};

const track = (popupId: string, event_type: "impression" | "click" | "dismiss") => {
  supabase.from("popup_events").insert({ popup_id: popupId, event_type }).then(() => {}, () => {});
};

interface Props {
  restaurantId: string;
  lang?: string;
  delayMs?: number;
}

const PromoPopup = ({ restaurantId, lang, delayMs = 4000 }: Props) => {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);

  const hide = useCallback(() => {
    visibleRef.current = false;
    setVisible(false);
    setTimeout(() => setPopup(null), 250);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let unsubscribe: (() => void) | undefined;

    const load = async () => {
      const nowIso = new Date().toISOString();
      const { data } = await supabase
        .from("popups")
        .select("id, title, body, image_url, cta_label, cta_url, frequency, target_lang, starts_at, ends_at, sort_order")
        .eq("restaurant_id", restaurantId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(20);

      const candidates = ((data ?? []) as Popup[]).filter((p) => {
        if (p.starts_at && p.starts_at > nowIso) return false;
        if (p.ends_at && p.ends_at < nowIso) return false;
        if (p.target_lang && lang && p.target_lang !== lang) return false;
        return !wasSeen(p);
      });

      const next = candidates[0];
      if (cancelled || !next) return;

      const attempt = () => {
        if (cancelled) return true;
        if (visibleRef.current) return true;
        // Wait for our turn: another overlay (daily menu, …) may be open.
        if (!tryOpenOverlay({ id: OVERLAY_ID, close: hide })) return false;
        visibleRef.current = true;
        setPopup(next);
        setVisible(true);
        markSeen(next);
        track(next.id, "impression");
        unsubscribe?.();
        return true;
      };

      timer = setTimeout(() => {
        if (!attempt()) {
          unsubscribe = onOverlayFree(() => {
            attempt();
          });
        }
      }, delayMs);
    };

    load();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsubscribe?.();
    };
  }, [restaurantId, lang, delayMs, hide]);

  const close = (dismissed = true) => {
    if (popup && dismissed) track(popup.id, "dismiss");
    hide();
    releaseOverlay(OVERLAY_ID);
  };


  const handleCta = () => {
    if (!popup) return;
    track(popup.id, "click");
    if (popup.cta_url) window.open(popup.cta_url, "_blank", "noopener,noreferrer");
    close(false);
  };

  if (!popup) return null;

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-end justify-center p-4 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <button
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => close()}
        aria-label="Fermer"
      />
      <div
        className={`relative w-full max-w-sm rounded-2xl overflow-hidden bg-card border border-border shadow-2xl transition-transform duration-300 ${
          visible ? "translate-y-0" : "translate-y-6"
        }`}
      >
        <button
          onClick={() => close()}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-background/70 backdrop-blur flex items-center justify-center text-foreground"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {popup.image_url && (
          <img
            src={popup.image_url}
            alt={popup.title || "Offre du restaurant"}
            className="w-full h-40 object-cover"
            loading="lazy"
          />
        )}

        <div className="p-5 space-y-2 text-center">
          {popup.title && <h2 className="text-lg font-semibold leading-snug">{popup.title}</h2>}
          {popup.body && <p className="text-sm text-muted-foreground whitespace-pre-line">{popup.body}</p>}
          <div className="pt-2 space-y-1.5">
            {popup.cta_label && (
              <button
                onClick={handleCta}
                className="w-full py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-medium active:scale-[0.98] transition-transform"
              >
                {popup.cta_label}
              </button>
            )}
            <button
              onClick={() => close()}
              className="w-full py-2 text-xs text-muted-foreground"
            >
              Continuer vers la carte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoPopup;
