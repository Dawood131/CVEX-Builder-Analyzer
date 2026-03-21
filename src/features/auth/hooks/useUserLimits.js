import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../context/AuthContext";

const DAILY_CV_LIMIT       = 3;
const DAILY_ANALYSIS_LIMIT = 3;

export function useUserLimits() {
  const { user } = useAuth();
  const [usage,   setUsage]   = useState({ cv_builds: 0, analyses: 0 });
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  const fetchUsage = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("daily_usage")
      .select("cv_builds, analyses")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    setUsage(data || { cv_builds: 0, analyses: 0 });
    setLoading(false);
  }, [user, today]);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  const incrementCV = useCallback(async () => {
    if (!user) return;
    const newVal = (usage.cv_builds || 0) + 1;
    const { data } = await supabase
      .from("daily_usage")
      .upsert(
        { user_id: user.id, date: today, cv_builds: newVal, analyses: usage.analyses || 0 },
        { onConflict: "user_id,date" }
      )
      .select()
      .single();
    if (data) setUsage(data);
  }, [user, today, usage]);

  const incrementAnalysis = useCallback(async () => {
    if (!user) return;
    const newVal = (usage.analyses || 0) + 1;
    const { data } = await supabase
      .from("daily_usage")
      .upsert(
        { user_id: user.id, date: today, cv_builds: usage.cv_builds || 0, analyses: newVal },
        { onConflict: "user_id,date" }
      )
      .select()
      .single();
    if (data) setUsage(data);
  }, [user, today, usage]);

  return {
    usage,
    loading,
    canBuildCV:     (usage.cv_builds    || 0) < DAILY_CV_LIMIT,
    canAnalyze:     (usage.analyses     || 0) < DAILY_ANALYSIS_LIMIT,
    remainingCV:    Math.max(0, DAILY_CV_LIMIT       - (usage.cv_builds || 0)),
    remainingAnalysis: Math.max(0, DAILY_ANALYSIS_LIMIT - (usage.analyses  || 0)),
    dailyCVLimit:       DAILY_CV_LIMIT,
    dailyAnalysisLimit: DAILY_ANALYSIS_LIMIT,
    incrementCV,
    incrementAnalysis,
    refetch: fetchUsage,
  };
}