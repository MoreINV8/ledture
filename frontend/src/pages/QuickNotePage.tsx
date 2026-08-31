import { useEffect, useState } from "react";
import type { Dispatch, FC, FormEvent, SetStateAction } from "react";
import {
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  ChevronUp,
  ChevronDown,
  Check,
  Lock,
  LoaderCircle,
} from "lucide-react";
import type {
  ActiveTab,
  Category,
  Transaction,
  TransactionType,
} from "../types";
import { PRESET_AMOUNTS, PRESET_NEGATIVE_AMOUNTS } from "../constants";
import {
  Button,
  Input,
  Select,
  Label,
  Badge,
  Card,
  Toast,
} from "../components";
import { transactionService, toTransactionRequest } from "../service";
import {
  formatDateString,
  getMinimumRuleDate,
  isWithin7DaysRule,
} from "../utils/date";
import { useToast } from "../hooks/useToast";

export interface QuickNoteProps {
  categories: Category[];
  transactions: Transaction[];
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
  setActiveTab: (tab: ActiveTab) => void;
  initialDate?: string;
}

/**
 * Quick Note UI extracted from the main App.
 * All state management is delegated to the parent via props.
 */
export const QuickNote: FC<QuickNoteProps> = ({
  categories,
  transactions,
  setTransactions,
  setActiveTab,
  initialDate,
}) => {
  const [quickAmount, setQuickAmount] = useState("");
  const [quickType, setQuickType] = useState<TransactionType>("E");
  const [quickCategory, setQuickCategory] = useState("");
  const [quickNote, setQuickNote] = useState("");
  const [quickDate, setQuickDate] = useState(
    initialDate ?? formatDateString(new Date()),
  );
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toastMessage, showToast, dismissToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    const loadRecentTransactions = async () => {
      setIsLoadingRecent(true);
      try {
        const recent = await transactionService.listRecent(3);
        if (!cancelled) setRecentTransactions(recent);
      } catch (error) {
        if (!cancelled) {
          console.warn("[Ledture] Could not load recent transactions.", error);
          setRecentTransactions([]);
        }
      } finally {
        if (!cancelled) setIsLoadingRecent(false);
      }
    };

    void loadRecentTransactions();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateTransaction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number.parseFloat(quickAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      showToast("Amount is required and must be greater than 0.", "error");
      return;
    }

    const transactionDate = quickDate || formatDateString(new Date());
    if (!isWithin7DaysRule(transactionDate)) {
      showToast("Cannot record a transaction older than 7 days.", "error");
      return;
    }

    const draft: Transaction = {
      id: `tx-${Date.now()}`,
      amount,
      type: quickType,
      transactionDate,
      categoryId: quickCategory || null,
      note: quickNote.trim() || null,
      createdAt: new Date().toISOString(),
    };

    setIsSaving(true);
    try {
      const saved = await transactionService.create(
        toTransactionRequest(draft),
      );
      setTransactions((current) => [
        saved,
        ...current.filter((tx) => tx.id !== saved.id),
      ]);
      setRecentTransactions((current) =>
        [saved, ...current.filter((tx) => tx.id !== saved.id)].slice(0, 3),
      );
      setQuickAmount("");
      setQuickNote("");
      setQuickDate(formatDateString(new Date()));
      setShowMoreDetails(false);
      showToast(
        `Recorded ${quickType === "I" ? "Income" : "Expense"} of ฿${amount.toFixed(2)} successfully.`,
      );
    } catch (error) {
      console.error("[Ledture] Could not save transaction.", error);
      showToast("Could not save the transaction. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const increaseAmount = (operateAmt: number, quickAmt: string) => {
    let currentAmt = Number.isNaN(Number(quickAmt)) ? 0 : Number(quickAmt);

    currentAmt += operateAmt;
    setQuickAmount(currentAmt.toString());
  };

  const decreaseAmount = (operateAmt: number, quickAmt: string) => {
    let currentAmt = Number.isNaN(Number(quickAmt)) ? 0 : Number(quickAmt);

    currentAmt = currentAmt - operateAmt < 0 ? 0 : currentAmt - operateAmt;
    setQuickAmount(currentAmt > 0 ? currentAmt.toString() : "");
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">
      {toastMessage && (
        <Toast message={toastMessage} onDismiss={dismissToast} />
      )}
      {/* Page Header */}
      <div className="text-center space-y-1">
        <Badge
          variant="success"
          icon={<Zap className="w-3.5 h-3.5" />}
          className="px-3 py-1 text-xs rounded-full"
        >
          Express Recording Mode
        </Badge>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Record Transaction
        </h2>
        <p className="text-xs text-slate-400">
          Log income or expense instantly to avoid forgetting later.
        </p>
      </div>

      {/* Main Fast-Record Card */}
      <Card className="p-6 space-y-6">
        <form
          onSubmit={handleCreateTransaction}
          className="space-y-6"
          noValidate
        >
          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <Button
              type="button"
              variant={quickType === "I" ? "income" : "ghost"}
              size="lg"
              icon={<ArrowUpRight className="w-4 h-4 stroke-[3]" />}
              onClick={() => setQuickType("I")}
              className="py-3 rounded-lg text-sm"
            >
              <span>Income</span>
            </Button>
            <Button
              type="button"
              variant={quickType === "E" ? "expense" : "ghost"}
              size="lg"
              icon={<ArrowDownRight className="w-4 h-4 stroke-[3]" />}
              onClick={() => setQuickType("E")}
              className="py-3 rounded-lg text-sm"
            >
              <span>Expense</span>
            </Button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label required hint="Required &gt; ฿0">
              AMOUNT
            </Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              autoFocus
              variant="amount"
              prefix="฿"
              value={quickAmount}
              onChange={(e) => setQuickAmount(e.target.value)}
            />
            {/* Quick preset amount buttons */}
            <div className="flex">
              <div className="flex flex-col flex-wrap gap-2 pt-1">
                <div className="flex flex-wrap gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      variant="subtle"
                      size="sm"
                      onClick={() => increaseAmount(amt, quickAmount)}
                      className="font-mono"
                    >
                      +฿{amt}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap">
                  {PRESET_NEGATIVE_AMOUNTS.map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      variant="subtle"
                      size="sm"
                      onClick={() => decreaseAmount(amt, quickAmount)}
                      className="font-mono"
                    >
                      -฿{amt}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap">
              <Button
                type="button"
                variant="subtle"
                size="sm"
                onClick={() => setQuickAmount("")}
                className="ml-auto bg-slate-800/30 text-slate-500 border-slate-800"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Collapsible Details */}
          <div className="border-t border-slate-800/80 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowMoreDetails(!showMoreDetails)}
              className="w-full justify-between py-2 text-xs font-semibold"
            >
              <span className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />
                {showMoreDetails
                  ? "Hide Optional Details"
                  : "More Details (Category, Note, Date)"}
              </span>
              {showMoreDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            {showMoreDetails && (
              <div className="mt-4 space-y-4 pt-2 border-t border-slate-800/40 animate-fadeIn">
                {/* Category Selection */}
                <div>
                  <Label htmlFor="quick-category">Category (Optional)</Label>
                  <div className="relative">
                    <Select
                      className="select"
                      id="quick-category"
                      value={quickCategory}
                      onChange={(e) => setQuickCategory(e.target.value)}
                    >
                      <option value="">Uncategorized (None)</option>
                      {categories
                        .filter((c) => c.type === quickType)
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                    </Select>
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <Label
                    htmlFor="quick-date"
                    hint="Max 7 days in past"
                    hintClassName="text-amber-400"
                  >
                    Transaction Date
                  </Label>
                  <Input
                    id="quick-date"
                    type="date"
                    value={quickDate}
                    max={formatDateString(new Date())}
                    min={formatDateString(getMinimumRuleDate())}
                    onChange={(e) => setQuickDate(e.target.value)}
                    className="font-mono"
                  />
                </div>

                {/* Note Field */}
                <div>
                  <Label htmlFor="quick-note">Note / Description</Label>
                  <Input
                    id="quick-note"
                    type="text"
                    placeholder="e.g. Groceries at Trader Joe's"
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={
              isSaving ? (
                <LoaderCircle className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5 stroke-[3]" />
              )
            }
            className="py-4 text-base"
            disabled={isSaving}
          >
            <span>{isSaving ? "Saving…" : "Save Transaction"}</span>
          </Button>
        </form>
      </Card>

      {/* Quick Recent Activity */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
          <span>RECENT ENTRIES</span>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("list")}
            className="text-emerald-400 hover:underline gap-1"
          >
            View All ({transactions.length})
          </Button>
        </div>
        <div className="space-y-2">
          {isLoadingRecent && (
            <Card className="p-4 flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-900/60 shadow-none">
              <LoaderCircle className="w-4 h-4 animate-spin text-emerald-400" />
              Loading recent entries…
            </Card>
          )}
          {!isLoadingRecent && recentTransactions.length === 0 && (
            <Card className="p-4 text-center text-xs text-slate-500 bg-slate-900/60 shadow-none">
              No recent transactions yet.
            </Card>
          )}
          {!isLoadingRecent &&
            recentTransactions.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const editable = isWithin7DaysRule(tx.transactionDate);
              return (
                <Card
                  key={tx.id}
                  className="p-3 flex items-center justify-between text-xs bg-slate-900/60 border-slate-800/80 shadow-none"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        tx.type === "I"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {cat ? cat.icon : tx.type === "I" ? "+" : "-"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">
                        {cat ? cat.label : "Uncategorized"}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {tx.transactionDate} {tx.note ? `• ${tx.note}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span
                      className={`font-mono font-bold text-sm ${tx.type === "I" ? "text-emerald-400" : "text-slate-200"}`}
                    >
                      {tx.type === "I" ? "+" : "-"}฿{tx.amount.toFixed(2)}
                    </span>
                    {!editable && (
                      <span title="Locked (> 7 days old)">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default QuickNote;
