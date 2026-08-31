import { useMemo, useState } from "react";
import type { FC, MouseEvent } from "react";
import {
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
} from "lucide-react";
import type {
  SummaryPeriod,
  MonthSummaryData,
  MultiYearSummaryData,
  MonthlyDetail,
  TooltipPos,
  YearMonthsSummaryData,
  YearlyDetail,
  Category,
  Transaction,
} from "../types";
import { YEARLY_RANGE_OPTIONS } from "../constants";
import { Button, Input, Select, Card, Badge } from "../components";
import { formatDateString } from "../utils";

/* ------------------------------- Props Shape ------------------------------ */
export interface SummaryProps {
  summaryPeriod: SummaryPeriod;
  setSummaryPeriod: (period: SummaryPeriod) => void;

  hoveredYear: YearlyDetail | null;
  setHoveredYear: (year: YearlyDetail | null) => void;
  hoveredMonth: MonthlyDetail | null;
  setHoveredMonth: (month: MonthlyDetail | null) => void;

  summarySelectedMonth: string;
  setSummarySelectedMonth: (month: string) => void;
  summarySelectedYear: number;
  setSummarySelectedYear: (year: number) => void;

  monthSummaryData: MonthSummaryData;
  yearMonthsSummaryData: YearMonthsSummaryData;
  multiYearSummaryData: MultiYearSummaryData;

  yearlyRange: number;
  setYearlyRange: (range: number) => void;
  availableYearCount: number;

  tooltipPos: TooltipPos;
  setTooltipPos: (pos: TooltipPos) => void;

  formatDateString: (date: Date | string) => string;
}

const PERIOD_BUTTONS: Array<{ value: SummaryPeriod; label: string }> = [
  { value: "MONTH", label: "Monthly" },
  { value: "YEAR_MONTHS", label: "By Month" },
  { value: "YEAR", label: "By Year" },
];

/**
 * Summary component extracted from the main App (`exe.tsx`).
 * Displays the monthly / month-by-month / multi-year analytics views.
 */
