import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = useCallback(async (u: User | null) => {
    if (!u) {
      setIsAdmin(false);
      return;
    }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", u.id)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  }, []);

  useEffect(() => {
    let ignore = false;

    // Get initial session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (ignore) return;
      const u = session?.user ?? null;
      setUser(u);
      await checkAdmin(u);
      if (!ignore) setLoading(false);
    });

    // Then listen for changes (won't re-fire for initial session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (ignore) return;
        const u = session?.user ?? null;
        setUser(u);
        await checkAdmin(u);
        if (!ignore) setLoading(false);
      }
    );

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    return supabase.auth.signOut();
  };

  return { user, isAdmin, loading, signIn, signOut };
};
