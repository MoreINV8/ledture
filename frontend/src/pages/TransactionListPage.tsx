import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, Dispatch, FC, FormEvent, SetStateAction } from "react";
import {
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Unlock,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Edit3,
  Trash2,
  Search,
  FileText,
  X,
} from "lucide-react";
import type {
  Category,
  FilterType,
  Transaction,
} from "../types";
import { Button, Input, Select, Label, Badge, Card, Toast } from "../components";
import { categoryService, transactionService, toTransactionRequest } from "../service";
import { formatDateString, getDaysDifferenceFromToday, isWithin7DaysRule, shiftDate } from "../utils";
import { useToast } from "../hooks/useToast";

export interface TransactionListProps {
  onCreateForDate: (date: string) => void;
  transactions: Transaction[];
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
}

/**
 * Transaction List UI extracted from the main App.
 * All state handling (date navigation, filters, edit/delete) is delegated to the parent via props.
 */
export const TransactionList: FC<TransactionListProps> = ({
  onCreateForDate,
  transactions,
  setTransactions,
}) => {
  const [selectedListDate, setSelectedListDate] = useState(formatDateString(new Date()));
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteConfirmTx, setDeleteConfirmTx] = useState<Transaction | null>(null);
  const { toastMessage, showToast, dismissToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const databaseCategories = await categoryService.listCategories();
        if (!cancelled) setCategories(databaseCategories);
      } catch (error) {
        if (!cancelled) {
          console.error("[Ledture] Could not load categories.", error);
          setCategories([]);
          showToast("Could not load categories from the database.", "error");
        }
      } finally {
        if (!cancelled) setIsLoadingCategories(false);
      }
    };

    void loadCategories();
    return () => { cancelled = true; };
  }, [showToast]);

  const today = formatDateString(new Date());
  const shiftListDate = (days: number) => setSelectedListDate((date) => {
    const shiftedDate = shiftDate(date, days);
    return shiftedDate > today ? today : shiftedDate;
  });

  const handleDateChange = (date: string) => {
    if (date && date <= today) setSelectedListDate(date);
  };

  const filteredTransactions = useMemo(() => transactions.filter((tx) => {
    if (tx.transactionDate !== selectedListDate) return false;
    if (filterType !== "ALL" && tx.type !== filterType) return false;
    if (filterCategory === "UNCATEGORIZED" && tx.categoryId !== null) return false;
    if (filterCategory !== "ALL" && filterCategory !== "UNCATEGORIZED" && tx.categoryId !== filterCategory) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const category = categories.find((item) => item.id === tx.categoryId)?.label.toLowerCase() ?? "uncategorized";
    return category.includes(query) || (tx.note ?? "").toLowerCase().includes(query) || tx.amount.toString().includes(query);
  }), [categories, filterCategory, filterType, searchQuery, selectedListDate, transactions]);

  const dailySummary = useMemo(() => {
    const dayTransactions = transactions.filter((tx) => tx.transactionDate === selectedListDate);
    const income = dayTransactions.filter((tx) => tx.type === "I").reduce((sum, tx) => sum + tx.amount, 0);
    const expense = dayTransactions.filter((tx) => tx.type === "E").reduce((sum, tx) => sum + tx.amount, 0);
    return { income, expense, net: income - expense, count: dayTransactions.length, isEditable: isWithin7DaysRule(selectedListDate) };
  }, [selectedListDate, transactions]);

  const handleUpdateTransaction = async (transaction: Transaction) => {
    if (!isWithin7DaysRule(transaction.transactionDate) || transaction.amount <= 0) {
      showToast("Enter a valid amount and an editable transaction date.", "error");
      return;
    }
    try {
      const updated = await transactionService.update(transaction.id, toTransactionRequest(transaction));
      setTransactions((current) => current.map((tx) => tx.id === updated.id ? updated : tx));
      setEditingTransaction(null);
      showToast("Transaction updated successfully.");
    } catch (error) {
      console.error("[Ledture] Could not update transaction.", error);
      showToast("Could not update the transaction.", "error");
    }
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    try {
      await transactionService.remove(transaction.id);
      setTransactions((current) => current.filter((tx) => tx.id !== transaction.id));
      setDeleteConfirmTx(null);
      showToast("Transaction deleted.", "warning");
    } catch (error) {
      console.error("[Ledture] Could not delete transaction.", error);
      showToast("Could not delete the transaction.", "error");
    }
  };

  const isToday = selectedListDate === today;
  const daysDiff = getDaysDifferenceFromToday(selectedListDate);

  return (
    <div className="space-y-6 animate-fadeIn">
      {toastMessage && <Toast message={toastMessage} onDismiss={dismissToast} />}
      {/* Header & Quick Entry Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Daily Ledger View
          </h2>
          <p className="text-xs text-slate-400">
            View and manage records for a specific day.
          </p>
        </div>
        <Button
          variant="income"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            onCreateForDate(selectedListDate);
          }}
          className="self-start sm:self-auto shadow-md"
        >
          <span>New Record for {selectedListDate}</span>
        </Button>
      </div>

      {/* Date Navigation Overview */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          {/* Date Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="icon"
              icon={<ChevronLeft className="w-5 h-5" />}
              onClick={() => shiftListDate(-1)}
              title="Previous Day"
              aria-label="Previous Day"
            />
            <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
              <Calendar className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
              <input
                type="date"
                value={selectedListDate}
                max={today}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-transparent text-sm font-mono text-slate-100 font-bold outline-none cursor-pointer"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              icon={<ChevronRight className="w-5 h-5" />}
              onClick={() => shiftListDate(1)}
              disabled={isToday}
              title="Next Day"
              aria-label="Next Day"
            />
            <Button
              variant={isToday ? "activeOutline" : "outline"}
              size="sm"
              onClick={() => setSelectedListDate(today)}
            >
              Today
            </Button>
          </div>

          {/* Lock Indicator */}
          <div className="flex items-center gap-2">
            {dailySummary.isEditable ? (
              <Badge
                variant="success"
                icon={<Unlock className="w-3.5 h-3.5" />}
                className="px-3 py-1 text-xs rounded-full"
              >
                Editable Day ({daysDiff === 0 ? "Today" : `${daysDiff}d ago`})
              </Badge>
            ) : (
              <Badge
                variant="warning"
                icon={<Lock className="w-3.5 h-3.5" />}
                className="px-3 py-1 text-xs rounded-full"
              >
                Locked Day (&gt; 7d old)
              </Badge>
            )}
          </div>
        </div>

        {/* Totals Summary */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <Card className="bg-slate-950/60 p-3 rounded-xl border-slate-800/80 shadow-none">
            <p className="text-[10px] uppercase font-mono text-slate-400">
              Day Income
            </p>
            <p className="text-sm md:text-base font-bold font-mono text-emerald-400 mt-0.5">
              +฿{dailySummary.income.toFixed(2)}
            </p>
          </Card>
          <Card className="bg-slate-950/60 p-3 rounded-xl border-slate-800/80 shadow-none">
            <p className="text-[10px] uppercase font-mono text-slate-400">
              Day Expense
            </p>
            <p className="text-sm md:text-base font-bold font-mono text-rose-400 mt-0.5">
              -฿{dailySummary.expense.toFixed(2)}
            </p>
          </Card>
          <Card className="bg-slate-950/60 p-3 rounded-xl border-slate-800/80 shadow-none">
            <p className="text-[10px] uppercase font-mono text-slate-400">
              Daily Net
            </p>
            <p
              className={`text-sm md:text-base font-bold font-mono mt-0.5 ${dailySummary.net >= 0 ? "text-teal-400" : "text-rose-400"}`}
            >
              {dailySummary.net >= 0 ? "+" : ""}฿{dailySummary.net.toFixed(2)}
            </p>
          </Card>
        </div>
      </Card>

      {/* Search and Category Filters */}
      <Card className="p-4 space-y-3">
        <Input
          type="text"
          placeholder="Search in this day's notes, category or amount..."
          icon={<Search className="w-4 h-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="py-2"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="py-1.5 text-xs rounded-lg"
          >
            <option value="ALL">All Types (Income &amp; Expense)</option>
            <option value="I">Income Only</option>
            <option value="E">Expense Only</option>
          </Select>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            disabled={isLoadingCategories}
            className="py-1.5 text-xs rounded-lg"
          >
            <option value="ALL">{isLoadingCategories ? "Loading Categories…" : "All Categories"}</option>
            <option value="UNCATEGORIZED">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Transaction List Table */}
      {filteredTransactions.length === 0 ? (
        <Card className="text-center py-12 bg-slate-900/40 border-slate-800 rounded-2xl space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">
            No transactions recorded for {selectedListDate}.
          </p>
          {dailySummary.isEditable && (
            <Button
              variant="ghost"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                onCreateForDate(selectedListDate);
              }}
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs"
            >
              <span>Add Transaction for {selectedListDate}</span>
            </Button>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
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
                  const cat = categories.find((c) => c.id === tx.categoryId);
                  const isEditable = isWithin7DaysRule(tx.transactionDate);
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono">
                        {isEditable ? (
                          <Badge
                            variant="success"
                            icon={<Unlock className="w-2.5 h-2.5" />}
                            title="Editable: Within 7 days limit"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="neutral"
                            icon={<Lock className="w-2.5 h-2.5" />}
                            title="Locked: Older than 7 days"
                          >
                            Locked
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {tx.type === "I" ? (
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
                          <Badge
                            variant="neutral"
                            className="text-slate-200 rounded-md"
                          >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </Badge>
                        ) : (
                          <span className="text-slate-500 italic">
                            Uncategorized
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                        {tx.note || <span className="text-slate-600">—</span>}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm">
                        <span
                          className={
                            tx.type === "I"
                              ? "text-emerald-400"
                              : "text-slate-200"
                          }
                        >
                          {tx.type === "I" ? "+" : "-"}฿{tx.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEditable ? (
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="iconSm"
                              icon={<Edit3 className="w-3.5 h-3.5" />}
                              onClick={() => setEditingTransaction(tx)}
                              title="Edit Transaction"
                              aria-label="Edit Transaction"
                              className="hover:text-emerald-400"
                            />
                            <Button
                              variant="ghost"
                              size="iconSm"
                              icon={<Trash2 className="w-3.5 h-3.5" />}
                              onClick={() => setDeleteConfirmTx(tx)}
                              title="Delete Transaction"
                              aria-label="Delete Transaction"
                              className="hover:text-rose-400"
                            />
                          </div>
                        ) : (
                          <span
                            className="text-[10px] text-slate-500 font-mono"
                            title="Modifications blocked (> 7 days)"
                          >
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
        </Card>
      )}

      {editingTransaction && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white">Edit Transaction</h3>
              <Button variant="ghost" size="iconSm" icon={<X className="w-5 h-5" />} onClick={() => setEditingTransaction(null)} aria-label="Close" />
            </div>
            <form noValidate onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void handleUpdateTransaction(editingTransaction); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant={editingTransaction.type === "I" ? "income" : "outline"} size="md" onClick={() => setEditingTransaction({ ...editingTransaction, type: "I" })} className="py-2 rounded-lg text-xs">Income</Button>
                <Button type="button" variant={editingTransaction.type === "E" ? "expense" : "outline"} size="md" onClick={() => setEditingTransaction({ ...editingTransaction, type: "E" })} className="py-2 rounded-lg text-xs">Expense</Button>
              </div>
              <div>
                <Label htmlFor="edit-amount">Amount (฿)</Label>
                <Input id="edit-amount" type="number" step="0.01" value={editingTransaction.amount} onChange={(event: ChangeEvent<HTMLInputElement>) => setEditingTransaction({ ...editingTransaction, amount: Number.parseFloat(event.target.value) || 0 })} className="py-2" />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select id="edit-category" value={editingTransaction.categoryId || ""} onChange={(event: ChangeEvent<HTMLSelectElement>) => setEditingTransaction({ ...editingTransaction, categoryId: event.target.value || null })} className="py-2" disabled={isLoadingCategories}>
                  <option value="">Uncategorized</option>
                  {categories.filter((category) => category.type === editingTransaction.type).map((category) => <option key={category.id} value={category.id}>{category.icon} {category.label}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-date">Date</Label>
                <Input id="edit-date" type="date" max={formatDateString(new Date())} value={editingTransaction.transactionDate} onChange={(event: ChangeEvent<HTMLInputElement>) => setEditingTransaction({ ...editingTransaction, transactionDate: event.target.value })} className="py-2 font-mono" />
              </div>
              <div>
                <Label htmlFor="edit-note">Note</Label>
                <Input id="edit-note" type="text" value={editingTransaction.note || ""} onChange={(event: ChangeEvent<HTMLInputElement>) => setEditingTransaction({ ...editingTransaction, note: event.target.value })} className="py-2" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" size="md" onClick={() => setEditingTransaction(null)} className="flex-1 py-2.5">Cancel</Button>
                <Button type="submit" variant="income" size="md" className="flex-1 py-2.5">Save Changes</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {deleteConfirmTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="p-6 max-w-sm w-full space-y-4 text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto"><Trash2 className="w-6 h-6" /></div>
            <div>
              <h3 className="font-bold text-base text-white">Delete Transaction?</h3>
              <p className="text-xs text-slate-400 mt-1">This action cannot be undone. Amount: <span className="text-white font-mono font-bold">฿{deleteConfirmTx.amount.toFixed(2)}</span></p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="md" onClick={() => setDeleteConfirmTx(null)} className="flex-1 py-2">Cancel</Button>
              <Button type="button" variant="expense" size="md" onClick={() => void handleDeleteTransaction(deleteConfirmTx)} className="flex-1 py-2">Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
