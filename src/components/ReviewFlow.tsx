import { useEffect, useState } from "react";
import { Star, MessageCircleHeart, X, Send, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { RestaurantFeatures } from "@/hooks/useRestaurantFeatures";

interface Props {
  restaurantId: string;
  features: RestaurantFeatures;
  lang?: string;
}

const DELAY_MS = 40000;

const ReviewFlow = ({ restaurantId, features, lang }: Props) => {
  const storageKey = `review_prompt_${restaurantId}`;
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [contact, setContact] = useState("");
  const [firstName, setFirstName] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const alreadyDone = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return false;
      // One prompt per 24h
      return Date.now() - Number(raw) < 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!features.reviews_enabled || alreadyDone()) return;
    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [features.reviews_enabled, restaurantId]);

  const remember = () => {
    try {
      localStorage.setItem(storageKey, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  const threshold = features.reviews_threshold ?? 4;
  const isPositive = rating !== null && rating >= threshold;
  const googleUrl = features.google_review_url?.trim();

  const saveReview = async (redirected: boolean) => {
    if (rating === null) return null;
    const isEmail = contact.includes("@");
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        restaurant_id: restaurantId,
        rating,
        comment: comment.trim() || null,
        first_name: firstName.trim() || null,
        email: isEmail ? contact.trim() : null,
        phone: !isEmail && contact.trim() ? contact.trim() : null,
        lang: lang ?? null,
        redirected_to_google: redirected,
      })
      .select("id")
      .maybeSingle();
    if (error) throw error;
    return data;
  };

  const handleSelect = (value: number) => {
    setRating(value);
  };

  const handleGoogle = async () => {
    remember();
    // Ouvrir d'abord pour rester dans le geste utilisateur (anti popup-blocker)
    if (googleUrl) window.open(googleUrl, "_blank", "noopener");
    try {
      await saveReview(true);
    } catch {
      /* silencieux : l'expérience client ne doit pas casser */
    }
    setOpen(false);
    setVisible(false);
  };

  const handleSkipPositive = async () => {
    remember();
    try {
      await saveReview(false);
    } catch {
      /* silencieux */
    }
    setOpen(false);
    setVisible(false);
  };

  const handleSubmitPrivate = async () => {
    if (rating === null) return;
    setSending(true);
    try {
      await saveReview(false);
      remember();
      setDone(true);
    } catch (e: any) {
      toast.error("Impossible d'envoyer votre retour");
    } finally {
      setSending(false);
    }
  };

  const dismiss = () => {
    remember();
    setVisible(false);
  };

  if (!features.reviews_enabled || !visible) return null;

  return (
    <>
      {/* Invitation discrète */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-1 rounded-full border border-border bg-card/90 backdrop-blur-md pl-4 pr-1 py-1.5 shadow-lg">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-xs font-medium text-foreground"
          >
            <MessageCircleHeart className="w-4 h-4 text-accent" />
            {features.reviews_prompt?.trim() || "Votre expérience vous a plu ?"}
          </button>
          <button
            onClick={dismiss}
            aria-label="Masquer"
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o && done) setVisible(false);
        }}
      >
        <DialogContent className="max-w-xs sm:max-w-sm rounded-2xl">
          {done ? (
            <div className="text-center space-y-3 py-4">
              <MessageCircleHeart className="w-10 h-10 mx-auto text-accent" />
              <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
                Merci pour votre retour
              </h2>
              <p className="text-sm text-muted-foreground">
                Il est transmis directement à l'équipe du restaurant.
              </p>
              <Button className="w-full" onClick={() => setOpen(false)}>
                Fermer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
                  {features.reviews_prompt?.trim() || "Votre expérience vous a plu ?"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Votre avis nous aide à nous améliorer.
                </p>
              </div>

              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleSelect(value)}
                    aria-label={`${value} sur 5`}
                    className="p-1 active:scale-90 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        rating !== null && value <= rating
                          ? "fill-accent text-accent"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {rating !== null && isPositive && (
                <div className="space-y-3 text-center">
                  <p className="text-sm text-foreground">
                    Merci ! Partagez-le en un clic sur Google, cela compte beaucoup pour nous.
                  </p>
                  <Button className="w-full gap-2" onClick={handleGoogle} disabled={!googleUrl}>
                    <ExternalLink className="w-4 h-4" />
                    Laisser un avis Google
                  </Button>
                  {!googleUrl && (
                    <p className="text-xs text-muted-foreground">
                      Le lien Google n'est pas encore renseigné.
                    </p>
                  )}
                  <button
                    className="text-xs text-muted-foreground underline"
                    onClick={() => {
                      remember();
                      setOpen(false);
                      setVisible(false);
                    }}
                  >
                    Plus tard
                  </button>
                </div>
              )}

              {rating !== null && !isPositive && (
                <div className="space-y-3">
                  <p className="text-sm text-foreground text-center">
                    Dites-nous ce qui n'a pas été à la hauteur. Ce message reste privé.
                  </p>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 1000))}
                    placeholder="Votre retour…"
                    rows={4}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value.slice(0, 60))}
                      placeholder="Prénom (facultatif)"
                    />
                    <Input
                      value={contact}
                      onChange={(e) => setContact(e.target.value.slice(0, 120))}
                      placeholder="Email ou tél. (facultatif)"
                    />
                  </div>
                  <Button
                    className="w-full gap-2"
                    onClick={handleSubmitPrivate}
                    disabled={sending || !comment.trim()}
                  >
                    <Send className="w-4 h-4" />
                    {sending ? "Envoi…" : "Envoyer au restaurant"}
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center">
                    Vos coordonnées ne servent qu'à répondre à ce message.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReviewFlow;
