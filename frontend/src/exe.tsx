import React, { useState, useMemo } from 'react';
import {
  Plus,
  DollarSign,
  Calendar,
  Tag,
  FileText,
  Lock,
  Unlock,
  Edit3,
  Trash2,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  AlertTriangle,
  Search,
  Layers,
  TrendingUp,
  TrendingDown,
  Zap,
  ShieldCheck,
  X
} from 'lucide-react';

import { INITIAL_CATEGORIES } from './constants';
import { formatDateString, getDaysDifferenceFromToday, isWithin7DaysRule } from './utils';
import type {
  ActiveTab,
  Category,
  FilterLockStatus,
  FilterType,
  MonthlyDetail,
  SummaryPeriod,
  ToastMessage,
  ToastType,
  TopExpenseItem,
  TooltipPos,
  Transaction,
  TransactionType,
  User,
  YearlyDetail,
} from './types';

// Re-export shared types so consumers of this module keep the same API.
export * from './types';

const generateMockTransactions = (): Transaction[] => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const subDays = (days: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return formatDateString(d);
  };

  const currentYearTxs: Transaction[] = [
    {
      id: 'tx-1',
      amount: 45.50,
      type: 'E',
      transactionDate: formatDateString(today),
      categoryId: 'cat-1',
      note: 'Lunch with colleagues at Bistro',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tx-2',
      amount: 1200.00,
      type: 'I',
      transactionDate: formatDateString(today),
      categoryId: 'cat-8',
      note: 'UI Design Milestone payout',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tx-3',
      amount: 12.00,
      type: 'E',
      transactionDate: subDays(2),
      categoryId: 'cat-2',
      note: 'Metro express transit pass',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tx-4',
      amount: 89.99,
      type: 'E',
      transactionDate: subDays(4),
      categoryId: 'cat-3',
      note: 'New ergonomic desk lamp',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tx-5',
      amount: 250.00,
      type: 'E',
      transactionDate: subDays(6),
      categoryId: 'cat-4',
      note: 'Monthly electricity bill payment',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tx-6',
      amount: 3200.00,
      type: 'I',
      transactionDate: subDays(10),
      categoryId: 'cat-7',
      note: 'Bi-weekly Salary',
      createdAt: new Date().toISOString()
    },
    {
      id: 'tx-7',
      amount: 65.00,
      type: 'E',
      transactionDate: subDays(14),
      categoryId: 'cat-6',
      note: 'Dental checkup & cleanup',
      createdAt: new Date().toISOString()
    }
  ];

  const historicalTxs: Transaction[] = [];
  const sampleNotes: Record<string, string[]> = {
    'cat-1': ['Restaurant dining', 'Supermarket groceries', 'Coffee & bakery', 'Weekend brunch'],
    'cat-2': ['Fuel refill', 'Car servicing & oil change', 'Ride-hailing transit', 'Highway tolls'],
    'cat-3': ['Wardrobe & apparel', 'Gadget upgrade', 'Home furniture', 'Online retail shopping'],
    'cat-4': ['Electricity & power', 'Water supply bill', 'Fiber broadband internet', 'Mobile plan'],
    'cat-5': ['Movie theater tickets', 'Live concert pass', 'Streaming subscriptions', 'Gaming gear'],
    'cat-6': ['Pharmacy prescription', 'Doctor consultation', 'Health insurance premium', 'Vision care']
  };

  for (let yearOffset = 1; yearOffset <= 10; yearOffset++) {
    const targetYear = currentYear - yearOffset;
    
    historicalTxs.push({
      id: `tx-hist-sal-${targetYear}`,
      amount: 42000 + (10 - yearOffset) * 2200,
      type: 'I',
      transactionDate: `${targetYear}-01-15`,
      categoryId: 'cat-7',
      note: `${targetYear} Base Compensation & Salary`,
      createdAt: new Date().toISOString()
    });

    historicalTxs.push({
      id: `tx-hist-side-${targetYear}`,
      amount: 3800 + Math.floor(Math.sin(yearOffset) * 1400),
      type: 'I',
      transactionDate: `${targetYear}-06-20`,
      categoryId: 'cat-8',
      note: `${targetYear} Freelance Contracts`,
      createdAt: new Date().toISOString()
    });

    const expCategories = [
      { id: 'cat-1', baseAmt: 6800 },
      { id: 'cat-2', baseAmt: 2900 },
      { id: 'cat-3', baseAmt: 4500 },
      { id: 'cat-4', baseAmt: 3200 },
      { id: 'cat-5', baseAmt: 2100 },
      { id: 'cat-6', baseAmt: 1600 }
    ];

    expCategories.forEach((cat, idx) => {
      const variation = Math.floor((Math.cos(yearOffset + idx * 2) * 900));
      const amount = Math.max(900, cat.baseAmt + variation);
      const notes = sampleNotes[cat.id] || ['General Expense'];
      
      historicalTxs.push({
        id: `tx-hist-exp-${targetYear}-${cat.id}`,
        amount: amount,
        type: 'E',
        transactionDate: `${targetYear}-0${(idx % 9) + 1}-10`,
        categoryId: cat.id,
        note: `${targetYear} ${notes[idx % notes.length]}`,
        createdAt: new Date().toISOString()
      });
    });
  }

  return [...currentYearTxs, ...historicalTxs];
};

