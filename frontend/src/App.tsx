import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { INITIAL_CATEGORIES } from "./constants";
import { authService, categoryService, transactionService } from "./service";
import type { ActiveTab, Category, Transaction, User } from "./types";
import { formatDateString } from "./utils";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import QuickNotePage from "./pages/QuickNotePage";
import SignupPage from "./pages/SignupPage";
import SummaryPage from "./pages/SummaryPage";
import TransactionListPage from "./pages/TransactionListPage";

type AuthView = "login" | "signup";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("quick");
  const [quickNoteInitialDate, setQuickNoteInitialDate] = useState(formatDateString(new Date()));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

  useEffect(() => {
    let cancelled = false;
    const restoreSession = async () => {
      try {
        const session = await authService.getSession();
        if (!cancelled) {
          setUser({
            id: session.email,
            email: session.email,
            isAuthenticated: true,
            sessionExpires: "Current session",
          });
        }
      } catch {
        // A missing or expired session is the normal signed-out state.
      } finally {
        if (!cancelled) setIsCheckingSession(false);
      }
    };

    void restoreSession();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadLedger = async () => {
      try {
        const [liveCategories, liveTransactions] = await Promise.all([
          categoryService.listCategories(),
          transactionService.list(),
        ]);
        if (cancelled) return;
        setCategories(liveCategories.length ? liveCategories : INITIAL_CATEGORIES);
        setTransactions(liveTransactions);
      } catch (error) {
        if (!cancelled) console.warn("[Ledture] Could not load ledger data.", error);
      }
    };

    void loadLedger();
    return () => { cancelled = true; };
  }, [user]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch (error) {
      console.warn("[Ledture] Logout endpoint was unavailable.", error);
    } finally {
      setUser(null);
      setTransactions([]);
      setCategories(INITIAL_CATEGORIES);
      setActiveTab("quick");
      setQuickNoteInitialDate(formatDateString(new Date()));
      setRegisteredEmail("");
      setAuthView("login");
      setIsLoggingOut(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center gap-3 text-sm">
        <LoaderCircle className="w-5 h-5 animate-spin text-emerald-400" />
        Restoring your secure session…
      </div>
    );
  }

  if (!user) {
    if (authView === "signup") {
      return <SignupPage onShowLogin={() => setAuthView("login")} onRegistered={(email) => { setRegisteredEmail(email); setAuthView("login"); }} />;
    }

    return (
      <LoginPage
        initialEmail={registeredEmail}
        successMessage={registeredEmail ? "Your account is ready. Sign in to continue." : undefined}
        onShowSignup={() => { setRegisteredEmail(""); setAuthView("signup"); }}
        onLogin={(email) => setUser({ id: email, email, isAuthenticated: true, sessionExpires: "Current session" })}
      />
    );
  }

  const openQuickNoteForDate = (date: string) => {
    setQuickNoteInitialDate(date);
    setActiveTab("quick");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-emerald-500 selection:text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} isEditable transactionCount={transactions.length} onLogout={() => void handleLogout()} isLoggingOut={isLoggingOut} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {activeTab === "quick" && <QuickNotePage categories={categories} transactions={transactions} setTransactions={setTransactions} setActiveTab={setActiveTab} initialDate={quickNoteInitialDate} />}
        {activeTab === "list" && <TransactionListPage transactions={transactions} setTransactions={setTransactions} onCreateForDate={openQuickNoteForDate} />}
        {activeTab === "summary" && <SummaryPage categories={categories} transactions={transactions} />}
      </main>
    </div>
  );
}
