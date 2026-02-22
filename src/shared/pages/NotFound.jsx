// src/pages/NotFound.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--surface-50)] text-white px-6">
      <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-t from-[var(--brand-500)] to-purple-500 animate-pulse">
        404
      </h1>
      <h2 className="text-3xl font-semibold mt-4 text-[var(--surface-900)]">Page Not Found</h2>
      <p className="text-[var(--surface-900)] mt-2 text-center max-w-md">
        The page you are looking for does not exist.
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-3 bg-[var(--brand-500)] rounded-xl hover:bg-[var(--brand-600)] transition-all flex items-center gap-2 cursor-pointer"
      >
        <FaArrowLeft /> Back to Home
      </button>
    </div>
  );
}

export default NotFound;