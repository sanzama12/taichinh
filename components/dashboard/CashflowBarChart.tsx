"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { type MonthlyTrendItem } from "@/services/dashboard.service";

interface CashflowBarChartProps {
  data: MonthlyTrendItem[];
}

export function CashflowBarChart({ data }: CashflowBarChartProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const hasAnyHistoricalData = data.some((item) => item.income > 0 || item.expense > 0);

  if (!isMounted) {
    return (
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] h-[380px] animate-pulse flex items-center justify-center">
        <span className="text-xs font-mono text-slate-400">
          Đang tải biểu đồ dòng tiền 12 tháng...
        </span>
      </div>
    );
  }

  // Format trục Y rút gọn (triệu đồng)
  const formatYAxis = (val: number) => {
    if (val >= 1000000) {
      return `${Math.round(val / 1000000)}M`;
    }
    return val.toString();
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between h-full min-h-[380px] relative overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            DÒNG TIỀN DOANH THU & CHI TIÊU (12 THÁNG QUA)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Niên độ kế toán</span>
      </div>

      {/* Bar Chart Container */}
      <div className="h-[250px] w-full my-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
            <XAxis
              dataKey="monthKey"
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickFormatter={formatYAxis}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as MonthlyTrendItem;
                  return (
                    <div className="p-3 rounded-xl bg-white dark:bg-[#030712] border border-slate-200 dark:border-white/15 text-xs font-mono shadow-lg space-y-1 text-slate-800 dark:text-white">
                      <p className="font-bold border-b border-slate-200 dark:border-white/10 pb-1">
                        {item.fullLabel}
                      </p>
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Thu nhập: {formatCurrencyVND(item.income)}
                      </p>
                      <p className="text-blue-600 dark:text-blue-400 font-bold">
                        Chi tiêu: {formatCurrencyVND(item.expense)}
                      </p>
                      <p
                        className={`font-bold ${
                          item.net >= 0
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        Thặng dư ròng: {formatCurrencyVND(item.net)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", paddingTop: "10px" }}
              formatter={(value) => {
                if (value === "income")
                  return <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Doanh thu</span>;
                if (value === "expense")
                  return <span className="text-blue-600 dark:text-blue-400 font-semibold">Chi phí</span>;
                return value;
              }}
            />
            <Bar dataKey="income" name="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} />
            <Bar dataKey="expense" name="expense" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>

        {/* Empty state overlay khi chưa có dữ liệu 12 tháng */}
        {!hasAnyHistoricalData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-white/80 dark:bg-[#090e17]/70 backdrop-blur-[2px] rounded-xl text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
              <BarChart3 className="w-5 h-5" />
            </div>
            <p className="text-xs font-mono font-bold text-slate-800 dark:text-white">
              SỔ CÁI 12 THÁNG SẴN SÀNG GHI NHẬN
            </p>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Biểu đồ tương quan thu - chi sẽ tự động hình thành liên tục khi bạn bắt đầu thêm các giao dịch thực tế.
            </p>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] text-right">
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
          So sánh tương quan dòng tiền vào và ra 12 tháng liên tục
        </span>
      </div>
    </div>
  );
}
