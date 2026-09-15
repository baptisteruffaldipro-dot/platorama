import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LoyaltyMember {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  card_code: string;
  points: number;
  visits: number;
  consent_email: boolean;
  consent_sms: boolean;
  unsubscribed_at: string | null;
  created_at: string;
}

export interface LoyaltyReward {
  id: string;
  label: string;
  description: string | null;
  points_cost: number;
}

export interface LoyaltyHistoryItem {
  id: string;
  kind: string;
  points: number;
  label: string | null;
  created_at: string;
}

export interface LoyaltySettings {
  loyalty_points_per_visit: number;
  loyalty_reward_threshold: number;
  loyalty_welcome_text: string | null;
  loyalty_program_name: string | null;
}

export interface LoyaltyPayload {
  token: string;
  member: LoyaltyMember;
  history: LoyaltyHistoryItem[];
  rewards: LoyaltyReward[];
  settings: LoyaltySettings | null;
}

const storageKey = (restaurantId: string) => `loyalty_token_${restaurantId}`;

const call = async (body: Record<string, unknown>): Promise<LoyaltyPayload> => {
  const { data, error } = await supabase.functions.invoke("loyalty", { body });
  if (error) throw error;
  if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Erreur");
  return data as LoyaltyPayload;
};

export const useLoyalty = (restaurantId?: string | null) => {
  const [data, setData] = useState<LoyaltyPayload | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!restaurantId) return;
    const token = localStorage.getItem(storageKey(restaurantId));
    if (!token) return;
    setLoading(true);
    try {
      setData(await call({ action: "me", token }));
    } catch {
      localStorage.removeItem(storageKey(restaurantId));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const join = useCallback(
    async (input: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      consent_email?: boolean;
      consent_sms?: boolean;
      lang?: string;
    }) => {
      if (!restaurantId) throw new Error("Restaurant manquant");
      setLoading(true);
      try {
        const payload = await call({ action: "join", restaurant_id: restaurantId, ...input });
        localStorage.setItem(storageKey(restaurantId), payload.token);
        setData(payload);
        return payload;
      } finally {
        setLoading(false);
      }
    },
    [restaurantId],
  );

  const updatePrefs = useCallback(
    async (prefs: { consent_email: boolean; consent_sms: boolean; unsubscribe?: boolean }) => {
      if (!restaurantId) return;
      const token = localStorage.getItem(storageKey(restaurantId));
      if (!token) return;
      setLoading(true);
      try {
        setData(await call({ action: "prefs", token, ...prefs }));
      } finally {
        setLoading(false);
      }
    },
    [restaurantId],
  );

  const forget = useCallback(() => {
    if (!restaurantId) return;
    localStorage.removeItem(storageKey(restaurantId));
    setData(null);
  }, [restaurantId]);

  return { data, loading, join, refresh, updatePrefs, forget };
};
