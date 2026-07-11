import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { ensureUserSetup } from "../services/userSetupService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncSession = useCallback(async (nextSession) => {
    setSession(nextSession);
    setUser(nextSession?.user || null);

    if (nextSession?.user) {
      await ensureUserSetup(nextSession.user);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      await syncSession(data.session);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      await syncSession(nextSession);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncSession]);

  const signIn = useCallback(async ({ email, password }) => {
    const result = await supabase.auth.signInWithPassword({ email, password });

    if (result.data.session?.user && !result.error) {
      await ensureUserSetup(result.data.session.user);
      setSession(result.data.session);
      setUser(result.data.session.user);
    }

    return result;
  }, []);

  const signUp = useCallback(async ({ email, password, username, fullName }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = (username || fullName || "").trim();
    const result = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          username: normalizedUsername,
        },
      },
    });

    if (result.error) {
      console.error("Signup failed", {
        message: result.error?.message,
        code: result.error?.code,
        status: result.error?.status,
        name: result.error?.name,
      });
      return result;
    }

    const nextSession = result.data.session;
    const nextUser = result.data.user;

    if (!nextSession?.user) {
      const sessionError = new Error("Signup completed without a session. Disable email confirmations in Supabase Auth settings.");
      console.error("Signup failed", {
        message: sessionError.message,
        code: "missing_session",
        status: null,
        name: sessionError.name,
      });
      return { ...result, error: sessionError };
    }

    const setupResult = await ensureUserSetup(nextSession.user, normalizedUsername);

    if (setupResult.error) {
      console.error("Signup failed", {
        message: setupResult.error?.message,
        code: setupResult.error?.code,
        status: setupResult.error?.status,
        name: setupResult.error?.name,
      });
      return { ...result, error: setupResult.error };
    }

    setSession(nextSession);
    setUser(nextUser || nextSession.user);

    return { ...result, data: { ...result.data, session: nextSession, user: nextUser || nextSession.user } };
  }, []);

  const signOut = useCallback(async () => {
    const result = await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    return result;
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [loading, session, signIn, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
