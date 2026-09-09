import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DailyMenuItem {
  label: string;
  description?: string;
  price?: number | null;
}

export interface DailyMenu {
  id: string;
  restaurant_id: string;
  menu_date: string;
  title: string;
  caption: string;
  formula_label: string;
  formula_price: number | null;
  items: DailyMenuItem[];
  image_square: string;
  image_story: string;
  is_published: boolean;
}

const todayISO = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const useTodayDailyMenu = (restaurantId?: string | null) =>
  useQuery({
    queryKey: ["daily-menu-today", restaurantId],
    enabled: !!restaurantId,
    queryFn: async (): Promise<DailyMenu | null> => {
      const { data, error } = await supabase
        .from("daily_menus")
        .select("*")
        .eq("restaurant_id", restaurantId!)
        .eq("menu_date", todayISO())
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { ...(data as any), items: ((data as any).items ?? []) as DailyMenuItem[] };
    },
  });

export const useDailyMenus = (restaurantId?: string | null) =>
  useQuery({
    queryKey: ["daily-menus", restaurantId],
    enabled: !!restaurantId,
    queryFn: async (): Promise<DailyMenu[]> => {
      const { data, error } = await supabase
        .from("daily_menus")
        .select("*")
        .eq("restaurant_id", restaurantId!)
        .order("menu_date", { ascending: false })
        .limit(60);
      if (error) throw error;
      return ((data ?? []) as any[]).map((d) => ({ ...d, items: (d.items ?? []) as DailyMenuItem[] }));
    },
  });

export const dailyMenuToday = todayISO;
