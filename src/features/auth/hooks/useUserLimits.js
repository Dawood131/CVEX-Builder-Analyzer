import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../../lib/supabaseClient"; 
import { useAuth } from "../../../context/AuthContext";

/* ── Config ────────────────────────────────────────────────────────────── */
const DAILY_CV_LIMIT       = 3;
const DAILY_ANALYSIS_LIMIT = 3;
const WINDOW_HOURS         = 24;

function getTimeUntilReset(windowStart) {
  if (!windowStart) return null;
  const resetAt = new Date(windowStart).getTime() + WINDOW_HOURS * 60 * 60 * 1000;
  const diffMs  = resetAt - Date.now();
  if (diffMs <= 0) return null;

  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function isWindowExpired(windowStart) {
  if (!windowStart) return true;
  const diffMs = Date.now() - new Date(windowStart).getTime();
  return diffMs >= WINDOW_HOURS * 60 * 60 * 1000;
}

/* ══════════════════════════════════════════════════════════════════════════
   HOOK
══════════════════════════════════════════════════════════════════════════ */
export function useUserLimits() {
  const { user } = useAuth();

  const [usage, setUsage]       = useState({ cv_builds: 0, analyses: 0 });
  const [windows, setWindows]   = useState({ cv: null, analysis: null });
  const [loading, setLoading]   = useState(true);
  const fetchedRef              = useRef(false);

  /* ── Fetch usage from Supabase ─────────────────────────────────────── */
  const fetchUsage = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("user_usage")
      .select("cv_builds, analyses, cv_window_start, analysis_window_start")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) { console.error("[useUserLimits] fetch error:", error); setLoading(false); return; }

    if (!data) {
      // Pehli baar — row create karo
      const { data: inserted } = await supabase
        .from("user_usage")
        .insert({ user_id: user.id, cv_builds: 0, analyses: 0 })
        .select()
        .single();

      if (inserted) {
        setUsage({ cv_builds: 0, analyses: 0 });
        setWindows({ cv: null, analysis: null });
      }
    } else {
      const cvExpired  = isWindowExpired(data.cv_window_start);
      const anlExpired = isWindowExpired(data.analysis_window_start);

      let updates = {};
      if (cvExpired  && data.cv_builds  > 0) updates = { ...updates, cv_builds: 0, cv_window_start: null };
      if (anlExpired && data.analyses   > 0) updates = { ...updates, analyses: 0, analysis_window_start: null };

      if (Object.keys(updates).length > 0) {
        await supabase.from("user_usage").update(updates).eq("user_id", user.id);
        setUsage({
          cv_builds: cvExpired  ? 0 : data.cv_builds,
          analyses:  anlExpired ? 0 : data.analyses,
        });
        setWindows({
          cv:       cvExpired  ? null : data.cv_window_start,
          analysis: anlExpired ? null : data.analysis_window_start,
        });
      } else {
        setUsage({ cv_builds: data.cv_builds, analyses: data.analyses });
        setWindows({ cv: data.cv_window_start, analysis: data.analysis_window_start });
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchUsage();
  }, [user, fetchUsage]);

  /* ── Increment CV build ────────────────────────────────────────────── */
  const incrementCV = useCallback(async () => {
    if (!user) return;
    const now = new Date().toISOString();
    const newCount = (usage.cv_builds || 0) + 1;
    const windowStart = windows.cv || now;

    const { error } = await supabase
      .from("user_usage")
      .upsert({
        user_id:         user.id,
        cv_builds:       newCount,
        cv_window_start: windowStart,
      }, { onConflict: "user_id" });

    if (!error) {
      setUsage(prev => ({ ...prev, cv_builds: newCount }));
      setWindows(prev => ({ ...prev, cv: windowStart }));
    }
  }, [user, usage.cv_builds, windows.cv]);

  /* ── Increment analysis ────────────────────────────────────────────── */
  const incrementAnalysis = useCallback(async () => {
    if (!user) return;
    const now = new Date().toISOString();
    const newCount = (usage.analyses || 0) + 1;
    const windowStart = windows.analysis || now;

    const { error } = await supabase
      .from("user_usage")
      .upsert({
        user_id:               user.id,
        analyses:              newCount,
        analysis_window_start: windowStart,
      }, { onConflict: "user_id" });

    if (!error) {
      setUsage(prev => ({ ...prev, analyses: newCount }));
      setWindows(prev => ({ ...prev, analysis: windowStart }));
    }
  }, [user, usage.analyses, windows.analysis]);

  /* ── Reset time getters ────────────────────────────────────────────── */
  const getCVResetTime       = useCallback(() => getTimeUntilReset(windows.cv),       [windows.cv]);
  const getAnalysisResetTime = useCallback(() => getTimeUntilReset(windows.analysis), [windows.analysis]);

  /* ── Derived values ────────────────────────────────────────────────── */
  const cvBuildsUsed    = usage.cv_builds  || 0;
  const analysesUsed    = usage.analyses   || 0;
  const canBuildCV      = cvBuildsUsed  < DAILY_CV_LIMIT;
  const canAnalyze      = analysesUsed  < DAILY_ANALYSIS_LIMIT;
  const remainingCV     = Math.max(0, DAILY_CV_LIMIT       - cvBuildsUsed);
  const remainingAnalysis = Math.max(0, DAILY_ANALYSIS_LIMIT - analysesUsed);

  return {
    /* state */
    usage,
    loading,
    /* CV limits */
    canBuildCV,
    remainingCV,
    dailyCVLimit:       DAILY_CV_LIMIT,
    getCVResetTime,
    incrementCV,
    /* Analysis limits */
    canAnalyze,
    remainingAnalysis,
    dailyAnalysisLimit: DAILY_ANALYSIS_LIMIT,
    getAnalysisResetTime,
    incrementAnalysis,
    /* refresh */
    refetch: fetchUsage,
  };
}