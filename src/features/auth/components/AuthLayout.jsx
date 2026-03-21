// src/features/auth/components/AuthLayout.jsx
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "../../../utils/helper";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-100)]">

      {/* Navbar */}
      <header className="h-14 flex items-center px-6 border-b border-[var(--surface-200)] bg-[var(--surface-50)]">
        <Link to="/">
          <div className="w-12 h-12 rounded-full overflow-hidden md:ml-12">
            <img src="/CVEX Logo Design.png" alt="CVEX" className="w-full h-full object-cover" />
          </div>
        </Link>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[var(--surface-50)] rounded-2xl border border-[var(--surface-200)] shadow-sm overflow-hidden">

          {/* Header */}
          <div className="px-7 pt-8 pb-6 border-b border-[var(--surface-100)]">
            <h1 className="text-[22px] font-bold text-[var(--surface-900)]">{title}</h1>
            {subtitle && (
              <p className="text-sm text-[var(--surface-500)] mt-1.5">{subtitle}</p>
            )}
          </div>

          {/* Content */}
          <div className="px-7 py-6">
            {children}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 flex items-center justify-center">
        <p className="text-[11px] text-[var(--surface-400)]">
          © {new Date().getFullYear()} CVEX. All rights reserved.
        </p>
      </footer>

    </div>
  );
}