import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../context/AuthContext";

export function useCVDatabase() {
  const { user } = useAuth();

  const [savedCVs, setSavedCVs] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentUserIdRef = useRef(null);
  const suppressAutosaveRef = useRef(false);
  const autosaveTimerRef = useRef(null);

  const fetchAllVersions = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("cvs")
      .select("id, name, cv_data, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(30);

    if (currentUserIdRef.current !== userId) {
      setLoading(false);
      return;
    }

    if (error) {
      console.error("[useCVDatabase] fetchAllVersions error:", error);
    } else {
      const normalized = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        data: row.cv_data,
        savedAt: row.updated_at || row.created_at,
        layout: row.cv_data?.design?.layout || "single",
      }));
      setSavedCVs(normalized);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const newUserId = user?.id || null;

    if (currentUserIdRef.current !== newUserId) {
      currentUserIdRef.current = newUserId;
      setSavedCVs([]);
      setLoading(false);
      suppressAutosaveRef.current = false;

      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    }

    if (newUserId) {
      fetchAllVersions(newUserId);
    }
  }, [user?.id, fetchAllVersions]);

  /* ── Fetch latest CV ───────────────────────────────────────────────── */
  const fetchLatestCV = useCallback(async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("cvs")
      .select("cv_data, name")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) { console.error("[useCVDatabase] fetchLatestCV error:", error); return null; }
    return data ? { cvData: data.cv_data, name: data.name } : null;
  }, [user]);

  /* ── Save / insert new CV version ─────────────────────────────────── */
  const saveCV = useCallback(async (cvData, name = "Untitled CV") => {
    if (!user) return { error: "Not logged in" };

    suppressAutosaveRef.current = false;

    const { data, error } = await supabase
      .from("cvs")
      .insert({
        user_id: user.id,
        name: name || "Untitled CV",
        cv_data: cvData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, name, cv_data, updated_at")
      .single();

    if (error) {
      console.error("[useCVDatabase] saveCV error:", error);
      return { error: error.message };
    }

    const normalized = {
      id: data.id,
      name: data.name,
      data: data.cv_data,
      savedAt: data.updated_at,
      layout: data.cv_data?.design?.layout || "single",
    };

    if (currentUserIdRef.current === user.id) {
      setSavedCVs(prev => [normalized, ...prev].slice(0, 30));
      fetchAllVersions(user.id);
    }
    return { data: normalized, error: null };
  }, [user]);

  /* ── Autosave ──────────────────────────────────────────────────────── */
  const autosave = useCallback((cvData, name = "Untitled CV", isNewCV = false) => {
    if (!user) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(async () => {
      if (suppressAutosaveRef.current) return;
      if (currentUserIdRef.current !== user.id) return;

      if (isNewCV) return;

      const { data: latest } = await supabase
        .from("cvs")
        .select("id")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latest?.id && currentUserIdRef.current === user.id) {
        const { error } = await supabase
          .from("cvs")
          .update({ cv_data: cvData, name, updated_at: new Date().toISOString() })
          .eq("id", latest.id)
          .eq("user_id", user.id);

        if (!error) {
          setSavedCVs(prev =>
            prev.map(cv => cv.id === latest.id
              ? { ...cv, data: cvData, name, savedAt: new Date().toISOString() }
              : cv
            )
          );
        }
      }
    }, 2000);
  }, [user]);

  /* ── Load a specific version ───────────────────────────────────────── */
  const loadVersion = useCallback(async (id) => {
    const found = savedCVs.find(cv => cv.id === id);
    if (found) return found.data;

    const { data, error } = await supabase
      .from("cvs")
      .select("cv_data")
      .eq("id", id)
      .eq("user_id", user?.id)
      .maybeSingle();

    if (error || !data) return null;
    return data.cv_data;
  }, [savedCVs, user]);

  /* ── Delete one version ────────────────────────────────────────────── */
  const deleteVersion = useCallback(async (id) => {
    if (!user || !id) return;

    const { error } = await supabase
      .from("cvs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (!error) {
      setSavedCVs(prev => {
        const next = prev.filter(cv => cv.id !== id);
        if (next.length === 0) suppressAutosaveRef.current = true;
        return next;
      });
    } else {
      console.error("[useCVDatabase] deleteVersion error:", error);
    }
  }, [user]);

  /* ── Clear all versions ────────────────────────────────────────────── */
  const clearAllCVs = useCallback(async () => {
    if (!user) return;

    suppressAutosaveRef.current = true;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    const { error } = await supabase
      .from("cvs")
      .delete()
      .eq("user_id", user.id);

    if (!error) {
      setSavedCVs([]);
      setTimeout(() => { suppressAutosaveRef.current = false; }, 3000);
    } else {
      console.error("[useCVDatabase] clearAllCVs error:", error);
      suppressAutosaveRef.current = false;
    }
  }, [user]);

  return {
    savedCVs,
    loading,
    saveCV,
    autosave,
    fetchLatestCV,
    fetchAllVersions: () => fetchAllVersions(user?.id),
    loadVersion,
    deleteVersion,
    clearAllCVs,
  };
}