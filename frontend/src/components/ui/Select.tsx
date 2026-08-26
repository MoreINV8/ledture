import type { ReactNode, SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Optional label rendered above the select. */
  label?: ReactNode;
  /** Right-aligned helper text inside the label row. */
  hint?: ReactNode;
}

const BASE_CLASSES =
  'w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 outline-none';

export const Select = ({ label, hint, className, children, ...rest }: SelectProps) => (
  <div className="space-y-1.5">
    {label && (
      <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
        <span>{label}</span>
        {hint && <span className="text-[10px] text-slate-500 font-mono">{hint}</span>}
      </label>
    )}
    <select className={cn(BASE_CLASSES, className)} {...rest}>
      {children}
    </select>
  </div>
);
