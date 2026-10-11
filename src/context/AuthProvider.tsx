"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/browserClient";
import type { Profile } from "@/types/database";

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    setProfile(data ?? null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user.id) {
      await loadProfile(session.user.id);
    }
  }, [session, loadProfile]);

  // The profile is loaded from onAuthStateChange alone: it fires
  // INITIAL_SESSION on subscribe, so the separate getSession() call that was
  // here loaded the same row a second time on every page load. Two rules
  // from Supabase's docs apply to that callback:
  // - it runs while the client holds its auth lock, and a query started
  //   inside it has to wait for that lock, so the load is deferred with
  //   setTimeout until the callback has returned;
  // - TOKEN_REFRESHED (and other events for the same user) don't change the
  //   profile, so they don't reload it.
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      const userId = newSession?.user.id ?? null;
      if (!userId) {
        loadedFor.current = null;
        setProfile(null);
        setLoading(false);
        return;
      }
      if (loadedFor.current === userId && event !== "USER_UPDATED") return;
      loadedFor.current = userId;
      setTimeout(() => {
        loadProfile(userId).finally(() => setLoading(false));
      }, 0);
    });

    return () => listener.subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    loadedFor.current = null;
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
