import { useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../context/AuthContext";

export function useCVDatabase() {
  const { user } = useAuth();

  /* ── Save or update CV in DB ── */
  const saveCV = useCallback(async (cvData, cvName) => {
    if (!user) return { error: "Not logged in" };

    // Check if CV with same name exists for this user
    const { data: existing } = await supabase
      .from("cvs")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", cvName)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from("cvs")
        .update({ cv_data: cvData, name: cvName })
        .eq("id", existing.id)
        .select()
        .single();
      return { data, error };
    } else {
      // Check limit — max 3 CVs total
      const { count } = await supabase
        .from("cvs")
        .select("id", { count: "exact" })
        .eq("user_id", user.id);

      if (count >= 3) {
        return { error: "CV limit reached. Delete an existing CV to save a new one." };
      }

      // Insert new
      const { data, error } = await supabase
        .from("cvs")
        .insert({ user_id: user.id, name: cvName, cv_data: cvData })
        .select()
        .single();
      return { data, error };
    }
  }, [user]);

  /* ── Get all user CVs ── */
  const getCVs = useCallback(async () => {
    if (!user) return { data: [], error: null };
    const { data, error } = await supabase
      .from("cvs")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    return { data: data || [], error };
  }, [user]);

  /* ── Delete CV ── */
  const deleteCV = useCallback(async (cvId) => {
    if (!user) return { error: "Not logged in" };
    const { error } = await supabase
      .from("cvs")
      .delete()
      .eq("id", cvId)
      .eq("user_id", user.id);
    return { error };
  }, [user]);

  return { saveCV, getCVs, deleteCV };
}