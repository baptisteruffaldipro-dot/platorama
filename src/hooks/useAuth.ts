import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkRoles = useCallback(async (u: User | null) => {
    if (!u) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", u.id);

    if (error || !data) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      return;
    }

    const roles = data.map((r) => r.role);
    setIsAdmin(roles.includes("admin") || roles.includes("super_admin"));
    setIsSuperAdmin(roles.includes("super_admin"));
  }, []);

  useEffect(() => {
    let ignore = false;

    const syncSession = async (session: Session | null) => {
      if (ignore) return;

      const nextUser = session?.user ?? null;
      setUser(nextUser);
      await checkRoles(nextUser);

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
  }, [checkRoles]);

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    return supabase.auth.signOut();
  };

  return { user, isAdmin, isSuperAdmin, loading, signIn, signOut };
};
