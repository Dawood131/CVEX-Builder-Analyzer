import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser]                     = useState(null);
  const [profile, setProfile]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [authError, setAuthError]           = useState(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const fetchProfile = useCallback(async (uid) => {
    const { data } = await supabase
      .from("profiles").select("*").eq("id", uid).single();
    if (data) setProfile(data);
  }, []);

  useEffect(() => {
    try {
      const bc = new BroadcastChannel("cvex_auth");
      bc.onmessage = (e) => {
        if (e.data?.type === "RECOVERY_STARTED") {
          setUser(null);
          setProfile(null);
        }
      };
      return () => bc.close();
    } catch {}
  }, []);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const isRecoveryLink = hash.get("type") === "recovery";

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isRecoveryLink) {
        setLoading(false);
        return;
      }
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!event) return;

        if (event === "PASSWORD_RECOVERY") {
          setIsRecoveryMode(true);
          setUser(session?.user ?? null);
          if (session?.user) fetchProfile(session.user.id);
          try {
            const bc = new BroadcastChannel("cvex_auth");
            bc.postMessage({ type: "RECOVERY_STARTED" });
            bc.close();
          } catch {}
          return;
        }

        if (event === "USER_UPDATED") {
          setIsRecoveryMode(false);
          setUser(session?.user ?? null);
          if (session?.user) fetchProfile(session.user.id);
          return;
        }

        if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setIsRecoveryMode(false);
          return;
        }

        if (event === "SIGNED_IN") {
          if (isRecoveryLink) return; 
          setUser(session?.user ?? null);
          if (session?.user) fetchProfile(session.user.id);
          return;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async ({ email, password, fullName }) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setAuthError(error.message);
    return { data, error };
  };

  const signIn = async ({ email, password }) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    return { data, error };
  };

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

  const forgotPassword = async (email) => {
    setAuthError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) setAuthError(error.message);
    return { error };
  };

  const resetPassword = async (newPassword) => {
    setAuthError(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setAuthError(error.message);
    return { error };
  };

  const signOut = async () => {
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise(resolve => setTimeout(resolve, 3000))
      ]);
    } catch {}
    setUser(null);
    setProfile(null);
    setIsRecoveryMode(false);
  };

  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from("profiles").update(updates).eq("id", user.id).select().single();
    if (data) setProfile(data);
    return { data, error };
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, authError, isRecoveryMode,
      isVerified: !!user?.email_confirmed_at,
      signUp, signIn, signInWithGoogle,
      forgotPassword, resetPassword, signOut, updateProfile,
      clearError: () => setAuthError(null),
    }}>
      {children}
    </AuthContext.Provider>
  );
}