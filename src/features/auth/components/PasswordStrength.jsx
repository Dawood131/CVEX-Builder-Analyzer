// src/features/auth/components/PasswordStrength.jsx
import React, { useMemo } from "react";
import { cn } from "../../../utils/helper";

function getStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8)              score++;
  if (password.length >= 12)             score++;
  if (/[A-Z]/.test(password))            score++;
  if (/[0-9]/.test(password))            score++;
  if (/[^A-Za-z0-9]/.test(password))     score++;

  if (score <= 1) return { score, label: "Very weak",   color: "bg-red-500"     };
  if (score === 2) return { score, label: "Weak",        color: "bg-orange-500"  };
  if (score === 3) return { score, label: "Fair",        color: "bg-yellow-500"  };
  if (score === 4) return { score, label: "Strong",      color: "bg-blue-500"    };
  return               { score, label: "Very strong",  color: "bg-emerald-500"  };
}

export default function PasswordStrength({ password }) {
  const { score, label, color } = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={cn(
            "h-1 flex-1 rounded-full transition-all duration-300",
            i < score ? color : "bg-[var(--surface-200)]"
          )} />
        ))}
      </div>
      <p className={cn(
        "text-[10px] font-semibold",
        score <= 1 ? "text-red-600"
        : score === 2 ? "text-orange-600"
        : score === 3 ? "text-yellow-600"
        : score === 4 ? "text-blue-600"
        : "text-emerald-600"
      )}>
        {label}
      </p>
    </div>
  );
}