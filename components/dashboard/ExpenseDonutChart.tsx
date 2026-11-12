"use client";

import * as React from "react";
import Link from "next/link";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { type CategoryBreakdownItem } from "@/services/dashboard.service";

interface ExpenseDonutChartProps {
  data: CategoryBreakdownItem[];
}

export function ExpenseDonutChart({ data }: ExpenseDonutChartProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  if (!isMounted) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] h-[400px] animate-pulse flex items-center justify-center">
        <span className="text-xs font-mono text-slate-400">
          Đang tải biểu đồ cơ cấu chi tiêu...
        </span>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between h-full">
      {/* Title Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              CƠ CẤU CHI PHÍ VẬN HÀNH
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-bold">
            {formatCurrencyVND(totalAmount)}
          </span>
        </div>

        {/* Donut Chart Graphic */}
        <div className="h-[180px] w-full relative flex items-center justify-center my-2">
          {data.length === 0 ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center mx-auto mb-2 text-slate-400">
                <PieChartIcon className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-400 block font-semibold">
                Chưa có chi phí phát sinh kỳ này
              </span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block mt-0.5">
                Nhật ký chi tiêu đang trống
              </span>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as CategoryBreakdownItem;
                        return (
                          <div className="p-2.5 rounded-xl bg-white dark:bg-[#030712] border border-slate-200 dark:border-white/15 text-xs font-mono shadow-md text-slate-800 dark:text-white">
                            <p className="font-bold">{item.name}</p>
                            <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                              {formatCurrencyVND(item.amount)} ({item.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Overlay Stats */}
              <div className="absolute text-center pointer-events-none">
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-semibold">
                  DANH MỤC
                </span>
                <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-white">
                  {data.length} Nhóm
                </span>
              </div>
            </>
          )}
        </div>

        {/* Responsive Category Breakdown List */}
        {data.length === 0 ? (
          <div className="pt-2 text-center">
            <Link
              href="/expenses"
              className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 dark:bg-blue-600/10 dark:border-blue-500/20 dark:hover:bg-blue-500/20 dark:text-blue-400 font-bold text-xs font-mono flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            >
              <span>+ Ghi chi phí đầu tiên</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[170px] overflow-y-auto pr-1">
            {data.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-slate-700 dark:text-slate-300 truncate text-[11px] font-medium">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-right shrink-0">
                    <span className="text-slate-900 dark:text-white font-bold tabular-nums text-[11px]">
                      {formatCurrencyVND(cat.amount)}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] min-w-[28px] font-bold">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                {/* Mini visual ratio bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(3, cat.percentage))}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-slate-200 dark:border-white/[0.06] text-right">
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
          Phân bổ tự động theo tỷ trọng dòng tiền
        </span>
      </div>
    </div>
  );
}
