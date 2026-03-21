import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/", { replace: true });
      }
    });

    // Fallback
    setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/", { replace: true });
      } else {
        navigate("/auth/login", { replace: true });
      }
    }, 2000);
  }, [navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-[var(--surface-50)]">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin w-8 h-8 text-[var(--brand-500)]" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-sm text-[var(--surface-500)] font-medium">Signing you in…</p>
      </div>
    </div>
  );
}