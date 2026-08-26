/* ============================================================================
 * Shared domain & UI types
 * Single source of truth for every type used across the Ledture frontend.
 * ========================================================================== */

/** 'I' = Income, 'E' = Expense */
export type TransactionType = 'I' | 'E';

export interface Category {
  id: string;
  label: string;
  icon: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  /** YYYY-MM-DD */
  transactionDate: string;
  categoryId: string | null;
  note: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  isAuthenticated: boolean;
  sessionExpires: string;
}

/* ------------------------------ Feedback ------------------------------ */
export type ToastType = 'success' | 'error' | 'warning';

export interface ToastMessage {
  text: string;
  type: ToastType;
}

/* --------------------------- Navigation / Filter --------------------------- */
export type ActiveTab = 'quick' | 'list' | 'summary';
export type SummaryPeriod = 'MONTH' | 'YEAR_MONTHS' | 'YEAR';
export type FilterType = 'ALL' | TransactionType;
export type FilterLockStatus = 'ALL' | 'EDITABLE' | 'LOCKED';

/* ------------------------------- Analytics ------------------------------- */
export interface TopExpenseItem {
  id: string;
  label: string;
  icon: string;
  amount: number;
  percentage?: string;
}

export interface YearlyDetail {
  year: number;
  income: number;
  expense: number;
  net: number;
  topExpenses: TopExpenseItem[];
}

export interface MonthlyDetail {
  monthKey: string;
  monthName: string;
  monthNum: number;
  income: number;
  expense: number;
  net: number;
  topExpenses: TopExpenseItem[];
}

export interface TooltipPos {
  x: number;
  y: number;
}

/* --------------------- Derived summary data shapes --------------------- */
export interface DailySummary {
  income: number;
  expense: number;
  net: number;
  count: number;
  isEditable: boolean;
}

export interface MonthSummaryData {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  count: number;
  breakdown: TopExpenseItem[];
}

export interface YearMonthsSummaryData {
  monthlyBreakdown: MonthlyDetail[];
  yearTotalIncome: number;
  yearTotalExpense: number;
  yearNetBalance: number;
  maxVal: number;
}

export interface MultiYearSummaryData {
  yearlyDetails: YearlyDetail[];
  avgNetBalance: number;
  maxVal: number;
  totalPeriodIncome: number;
  totalPeriodExpense: number;
  totalPeriodNet: number;
}
