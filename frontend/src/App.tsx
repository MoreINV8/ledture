import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { X, Trash2 } from 'lucide-react';

import { DEFAULT_USER, INITIAL_CATEGORIES } from './constants';
import { formatDateString, getDaysDifferenceFromToday, isWithin7DaysRule } from './utils';
import { categoryService, transactionService } from './service';
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

import Sidebar from './components/Sidebar';
import QuickNotePage from './pages/QuickNotePage';
import TransactionListPage from './pages/TransactionListPage';
import SummaryPage from './pages/SummaryPage';
import { Toast, Card, Button, Input, Select, Label } from './components/ui';

/* ----------------------------------------------------------------------------
 * Mock data generator — mirrors the reference `exe.tsx` implementation.
 * ------------------------------------------------------------------------- */
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
      amount: 45.5,
      type: 'E',
      transactionDate: formatDateString(today),
      categoryId: 'cat-1',
      note: 'Lunch with colleagues at Bistro',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-2',
      amount: 1200.0,
      type: 'I',
      transactionDate: formatDateString(today),
      categoryId: 'cat-8',
      note: 'UI Design Milestone payout',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-3',
      amount: 12.0,
      type: 'E',
      transactionDate: subDays(2),
      categoryId: 'cat-2',
      note: 'Metro express transit pass',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-4',
      amount: 89.99,
      type: 'E',
      transactionDate: subDays(4),
      categoryId: 'cat-3',
      note: 'New ergonomic desk lamp',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-5',
      amount: 250.0,
      type: 'E',
      transactionDate: subDays(6),
      categoryId: 'cat-4',
      note: 'Monthly electricity bill payment',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-6',
      amount: 3200.0,
      type: 'I',
      transactionDate: subDays(10),
      categoryId: 'cat-7',
      note: 'Bi-weekly Salary',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-7',
      amount: 65.0,
      type: 'E',
      transactionDate: subDays(14),
      categoryId: 'cat-6',
      note: 'Dental checkup & cleanup',
      createdAt: new Date().toISOString(),
    },
  ];

  const historicalTxs: Transaction[] = [];
  const sampleNotes: Record<string, string[]> = {
    'cat-1': ['Restaurant dining', 'Supermarket groceries', 'Coffee & bakery', 'Weekend brunch'],
    'cat-2': ['Fuel refill', 'Car servicing & oil change', 'Ride-hailing transit', 'Highway tolls'],
    'cat-3': ['Wardrobe & apparel', 'Gadget upgrade', 'Home furniture', 'Online retail shopping'],
    'cat-4': ['Electricity & power', 'Water supply bill', 'Fiber broadband internet', 'Mobile plan'],
    'cat-5': ['Movie theater tickets', 'Live concert pass', 'Streaming subscriptions', 'Gaming gear'],
    'cat-6': ['Pharmacy prescription', 'Doctor consultation', 'Health insurance premium', 'Vision care'],
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
      createdAt: new Date().toISOString(),
    });

    historicalTxs.push({
      id: `tx-hist-side-${targetYear}`,
      amount: 3800 + Math.floor(Math.sin(yearOffset) * 1400),
      type: 'I',
      transactionDate: `${targetYear}-06-20`,
      categoryId: 'cat-8',
      note: `${targetYear} Freelance Contracts`,
      createdAt: new Date().toISOString(),
    });

    const expCategories = [
      { id: 'cat-1', baseAmt: 6800 },
      { id: 'cat-2', baseAmt: 2900 },
      { id: 'cat-3', baseAmt: 4500 },
      { id: 'cat-4', baseAmt: 3200 },
      { id: 'cat-5', baseAmt: 2100 },
      { id: 'cat-6', baseAmt: 1600 },
    ];

    expCategories.forEach((cat, idx) => {
      const variation = Math.floor(Math.cos(yearOffset + idx * 2) * 900);
      const amount = Math.max(900, cat.baseAmt + variation);
      const notes = sampleNotes[cat.id] || ['General Expense'];

      historicalTxs.push({
        id: `tx-hist-exp-${targetYear}-${cat.id}`,
        amount,
        type: 'E',
        transactionDate: `${targetYear}-0${(idx % 9) + 1}-10`,
        categoryId: cat.id,
        note: `${targetYear} ${notes[idx % notes.length]}`,
        createdAt: new Date().toISOString(),
      });
    });
  }

  return [...currentYearTxs, ...historicalTxs];
};

