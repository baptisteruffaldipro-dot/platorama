import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = useCallback(async (u: User | null) => {
    if (!u) {
      setIsAdmin(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", u.id)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!error && !!data);
  }, []);

  useEffect(() => {
    let ignore = false;

    const syncSession = async (session: Session | null) => {
      if (ignore) return;

      const nextUser = session?.user ?? null;
      setUser(nextUser);
      await checkAdmin(nextUser);

      if (!ignore) {
        setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session);
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      void syncSession(session);
    });

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
