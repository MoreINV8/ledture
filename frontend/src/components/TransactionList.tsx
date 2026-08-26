import type { FC } from 'react';
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
} from 'lucide-react';
import type {
  ActiveTab,
  Category,
  DailySummary,
  FilterType,
  Transaction,
} from '../types';
import { Button, Input, Select, Badge, Card } from './ui';

export interface TransactionListProps {
  setActiveTab: (tab: ActiveTab) => void;
  selectedListDate: string;
  setSelectedListDate: (date: string) => void;
  shiftListDate: (days: number) => void;
  setQuickDate: (date: string) => void;
  dailySummary: DailySummary;
  getDaysDifferenceFromToday: (date: string) => number;
  formatDateString: (date: Date | string) => string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterType: FilterType;
  setFilterType: (t: FilterType) => void;
  filterCategory: string;
  setFilterCategory: (c: string) => void;
  categories: Category[];
  filteredTransactions: Transaction[];
  isWithin7DaysRule: (dateStr: string) => boolean;
  setEditingTransaction: (tx: Transaction) => void;
  setDeleteConfirmTx: (tx: Transaction) => void;
}

/**
 * Transaction List UI extracted from the main App.
 * All state handling (date navigation, filters, edit/delete) is delegated to the parent via props.
 */
export const TransactionList: FC<TransactionListProps> = ({
  setActiveTab,
  selectedListDate,
  setSelectedListDate,
  shiftListDate,
  setQuickDate,
  dailySummary,
  getDaysDifferenceFromToday,
  formatDateString,
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  filterCategory,
  setFilterCategory,
  categories,
  filteredTransactions,
  isWithin7DaysRule,
  setEditingTransaction,
  setDeleteConfirmTx,
}) => {
  const isToday = selectedListDate === formatDateString(new Date());
  const daysDiff = getDaysDifferenceFromToday(selectedListDate);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Quick Entry Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Daily Ledger View</h2>
          <p className="text-xs text-slate-400">View and manage records for a specific day.</p>
        </div>
        <Button
          variant="income"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setQuickDate(selectedListDate);
            setActiveTab('quick');
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
                onChange={(e) => e.target.value && setSelectedListDate(e.target.value)}
                className="bg-transparent text-sm font-mono text-slate-100 font-bold outline-none cursor-pointer"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              icon={<ChevronRight className="w-5 h-5" />}
              onClick={() => shiftListDate(1)}
              title="Next Day"
              aria-label="Next Day"
            />
            <Button
              variant={isToday ? 'activeOutline' : 'outline'}
              size="sm"
              onClick={() => setSelectedListDate(formatDateString(new Date()))}
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
                Editable Day ({daysDiff === 0 ? 'Today' : `${daysDiff}d ago`})
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
            <p className="text-[10px] uppercase font-mono text-slate-400">Day Income</p>
            <p className="text-sm md:text-base font-bold font-mono text-emerald-400 mt-0.5">
              +${dailySummary.income.toFixed(2)}
            </p>
          </Card>
          <Card className="bg-slate-950/60 p-3 rounded-xl border-slate-800/80 shadow-none">
            <p className="text-[10px] uppercase font-mono text-slate-400">Day Expense</p>
            <p className="text-sm md:text-base font-bold font-mono text-rose-400 mt-0.5">
              -${dailySummary.expense.toFixed(2)}
            </p>
          </Card>
          <Card className="bg-slate-950/60 p-3 rounded-xl border-slate-800/80 shadow-none">
            <p className="text-[10px] uppercase font-mono text-slate-400">Daily Net</p>
            <p className={`text-sm md:text-base font-bold font-mono mt-0.5 ${dailySummary.net >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
              {dailySummary.net >= 0 ? '+' : ''}${dailySummary.net.toFixed(2)}
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
            className="py-1.5 text-xs rounded-lg"
          >
            <option value="ALL">All Categories</option>
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
          <p className="text-sm text-slate-400 font-medium">No transactions recorded for {selectedListDate}.</p>
          {dailySummary.isEditable && (
            <Button
              variant="ghost"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setQuickDate(selectedListDate);
                setActiveTab('quick');
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
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono">
                        {isEditable ? (
                          <Badge variant="success" icon={<Unlock className="w-2.5 h-2.5" />} title="Editable: Within 7 days limit">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="neutral" icon={<Lock className="w-2.5 h-2.5" />} title="Locked: Older than 7 days">
                            Locked
                          </Badge>
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
                          <Badge variant="neutral" className="text-slate-200 rounded-md">
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </Badge>
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
        </Card>
      )}
    </div>
  );
};

export default TransactionList;