export const Summary: FC<SummaryProps> = ({
  summaryPeriod,
  setSummaryPeriod,
  hoveredYear,
  setHoveredYear,
  hoveredMonth,
  setHoveredMonth,
  summarySelectedMonth,
  setSummarySelectedMonth,
  summarySelectedYear,
  setSummarySelectedYear,
  monthSummaryData,
  yearMonthsSummaryData,
  multiYearSummaryData,
  yearlyRange,
  setYearlyRange,
  availableYearCount,
  tooltipPos,
  setTooltipPos,
  formatDateString,
}) => {
  const selectPeriod = (period: SummaryPeriod) => {
    setSummaryPeriod(period);
    setHoveredYear(null);
    setHoveredMonth(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Financial Summary
          </h2>
          <p className="text-xs text-slate-400">
            Monthly breakdown and multi-year comparative analytics.
          </p>
        </div>

        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto gap-1">
          {PERIOD_BUTTONS.map(({ value, label }) => (
            <Button
              key={value}
              variant={summaryPeriod === value ? "income" : "ghost"}
              size="sm"
              onClick={() => selectPeriod(value)}
              className="py-1.5 rounded-lg text-xs shadow-md"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* TAB 3.1: MONTHLY SUMMARY */}
      {summaryPeriod === "MONTH" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Month Picker Control */}
          <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold text-white">Select Month</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="month"
                value={summarySelectedMonth}
                onChange={(e) =>
                  e.target.value && setSummarySelectedMonth(e.target.value)
                }
                className="py-1.5 text-xs font-mono font-bold"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSummarySelectedMonth(
                    formatDateString(new Date()).substring(0, 7),
                  )
                }
              >
                Current Month
              </Button>
            </div>
          </Card>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Income
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
                +฿{monthSummaryData.totalIncome.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {summarySelectedMonth}
              </p>
            </Card>

            <Card className="p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Expense
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-black text-rose-400 font-mono">
                -฿{monthSummaryData.totalExpense.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {summarySelectedMonth}
              </p>
            </Card>

            <Card className="p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Net Balance
                </span>
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p
                className={`text-2xl md:text-3xl font-black font-mono ${monthSummaryData.netBalance >= 0 ? "text-teal-400" : "text-rose-400"}`}
              >
                {monthSummaryData.netBalance >= 0 ? "+" : ""}฿
                {monthSummaryData.netBalance.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Income minus expenses
              </p>
            </Card>
          </div>

          {/* Category Distribution Breakdown Chart */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>Category Breakdown ({summarySelectedMonth})</span>
            </h3>
            {monthSummaryData.breakdown.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No transactions recorded for this month.
              </p>
            ) : (
              <div className="space-y-3">
                {monthSummaryData.breakdown.map((item) => {
                  const totalSum =
                    monthSummaryData.totalIncome +
                    monthSummaryData.totalExpense;
                  const percentage =
                    totalSum > 0
                      ? ((item.amount / totalSum) * 100).toFixed(1)
                      : "0";
                  return (
                    <div key={item.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-300 font-medium">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </span>
                        <span className="font-mono text-slate-200 font-semibold">
                          ฿{item.amount.toFixed(2)} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(Number(percentage), 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 3.2: MONTH-BY-MONTH COMPARISON IN A YEAR */}
      {summaryPeriod === "YEAR_MONTHS" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Year Selector */}
          <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold text-white">
                Monthly Comparison in {summarySelectedYear}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Target Year:</span>
              <Select
                value={summarySelectedYear}
                onChange={(e) =>
                  setSummarySelectedYear(parseInt(e.target.value))
                }
                className="py-1.5 text-xs font-mono font-bold"
              >
                {Array.from(
                  { length: 11 },
                  (_, i) => new Date().getFullYear() - i,
                ).map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </Select>
            </div>
          </Card>

          {/* Bar Chart Surface */}
          <div
            onMouseMove={(e: MouseEvent<HTMLDivElement>) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltipPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Income vs Expense Across Months
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Yearly Total Net:{" "}
                  <span
                    className={`font-mono font-bold ${yearMonthsSummaryData.yearNetBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {yearMonthsSummaryData.yearNetBalance >= 0 ? "+" : ""}฿
                    {yearMonthsSummaryData.yearNetBalance.toFixed(2)}
                  </span>
                </p>
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
                const incPct = Math.min(
                  100,
                  Math.max(4, (m.income / yearMonthsSummaryData.maxVal) * 100),
                );
                const expPct = Math.min(
                  100,
                  Math.max(4, (m.expense / yearMonthsSummaryData.maxVal) * 100),
                );
                const isHovered = hoveredMonth?.monthName === m.monthName;
                return (
                  <div
                    key={m.monthName}
                    onMouseEnter={() => setHoveredMonth(m)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className={`flex flex-col items-center justify-end h-full group p-1 cursor-pointer rounded-lg transition-all ${
                      isHovered
                        ? "bg-slate-800/90 ring-1 ring-emerald-500/50"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      {m.income > 0 && (
                        <div className="w-1/2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-200 group-hover:brightness-125" style={{ height: `${incPct}%` }} />
                      )}
                      {m.expense > 0 && (
                        <div className="w-1/2 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-sm transition-all duration-200 group-hover:brightness-125" style={{ height: `${expPct}%` }} />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold mt-2 truncate w-full text-center transition-colors ${isHovered ? "text-emerald-400 scale-110" : "text-slate-400"}`}
                    >
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
                    <span>
                      {hoveredMonth.monthName} {summarySelectedYear}
                    </span>
                  </span>
                  <Badge
                    variant={hoveredMonth.net >= 0 ? "success" : "error"}
                    className="text-[10px]"
                  >
                    Net: {hoveredMonth.net >= 0 ? "+" : ""}฿
                    {hoveredMonth.net.toFixed(0)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">
                      INCOME
                    </span>
                    <span className="text-emerald-400 font-bold">
                      +฿{hoveredMonth.income.toFixed(0)}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">
                      EXPENSE
                    </span>
                    <span className="text-rose-400 font-bold">
                      -฿{hoveredMonth.expense.toFixed(0)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Top Expenses
                  </p>
                  {hoveredMonth.topExpenses.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">
                      No expenses recorded
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {hoveredMonth.topExpenses.map((cat, idx) => (
                        <div
                          key={cat.id}
                          className="bg-slate-900/90 p-1 rounded flex items-center justify-between text-[11px]"
                        >
                          <span className="flex items-center gap-1">
                            <span className="text-[9px] font-mono text-slate-500">
                              #{idx + 1}
                            </span>
                            <span>{cat.icon}</span>
                            <span className="text-slate-200 truncate max-w-[85px]">
                              {cat.label}
                            </span>
                          </span>
                          <span className="font-mono font-semibold text-slate-100">
                            ฿{cat.amount.toFixed(0)}
                          </span>
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

      {/* TAB 3.3: MULTI-YEAR COMPARISON */}
      {summaryPeriod === "YEAR" && (
        <div className="space-y-6">
          {/* Year Range Selector */}
          <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold text-white">
                Yearly Comparison Range
              </span>
            </div>
            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              {YEARLY_RANGE_OPTIONS.map((num) => (
                <Button
                  key={num}
                  variant={yearlyRange === num ? "income" : "ghost"}
                  size="sm"
                  disabled={num > availableYearCount}
                  title={num > availableYearCount ? `Only ${availableYearCount} year${availableYearCount === 1 ? "" : "s"} of data available` : `Show ${num} years of data`}
                  onClick={() => {
                    setYearlyRange(num);
                    setHoveredYear(null);
                  }}
                  className="py-1.5 rounded-lg text-xs font-mono shadow-md"
                >
                  {num} Years
                </Button>
              ))}
            </div>
          </Card>

          {/* Graph Container */}
          <div
            onMouseMove={(e: MouseEvent<HTMLDivElement>) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltipPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 relative overflow-hidden"
          >
            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Multi-Year Performance Trend</span>
                  <Badge
                    variant="success"
                    className="text-xs font-mono font-normal px-2 py-0.5 rounded-full"
                  >
                    {multiYearSummaryData.yearlyDetails.length} {multiYearSummaryData.yearlyDetails.length === 1 ? "Year" : "Years"} of Data
                  </Badge>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hover over any year to inspect top 3 expense categories.
                </p>
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
                  top: `${Math.max(10, Math.min(90, 100 - (multiYearSummaryData.avgNetBalance / multiYearSummaryData.maxVal) * 80))}%`,
                }}
              >
                <span className="bg-slate-950/90 text-teal-300 text-[10px] font-mono px-2 py-0.5 rounded border border-teal-500/30 font-bold backdrop-blur">
                  Avg Balance: ฿
                  {multiYearSummaryData.avgNetBalance.toLocaleString(
                    undefined,
                    { maximumFractionDigits: 0 },
                  )}
                </span>
              </div>

              {/* Bars Container */}
              <div className="flex items-end justify-center gap-2 md:gap-4 h-64 border-b border-slate-800 pb-2 relative z-0">
                {multiYearSummaryData.yearlyDetails.map((item) => {
                  const incPct = Math.min(
                    100,
                    Math.max(
                      5,
                      (item.income / multiYearSummaryData.maxVal) * 100,
                    ),
                  );
                  const expPct = Math.min(
                    100,
                    Math.max(
                      5,
                      (item.expense / multiYearSummaryData.maxVal) * 100,
                    ),
                  );
                  const isHovered = hoveredYear?.year === item.year;
                  return (
                    <div
                      key={item.year}
                      onMouseEnter={() => setHoveredYear(item)}
                      onMouseLeave={() => setHoveredYear(null)}
                      className={`flex flex-col items-center justify-end h-full group cursor-pointer p-1 rounded-xl transition-all max-w-[64px] w-full ${
                        isHovered
                          ? "bg-slate-800/80 ring-1 ring-emerald-500/50"
                          : "hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="w-full flex items-end justify-center gap-1 h-full px-1">
                        {item.income > 0 && (
                          <div className="w-1/2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-300 group-hover:brightness-125" style={{ height: `${incPct}%` }} />
                        )}
                        {item.expense > 0 && (
                          <div className="w-1/2 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-sm transition-all duration-300 group-hover:brightness-125" style={{ height: `${expPct}%` }} />
                        )}
                      </div>
                      <span
                        className={`text-xs font-mono font-bold mt-2 transition-colors ${isHovered ? "text-emerald-400 scale-105" : "text-slate-400"}`}
                      >
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
                  <Badge
                    variant={hoveredYear.net >= 0 ? "success" : "error"}
                    className="text-[10px]"
                  >
                    Net: {hoveredYear.net >= 0 ? "+" : ""}฿
                    {hoveredYear.net.toFixed(0)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">
                      INCOME
                    </span>
                    <span className="text-emerald-400 font-bold">
                      +฿{hoveredYear.income.toFixed(0)}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">
                      EXPENSE
                    </span>
                    <span className="text-rose-400 font-bold">
                      -฿{hoveredYear.expense.toFixed(0)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Top 3 Expenses
                  </p>
                  {hoveredYear.topExpenses.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">
                      No expenses recorded
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {hoveredYear.topExpenses.map((cat, idx) => (
                        <div
                          key={cat.id}
                          className="bg-slate-900/90 p-1 rounded flex items-center justify-between text-[11px]"
                        >
                          <span className="flex items-center gap-1">
                            <span className="text-[9px] font-mono text-slate-500">
                              #{idx + 1}
                            </span>
                            <span>{cat.icon}</span>
                            <span className="text-slate-200 truncate max-w-[90px]">
                              {cat.label}
                            </span>
                          </span>
                          <span className="font-mono font-semibold text-slate-100">
                            ฿{cat.amount.toFixed(0)}
                          </span>
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
  );
};

export interface SummaryPageProps {
  categories: Category[];
  transactions: Transaction[];
}

const SummaryPage: FC<SummaryPageProps> = ({ categories, transactions }) => {
  const [summaryPeriod, setSummaryPeriod] = useState<SummaryPeriod>("MONTH");
  const [hoveredYear, setHoveredYear] = useState<YearlyDetail | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyDetail | null>(null);
  const [summarySelectedMonth, setSummarySelectedMonth] = useState(formatDateString(new Date()).slice(0, 7));
  const [summarySelectedYear, setSummarySelectedYear] = useState(new Date().getFullYear());
  const [yearlyRange, setYearlyRange] = useState(3);
  const [tooltipPos, setTooltipPos] = useState<TooltipPos>({ x: 0, y: 0 });

  const availableYears = useMemo(() => Array.from(new Set(
    transactions.map((transaction) => Number(transaction.transactionDate.slice(0, 4))),
  )).filter(Number.isFinite).sort((a, b) => a - b), [transactions]);

  const monthSummaryData = useMemo<MonthSummaryData>(() => {
    const filtered = transactions.filter((tx) => tx.transactionDate.startsWith(summarySelectedMonth));
    const totalIncome = filtered.filter((tx) => tx.type === "I").reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpense = filtered.filter((tx) => tx.type === "E").reduce((sum, tx) => sum + tx.amount, 0);
    const categoryTotals = filtered.reduce<Record<string, number>>((totals, tx) => {
      const categoryId = tx.categoryId ?? "uncategorized";
      totals[categoryId] = (totals[categoryId] ?? 0) + tx.amount;
      return totals;
    }, {});
    const breakdown = Object.entries(categoryTotals).map(([id, amount]) => {
      const category = categories.find((item) => item.id === id);
      return { id, label: category?.label ?? "Uncategorized", icon: category?.icon ?? "🏷️", amount };
    }).sort((a, b) => b.amount - a.amount);
    return { totalIncome, totalExpense, netBalance: totalIncome - totalExpense, count: filtered.length, breakdown };
  }, [categories, summarySelectedMonth, transactions]);

  const yearMonthsSummaryData = useMemo<YearMonthsSummaryData>(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let yearTotalIncome = 0;
    let yearTotalExpense = 0;
    const monthlyBreakdown = months.map((monthName, index) => {
      const monthKey = `${summarySelectedYear}-${String(index + 1).padStart(2, "0")}`;
      const monthTransactions = transactions.filter((tx) => tx.transactionDate.startsWith(monthKey));
      const income = monthTransactions.filter((tx) => tx.type === "I").reduce((sum, tx) => sum + tx.amount, 0);
      const expense = monthTransactions.filter((tx) => tx.type === "E").reduce((sum, tx) => sum + tx.amount, 0);
      yearTotalIncome += income;
      yearTotalExpense += expense;
      const expenseTotals = monthTransactions.filter((tx) => tx.type === "E").reduce<Record<string, number>>((totals, tx) => {
        const id = tx.categoryId ?? "uncategorized";
        totals[id] = (totals[id] ?? 0) + tx.amount;
        return totals;
      }, {});
      const topExpenses = Object.entries(expenseTotals).map(([id, amount]) => {
        const category = categories.find((item) => item.id === id);
        return { id, label: category?.label ?? "Uncategorized", icon: category?.icon ?? "🏷️", amount };
      }).sort((a, b) => b.amount - a.amount).slice(0, 3);
      return { monthKey, monthName, monthNum: index + 1, income, expense, net: income - expense, topExpenses };
    });
    return {
      monthlyBreakdown,
      yearTotalIncome,
      yearTotalExpense,
      yearNetBalance: yearTotalIncome - yearTotalExpense,
      maxVal: Math.max(...monthlyBreakdown.map((month) => Math.max(month.income, month.expense)), 1000),
    };
  }, [categories, summarySelectedYear, transactions]);

  const multiYearSummaryData = useMemo<MultiYearSummaryData>(() => {
    const years = availableYears.slice(-yearlyRange);
    const yearlyDetails = years.map((year) => {
      const yearTransactions = transactions.filter((tx) => tx.transactionDate.startsWith(String(year)));
      const income = yearTransactions.filter((tx) => tx.type === "I").reduce((sum, tx) => sum + tx.amount, 0);
      const expense = yearTransactions.filter((tx) => tx.type === "E").reduce((sum, tx) => sum + tx.amount, 0);
      const expenseTotals = yearTransactions.filter((tx) => tx.type === "E").reduce<Record<string, number>>((totals, tx) => {
        const id = tx.categoryId ?? "uncategorized";
        totals[id] = (totals[id] ?? 0) + tx.amount;
        return totals;
      }, {});
      const topExpenses = Object.entries(expenseTotals).map(([id, amount]) => {
        const category = categories.find((item) => item.id === id);
        return { id, label: category?.label ?? "Uncategorized", icon: category?.icon ?? "🏷️", amount, percentage: expense > 0 ? ((amount / expense) * 100).toFixed(1) : "0" };
      }).sort((a, b) => b.amount - a.amount).slice(0, 3);
      return { year, income, expense, net: income - expense, topExpenses };
    });
    const totalPeriodIncome = yearlyDetails.reduce((sum, year) => sum + year.income, 0);
    const totalPeriodExpense = yearlyDetails.reduce((sum, year) => sum + year.expense, 0);
    const totalPeriodNet = totalPeriodIncome - totalPeriodExpense;
    return {
      yearlyDetails,
      totalPeriodIncome,
      totalPeriodExpense,
      totalPeriodNet,
      avgNetBalance: yearlyDetails.length ? totalPeriodNet / yearlyDetails.length : 0,
      maxVal: Math.max(...yearlyDetails.map((year) => Math.max(year.income, year.expense)), 1000),
    };
  }, [availableYears, categories, transactions, yearlyRange]);

  return <Summary summaryPeriod={summaryPeriod} setSummaryPeriod={setSummaryPeriod} hoveredYear={hoveredYear} setHoveredYear={setHoveredYear} hoveredMonth={hoveredMonth} setHoveredMonth={setHoveredMonth} summarySelectedMonth={summarySelectedMonth} setSummarySelectedMonth={setSummarySelectedMonth} summarySelectedYear={summarySelectedYear} setSummarySelectedYear={setSummarySelectedYear} monthSummaryData={monthSummaryData} yearMonthsSummaryData={yearMonthsSummaryData} multiYearSummaryData={multiYearSummaryData} yearlyRange={yearlyRange} setYearlyRange={setYearlyRange} availableYearCount={availableYears.length} tooltipPos={tooltipPos} setTooltipPos={setTooltipPos} formatDateString={formatDateString} />;
};

export default SummaryPage;
