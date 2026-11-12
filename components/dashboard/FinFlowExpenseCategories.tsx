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

interface FinFlowExpenseCategoriesProps {
  month?: number;
  year?: number;
  weekTrend?: TrendPointDto[];
  monthlyTrend?: MonthlyTrendItem[];
  activeCategory?: string;
}

export function FinFlowExpenseCategories({
  month = 11,
  year = 2026,
  weekTrend,
  activeCategory = "all",
}: FinFlowExpenseCategoriesProps) {
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

  // Dữ liệu tuần thực tế từ MongoDB
  const defaultWeekData = [
    { day: "Mon", housing: 0, dining: 0, transport: 0, fullLabel: "Thứ Hai" },
    { day: "Tue", housing: 0, dining: 0, transport: 0, fullLabel: "Thứ Ba" },
    { day: "Wed", housing: 0, dining: 0, transport: 0, fullLabel: "Thứ Tư" },
    { day: "Thu", housing: 0, dining: 0, transport: 0, fullLabel: "Thứ Năm" },
    { day: "Fri", housing: 0, dining: 0, transport: 0, fullLabel: "Thứ Sáu" },
    { day: "Sat", housing: 0, dining: 0, transport: 0, fullLabel: "Thứ Bảy" },
    { day: "Sun", housing: 0, dining: 0, transport: 0, fullLabel: "Chủ Nhật" },
  ];

  const actualWeekData = weekTrend && weekTrend.length === 7
    ? weekTrend.map((w) => ({
        day: w.day,
        housing: w.housing,
        dining: w.dining,
        transport: w.transport,
        fullLabel: w.fullLabel,
      }))
    : defaultWeekData;

  const currentData = actualWeekData;
  const hasData = currentData.some((d) => d.housing > 0 || d.dining > 0 || d.transport > 0);

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
              Expense Categories
            </h3>
            <div title="Chi tiết biến động chi phí theo từng danh mục chính từ MongoDB" className="cursor-help">
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
          <span>Housing (Mặt bằng/Nhà ở)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-xs bg-slate-400 shrink-0" />
          <span>Dining Out (Ăn uống/Tiếp khách)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 border-b-2 border-dashed border-emerald-700 shrink-0" />
          <span>Transportation (Xăng & Xe)</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-[250px] sm:h-[280px] w-full pt-2 relative">
        {!hasData && (
          <div className="absolute top-2 right-2 z-10 text-[11px] font-mono text-slate-400 bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-md border border-slate-200/60 dark:border-white/10">
            Sẵn sàng nhận dữ liệu chi tiêu & xăng xe
          </div>
        )}

        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentData} margin={{ top: 15, right: 10, left: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="housingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={activeCategory === "housing" || activeCategory === "all" ? 0.22 : 0.05} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient id="diningGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity={activeCategory === "housing" || activeCategory === "all" ? 0.14 : 0.05} />
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
                          <span>Housing: {formatCurrencyVND(data.housing)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>Dining: {formatCurrencyVND(data.dining)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                          <span>Transport: {formatCurrencyVND(data.transport)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Area 1: Housing (Emerald) */}
              <Area
                type="monotone"
                dataKey="housing"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#housingGrad)"
                activeDot={{ r: 5, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
              />

              {/* Area 2: Dining (Slate) */}
              <Area
                type="monotone"
                dataKey="dining"
                stroke="#94a3b8"
                strokeWidth={2}
                fill="url(#diningGrad)"
                activeDot={{ r: 4, fill: "#94a3b8", stroke: "#ffffff", strokeWidth: 2 }}
              />

              {/* Line 3: Transportation (Dashed line) */}
              <Line
                type="monotone"
                dataKey="transport"
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
