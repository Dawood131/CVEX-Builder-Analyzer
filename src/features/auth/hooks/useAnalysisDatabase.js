import { useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../context/AuthContext";

export function useAnalysisDatabase() {
  const { user } = useAuth();

  /* ── Save analysis to DB ── */
  const saveAnalysis = useCallback(async (result) => {
    if (!user) return { error: "Not logged in" };

    const { data, error } = await supabase
      .from("analysis_reports")
      .insert({
        user_id:       user.id,
        cv_name:       result.meta?.cvName || "Untitled CV",
        overall_score: result.overallScore || 0,
        grade:         result.grade || "—",
        industry:      result.meta?.industry || "",
        report_data:   result,
      })
      .select()
      .single();

    return { data, error };
  }, [user]);

  /* ── Get all analyses ── */
  const getAnalyses = useCallback(async () => {
    if (!user) return { data: [], error: null };

    const { data, error } = await supabase
      .from("analysis_reports")
      .select("id, cv_name, overall_score, grade, industry, analyzed_at, report_data")
      .eq("user_id", user.id)
      .order("analyzed_at", { ascending: false })
      .limit(20);

    return { data: data || [], error };
  }, [user]);

  /* ── Get today's analysis count ── */
  const getTodayCount = useCallback(async () => {
    if (!user) return 0;

    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("analysis_reports")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .gte("analyzed_at", `${today}T00:00:00`)
      .lte("analyzed_at", `${today}T23:59:59`);

    return count || 0;
  }, [user]);

  /* ── Delete analysis ── */
  const deleteAnalysis = useCallback(async (id) => {
    if (!user) return { error: "Not logged in" };

    const { error } = await supabase
      .from("analysis_reports")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    return { error };
  }, [user]);

  return {
    saveAnalysis,
    getAnalyses,
    getTodayCount,
    deleteAnalysis,
  };
}