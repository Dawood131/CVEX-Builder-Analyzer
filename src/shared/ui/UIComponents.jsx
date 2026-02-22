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
      className: 'backdrop-blur-lg text-[var(--brand-700)]  hover:scale-105',
      style: {
        background: 'bg-[var(--brand-600)]',
        boxShadow: '0 4px 14px -3px rgba(99,102,241,0.4)',
      }
    },
    ghost: {
      className: 'bg-transparent text-[var(--surface-100)] dark:text-[var(--surface-900)] hover:bg-[var(--surface-700)] dark:hover:bg-[var(--surface-200)]',
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
function Modal({ open, onClose, title, children, maxWidth = 'max-w-xl' }) {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={cn('bg-[var(--surface-50)] dark:bg-[var(--surface-800)] rounded-2xl w-[90%] max-h-[85vh] overflow-y-auto shadow-2xl animate-scaleIn', maxWidth)}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-200)] dark:border-[var(--surface-700)]">
          <h3 className="font-bold text-lg text-[var(--surface-900)] dark:text-[var(--surface-100)]">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <i className="fas fa-times" />
          </Button>
        </div>
        <div className="px-6 py-4 text-[var(--surface-900)] dark:text-[var(--surface-100)]">{children}</div>
      </div>
    </div>,
    document.body
  );
}

// ---- Toggle Switch ----
function Toggle({ active, onChange, label }) {
  return (
    <div className="flex items-center justify-between">
      {label && <span className="text-sm font-medium text-[var(--surface-900)] dark:text-[var(--surface-100)]">{label}</span>}
      <div
        className={cn('relative w-11 h-6 rounded-full cursor-pointer transition-all flex-shrink-0', active ? 'bg-[var(--brand-500)]' : 'bg-[var(--surface-200)] dark:bg-[var(--surface-700)]')}
        onClick={() => onChange(!active)}
      >
        <div className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', active ? 'translate-x-[22px]' : 'translate-x-0.5')} />
      </div>
    </div>
  );
}

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
    'w-full px-3.5 py-2.5 border-[1.5px] rounded-[0.625rem] text-sm transition-all bg-[var(--surface-50)] dark:bg-[var(--surface-800)] text-[var(--surface-900)] dark:text-[var(--surface-100)] placeholder:text-[var(--surface-400)] focus:outline-none focus:border-[var(--brand-500)] focus:ring-[3px] focus:ring-[var(--brand-500)]/10',
    error ? 'border-red-400' : 'border-[var(--surface-200)] dark:border-[var(--surface-700)]'
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
      <label htmlFor={id} className="block text-[0.8125rem] font-semibold text-[var(--surface-500)] dark:text-[var(--surface-400)] mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {renderInput()}
      {hint && <p className="text-xs text-[var(--surface-400)] mt-1">{hint}</p>}
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

export { Button, Modal, Toggle, ToastContainer, FormField, ColorSwatch, TemplateThumbnail };