export default function App(): React.ReactElement {
  // Session user state
  const [user] = useState<User>({
    id: 'usr_892113',
    email: 'alex.investor@ledture.app',
    isAuthenticated: true,
    sessionExpires: '7 days remaining'
  });

  // Main entity collections
  const [transactions, setTransactions] = useState<Transaction[]>(generateMockTransactions);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);

  // Tab navigation & date selection
  const [activeTab, setActiveTab] = useState<ActiveTab>('quick');
  const [selectedListDate, setSelectedListDate] = useState<string>(formatDateString(new Date()));

  // Feedback Toast state
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  const showToast = (text: string, type: ToastType = 'success'): void => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const shiftListDate = (days: number): void => {
    const d = new Date(selectedListDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setSelectedListDate(formatDateString(d));
  };

  // Quick Note Form state
  const [quickAmount, setQuickAmount] = useState<string>('');
  const [quickType, setQuickType] = useState<TransactionType>('E');
  const [quickCategory, setQuickCategory] = useState<string>('');
  const [quickNote, setQuickNote] = useState<string>('');
  const [quickDate, setQuickDate] = useState<string>(formatDateString(new Date()));
  const [showMoreDetails, setShowMoreDetails] = useState<boolean>(false);

  // Filtering state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [filterLockStatus] = useState<FilterLockStatus>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Modal editing & delete confirmation states
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteConfirmTx, setDeleteConfirmTx] = useState<Transaction | null>(null);

  // Analytics summary states
  const [summaryPeriod, setSummaryPeriod] = useState<SummaryPeriod>('MONTH'); 
  const [summarySelectedMonth, setSummarySelectedMonth] = useState<string>(formatDateString(new Date()).substring(0, 7));
  const [summarySelectedYear, setSummarySelectedYear] = useState<number>(new Date().getFullYear());
  
  const [yearlyRange, setYearlyRange] = useState<number>(3);
  const [hoveredYear, setHoveredYear] = useState<YearlyDetail | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyDetail | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPos>({ x: 0, y: 0 });

  const handleCreateTransaction = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const numAmount = parseFloat(quickAmount);

    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Amount is required and must be greater than 0.', 'error');
      return;
    }

    const targetDate = quickDate || formatDateString(new Date());
    if (!isWithin7DaysRule(targetDate)) {
      showToast('Service Rule Blocked: Cannot record a transaction older than 7 days.', 'error');
      return;
    }

    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      amount: numAmount,
      type: quickType,
      transactionDate: targetDate,
      categoryId: quickCategory || null,
      note: quickNote.trim() || null,
      createdAt: new Date().toISOString()
    };

    setTransactions([newTx, ...transactions]);

    setQuickAmount('');
    setQuickNote('');
    setQuickDate(formatDateString(new Date()));
    setShowMoreDetails(false);

    showToast(`Recorded ${quickType === 'I' ? 'Income' : 'Expense'} of $${numAmount.toFixed(2)} successfully!`);
  };

  const handleUpdateTransaction = (updatedTx: Transaction): void => {
    if (!isWithin7DaysRule(updatedTx.transactionDate)) {
      showToast('Service Rule Blocked: Cannot modify transactions older than 7 days.', 'error');
      return;
    }

    if (updatedTx.amount <= 0) {
      showToast('Amount must be greater than 0.', 'error');
      return;
    }

    setTransactions(transactions.map(t => t.id === updatedTx.id ? updatedTx : t));
    setEditingTransaction(null);
    showToast('Transaction updated successfully.');
  };

  const handleDeleteTransaction = (tx: Transaction): void => {
    if (!isWithin7DaysRule(tx.transactionDate)) {
      showToast('Service Rule Blocked: Transactions older than 7 days cannot be deleted.', 'error');
      setDeleteConfirmTx(null);
      return;
    }

    setTransactions(transactions.filter(t => t.id !== tx.id));
    setDeleteConfirmTx(null);
    showToast('Transaction deleted.', 'warning');
  };

  const filteredTransactions = useMemo<Transaction[]>(() => {
    return transactions.filter(tx => {
      if (tx.transactionDate !== selectedListDate) return false;
      if (filterType !== 'ALL' && tx.type !== filterType) return false;

      if (filterCategory !== 'ALL') {
        if (filterCategory === 'UNCATEGORIZED' && tx.categoryId !== null) return false;
        if (filterCategory !== 'UNCATEGORIZED' && tx.categoryId !== filterCategory) return false;
      }

      const isEditable = isWithin7DaysRule(tx.transactionDate);
      if (filterLockStatus === 'EDITABLE' && !isEditable) return false;
      if (filterLockStatus === 'LOCKED' && isEditable) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const cat = categories.find(c => c.id === tx.categoryId);
        const catName = cat ? cat.label.toLowerCase() : 'uncategorized';
        const note = (tx.note || '').toLowerCase();
        const amountStr = tx.amount.toString();

        return catName.includes(query) || note.includes(query) || amountStr.includes(query);
      }

      return true;
    });
  }, [transactions, selectedListDate, filterType, filterCategory, filterLockStatus, searchQuery, categories]);

  const dailySummary = useMemo(() => {
    const dayTxs = transactions.filter(t => t.transactionDate === selectedListDate);
    const income = dayTxs.filter(t => t.type === 'I').reduce((sum, t) => sum + t.amount, 0);
    const expense = dayTxs.filter(t => t.type === 'E').reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      net: income - expense,
      count: dayTxs.length,
      isEditable: isWithin7DaysRule(selectedListDate)
    };
  }, [transactions, selectedListDate]);

  const multiYearSummaryData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsList: number[] = [];
    
    for (let i = yearlyRange - 1; i >= 0; i--) {
      yearsList.push(currentYear - i);
    }

    let totalPeriodIncome = 0;
    let totalPeriodExpense = 0;
    let totalPeriodNet = 0;

    const yearlyDetails: YearlyDetail[] = yearsList.map((yearNum) => {
      const yearStr = yearNum.toString();
      const yearTxs = transactions.filter(t => t.transactionDate.startsWith(yearStr));

      let income = 0;
      let expense = 0;
      const catExpenseTotals: Record<string, number> = {};

      yearTxs.forEach(tx => {
        if (tx.type === 'I') {
          income += tx.amount;
        } else {
          expense += tx.amount;
          const catId = tx.categoryId || 'uncategorized';
          catExpenseTotals[catId] = (catExpenseTotals[catId] || 0) + tx.amount;
        }
      });

      const net = income - expense;
      totalPeriodIncome += income;
      totalPeriodExpense += expense;
      totalPeriodNet += net;

      const topExpenses: TopExpenseItem[] = Object.keys(catExpenseTotals)
        .map(catId => {
          const cat = categories.find(c => c.id === catId);
          const amt = catExpenseTotals[catId];
          return {
            id: catId,
            label: cat ? cat.label : 'Uncategorized',
            icon: cat ? cat.icon : '🏷️',
            amount: amt,
            percentage: expense > 0 ? ((amt / expense) * 100).toFixed(1) : '0'
          };
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      return {
        year: yearNum,
        income,
        expense,
        net,
        topExpenses
      };
    });

    const avgNetBalance = yearlyDetails.length > 0 ? totalPeriodNet / yearlyDetails.length : 0;
    const maxVal = Math.max(
      ...yearlyDetails.map(d => Math.max(d.income, d.expense)),
      1000
    );

    return {
      yearlyDetails,
      avgNetBalance,
      maxVal,
      totalPeriodIncome,
      totalPeriodExpense,
      totalPeriodNet
    };
  }, [transactions, yearlyRange, categories]);

  const yearMonthsSummaryData = useMemo(() => {
    const yearStr = summarySelectedYear.toString();
    const yearTxs = transactions.filter(t => t.transactionDate.startsWith(yearStr));

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let yearTotalIncome = 0;
    let yearTotalExpense = 0;

    const monthlyBreakdown: MonthlyDetail[] = monthNames.map((monthName, idx) => {
      const monthNumStr = String(idx + 1).padStart(2, '0');
      const monthPrefix = `${yearStr}-${monthNumStr}`;
      const monthTxs = yearTxs.filter(t => t.transactionDate.startsWith(monthPrefix));

      let income = 0;
      let expense = 0;
      const catExpenseTotals: Record<string, number> = {};

      monthTxs.forEach(tx => {
        if (tx.type === 'I') {
          income += tx.amount;
        } else {
          expense += tx.amount;
          const catId = tx.categoryId || 'uncategorized';
          catExpenseTotals[catId] = (catExpenseTotals[catId] || 0) + tx.amount;
        }
      });

      yearTotalIncome += income;
      yearTotalExpense += expense;

      const topExpenses: TopExpenseItem[] = Object.keys(catExpenseTotals)
        .map(catId => {
          const cat = categories.find(c => c.id === catId);
          const amt = catExpenseTotals[catId];
          return {
            id: catId,
            label: cat ? cat.label : 'Uncategorized',
            icon: cat ? cat.icon : '🏷️',
            amount: amt
          };
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      return {
        monthKey: monthPrefix,
        monthName,
        monthNum: idx + 1,
        income,
        expense,
        net: income - expense,
        topExpenses
      };
    });

    const maxVal = Math.max(
      ...monthlyBreakdown.map(m => Math.max(m.income, m.expense)),
      1000
    );

    return {
      monthlyBreakdown,
      yearTotalIncome,
      yearTotalExpense,
      yearNetBalance: yearTotalIncome - yearTotalExpense,
      maxVal
    };
  }, [transactions, summarySelectedYear, categories]);

  const monthSummaryData = useMemo(() => {
    const filtered = transactions.filter(tx => tx.transactionDate.startsWith(summarySelectedMonth));

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals: Record<string, number> = {};

    filtered.forEach(tx => {
      if (tx.type === 'I') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }

      const catId = tx.categoryId || 'uncategorized';
      categoryTotals[catId] = (categoryTotals[catId] || 0) + tx.amount;
    });

    const netBalance = totalIncome - totalExpense;

    const breakdown: TopExpenseItem[] = Object.keys(categoryTotals).map(catId => {
      const cat = categories.find(c => c.id === catId);
      return {
        id: catId,
        label: cat ? cat.label : 'Uncategorized',
        icon: cat ? cat.icon : '🏷️',
        amount: categoryTotals[catId]
      };
    }).sort((a, b) => b.amount - a.amount);

    return {
      totalIncome,
      totalExpense,
      netBalance,
      count: filtered.length,
      breakdown
    };
  }, [transactions, summarySelectedMonth, categories]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-bounce ${
          toastMessage.type === 'error'
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            : toastMessage.type === 'warning'
            ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
            : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
        }`}>
          {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
          {toastMessage.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
          {toastMessage.type === 'success' && <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />}
          <span className="text-sm font-medium">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Header */}
          <div className="p-6 flex items-center justify-between md:justify-start gap-3 border-b border-slate-800/60">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/20">
              L
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Ledture
              </h1>
              <p className="text-xs text-slate-400 font-mono">Ledger for Future</p>
            </div>
          </div>

          {/* User Session Info Badge */}
          <div className="p-4 mx-3 my-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate">{user.email}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Session Active (HttpOnly)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            <button
              onClick={() => setActiveTab('quick')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'quick'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Quick Note</span>
              <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">Fast</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Transactions</span>
              <span className="ml-auto text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                {transactions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'summary'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Summary</span>
            </button>
          </nav>
        </div>

        {/* Business Rule Warning Note */}
        <div className="p-4 m-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-300/80 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>7-Day Policy Active</span>
          </div>
          <p className="leading-relaxed text-[11px] text-amber-300/70">
            Records older than 7 days are permanently locked for modifications.
          </p>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full">

        {/* ========================================================= */}
        {/* TAB 1: QUICK NOTE PAGE */}
        {/* ========================================================= */}
        {activeTab === 'quick' && (
          <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
            
            {/* Page Header */}
            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap className="w-3.5 h-3.5" /> Express Recording Mode
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white">Record Transaction</h2>
              <p className="text-xs text-slate-400">Log income or expense instantly to avoid forgetting later.</p>
            </div>

            {/* Main Fast-Record Card */}
            <form onSubmit={handleCreateTransaction} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              
              {/* Type Switcher [ Income ] [ Expense ] */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuickType('I')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${
                    quickType === 'I'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                  <span>Income</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuickType('E')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${
                    quickType === 'E'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 stroke-[3]" />
                  <span>Expense</span>
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
                  <span>AMOUNT <span className="text-rose-400">*</span></span>
                  <span className="text-[10px] text-slate-500 font-mono">Required &gt; $0</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-3xl font-extrabold text-slate-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    autoFocus
                    value={quickAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuickAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-4 pl-12 pr-4 text-3xl font-black text-white placeholder-slate-700 outline-none transition-all font-mono"
                  />
                </div>

                {/* Quick preset amount buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[10, 20, 50, 100, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setQuickAmount(amt.toString())}
                      className="px-3 py-1 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs rounded-lg font-mono border border-slate-700/50 transition-colors"
                    >
                      +${amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setQuickAmount('')}
                    className="px-3 py-1 bg-slate-800/30 hover:bg-slate-800 text-slate-500 text-xs rounded-lg font-mono border border-slate-800 transition-colors ml-auto"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Collapsible Details */}
              <div className="border-t border-slate-800/80 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMoreDetails(!showMoreDetails)}
                  className="w-full flex items-center justify-between py-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" />
                    {showMoreDetails ? 'Hide Optional Details' : 'More Details (Category, Note, Date)'}
                  </span>
                  {showMoreDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showMoreDetails && (
                  <div className="mt-4 space-y-4 pt-2 border-t border-slate-800/40 animate-fadeIn">
                    
                    {/* Category Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400">Category (Optional)</label>
                      <select
                        value={quickCategory}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setQuickCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 outline-none"
                      >
                        <option value="">Uncategorized (None)</option>
                        {categories
                          .filter(c => c.type === quickType)
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.icon} {cat.label}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Date Selection */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-400">Transaction Date</label>
                        <span className="text-[10px] text-amber-400 font-mono">Max 7 days in past</span>
                      </div>
                      <input
                        type="date"
                        value={quickDate}
                        max={formatDateString(new Date())}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuickDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 outline-none font-mono"
                      />
                    </div>

                    {/* Note Field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400">Note / Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Groceries at Trader Joe's"
                        value={quickNote}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuickNote(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Save Transaction</span>
              </button>
            </form>

            {/* Quick Recent Activity */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
                <span>RECENT ENTRIES</span>
                <button
                  onClick={() => setActiveTab('list')}
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  View All ({transactions.length})
                </button>
              </div>

              <div className="space-y-2">
                {transactions.slice(0, 3).map((tx) => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  const isEditable = isWithin7DaysRule(tx.transactionDate);
                  return (
                    <div
                      key={tx.id}
                      className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          tx.type === 'I' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {cat ? cat.icon : (tx.type === 'I' ? '+' : '-')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{cat ? cat.label : 'Uncategorized'}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{tx.transactionDate} {tx.note ? `• ${tx.note}` : ''}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className={`font-mono font-bold text-sm ${tx.type === 'I' ? 'text-emerald-400' : 'text-slate-200'}`}>
                          {tx.type === 'I' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </span>
                        {!isEditable && (
                          <span title="Locked (> 7 days old)">
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TRANSACTION LIST & MODIFICATION */}
        {/* ========================================================= */}
        {activeTab === 'list' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header & Quick Entry Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Daily Ledger View</h2>
                <p className="text-xs text-slate-400">View and manage records for a specific day.</p>
              </div>
              
              <button
                onClick={() => {
                  setQuickDate(selectedListDate);
                  setActiveTab('quick');
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 self-start sm:self-auto transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>New Record for {selectedListDate}</span>
              </button>
            </div>

            {/* Date Navigation Overview */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                
                {/* Date Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => shiftListDate(-1)}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Previous Day"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                    <Calendar className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                    <input
                      type="date"
                      value={selectedListDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.value && setSelectedListDate(e.target.value)}
                      className="bg-transparent text-sm font-mono text-slate-100 font-bold outline-none cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => shiftListDate(1)}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Next Day"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setSelectedListDate(formatDateString(new Date()))}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedListDate === formatDateString(new Date())
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Today
                  </button>
                </div>

                {/* Lock Indicator */}
                <div className="flex items-center gap-2">
                  {dailySummary.isEditable ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Unlock className="w-3.5 h-3.5" /> Editable Day ({getDaysDifferenceFromToday(selectedListDate) === 0 ? 'Today' : `${getDaysDifferenceFromToday(selectedListDate)}d ago`})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Lock className="w-3.5 h-3.5" /> Locked Day (&gt; 7d old)
                    </span>
                  )}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-[10px] uppercase font-mono text-slate-400">Day Income</p>
                  <p className="text-sm md:text-base font-bold font-mono text-emerald-400 mt-0.5">
                    +${dailySummary.income.toFixed(2)}
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-[10px] uppercase font-mono text-slate-400">Day Expense</p>
                  <p className="text-sm md:text-base font-bold font-mono text-rose-400 mt-0.5">
                    -${dailySummary.expense.toFixed(2)}
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-[10px] uppercase font-mono text-slate-400">Daily Net</p>
                  <p className={`text-sm md:text-base font-bold font-mono mt-0.5 ${
                    dailySummary.net >= 0 ? 'text-teal-400' : 'text-rose-400'
                  }`}>
                    {dailySummary.net >= 0 ? '+' : ''}${dailySummary.net.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Search and Category Filters */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search in this day's notes, category or amount..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:border-emerald-500 outline-none placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <select
                  value={filterType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value as FilterType)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-emerald-500 outline-none"
                >
                  <option value="ALL">All Types (Income & Expense)</option>
                  <option value="I">Income Only</option>
                  <option value="E">Expense Only</option>
                </select>

                <select
                  value={filterCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-emerald-500 outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="UNCATEGORIZED">Uncategorized</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Transaction List Table */}
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
                <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-400 font-medium">No transactions recorded for {selectedListDate}.</p>
                {dailySummary.isEditable && (
                  <button
                    onClick={() => {
                      setQuickDate(selectedListDate);
                      setActiveTab('quick');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Transaction for {selectedListDate}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Note</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {filteredTransactions.map((tx) => {
                        const cat = categories.find(c => c.id === tx.categoryId);
                        const isEditable = isWithin7DaysRule(tx.transactionDate);

                        return (
                          <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-4 font-mono">
                              {isEditable ? (
                                <span title="Editable: Within 7 days limit" className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                  <Unlock className="w-2.5 h-2.5" /> Active
                                </span>
                              ) : (
                                <span title="Locked: Older than 7 days" className="inline-flex items-center gap-1 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                                  <Lock className="w-2.5 h-2.5 text-slate-400" /> Locked
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 font-semibold">
                              {tx.type === 'I' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400">
                                  <ArrowUpRight className="w-3.5 h-3.5" /> Income
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-400">
                                  <ArrowDownRight className="w-3.5 h-3.5" /> Expense
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              {cat ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700/50">
                                  <span>{cat.icon}</span>
                                  <span>{cat.label}</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 italic">Uncategorized</span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                              {tx.note || <span className="text-slate-600">—</span>}
                            </td>

                            <td className="py-3 px-4 text-right font-mono font-bold text-sm">
                              <span className={tx.type === 'I' ? 'text-emerald-400' : 'text-slate-200'}>
                                {tx.type === 'I' ? '+' : '-'}${tx.amount.toFixed(2)}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-center">
                              {isEditable ? (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => setEditingTransaction(tx)}
                                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors"
                                    title="Edit Transaction"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmTx(tx)}
                                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                                    title="Delete Transaction"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-mono" title="Modifications blocked (> 7 days)">
                                  Read-only
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: TRANSACTION SUMMARY */}
        {/* ========================================================= */}
        {activeTab === 'summary' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header & Period Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Financial Summary</h2>
                <p className="text-xs text-slate-400">Monthly breakdown and multi-year comparative analytics.</p>
              </div>

              <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto gap-1">
                <button
                  onClick={() => {
                    setSummaryPeriod('MONTH');
                    setHoveredYear(null);
                    setHoveredMonth(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    summaryPeriod === 'MONTH'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Monthly
                </button>

                <button
                  onClick={() => {
                    setSummaryPeriod('YEAR_MONTHS');
                    setHoveredYear(null);
                    setHoveredMonth(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    summaryPeriod === 'YEAR_MONTHS'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  By Month
                </button>

                <button
                  onClick={() => {
                    setSummaryPeriod('YEAR');
                    setHoveredYear(null);
                    setHoveredMonth(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    summaryPeriod === 'YEAR'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  By Year
                </button>
              </div>
            </div>

            {/* TAB 3.1: MONTHLY SUMMARY */}
            {summaryPeriod === 'MONTH' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Month Picker Control */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-white">Select Month</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="month"
                      value={summarySelectedMonth}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.value && setSummarySelectedMonth(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-200 outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => setSummarySelectedMonth(formatDateString(new Date()).substring(0, 7))}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-emerald-400 hover:bg-slate-800 transition-colors"
                    >
                      Current Month
                    </button>
                  </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Income</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
                      +${monthSummaryData.totalIncome.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">{summarySelectedMonth}</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expense</span>
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-2xl md:text-3xl font-black text-rose-400 font-mono">
                      -${monthSummaryData.totalExpense.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">{summarySelectedMonth}</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Balance</span>
                      <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <p className={`text-2xl md:text-3xl font-black font-mono ${
                      monthSummaryData.netBalance >= 0 ? 'text-teal-400' : 'text-rose-400'
                    }`}>
                      {monthSummaryData.netBalance >= 0 ? '+' : ''}${monthSummaryData.netBalance.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Income minus expenses</p>
                  </div>
                </div>

                {/* Category Distribution Breakdown Chart */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-emerald-400" />
                    <span>Category Breakdown ({summarySelectedMonth})</span>
                  </h3>

                  {monthSummaryData.breakdown.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No transactions recorded for this month.</p>
                  ) : (
                    <div className="space-y-3">
                      {monthSummaryData.breakdown.map((item) => {
                        const totalSum = monthSummaryData.totalIncome + monthSummaryData.totalExpense;
                        const percentage = totalSum > 0 ? ((item.amount / totalSum) * 100).toFixed(1) : 0;

                        return (
                          <div key={item.id} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-2 text-slate-300 font-medium">
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                              </span>
                              <span className="font-mono text-slate-200 font-semibold">
                                ${item.amount.toFixed(2)} ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(Number(percentage), 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3.2: MONTH-BY-MONTH COMPARISON IN A YEAR */}
            {summaryPeriod === 'YEAR_MONTHS' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Year Selector */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-white">Monthly Comparison in {summarySelectedYear}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Target Year:</span>
                    <select
                      value={summarySelectedYear}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSummarySelectedYear(parseInt(e.target.value))}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-200 outline-none focus:border-emerald-500"
                    >
                      {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - i).map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bar Chart Surface */}
                <div 
                  onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPos({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top
                    });
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-white">Income vs Expense Across Months</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Yearly Total Net: <span className={`font-mono font-bold ${yearMonthsSummaryData.yearNetBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{yearMonthsSummaryData.yearNetBalance >= 0 ? '+' : ''}${yearMonthsSummaryData.yearNetBalance.toFixed(2)}</span></p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
                        <span className="text-slate-300">Income</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block"></span>
                        <span className="text-slate-300">Expense</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-1 md:gap-2 items-end h-56 border-b border-slate-800 pb-2 relative z-0">
                    {yearMonthsSummaryData.monthlyBreakdown.map((m) => {
                      const incPct = Math.min(100, Math.max(4, (m.income / yearMonthsSummaryData.maxVal) * 100));
                      const expPct = Math.min(100, Math.max(4, (m.expense / yearMonthsSummaryData.maxVal) * 100));
                      const isHovered = hoveredMonth?.monthName === m.monthName;

                      return (
                        <div
                          key={m.monthName}
                          onMouseEnter={() => setHoveredMonth(m)}
                          onMouseLeave={() => setHoveredMonth(null)}
                          className={`flex flex-col items-center justify-end h-full group p-1 cursor-pointer rounded-lg transition-all ${
                            isHovered ? 'bg-slate-800/90 ring-1 ring-emerald-500/50' : 'hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="w-full flex items-end justify-center gap-0.5 h-full">
                            <div
                              className="w-1/2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-200 group-hover:brightness-125"
                              style={{ height: `${incPct}%` }}
                            ></div>
                            <div
                              className="w-1/2 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-sm transition-all duration-200 group-hover:brightness-125"
                              style={{ height: `${expPct}%` }}
                            ></div>
                          </div>
                          <span className={`text-[10px] font-mono font-bold mt-2 truncate w-full text-center transition-colors ${
                            isHovered ? 'text-emerald-400 scale-110' : 'text-slate-400'
                          }`}>
                            {m.monthName}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Floating Tooltip */}
                  {hoveredMonth && (
                    <div
                      className="absolute pointer-events-none z-30 bg-slate-950/95 border border-emerald-500/50 rounded-xl p-3 shadow-2xl space-y-2 text-xs w-60 backdrop-blur-md transition-all duration-75"
                      style={{
                        left: `${Math.min(Math.max(10, tooltipPos.x - 120), 450)}px`,
                        top: `${Math.max(10, tooltipPos.y - 170)}px`,
                      }}
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="font-bold text-white flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{hoveredMonth.monthName} {summarySelectedYear}</span>
                        </span>
                        <span className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ${
                          hoveredMonth.net >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          Net: {hoveredMonth.net >= 0 ? '+' : ''}${hoveredMonth.net.toFixed(0)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                        <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                          <span className="text-slate-500 block text-[9px]">INCOME</span>
                          <span className="text-emerald-400 font-bold">+${hoveredMonth.income.toFixed(0)}</span>
                        </div>
                        <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                          <span className="text-slate-500 block text-[9px]">EXPENSE</span>
                          <span className="text-rose-400 font-bold">-${hoveredMonth.expense.toFixed(0)}</span>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Top Expenses</p>
                        {hoveredMonth.topExpenses.length === 0 ? (
                          <p className="text-[11px] text-slate-500 italic">No expenses recorded</p>
                        ) : (
                          <div className="space-y-1">
                            {hoveredMonth.topExpenses.map((cat, idx) => (
                              <div key={cat.id} className="bg-slate-900/90 p-1 rounded flex items-center justify-between text-[11px]">
                                <span className="flex items-center gap-1">
                                  <span className="text-[9px] font-mono text-slate-500">#{idx + 1}</span>
                                  <span>{cat.icon}</span>
                                  <span className="text-slate-200 truncate max-w-[85px]">{cat.label}</span>
                                </span>
                                <span className="font-mono font-semibold text-slate-100">${cat.amount.toFixed(0)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* Grid of Monthly Category Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {yearMonthsSummaryData.monthlyBreakdown.map((m) => (
                    <div key={m.monthName} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="font-bold text-white text-sm">{m.monthName} {summarySelectedYear}</span>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          m.net >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          Net: {m.net >= 0 ? '+' : ''}${m.net.toFixed(2)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">INCOME</span>
                          <span className="text-emerald-400 font-bold">+${m.income.toFixed(2)}</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block text-[10px]">EXPENSE</span>
                          <span className="text-rose-400 font-bold">-${m.expense.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Top Categories</span>
                        {m.topExpenses.length === 0 ? (
                          <p className="text-[11px] text-slate-600 italic">No expenses recorded</p>
                        ) : (
                          <div className="space-y-1">
                            {m.topExpenses.map((cat) => (
                              <div key={cat.id} className="flex items-center justify-between text-xs bg-slate-950/60 p-1.5 rounded-md">
                                <span className="flex items-center gap-1.5 text-slate-300">
                                  <span>{cat.icon}</span>
                                  <span className="truncate max-w-[110px]">{cat.label}</span>
                                </span>
                                <span className="font-mono text-slate-200 font-semibold">${cat.amount.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 3.3: MULTI-YEAR COMPARISON */}
            {summaryPeriod === 'YEAR' && (
              <div className="space-y-6">
                
                {/* Year Range Selector */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-white">Yearly Comparison Range</span>
                  </div>

                  <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    {[3, 5, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          setYearlyRange(num);
                          setHoveredYear(null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                          yearlyRange === num
                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {num} Years
                      </button>
                    ))}
                  </div>
                </div>

                {/* Graph Container */}
                <div
                  onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPos({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top
                    });
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 relative overflow-hidden"
                >
                  
                  {/* Legend */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Multi-Year Performance Trend</span>
                        <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          Last {yearlyRange} Years
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Hover over any year to inspect top 3 expense categories.</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
                        <span className="text-slate-300">Income Bar</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block"></span>
                        <span className="text-slate-300">Expense Bar</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-1 bg-teal-400 rounded-full inline-block"></span>
                        <span className="text-teal-300">Net Line</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative pt-6 pb-2">
                    
                    {/* Average Balance Line */}
                    <div 
                      className="absolute left-0 right-0 border-b-2 border-dashed border-teal-400/40 z-10 flex items-center justify-end pr-2 transition-all"
                      style={{
                        top: `${Math.max(10, Math.min(90, 100 - ((multiYearSummaryData.avgNetBalance / multiYearSummaryData.maxVal) * 80)))}%`
                      }}
                    >
                      <span className="bg-slate-950/90 text-teal-300 text-[10px] font-mono px-2 py-0.5 rounded border border-teal-500/30 font-bold backdrop-blur">
                        Avg Balance: ${multiYearSummaryData.avgNetBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    {/* Bars Container */}
                    <div className="flex items-end justify-center gap-2 md:gap-4 h-64 border-b border-slate-800 pb-2 relative z-0">
                      {multiYearSummaryData.yearlyDetails.map((item) => {
                        const incPct = Math.min(100, Math.max(5, (item.income / multiYearSummaryData.maxVal) * 100));
                        const expPct = Math.min(100, Math.max(5, (item.expense / multiYearSummaryData.maxVal) * 100));
                        const isHovered = hoveredYear?.year === item.year;

                        return (
                          <div
                            key={item.year}
                            onMouseEnter={() => setHoveredYear(item)}
                            onMouseLeave={() => setHoveredYear(null)}
                            className={`flex flex-col items-center justify-end h-full group cursor-pointer p-1 rounded-xl transition-all max-w-[64px] w-full ${
                              isHovered ? 'bg-slate-800/80 ring-1 ring-emerald-500/50' : 'hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="w-full flex items-end justify-center gap-1 h-full px-1">
                              <div
                                className="w-1/2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-300 group-hover:brightness-125"
                                style={{ height: `${incPct}%` }}
                              ></div>
                              <div
                                className="w-1/2 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-sm transition-all duration-300 group-hover:brightness-125"
                                style={{ height: `${expPct}%` }}
                              ></div>
                            </div>

                            <span className={`text-xs font-mono font-bold mt-2 transition-colors ${
                              isHovered ? 'text-emerald-400 scale-105' : 'text-slate-400'
                            }`}>
                              {item.year}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Floating Tooltip */}
                  {hoveredYear && (
                    <div
                      className="absolute pointer-events-none z-30 bg-slate-950/95 border border-emerald-500/50 rounded-xl p-3 shadow-2xl space-y-2 text-xs w-64 backdrop-blur-md transition-all duration-75"
                      style={{
                        left: `${Math.min(Math.max(10, tooltipPos.x - 128), 500)}px`,
                        top: `${Math.max(10, tooltipPos.y - 180)}px`,
                      }}
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="font-bold text-white flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Year {hoveredYear.year}</span>
                        </span>
                        <span className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ${
                          hoveredYear.net >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          Net: {hoveredYear.net >= 0 ? '+' : ''}${hoveredYear.net.toFixed(0)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                        <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                          <span className="text-slate-500 block text-[9px]">INCOME</span>
                          <span className="text-emerald-400 font-bold">+${hoveredYear.income.toFixed(0)}</span>
                        </div>
                        <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                          <span className="text-slate-500 block text-[9px]">EXPENSE</span>
                          <span className="text-rose-400 font-bold">-${hoveredYear.expense.toFixed(0)}</span>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Top 3 Expenses</p>
                        {hoveredYear.topExpenses.length === 0 ? (
                          <p className="text-[11px] text-slate-500 italic">No expenses recorded</p>
                        ) : (
                          <div className="space-y-1">
                            {hoveredYear.topExpenses.map((cat, idx) => (
                              <div key={cat.id} className="bg-slate-900/90 p-1 rounded flex items-center justify-between text-[11px]">
                                <span className="flex items-center gap-1">
                                  <span className="text-[9px] font-mono text-slate-500">#{idx + 1}</span>
                                  <span>{cat.icon}</span>
                                  <span className="text-slate-200 truncate max-w-[90px]">{cat.label}</span>
                                </span>
                                <span className="font-mono font-semibold text-slate-100">${cat.amount.toFixed(0)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Edit Modal Dialog */}
      {editingTransaction && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">Edit Transaction</h3>
              <button
                onClick={() => setEditingTransaction(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                if (editingTransaction) {
                  handleUpdateTransaction(editingTransaction);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTransaction({ ...editingTransaction, type: 'I' })}
                  className={`py-2 rounded-lg text-xs font-bold ${
                    editingTransaction.type === 'I' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTransaction({ ...editingTransaction, type: 'E' })}
                  className={`py-2 rounded-lg text-xs font-bold ${
                    editingTransaction.type === 'E' ? 'bg-rose-500 text-white' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  Expense
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editingTransaction.amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTransaction({ ...editingTransaction, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Category</label>
                <select
                  value={editingTransaction.categoryId || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditingTransaction({ ...editingTransaction, categoryId: e.target.value || null })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-emerald-500"
                >
                  <option value="">Uncategorized</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Date</label>
                <input
                  type="date"
                  max={formatDateString(new Date())}
                  value={editingTransaction.transactionDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTransaction({ ...editingTransaction, transactionDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Note</label>
                <input
                  type="text"
                  value={editingTransaction.note || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingTransaction({ ...editingTransaction, note: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Delete Transaction?</h3>
              <p className="text-xs text-slate-400 mt-1">
                This action cannot be undone. Amount: <span className="text-white font-mono font-bold">${deleteConfirmTx.amount.toFixed(2)}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmTx(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTransaction(deleteConfirmTx)}
                className="flex-1 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl hover:bg-rose-600 shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}