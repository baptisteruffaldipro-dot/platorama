import { Sparkles, ShieldAlert, Dices, Salad } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  useRestaurantFeatures,
  useSaveRestaurantFeatures,
  type RestaurantFeatures,
} from "@/hooks/useRestaurantFeatures";
import { DIET_PROFILES } from "@/lib/dietProfiles";

const SmartMenuPanel = ({ restaurantId }: { restaurantId: string | null }) => {
  const { data: features } = useRestaurantFeatures(restaurantId);
  const save = useSaveRestaurantFeatures(restaurantId);

  const toggle = (key: keyof RestaurantFeatures, value: boolean) =>
    save.mutate({ [key]: value } as Partial<RestaurantFeatures>, {
      onError: (e: any) => toast.error(e?.message ?? "Erreur"),
      onSuccess: () => toast.success("Réglage enregistré"),
    });

  if (!restaurantId) {
    return <p className="p-4 text-muted-foreground">Sélectionnez un restaurant.</p>;
  }

  const rows: {
    key: keyof RestaurantFeatures;
    icon: typeof Sparkles;
    title: string;
    desc: string;
  }[] = [
    {
      key: "diet_profiles_enabled",
      icon: Salad,
      title: "Profils alimentaires",
      desc: "Le client choisit ses préférences (végétarien, sans gluten…) et la carte s'adapte.",
    },
    {
      key: "allergens_enabled",
      icon: ShieldAlert,
      title: "Mode allergies",
      desc: "Le client masque les plats contenant les allergènes qu'il sélectionne.",
    },
    {
      key: "pick_for_me_enabled",
      icon: Dices,
      title: "Choisis pour moi",
      desc: "Tire au sort un plat parmi ceux qui correspondent aux préférences du client.",
    },
  ];

  return (
    <div className="p-4 space-y-4 max-w-2xl">
      <div className="flex items-start gap-2">
        <Sparkles className="w-5 h-5 text-accent mt-0.5" />
        <div>
          <h2 className="font-semibold">Menu intelligent</h2>
          <p className="text-xs text-muted-foreground">
            Une pastille discrète « Aide au choix » apparaît sur la carte dès qu'une des options
            ci-dessous est activée.
          </p>
        </div>
      </div>

      {rows.map((r) => (
        <div
          key={String(r.key)}
          className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-start gap-3">
            <r.icon className="w-4 h-4 text-accent mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">{r.title}</p>
              <p className="text-xs text-muted-foreground">{r.desc}</p>
            </div>
          </div>
          <Switch
            checked={!!features?.[r.key]}
            onCheckedChange={(v) => toggle(r.key, v)}
          />
        </div>
      ))}

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="font-semibold text-sm mb-2">Profils proposés au client</p>
        <div className="flex flex-wrap gap-2">
          {DIET_PROFILES.map((p) => (
            <span
              key={p.key}
              className="px-3 py-1 rounded-full bg-secondary/50 text-xs"
              title={p.hint}
            >
              {p.emoji} {p.label}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Les plats sont classés automatiquement d'après leur nom, leurs ingrédients et leurs
          allergènes. Renseignez les allergènes de chaque plat pour un filtrage plus fiable.
        </p>
      </div>
    </div>
  );
};

export default SmartMenuPanel;
