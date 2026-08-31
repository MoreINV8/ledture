import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "neutral"
  | "income"
  | "expense";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  error: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  neutral: "bg-slate-800 text-slate-400 border border-slate-700",
  income: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  expense: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Optional leading icon (lucide icon). */
  icon?: ReactNode;
  className?: string;
}

export const Badge = ({
  variant = "neutral",
  icon,
  className,
  children,
  ...rest
}: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold",
      VARIANT_CLASSES[variant],
      className,
    )}
    {...rest}
  >
    {icon}
    {children}
  </span>
);
