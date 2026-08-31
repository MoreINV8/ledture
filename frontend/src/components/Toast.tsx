import { AlertTriangle, ShieldCheck, X } from "lucide-react";
import { cn } from "../utils/cn";
import type { ToastMessage } from "../types";

const VARIANT_CLASSES = {
  error: "bg-rose-950/90 border-rose-500/50 text-rose-200",
  warning: "bg-amber-950/90 border-amber-500/50 text-amber-200",
  success: "bg-emerald-950/90 border-emerald-500/50 text-emerald-200",
} as const;

const ICON_CLASSES = {
  error: "text-rose-400",
  warning: "text-amber-400",
  success: "text-emerald-400",
} as const;

const ICONS = {
  error: AlertTriangle,
  warning: AlertTriangle,
  success: ShieldCheck,
} as const;

export interface ToastProps {
  message: ToastMessage;
  onDismiss: () => void;
}

/** Fixed-position toast notification banner. */
export const Toast = ({ message, onDismiss }: ToastProps) => {
  const Icon = ICONS[message.type];
  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-bounce",
        VARIANT_CLASSES[message.type],
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0", ICON_CLASSES[message.type])} />
      <span className="text-sm font-medium">{message.text}</span>
      <button
        onClick={onDismiss}
        className="ml-2 hover:opacity-75"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
