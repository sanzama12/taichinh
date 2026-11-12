"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Info, Calendar } from "lucide-react";
import { type MonthlyTrendItem, type TrendPointDto } from "@/services/dashboard.service";
import { formatCurrencyVND } from "@/lib/utils";

interface FinFlowCashFlowTrendProps {
  month?: number;
  year?: number;
  weekTrend?: TrendPointDto[];
  monthlyTrend?: MonthlyTrendItem[];
}

export function FinFlowCashFlowTrend({
  month = 11,
  year = 2026,
  weekTrend,
  monthlyTrend,
}: FinFlowCashFlowTrendProps) {
  const [timeRange, setTimeRange] = React.useState<"1D" | "1W" | "1M" | "1Y">("1W");
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthString = `${monthNames[month - 1] || "November"} ${year}`;

  // 1. Dữ liệu tuần thực tế (Mon..Sun) từ MongoDB
  const defaultWeekData = [
    { day: "Mon", income: 0, expense: 0, net: 0, fullLabel: "Thứ Hai" },
    { day: "Tue", income: 0, expense: 0, net: 0, fullLabel: "Thứ Ba" },
    { day: "Wed", income: 0, expense: 0, net: 0, fullLabel: "Thứ Tư" },
    { day: "Thu", income: 0, expense: 0, net: 0, fullLabel: "Thứ Năm" },
    { day: "Fri", income: 0, expense: 0, net: 0, fullLabel: "Thứ Sáu" },
    { day: "Sat", income: 0, expense: 0, net: 0, fullLabel: "Thứ Bảy" },
    { day: "Sun", income: 0, expense: 0, net: 0, fullLabel: "Chủ Nhật" },
  ];

  const actualWeekData = weekTrend && weekTrend.length === 7
    ? weekTrend.map((w) => ({
        day: w.day,
        income: w.income,
        expense: w.expense,
        net: w.net,
        fullLabel: w.fullLabel,
      }))
    : defaultWeekData;

  // 2. Dữ liệu tháng (1M / 1Y)
  const actualMonthData = monthlyTrend && monthlyTrend.length > 0
    ? monthlyTrend.slice(-4).map((m, idx) => ({
        day: `Tuần ${idx + 1}`,
        income: m.income,
        expense: m.expense,
        net: m.net,
        fullLabel: m.fullLabel,
      }))
    : [
        { day: "Tuần 1", income: 0, expense: 0, net: 0, fullLabel: "Tuần 1" },
        { day: "Tuần 2", income: 0, expense: 0, net: 0, fullLabel: "Tuần 2" },
        { day: "Tuần 3", income: 0, expense: 0, net: 0, fullLabel: "Tuần 3" },
        { day: "Tuần 4", income: 0, expense: 0, net: 0, fullLabel: "Tuần 4" },
      ];

  const currentData = timeRange === "1M" || timeRange === "1Y" ? actualMonthData : actualWeekData;

  const hasData = currentData.some((d) => d.income > 0 || d.expense > 0);

  const formatYAxisTick = (val: number) => {
    if (val === 0) return "0";
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return `${val}`;
  };

  return (
    <div className="bg-white dark:bg-[#0c121e] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs p-5 space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base tracking-tight">
              Cash Flow Trend
            </h3>
            <div title="Xu hướng thu chi và dòng tiền thời gian thực từ MongoDB" className="cursor-help">
              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{monthString}</span>
          </div>
        </div>

        {/* Time Filter Pills (1D | 1W | 1M | 1Y) */}
        <div className="inline-flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] self-start sm:self-auto">
          {(["1D", "1W", "1M", "1Y"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeRange(t)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                timeRange === t
                  ? "bg-white dark:bg-[#0c121e] text-slate-900 dark:text-white shadow-2xs border border-slate-200/80 dark:border-white/10"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Legend Row */}
      <div className="flex items-center gap-5 text-xs font-medium text-slate-600 dark:text-slate-400 pt-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 shrink-0" />
          <span>Income (Thu nhập & Đơn Be)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-xs bg-slate-400 shrink-0" />
          <span>Expenses (Chi phí & Xăng)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 border-b-2 border-dashed border-emerald-700 shrink-0" />
          <span>Net Savings (Dòng tiền ròng)</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-[250px] sm:h-[280px] w-full pt-2 relative">
        {!hasData && (
          <div className="absolute top-2 right-2 z-10 text-[11px] font-mono text-slate-400 bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-white/10">
            Sẵn sàng nhận dữ liệu cuốc xe & chi tiêu
          </div>
        )}

        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentData} margin={{ top: 15, right: 10, left: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeFlowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient id="expenseFlowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxisTick}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="px-3 py-2 rounded-xl bg-white dark:bg-[#030712] border border-slate-200 dark:border-white/15 text-xs font-mono shadow-md space-y-1">
                        <div className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-white/10 pb-1">
                          {data.fullLabel || label}
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Income: {formatCurrencyVND(data.income)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>Expenses: {formatCurrencyVND(data.expense)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                          <span>Net: {formatCurrencyVND(data.net)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Area 1: Income (Emerald) */}
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#incomeFlowGrad)"
                activeDot={{ r: 5, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
              />

              {/* Area 2: Expenses (Slate) */}
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#94a3b8"
                strokeWidth={2}
                fill="url(#expenseFlowGrad)"
                activeDot={{ r: 4, fill: "#94a3b8", stroke: "#ffffff", strokeWidth: 2 }}
              />

              {/* Line 3: Net Savings (Dashed line) */}
              <Line
                type="monotone"
                dataKey="net"
                stroke="#059669"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 animate-pulse">
            Đang tải dữ liệu biểu đồ...
          </div>
        )}
      </div>
    </div>
  );
}
