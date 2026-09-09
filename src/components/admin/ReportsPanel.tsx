import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Eye,
  Star,
  Gift,
  Megaphone,
  TrendingUp,
  TrendingDown,
  Printer,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

const monthLabel = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

const range = (d: Date) => {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return { start: start.toISOString(), end: end.toISOString() };
};

interface ReportData {
  views: number;
  arViews: number;
  perDish: { id: string; name: string; views: number }[];
  reviews: { total: number; avg: number; negatives: number; redirected: number };
  loyalty: { newMembers: number; visits: number; rewards: number };
  popups: { impressions: number; clicks: number };
}

const Stat = ({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: any;
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="flex items-center gap-2 text-muted-foreground text-xs">
      <Icon className="w-4 h-4" />
      {label}
    </div>
    <p className="text-2xl font-bold mt-1">{value}</p>
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const DishList = ({
  title,
  icon: Icon,
  items,
  empty,
}: {
  title: string;
  icon: any;
  items: { id: string; name: string; views: number }[];
  empty: string;
}) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <h3 className="flex items-center gap-2 font-semibold mb-3">
      <Icon className="w-4 h-4 text-accent" />
      {title}
    </h3>
    {items.length === 0 ? (
      <p className="text-sm text-muted-foreground">{empty}</p>
    ) : (
      <ol className="space-y-1.5">
        {items.map((d, i) => (
          <li key={d.id} className="flex items-center justify-between text-sm">
            <span className="truncate">
              <span className="text-muted-foreground mr-2">{i + 1}.</span>
              {d.name}
            </span>
            <span className="tabular-nums text-muted-foreground shrink-0 ml-3">
              {d.views} vue{d.views > 1 ? "s" : ""}
            </span>
          </li>
        ))}
      </ol>
    )}
  </div>
);

const ReportsPanel = ({
  restaurantId,
  restaurantName,
}: {
  restaurantId: string | null;
  restaurantName?: string;
}) => {
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  const { start, end } = range(month);

  const { data, isLoading } = useQuery({
    queryKey: ["monthly-report", restaurantId, start],
    enabled: !!restaurantId,
    queryFn: async (): Promise<ReportData> => {
      const { data: dishes, error: dErr } = await supabase
        .from("dishes")
        .select("id, name")
        .eq("restaurant_id", restaurantId!);
      if (dErr) throw dErr;
      const dishIds = (dishes ?? []).map((d) => d.id);
      const nameById = new Map((dishes ?? []).map((d) => [d.id, d.name]));

      let events: { dish_id: string; event_type: string }[] = [];
      if (dishIds.length) {
        const { data: ev, error } = await supabase
          .from("dish_events")
          .select("dish_id, event_type")
          .in("dish_id", dishIds)
          .gte("created_at", start)
          .lt("created_at", end);
        if (error) throw error;
        events = (ev ?? []) as any;
      }

      const counts = new Map<string, number>();
      let views = 0;
      let arViews = 0;
      for (const e of events) {
        if (e.event_type === "view") {
          views++;
          counts.set(e.dish_id, (counts.get(e.dish_id) ?? 0) + 1);
        } else if (e.event_type.startsWith("ar")) {
          arViews++;
        }
      }
      const perDish = dishIds
        .map((id) => ({ id, name: nameById.get(id) ?? "—", views: counts.get(id) ?? 0 }))
        .sort((a, b) => b.views - a.views);

      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating, redirected_to_google")
        .eq("restaurant_id", restaurantId!)
        .gte("created_at", start)
        .lt("created_at", end);
      const rl = reviews ?? [];

      const { data: members } = await supabase
        .from("loyalty_members")
        .select("id")
        .eq("restaurant_id", restaurantId!)
        .gte("created_at", start)
        .lt("created_at", end);

      const { data: tx } = await supabase
        .from("loyalty_transactions")
        .select("kind")
        .eq("restaurant_id", restaurantId!)
        .gte("created_at", start)
        .lt("created_at", end);

      const { data: popups } = await supabase
        .from("popups")
        .select("id")
        .eq("restaurant_id", restaurantId!);
      let pEvents: { event_type: string }[] = [];
      const popupIds = (popups ?? []).map((p) => p.id);
      if (popupIds.length) {
        const { data: pe } = await supabase
          .from("popup_events")
          .select("event_type")
          .in("popup_id", popupIds)
          .gte("created_at", start)
          .lt("created_at", end);
        pEvents = (pe ?? []) as any;
      }

      return {
        views,
        arViews,
        perDish,
        reviews: {
          total: rl.length,
          avg: rl.length ? rl.reduce((s, r) => s + (r.rating ?? 0), 0) / rl.length : 0,
          negatives: rl.filter((r) => (r.rating ?? 0) <= 3).length,
          redirected: rl.filter((r) => r.redirected_to_google).length,
        },
        loyalty: {
          newMembers: (members ?? []).length,
          visits: (tx ?? []).filter((t) => t.kind === "earn" || t.kind === "visit").length,
          rewards: (tx ?? []).filter((t) => t.kind === "redeem").length,
        },
        popups: {
          impressions: pEvents.filter((e) => e.event_type === "impression").length,
          clicks: pEvents.filter((e) => e.event_type === "click").length,
        },
      };
    },
  });

  const seen = useMemo(() => (data?.perDish ?? []).filter((d) => d.views > 0), [data]);
  const top = seen.slice(0, 5);
  const flop = useMemo(() => (data?.perDish ?? []).slice(-5).reverse(), [data]);

  const isCurrentMonth = () => {
    const n = new Date();
    return month.getFullYear() === n.getFullYear() && month.getMonth() === n.getMonth();
  };

  if (!restaurantId) {
    return <p className="p-4 text-muted-foreground">Sélectionnez un établissement.</p>;
  }

  const ctr = data && data.popups.impressions
    ? Math.round((data.popups.clicks / data.popups.impressions) * 100)
    : 0;

  return (
    <div className="p-4 space-y-5 print:p-0" id="monthly-report">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Rapport mensuel</h2>
          <p className="text-sm text-muted-foreground">
            {restaurantName ? `${restaurantName} — ` : ""}
            {monthLabel(month)}
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            aria-label="Mois précédent"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={isCurrentMonth()}
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            aria-label="Mois suivant"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" />
            Exporter en PDF
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat icon={Eye} label="Vues de plats" value={String(data?.views ?? 0)} hint={`${data?.arViews ?? 0} ouvertures en réalité augmentée`} />
            <Stat
              icon={Star}
              label="Avis reçus"
              value={String(data?.reviews.total ?? 0)}
              hint={data?.reviews.total ? `Note moyenne ${data.reviews.avg.toFixed(1)}/5 · ${data.reviews.redirected} vers Google` : "Aucun avis ce mois"}
            />
            <Stat
              icon={Gift}
              label="Nouveaux clients fidèles"
              value={String(data?.loyalty.newMembers ?? 0)}
              hint={`${data?.loyalty.visits ?? 0} passages · ${data?.loyalty.rewards ?? 0} récompenses`}
            />
            <Stat
              icon={Megaphone}
              label="Pop-ups affichés"
              value={String(data?.popups.impressions ?? 0)}
              hint={`${data?.popups.clicks ?? 0} clics · ${ctr}%`}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <DishList
              title="Plats les plus consultés"
              icon={TrendingUp}
              items={top}
              empty="Pas encore de consultation ce mois."
            />
            <DishList
              title="Plats les moins consultés"
              icon={TrendingDown}
              items={flop}
              empty="Ajoutez des plats pour voir ce classement."
            />
          </div>

          {data?.reviews.negatives ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold mb-1">Retours à traiter</h3>
              <p className="text-sm text-muted-foreground">
                {data.reviews.negatives} avis de 3 étoiles ou moins ce mois — retrouvez le détail dans l'onglet Avis.
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default ReportsPanel;
