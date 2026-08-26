import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface LabelProps {
  htmlFor?: string;
  /** Appends a red `*` after the label text. */
  required?: boolean;
  /** Right-aligned helper text (e.g. "Max 7 days in past"). */
  hint?: ReactNode;
  /** Extra classes for the hint text (defaults to slate-500 mono). */
  hintClassName?: string;
  className?: string;
  children: ReactNode;
}

/** Field label with optional required marker and right-side hint. */
export const Label = ({
  htmlFor,
  required,
  hint,
  hintClassName,
  className,
  children,
}: LabelProps) => (
  <label
    htmlFor={htmlFor}
    className={cn(
      'text-xs font-medium text-slate-400 flex items-center justify-between',
      className,
    )}
  >
    <span>
      {children}
      {required && <span className="text-rose-400"> *</span>}
    </span>
    {hint && (
      <span className={cn('text-[10px] text-slate-500 font-mono', hintClassName)}>{hint}</span>
    )}
  </label>
);
