import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

export type InputVariant = 'default' | 'amount';

const VARIANT_CLASSES: Record<InputVariant, string> = {
  default:
    'px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:ring-1 focus:ring-emerald-500',
  amount:
    'py-4 pr-4 text-3xl font-black text-white placeholder-slate-700 font-mono focus:ring-1 focus:ring-emerald-500',
};

const BASE_CLASSES =
  'w-full bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500 outline-none transition-all';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  variant?: InputVariant;
  /** Optional label rendered above the input. */
  label?: ReactNode;
  /** Right-aligned helper text inside the label row. */
  hint?: ReactNode;
  /** Leading icon (lucide icon) absolutely positioned inside the field. */
  icon?: ReactNode;
  /** Prefix text (e.g. a `$` sign) absolutely positioned inside the field. */
  prefix?: ReactNode;
}

export const Input = ({
  variant = 'default',
  label,
  hint,
  icon,
  prefix,
  className,
  ...rest
}: InputProps) => (
  <div className="space-y-1.5">
    {label && (
      <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
        <span>{label}</span>
        {hint && <span className="text-[10px] text-slate-500 font-mono">{hint}</span>}
      </label>
    )}
    <div className="relative flex items-center">
      {icon && (
        <span className="absolute left-3.5 text-slate-400 pointer-events-none">{icon}</span>
      )}
      {prefix && (
        <span className="absolute left-4 text-3xl font-extrabold text-slate-500 pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        className={cn(
          BASE_CLASSES,
          VARIANT_CLASSES[variant],
          icon ? 'pl-10' : '',
          prefix ? 'pl-12' : '',
          className,
        )}
        {...rest}
      />
    </div>
  </div>
);
