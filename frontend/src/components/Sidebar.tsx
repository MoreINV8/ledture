import { useState } from "react";
import type { FC, ReactNode } from "react";
import {
  Zap,
  Layers,
  BarChart3,
  User as UserIcon,
  Lock,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { ActiveTab, User } from "../types";
import { Button, Badge, BrandLogo, Card } from ".";

export interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: User;
  /** Whether the currently selected day is editable (within 7-day rule). */
  isEditable: boolean;
  /** Number of transactions, shown as a badge next to "Transactions". */
  transactionCount?: number;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

const NAV_ITEMS: Array<{
  tab: ActiveTab;
  label: string;
  icon: ReactNode;
  badge?: string;
}> = [
  {
    tab: "quick",
    label: "Quick Note",
    icon: <Zap className="w-4 h-4" />,
    badge: "Fast",
  },
  { tab: "list", label: "Transactions", icon: <Layers className="w-4 h-4" /> },
  { tab: "summary", label: "Summary", icon: <BarChart3 className="w-4 h-4" /> },
];

/**
 * Sidebar navigation component extracted from the original `exe.tsx`.
 *
 * Responsive behaviour:
 * - `md` and up: static sidebar pinned to the left of the app.
 * - below `md`: collapses into a top bar with a hamburger button that opens
 *   a slide-in drawer over the content.
 */
export const Sidebar: FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
  isEditable,
  transactionCount = 0,
  onLogout,
  isLoggingOut = false,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);
  const handleNavigate = (tab: ActiveTab) => {
    setActiveTab(tab);
    closeMobile();
  };

  /** Brand block (logo + name) reused by the mobile bar, drawer and desktop aside. */
  const renderBrand = (extra?: ReactNode) => (
    <div className="p-2 md:p-6 flex items-center justify-between gap-3 border-b border-slate-800/60">
      <div className="flex min-w-0 items-center gap-3 md:w-full">
        <BrandLogo className="w-10 md:w-full" />
      </div>
      {extra}
    </div>
  );

  /** Shared nav content (user badge + links + policy note). */
  const renderNavContent = (onNavigate: (tab: ActiveTab) => void) => (
    <>
      <div className="flex-1 overflow-y-auto">
        {/* User Session Info Badge */}
        <div className="p-4 mx-3 my-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {user.email}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Session Active (HttpOnly)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <Button
                key={item.tab}
                variant={isActive ? "navActive" : "nav"}
                size="lg"
                icon={item.icon}
                onClick={() => onNavigate(item.tab)}
              >
                <span>{item.label}</span>
                {item.tab === "list" ? (
                  <Badge
                    variant="neutral"
                    className="ml-auto font-mono text-xs"
                  >
                    {transactionCount}
                  </Badge>
                ) : item.badge ? (
                  <Badge variant="success" className="ml-auto font-mono">
                    {item.badge}
                  </Badge>
                ) : null}
              </Button>
            );
          })}
        </nav>
      </div>

      <div className="px-3 pb-1">
        <Button
          variant="outline"
          size="lg"
          icon={<LogOut className="w-4 h-4" />}
          onClick={onLogout}
          disabled={isLoggingOut}
          className="w-full justify-center text-slate-400 hover:text-rose-300"
        >
          {isLoggingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>

      {/* Business Rule Warning Note */}
      <Card className="p-4 m-3 bg-amber-950/20 border-amber-500/20 text-amber-300/80 text-xs shadow-none">
        <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-1">
          <Lock className="w-3.5 h-3.5" />
          <span>7-Day Policy {isEditable ? "Active" : "Locked"}</span>
        </div>
        <p className="leading-relaxed text-[11px] text-amber-300/70">
          Records older than 7 days are permanently locked for modifications.
        </p>
      </Card>
    </>
  );

  return (
    <>
      {/* ------------------------- Mobile top bar ------------------------- */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 p-4 bg-slate-900 border-b border-slate-800 shrink-0">
        {renderBrand()}
        <Button
          variant="outline"
          size="icon"
          icon={<Menu className="w-5 h-5" />}
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
        />
      </header>

      {/* ---------------------- Mobile drawer (overlay) ---------------------- */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={closeMobile}
            aria-hidden="true"
          />
          {/* Slide-in panel */}
          <aside className="absolute left-0 top-0 h-full w-64 max-w-[85%] bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col animate-fadeIn">
            {renderBrand(
              <Button
                variant="ghost"
                size="iconSm"
                icon={<X className="w-5 h-5" />}
                onClick={closeMobile}
                aria-label="Close menu"
              />,
            )}
            {renderNavContent(handleNavigate)}
          </aside>
        </div>
      )}

      {/* ------------------------ Desktop sidebar ------------------------ */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex-col shrink-0">
        {renderBrand()}
        {renderNavContent(setActiveTab)}
      </aside>
    </>
  );
};

export default Sidebar;
