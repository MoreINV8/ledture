import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export type ButtonVariant =
  | "primary"
  | "income"
  | "expense"
  | "outline"
  | "activeOutline"
  | "ghost"
  | "subtle"
  | "danger"
  | "nav"
  | "navActive";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon" | "iconSm";

/**
 * Tailwind class maps — single source of truth for button styling so the
 * rest of the app never repeats these strings.
 */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "w-full justify-center gap-2 font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-[0.99]",
  income:
    "justify-center gap-2 font-bold bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400",
  expense:
    "justify-center gap-2 font-bold bg-rose-500 text-white shadow-lg shadow-rose-500/25 hover:bg-rose-400",
  outline:
    "gap-2 font-bold bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800",
  activeOutline:
    "gap-2 font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  ghost: "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40",
  subtle:
    "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50",
  danger:
    "gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30",
  nav: "w-full gap-3 font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40",
  navActive:
    "w-full gap-3 font-semibold bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: "px-2 py-1 text-[10px] rounded-full",
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-xs rounded-xl",
  lg: "px-4 py-3 text-sm rounded-xl",
  icon: "p-2.5 rounded-xl",
  iconSm: "p-1.5 rounded-lg",
};

const BASE_CLASSES =
  "inline-flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** When omitted, no sizing classes are applied. */
  size?: ButtonSize;
  /** Leading icon element (usually a lucide-react icon). */
  icon?: ReactNode;
}

export const Button = ({
  variant = "ghost",
  size,
  icon,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={cn(
      BASE_CLASSES,
      VARIANT_CLASSES[variant],
      size && SIZE_CLASSES[size],
      className,
    )}
    {...rest}
  >
    {icon}
    {children}
  </button>
);