/* ----------------------------------------------------------------------------
 * App — composes the shared components into the same layout as `exe.tsx`.
 * ------------------------------------------------------------------------- */
export default function App() {
  // Session user state
  const [user] = useState<User>(DEFAULT_USER);

  // Main entity collections — seeded with demo data, replaced by the backend
  // service layer when it is reachable.
  const [transactions, setTransactions] = useState<Transaction[]>(generateMockTransactions);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

  // Load live data from the backend; fall back to the local demo data when the
  // API is unreachable (e.g. backend not running, or placeholder auth).
  useEffect(() => {
    let cancelled = false;

    const loadFromBackend = async () => {
      try {
        const [liveCategories, liveTransactions] = await Promise.all([
          categoryService.listCategories(),
          transactionService.list(),
        ]);
        if (cancelled) return;
        setCategories(liveCategories.length > 0 ? liveCategories : INITIAL_CATEGORIES);
        setTransactions(liveTransactions);
      } catch (err) {
        if (!cancelled) {
          console.warn('[Ledture] Backend unavailable – using local demo data.', err);
        }
      }
    };

    void loadFromBackend();
    return () => {
      cancelled = true;
    };
  }, []);

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
  const [summarySelectedMonth, setSummarySelectedMonth] = useState<string>(
    formatDateString(new Date()).substring(0, 7),
  );
  const [summarySelectedYear, setSummarySelectedYear] = useState<number>(new Date().getFullYear());

  const [yearlyRange, setYearlyRange] = useState<number>(3);
  const [hoveredYear, setHoveredYear] = useState<YearlyDetail | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyDetail | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPos>({ x: 0, y: 0 });

  const handleCreateTransaction = (e: FormEvent<HTMLFormElement>): void => {
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
      createdAt: new Date().toISOString(),
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

    setTransactions(transactions.map((t) => (t.id === updatedTx.id ? updatedTx : t)));
    setEditingTransaction(null);
    showToast('Transaction updated successfully.');
  };

  const handleDeleteTransaction = (tx: Transaction): void => {
    if (!isWithin7DaysRule(tx.transactionDate)) {
      showToast('Service Rule Blocked: Transactions older than 7 days cannot be deleted.', 'error');
      setDeleteConfirmTx(null);
      return;
    }

    setTransactions(transactions.filter((t) => t.id !== tx.id));
    setDeleteConfirmTx(null);
    showToast('Transaction deleted.', 'warning');
  };

  const filteredTransactions = useMemo<Transaction[]>(() => {
    return transactions.filter((tx) => {
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
        const cat = categories.find((c) => c.id === tx.categoryId);
        const catName = cat ? cat.label.toLowerCase() : 'uncategorized';
        const note = (tx.note || '').toLowerCase();
        const amountStr = tx.amount.toString();

        return catName.includes(query) || note.includes(query) || amountStr.includes(query);
      }

      return true;
    });
  }, [transactions, selectedListDate, filterType, filterCategory, filterLockStatus, searchQuery, categories]);

  const dailySummary = useMemo(() => {
    const dayTxs = transactions.filter((t) => t.transactionDate === selectedListDate);
    const income = dayTxs.filter((t) => t.type === 'I').reduce((sum, t) => sum + t.amount, 0);
    const expense = dayTxs.filter((t) => t.type === 'E').reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      net: income - expense,
      count: dayTxs.length,
      isEditable: isWithin7DaysRule(selectedListDate),
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
      const yearTxs = transactions.filter((t) => t.transactionDate.startsWith(yearStr));

      let income = 0;
      let expense = 0;
      const catExpenseTotals: Record<string, number> = {};

      yearTxs.forEach((tx) => {
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
        .map((catId) => {
          const cat = categories.find((c) => c.id === catId);
          const amt = catExpenseTotals[catId];
          return {
            id: catId,
            label: cat ? cat.label : 'Uncategorized',
            icon: cat ? cat.icon : '🏷️',
            amount: amt,
            percentage: expense > 0 ? ((amt / expense) * 100).toFixed(1) : '0',
          };
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      return {
        year: yearNum,
        income,
        expense,
        net,
        topExpenses,
      };
    });

    const avgNetBalance = yearlyDetails.length > 0 ? totalPeriodNet / yearlyDetails.length : 0;
    const maxVal = Math.max(...yearlyDetails.map((d) => Math.max(d.income, d.expense)), 1000);

    return {
      yearlyDetails,
      avgNetBalance,
      maxVal,
      totalPeriodIncome,
      totalPeriodExpense,
      totalPeriodNet,
    };
  }, [transactions, yearlyRange, categories]);

  const yearMonthsSummaryData = useMemo(() => {
    const yearStr = summarySelectedYear.toString();
    const yearTxs = transactions.filter((t) => t.transactionDate.startsWith(yearStr));

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let yearTotalIncome = 0;
    let yearTotalExpense = 0;

    const monthlyBreakdown: MonthlyDetail[] = monthNames.map((monthName, idx) => {
      const monthNumStr = String(idx + 1).padStart(2, '0');
      const monthPrefix = `${yearStr}-${monthNumStr}`;
      const monthTxs = yearTxs.filter((t) => t.transactionDate.startsWith(monthPrefix));

      let income = 0;
      let expense = 0;
      const catExpenseTotals: Record<string, number> = {};

      monthTxs.forEach((tx) => {
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
        .map((catId) => {
          const cat = categories.find((c) => c.id === catId);
          const amt = catExpenseTotals[catId];
          return {
            id: catId,
            label: cat ? cat.label : 'Uncategorized',
            icon: cat ? cat.icon : '🏷️',
            amount: amt,
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
        topExpenses,
      };
    });

    const maxVal = Math.max(...monthlyBreakdown.map((m) => Math.max(m.income, m.expense)), 1000);

    return {
      monthlyBreakdown,
      yearTotalIncome,
      yearTotalExpense,
      yearNetBalance: yearTotalIncome - yearTotalExpense,
      maxVal,
    };
  }, [transactions, summarySelectedYear, categories]);

  const monthSummaryData = useMemo(() => {
    const filtered = transactions.filter((tx) => tx.transactionDate.startsWith(summarySelectedMonth));

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals: Record<string, number> = {};

    filtered.forEach((tx) => {
      if (tx.type === 'I') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }

      const catId = tx.categoryId || 'uncategorized';
      categoryTotals[catId] = (categoryTotals[catId] || 0) + tx.amount;
    });

    const netBalance = totalIncome - totalExpense;

    const breakdown: TopExpenseItem[] = Object.keys(categoryTotals)
      .map((catId) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          id: catId,
          label: cat ? cat.label : 'Uncategorized',
          icon: cat ? cat.icon : '🏷️',
          amount: categoryTotals[catId],
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return {
      totalIncome,
      totalExpense,
      netBalance,
      count: filtered.length,
      breakdown,
    };
  }, [transactions, summarySelectedMonth, categories]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        isEditable={dailySummary.isEditable}
        transactionCount={transactions.length}
      />

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {activeTab === 'quick' && (
          <QuickNotePage
            quickAmount={quickAmount}
            setQuickAmount={setQuickAmount}
            quickType={quickType}
            setQuickType={setQuickType}
            quickCategory={quickCategory}
            setQuickCategory={setQuickCategory}
            quickNote={quickNote}
            setQuickNote={setQuickNote}
            quickDate={quickDate}
            setQuickDate={setQuickDate}
            showMoreDetails={showMoreDetails}
            setShowMoreDetails={setShowMoreDetails}
            handleCreateTransaction={handleCreateTransaction}
            categories={categories}
            transactions={transactions}
            setActiveTab={setActiveTab}
            isWithin7DaysRule={isWithin7DaysRule}
            formatDateString={formatDateString}
          />
        )}

        {activeTab === 'list' && (
          <TransactionListPage
            setActiveTab={setActiveTab}
            selectedListDate={selectedListDate}
            setSelectedListDate={setSelectedListDate}
            shiftListDate={shiftListDate}
            setQuickDate={setQuickDate}
            dailySummary={dailySummary}
            getDaysDifferenceFromToday={getDaysDifferenceFromToday}
            formatDateString={formatDateString}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterType={filterType}
            setFilterType={setFilterType}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            categories={categories}
            filteredTransactions={filteredTransactions}
            isWithin7DaysRule={isWithin7DaysRule}
            setEditingTransaction={setEditingTransaction}
            setDeleteConfirmTx={setDeleteConfirmTx}
          />
        )}

        {activeTab === 'summary' && (
          <SummaryPage
            summaryPeriod={summaryPeriod}
            setSummaryPeriod={setSummaryPeriod}
            hoveredYear={hoveredYear}
            setHoveredYear={setHoveredYear}
            hoveredMonth={hoveredMonth}
            setHoveredMonth={setHoveredMonth}
            summarySelectedMonth={summarySelectedMonth}
            setSummarySelectedMonth={setSummarySelectedMonth}
            summarySelectedYear={summarySelectedYear}
            setSummarySelectedYear={setSummarySelectedYear}
            monthSummaryData={monthSummaryData}
            yearMonthsSummaryData={yearMonthsSummaryData}
            multiYearSummaryData={multiYearSummaryData}
            yearlyRange={yearlyRange}
            setYearlyRange={setYearlyRange}
            tooltipPos={tooltipPos}
            setTooltipPos={setTooltipPos}
            formatDateString={formatDateString}
          />
        )}
      </main>

      {/* Edit Modal Dialog */}
      {editingTransaction && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">Edit Transaction</h3>
              <Button
                variant="ghost"
                size="iconSm"
                icon={<X className="w-5 h-5" />}
                onClick={() => setEditingTransaction(null)}
                aria-label="Close"
              />
            </div>

            <form
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                if (editingTransaction) {
                  handleUpdateTransaction(editingTransaction);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={editingTransaction.type === 'I' ? 'income' : 'outline'}
                  size="md"
                  onClick={() => setEditingTransaction({ ...editingTransaction, type: 'I' })}
                  className="py-2 rounded-lg text-xs"
                >
                  Income
                </Button>
                <Button
                  type="button"
                  variant={editingTransaction.type === 'E' ? 'expense' : 'outline'}
                  size="md"
                  onClick={() => setEditingTransaction({ ...editingTransaction, type: 'E' })}
                  className="py-2 rounded-lg text-xs"
                >
                  Expense
                </Button>
              </div>

              <div>
                <Label htmlFor="edit-amount">Amount ($)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  required
                  value={editingTransaction.amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEditingTransaction({ ...editingTransaction, amount: parseFloat(e.target.value) || 0 })
                  }
                  className="py-2"
                />
              </div>

              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  id="edit-category"
                  value={editingTransaction.categoryId || ''}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setEditingTransaction({ ...editingTransaction, categoryId: e.target.value || null })
                  }
                  className="py-2"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  max={formatDateString(new Date())}
                  value={editingTransaction.transactionDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEditingTransaction({ ...editingTransaction, transactionDate: e.target.value })
                  }
                  className="py-2 font-mono"
                />
              </div>

              <div>
                <Label htmlFor="edit-note">Note</Label>
                <Input
                  id="edit-note"
                  type="text"
                  value={editingTransaction.note || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEditingTransaction({ ...editingTransaction, note: e.target.value })
                  }
                  className="py-2"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setEditingTransaction(null)}
                  className="flex-1 py-2.5 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="income" size="md" className="flex-1 py-2.5 hover:bg-emerald-400">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="p-6 max-w-sm w-full space-y-4 text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Delete Transaction?</h3>
              <p className="text-xs text-slate-400 mt-1">
                This action cannot be undone. Amount:{' '}
                <span className="text-white font-mono font-bold">${deleteConfirmTx.amount.toFixed(2)}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setDeleteConfirmTx(null)}
                className="flex-1 py-2 text-slate-300 font-semibold hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="expense"
                size="md"
                onClick={() => handleDeleteTransaction(deleteConfirmTx)}
                className="flex-1 py-2 hover:bg-rose-600 shadow-md"
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
