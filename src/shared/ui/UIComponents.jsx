import React from 'react';
import ReactDOM from 'react-dom';
import { cn } from '../../utils/helper';
import { useCV } from '../../context/CVContext';

// ---- Button ----
function Button({ children, variant = 'primary', size = 'md', className = '', onClick, disabled, type = 'button', title }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-[0.625rem] font-semibold transition-all cursor-pointer border-none whitespace-nowrap active:scale-[0.97]';

  const variants = {
    primary: {
      className: 'text-white shadow-md hover:-translate-y-px',
      style: {
        background: 'linear-gradient(to bottom right, var(--brand-500), var(--brand-600))',
        boxShadow: '0 4px 14px -3px rgba(99,102,241,0.4)',
      }
    },
    secondary: {
      className: 'backdrop-blur-lg text-[var(--brand-500)]  hover:scale-105',
      style: {
        background: 'bg-[var(--brand-600)]',
        boxShadow: '0 4px 14px -3px rgba(99,102,241,0.4)',
      }
    },
    ghost: {
      className: 'bg-transparent text-[var(--surface-900)] hover:bg-[var(--surface-200)]',
    },
    danger: {
      className: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white',
    },
    white: {
      className: 'bg-white text-[var(--brand-600)] hover:bg-[var(-brand-700)] font-bold shadow-xl',
    }
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[0.8125rem]',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
    xl: 'px-8 py-4 text-[1.0625rem]',
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]?.className || ''} ${sizes[size]} ${disabled ? 'opacity-40 pointer-events-none' : ''} ${className}`}
      style={variants[variant]?.style}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

// ---- Modal ----
import { LuX } from "react-icons/lu";

function Modal({ open, onClose, title, children, maxWidth = "max-w-xl" }) {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "bg-[var(--surface-100)] rounded-2xl w-[90%] max-h-[85vh] overflow-y-auto shadow-2xl animate-scaleIn",
          maxWidth
        )}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-200)]">
          <h3 className="font-bold text-lg text-[var(--surface-900)]">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <LuX size={20} /> {/* <- Proper cross icon */}
          </Button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4 text-[var(--surface-900)]">{children}</div>
      </div>
    </div>,
    document.body
  );
}


// ---- Toggle Switch ----
function Toggle({ active, onChange, label }) {
  return (
    <div className="flex items-center justify-between">
      {label && <span className="text-sm font-medium text-[var(--surface-900)]">{label}</span>}
      <div
        className={cn('relative w-11 h-6 rounded-full cursor-pointer transition-all flex-shrink-0', active ? 'bg-[var(--brand-500)]' : 'bg-[var(--surface-200)]')}
        onClick={() => onChange(!active)}
      >
        <div className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', active ? 'translate-x-[22px]' : 'translate-x-0.5')} />
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { LuChevronDown } from "react-icons/lu";

const CustomSelect = ({ value, options, onChange, width = "w-full" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${width}`}>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 border border-[var(--surface-200)] rounded-[0.625rem] text-sm bg-[var(--surface-100)] text-[var(--surface-900)] focus:outline-none transition"
      >
        <span className="truncate">
          {options.find(o => o.value === value)?.label}
        </span>
        <LuChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-[var(--surface-200)] rounded-xl shadow-lg overflow-hidden">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer transition
                ${value === opt.value
                  ? "bg-brand-500 text-white"
                  : "hover:bg-[var(--surface-100)]"
                }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---- Toast Container ----
