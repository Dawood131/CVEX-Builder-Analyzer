import { useState, useRef, useEffect } from "react";
import { FaSun, FaMoon, FaDesktop, FaCheck } from "react-icons/fa";
import { useCV } from "../../context/CVContext";
import { cn } from "../../utils/helper";

const OPTIONS = [
  { value: "light", label: "Light", Icon: FaSun },
  { value: "dark", label: "Dark", Icon: FaMoon },
  { value: "system", label: "System", Icon: FaDesktop },
];

export default function ThemeDropdown() {
  const { themeMode, setThemeMode, darkMode } = useCV();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // System selected ho to Desktop icon, warna resolved theme (Sun/Moon)
  const CurrentIcon =
    themeMode === "system" ? FaDesktop : darkMode ? FaMoon : FaSun;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer",
          "hover:bg-[var(--surface-100)] border-[var(--surface-200)] text-[var(--surface-700)]",
          open && "bg-[var(--surface-100)]",
        )}
        aria-label="Theme settings"
      >
        <CurrentIcon className="text-sm" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-[var(--surface-50)] rounded-xl border border-[var(--surface-200)] shadow-xl overflow-hidden z-[100] p-1.5">
          {OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => {
                setThemeMode(value);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[var(--surface-700)] hover:bg-[var(--surface-100)] transition-colors cursor-pointer"
            >
              <Icon className="text-xs" />
              <span className="flex-1 text-left">{label}</span>
              {themeMode === value && (
                <FaCheck className="text-[10px] text-[var(--brand-500)]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
