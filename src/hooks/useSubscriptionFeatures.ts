import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = "classic" | "business" | "premium" | "none";

interface SubscriptionFeatures {
  tier: SubscriptionTier;
  maxDishes: number;
  hasStats: boolean;
  hasHeatmap: boolean;
  hasTimeSlots: boolean;
  hasStorytelling: boolean;
  hasMultiSite: boolean;
  hasAdvancedBranding: boolean;
  hasMultilingual: boolean;
}

const TIER_FEATURES: Record<SubscriptionTier, Omit<SubscriptionFeatures, "tier" | "maxDishes">> = {
  none: { hasStats: false, hasHeatmap: false, hasTimeSlots: false, hasStorytelling: false, hasMultiSite: false, hasAdvancedBranding: false, hasMultilingual: false },
  classic: { hasStats: false, hasHeatmap: false, hasTimeSlots: false, hasStorytelling: false, hasMultiSite: false, hasAdvancedBranding: false, hasMultilingual: false },
  business: { hasStats: true, hasHeatmap: true, hasTimeSlots: true, hasStorytelling: false, hasMultiSite: false, hasAdvancedBranding: false, hasMultilingual: false },
  premium: { hasStats: true, hasHeatmap: true, hasTimeSlots: true, hasStorytelling: true, hasMultiSite: true, hasAdvancedBranding: true, hasMultilingual: true },
};

export function useSubscriptionFeatures(restaurantId?: string | null): SubscriptionFeatures {
  const { data } = useQuery({
    queryKey: ["subscription-features", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return { tier: "none" as SubscriptionTier, maxDishes: 0 };

      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("subscription_id")
        .eq("id", restaurantId)
        .single();

      if (!restaurant?.subscription_id) return { tier: "none" as SubscriptionTier, maxDishes: 0 };

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("slug, max_dishes")
        .eq("id", restaurant.subscription_id)
        .single();

      if (!sub) return { tier: "none" as SubscriptionTier, maxDishes: 0 };

      return {
        tier: sub.slug as SubscriptionTier,
        maxDishes: sub.max_dishes,
      };
    },
    enabled: !!restaurantId,
  });

  const tier = data?.tier ?? "none";
  const maxDishes = data?.maxDishes ?? 0;

  return {
    tier,
    maxDishes,
    ...TIER_FEATURES[tier] ?? TIER_FEATURES.none,
  };
}