function ToastContainer() {
  const { toasts } = useCV();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg flex items-center gap-2 animate-slideUp',
            t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : 'bg-[var(--surface-800)]'
          )}
        >
          <i className={cn('fas', t.type === 'success' ? 'fa-check-circle' : t.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle')} />
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ---- FormField ----
function FormField({ label, type = 'text', value, onChange, placeholder, required, hint, error, half, rows }) {
  const id = React.useRef('f_' + Math.random().toString(36).substr(2, 8)).current;
  const inputCls = cn(
    'w-full px-3.5 py-2.5 border-[1px] rounded-[0.625rem] text-sm transition-all bg-[var(--surface-50)] text-[var(--surface-900)]  placeholder:text-[var(--surface-500)] focus:outline-none focus:border-[var(--brand-500)] focus:ring-[3px] focus:ring-[var(--brand-500)]/10',
    error ? 'border-red-400' : 'border-[var(--surface-400)]'
  );

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={id}
          className={cn(inputCls, 'resize-y min-h-[80px] font-[inherit]')}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows || 3}
        />
      );
    }

    if (type === 'select') {
      return (
        <select id={id} className={inputCls} value={value || ''} onChange={e => onChange(e.target.value)}>
          {placeholder && <option value="">{placeholder}</option>}
          {(rows || []).map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        id={id}
        type={type}
        className={inputCls}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  };

  return (
    <div className={half ? 'flex-1' : 'w-full'}>
      <label htmlFor={id} className="block text-[0.8125rem] font-semibold text-[var(--surface-900)] mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {renderInput()}
      {hint && <p className="text-xs text-[var(--surface-900)] mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ---- ColorSwatch ----
function ColorSwatch({ color, active, onClick, title }) {
  return (
    <div
      className={cn(
        'w-7 h-7 rounded-lg cursor-pointer border-2 transition-all hover:scale-115',
        active ? 'border-[var(--surface-800)] dark:border-white shadow-[0_0_0_2px_white,0_0_0_4px_currentColor]' : 'border-transparent'
      )}
      style={{ background: color }}
      onClick={onClick}
      title={title}
    />
  );
}

// ---- TemplateThumbnail ----
function TemplateThumbnail({ template, primaryColor }) {
  const color = primaryColor || template.colors[0];
  const isSidebar = template.layout === 'sidebar';
  const baseColor = color;

  if (isSidebar) {
    return (
      <div className="w-full h-full bg-white p-3 flex flex-row" style={{ fontSize: '4px' }}>
        <div className="w-[30%] h-full rounded-sm mr-2 flex flex-col items-center pt-4 gap-2" style={{ background: baseColor }}>
          <div className="w-6 h-6 rounded-full bg-white/30" />
          <div className="w-10 h-1 rounded bg-white/40" />
          <div className="w-8 h-0.5 rounded bg-white/30 mt-1" />
          <div className="w-8 h-0.5 rounded bg-white/30" />
          <div className="mt-2 w-10 h-1 rounded bg-white/40" />
          <div className="flex gap-0.5 mt-1 flex-wrap px-1 justify-center">
            <div className="w-4 h-1.5 rounded-sm bg-white/20" />
            <div className="w-5 h-1.5 rounded-sm bg-white/20" />
            <div className="w-4 h-1.5 rounded-sm bg-white/20" />
          </div>
        </div>
        <div className="flex-1 pt-3 flex flex-col gap-2 bg-white">
          <div className="w-16 h-1.5 rounded" style={{ background: baseColor }} />
          <div className="w-full h-0.5 bg-gray-200 rounded" />
          <div className="w-12 h-1 rounded" style={{ background: baseColor, opacity: 0.7 }} />
          <div className="space-y-0.5">
            <div className="w-full h-0.5 bg-gray-100 rounded" />
            <div className="w-11/12 h-0.5 bg-gray-100 rounded" />
            <div className="w-10/12 h-0.5 bg-gray-100 rounded" />
          </div>
          <div className="w-12 h-1 rounded mt-1" style={{ background: baseColor, opacity: 0.7 }} />
          <div className="space-y-0.5">
            <div className="w-full h-0.5 bg-gray-100 rounded" />
            <div className="w-10/12 h-0.5 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white p-3 flex flex-col" style={{ fontSize: '4px' }}>
      <div className="w-full py-3 px-3 rounded-sm mb-2 text-center" style={{ background: baseColor }}>
        <div className="w-12 h-1.5 rounded bg-white/40 mx-auto mb-1" />
        <div className="w-8 h-1 rounded bg-white/30 mx-auto" />
      </div>
      <div className="px-2 flex flex-col gap-2 flex-1">
        <div className="w-14 h-1 rounded" style={{ background: baseColor, opacity: 0.7 }} />
        <div className="space-y-0.5">
          <div className="w-full h-0.5 bg-gray-100 rounded" />
          <div className="w-11/12 h-0.5 bg-gray-100 rounded" />
          <div className="w-10/12 h-0.5 bg-gray-100 rounded" />
        </div>
        <div className="w-14 h-1 rounded mt-1" style={{ background: baseColor, opacity: 0.7 }} />
        <div className="space-y-0.5">
          <div className="w-full h-0.5 bg-gray-100 rounded" />
          <div className="w-11/12 h-0.5 bg-gray-100 rounded" />
        </div>
        <div className="w-14 h-1 rounded mt-1" style={{ background: baseColor, opacity: 0.7 }} />
        <div className="flex gap-1 flex-wrap">
          <div className="w-5 h-1.5 rounded-sm" style={{ background: baseColor, opacity: 0.15 }} />
          <div className="w-6 h-1.5 rounded-sm" style={{ background: baseColor, opacity: 0.15 }} />
          <div className="w-4 h-1.5 rounded-sm" style={{ background: baseColor, opacity: 0.15 }} />
        </div>
      </div>
    </div>
  );
}


import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { HiChevronDown, HiCheck } from "react-icons/hi";

function SmoothDropdown({ options, value, onChange, label }) {
  const selectedOption = options.find(o => o.id === value);

  return (
    <div className="w-full relative">
      {label && (
        <label className="block text-[0.8125rem] font-semibold text-[var(--surface-900)] mb-1.5">
          {label}
        </label>
      )}

      <Listbox value={value} onChange={onChange}>
        <div className="relative w-full">
          <Listbox.Button className="relative w-full cursor-pointer rounded-[0.625rem] bg-[var(--surface-100)] border-[1.5px] border-[var(--surface-200)] py-2 pl-3 pr-10 text-left text-sm font-mono text-[var(--surface-900)] focus:outline-none transition-all duration-200">
            <span className="block truncate">{selectedOption?.name}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <HiChevronDown className="h-4 w-4 text-[var(--surface-400)]" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 w-full max-h-36 overflow-y-auto rounded-md bg-[var(--surface-100)] py-1 text-sm shadow-lg ring-1 ring-[var(--surface-300)] ring-opacity-5 focus:outline-none">
              {options.map(option => (
                <Listbox.Option
                  key={option.id}
                  className={({ active }) =>
                    `cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                      active
                        ? "bg-[var(--brand-100)] text-[var(--brand-700)]"
                        : "text-[var(--surface-900)]"
                    }`
                  }
                  value={option.id}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}>
                        {option.name}
                      </span>
                      {selected && (
                        <span
                          className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                            active ? "text-[var(--brand-700)]" : "text-[var(--surface-400)]"
                          }`}
                        >
                          <HiCheck className="h-4 w-4" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}

import { HexColorPicker } from "react-colorful";
import tinycolor from "tinycolor2";
import { motion, AnimatePresence } from "framer-motion";

function AdvancedColorPicker({ color, onChange, presets = [] }) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(color);
  const wrapperRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update input when color prop changes
  useEffect(() => {
    setInputValue(color);
  }, [color]);

  const handleInputChange = (val) => {
    setInputValue(val);
    const tc = tinycolor(val);
    if (tc.isValid()) {
      onChange(tc.toHexString());
    }
  };

  return (
    <div ref={wrapperRef} className="relative inline-block flex-1">
      {/* Color Preview */}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-lg border-2 border-[var(--surface-200)] shadow-inner"
        style={{ backgroundColor: color }}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute mt-2 w-64 bg-[var(--surface-100)] border border-[var(--surface-200)] rounded-lg shadow-lg p-4 z-50"
          >
            {/* Presets */}
            {presets.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-3">
                {presets.map((c) => (
                  <button
                    key={c}
                    className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 ${c === color ? "border-[var(--brand-500)] scale-105" : "border-transparent hover:scale-110"
                      }`}
                    style={{ backgroundColor: c }}
                    onClick={() => onChange(c)}
                  />
                ))}
              </div>
            )}

            {/* Spectrum Picker */}
            <HexColorPicker color={color} onChange={onChange} />

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// components/Reveal.jsx
import useReveal from "../../hooks/useScrollReveal";

function Reveal({ children, direction = "up", delay = 0, className = "" }) {
  const { ref, isVisible } = useReveal();

  const directions = {
    up:    { from: "translateY(40px)",  to: "translateY(0)" },
    left:  { from: "translateX(-40px)", to: "translateX(0)" },
    right: { from: "translateX(40px)",  to: "translateX(0)" },
  };

  const { from, to } = directions[direction] || directions.up;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? to : from,
        transition: `opacity 0.7s ease-out ${delay}s, transform 0.7s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export { Button, Modal, Toggle, ToastContainer, FormField, ColorSwatch, TemplateThumbnail, CustomSelect, SmoothDropdown, AdvancedColorPicker, Reveal };
