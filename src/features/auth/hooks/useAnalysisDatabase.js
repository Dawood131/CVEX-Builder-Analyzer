import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../context/AuthContext";

export function useAnalysisDatabase() {
  const { user } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // KEY FIX: user ID track karo ref mein — not state
  // Jab user change ho, turant detect ho aur data wipe ho
  const currentUserIdRef = useRef(null);

  const fetchHistory = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("analysis_reports")
      .select("*")
      .eq("user_id", userId)
      .order("analyzed_at", { ascending: false })
      .limit(20);

    // KEY FIX: check karo k response aane tak user wahi hai
    // Agar user switch ho gaya to stale data set mat karo
    if (currentUserIdRef.current !== userId) {
      setLoading(false);
      return;
    }

    if (error) {
      console.error("[useAnalysisDatabase] fetchHistory error:", error);
    } else {
      const normalized = (data || []).map(row => ({
        ...row.report_data,
        scanId:       row.id,
        analyzedAt:   row.analyzed_at,
        overallScore: row.overall_score,
        grade:        row.grade,
        meta: {
          ...(row.report_data?.meta || {}),
          cvName:   row.cv_name,
          industry: row.industry,
        },
      }));
      setHistory(normalized);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const newUserId = user?.id || null;

    // User change detect — IMMEDIATELY wipe history
    // Ye synchronous hai — koi render gap nahi jisme purana data dikhe
    if (currentUserIdRef.current !== newUserId) {
      currentUserIdRef.current = newUserId;
      setHistory([]);  // turant clear
      setLoading(false);
    }

    if (newUserId) {
      // Naye user ka data fetch karo
      fetchHistory(newUserId);
    }
  }, [user?.id, fetchHistory]);

  /* ── Save analysis ─────────────────────────────────────────────────── */
  const saveAnalysis = useCallback(async (result) => {
    if (!user || !result) return { error: "No user or result" };

    const { data, error } = await supabase
      .from("analysis_reports")
      .insert({
        user_id:       user.id,
        cv_name:       result.meta?.cvName || "Untitled CV",
        overall_score: result.overallScore || 0,
        grade:         result.grade        || "—",
        industry:      result.meta?.industry || "general",
        report_data:   result,
        analyzed_at:   new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[useAnalysisDatabase] saveAnalysis error:", error);
      return { error: error.message };
    }

    const normalized = {
      ...data.report_data,
      scanId:       data.id,
      analyzedAt:   data.analyzed_at,
      overallScore: data.overall_score,
      grade:        data.grade,
      meta: {
        ...(data.report_data?.meta || {}),
        cvName:   data.cv_name,
        industry: data.industry,
      },
    };

    // Only add if current user still matches
    if (currentUserIdRef.current === user.id) {
      setHistory(prev => [normalized, ...prev].slice(0, 20));
    }

    return { data: normalized, error: null };
  }, [user]);

  /* ── Delete one analysis ───────────────────────────────────────────── */
  const deleteAnalysis = useCallback(async (scanId) => {
    if (!user || !scanId) return;

    const { error } = await supabase
      .from("analysis_reports")
      .delete()
      .eq("id", scanId)
      .eq("user_id", user.id);

    if (!error) {
      setHistory(prev => prev.filter(s => s.scanId !== scanId));
    } else {
      console.error("[useAnalysisDatabase] deleteAnalysis error:", error);
    }
  }, [user]);

  /* ── Clear all analyses ────────────────────────────────────────────── */
  const clearHistory = useCallback(async () => {
    if (!user) return;

    const { error } = await supabase
      .from("analysis_reports")
      .delete()
      .eq("user_id", user.id);

    if (!error) {
      setHistory([]);
    } else {
      console.error("[useAnalysisDatabase] clearHistory error:", error);
    }
  }, [user]);

  return {
    history,
    loading,
    saveAnalysis,
    fetchHistory: () => fetchHistory(user?.id),
    deleteAnalysis,
    clearHistory,
  };
}