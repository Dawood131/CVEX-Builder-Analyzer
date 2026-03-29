import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../context/AuthContext";

const DAILY_CV_LIMIT       = 3;
const DAILY_ANALYSIS_LIMIT = 3;
const WINDOW_MS            = 24 * 60 * 60 * 1000;

export function useUserLimits() {
  const { user } = useAuth();
  const [usage, setUsage] = useState({
    cv_builds: 0, analyses: 0,
    cv_window_start: null, analysis_window_start: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("user_usage")
      .select("cv_builds, analyses, cv_window_start, analysis_window_start")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!data) {
      setUsage({ cv_builds: 0, analyses: 0, cv_window_start: null, analysis_window_start: null });
    } else {
      const now = Date.now();
      const cvExpired       = !data.cv_window_start       || (now - new Date(data.cv_window_start).getTime())       >= WINDOW_MS;
      const analysisExpired = !data.analysis_window_start || (now - new Date(data.analysis_window_start).getTime()) >= WINDOW_MS;

      setUsage({
        cv_builds:            cvExpired       ? 0 : data.cv_builds,
        analyses:             analysisExpired ? 0 : data.analyses,
        cv_window_start:      cvExpired       ? null : data.cv_window_start,
        analysis_window_start: analysisExpired ? null : data.analysis_window_start,
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  const incrementCV = useCallback(async () => {
    if (!user) return;
    const { data: current } = await supabase
      .from("user_usage")
      .select("cv_builds, analyses, cv_window_start, analysis_window_start")
      .eq("user_id", user.id)
      .maybeSingle();

    const now = new Date().toISOString();
    const expired = !current?.cv_window_start
      || (Date.now() - new Date(current.cv_window_start).getTime()) >= WINDOW_MS;

    const newBuilds      = expired ? 1 : (current.cv_builds || 0) + 1;
    const newWindowStart = expired ? now : current.cv_window_start;

    const { data } = await supabase
      .from("user_usage")
      .upsert({
        user_id:               user.id,
        cv_builds:             newBuilds,
        analyses:              current?.analyses || 0,
        cv_window_start:       newWindowStart,
        analysis_window_start: current?.analysis_window_start || null,
      }, { onConflict: "user_id" })
      .select().single();

    if (data) setUsage({
      cv_builds:            newBuilds,
      analyses:             data.analyses,
      cv_window_start:      newWindowStart,
      analysis_window_start: data.analysis_window_start,
    });
  }, [user]);

  const incrementAnalysis = useCallback(async () => {
    if (!user) return;
    const { data: current } = await supabase
      .from("user_usage")
      .select("cv_builds, analyses, cv_window_start, analysis_window_start")
      .eq("user_id", user.id)
      .maybeSingle();

    const now = new Date().toISOString();
    const expired = !current?.analysis_window_start
      || (Date.now() - new Date(current.analysis_window_start).getTime()) >= WINDOW_MS;

    const newAnalyses    = expired ? 1 : (current.analyses || 0) + 1;
    const newWindowStart = expired ? now : current.analysis_window_start;

    const { data } = await supabase
      .from("user_usage")
      .upsert({
        user_id:               user.id,
        cv_builds:             current?.cv_builds || 0,
        analyses:              newAnalyses,
        cv_window_start:       current?.cv_window_start || null,
        analysis_window_start: newWindowStart,
      }, { onConflict: "user_id" })
      .select().single();

    if (data) setUsage({
      cv_builds:            data.cv_builds,
      analyses:             newAnalyses,
      cv_window_start:      data.cv_window_start,
      analysis_window_start: newWindowStart,
    });
  }, [user]);

  // Reset time helpers
  const getCVResetTime = useCallback(() => {
    if (!usage.cv_window_start) return null;
    const diffMs = (new Date(usage.cv_window_start).getTime() + WINDOW_MS) - Date.now();
    if (diffMs <= 0) return null;
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  }, [usage.cv_window_start]);

  const getAnalysisResetTime = useCallback(() => {
    if (!usage.analysis_window_start) return null;
    const diffMs = (new Date(usage.analysis_window_start).getTime() + WINDOW_MS) - Date.now();
    if (diffMs <= 0) return null;
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  }, [usage.analysis_window_start]);

  return {
    usage, loading,
    canBuildCV:        (usage.cv_builds || 0) < DAILY_CV_LIMIT,
    canAnalyze:        (usage.analyses  || 0) < DAILY_ANALYSIS_LIMIT,
    remainingCV:       Math.max(0, DAILY_CV_LIMIT       - (usage.cv_builds || 0)),
    remainingAnalysis: Math.max(0, DAILY_ANALYSIS_LIMIT - (usage.analyses  || 0)),
    dailyCVLimit:       DAILY_CV_LIMIT,
    dailyAnalysisLimit: DAILY_ANALYSIS_LIMIT,
    incrementCV, incrementAnalysis,
    getCVResetTime, getAnalysisResetTime,
    refetch: fetchUsage,
  };
}