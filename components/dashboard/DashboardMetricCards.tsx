"use client";

import {
  TrendingUp,
  CreditCard,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { type MetricCardData } from "@/services/dashboard.service";

interface DashboardMetricCardsProps {
  metrics: MetricCardData;
}

export function DashboardMetricCards({ metrics }: DashboardMetricCardsProps) {
  const isZeroData =
    metrics.monthlyIncome === 0 &&
    metrics.monthlyExpense === 0 &&
    metrics.netRemaining === 0;

  const isNetPositive = !isZeroData && metrics.netRemaining > 0;
  const isNetNegative = !isZeroData && metrics.netRemaining < 0;

  // Tính tỷ suất thặng dư / biên dòng tiền (%)
  const netMarginPercent =
    metrics.monthlyIncome > 0
      ? Math.round((metrics.netRemaining / metrics.monthlyIncome) * 100)
      : 0;

  // Tỷ lệ chi tiêu trên thu nhập (%)
  const expenseRatioPercent =
    metrics.monthlyIncome > 0
      ? Math.min(100, Math.round((metrics.monthlyExpense / metrics.monthlyIncome) * 100))
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. HERO BENTO CARD: DÒNG TIỀN RÒNG VẬN HÀNH (Chiếm 2 cột) */}
      <div
        className={`col-span-1 sm:col-span-2 lg:col-span-2 p-5 sm:p-6 rounded-2xl border shadow-sm relative overflow-hidden transition-all duration-300 ${
          isZeroData
            ? "bg-gradient-to-br from-blue-50/70 via-white to-slate-50 border-blue-200 dark:from-[#0c1424] dark:via-[#090e18] dark:to-[#060910] dark:border-blue-500/20"
            : isNetPositive
            ? "bg-gradient-to-br from-blue-50/80 via-white to-emerald-50/30 border-blue-200 dark:from-[#0a1120] dark:via-[#080d18] dark:to-[#050811] dark:border-blue-500/25"
            : "bg-gradient-to-br from-rose-50/80 via-white to-rose-50/40 border-rose-200 dark:from-[#180a0f] dark:via-[#10070b] dark:to-[#080406] dark:border-rose-500/30"
        }`}
      >
        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                  isZeroData
                    ? "bg-blue-100/70 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/25 dark:text-blue-400"
                    : isNetPositive
                    ? "bg-emerald-100/70 border-emerald-200 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-400"
                    : "bg-rose-100/70 border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-400"
                }`}
              >
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold block">
                  DÒNG TIỀN RÒNG CÒN LẠI (NET CASHFLOW)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Thu nhập - Chi phí vận hành - Hóa đơn đã trả
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div
              className={`px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1.5 shrink-0 ${
                isZeroData
                  ? "bg-blue-100/60 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/25 dark:text-blue-400"
                  : isNetPositive
                  ? "bg-emerald-100/60 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400"
                  : "bg-rose-100/60 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isZeroData
                    ? "bg-blue-500"
                    : isNetPositive
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-rose-500 animate-ping"
                }`}
              />
              <span>
                {isZeroData
                  ? "CHỜ NHẬP DỮ LIỆU"
                  : isNetPositive
                  ? "THẶNG DƯ DÒNG TIỀN"
                  : "CẢNH BÁO THÂM HỤT"}
              </span>
            </div>
          </div>

          {/* Core Metric Value */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <p
                className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight tabular-nums ${
                  isZeroData
                    ? "text-slate-800 dark:text-slate-200"
                    : isNetPositive
                    ? "text-slate-900 dark:text-white"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {formatCurrencyVND(metrics.netRemaining)}
              </p>
              <div className="flex items-center gap-2 text-xs font-mono mt-1 text-slate-500 dark:text-slate-400">
                {isZeroData ? (
                  <span>Chưa có giao dịch phát sinh trong kỳ</span>
                ) : (
                  <>
                    <span>Biên thặng dư:</span>
                    <span
                      className={`font-bold ${
                        isNetPositive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {netMarginPercent}%
                    </span>
                    <span className="text-slate-400">•</span>
                    <span>Tỷ lệ chi/thu: {expenseRatioPercent}%</span>
                  </>
                )}
              </div>
            </div>

            {/* Quick mini ratio bar */}
            <div className="w-full sm:w-44 space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <span>Trạng thái an toàn</span>
                <span className="text-slate-800 dark:text-white font-bold">
                  {isZeroData ? "100%" : `${Math.max(0, 100 - expenseRatioPercent)}%`}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800/80 overflow-hidden border border-slate-300/40 dark:border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isZeroData
                      ? "bg-blue-600"
                      : isNetPositive
                      ? "bg-gradient-to-r from-blue-600 to-emerald-500"
                      : "bg-rose-500"
                  }`}
                  style={{
                    width: isZeroData
                      ? "100%"
                      : `${Math.max(5, Math.min(100, Math.max(0, 100 - expenseRatioPercent)))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BENTO CARD: QUỸ DỰ PHÒNG & TÀI SẢN TÍCH LŨY (Chiếm 2 cột) */}
      <div className="col-span-1 sm:col-span-2 lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100/70 border border-amber-200 text-amber-700 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-400 flex items-center justify-center">
                <PiggyBank className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold block">
                  QUỸ DỰ PHÒNG & TÍCH LŨY
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Bộ đệm an toàn tài chính khẩn cấp
                </span>
              </div>
            </div>

            <div className="px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-[10px] font-mono font-bold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 flex items-center gap-1.5 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>BẢO VỆ RỦI RO</span>
            </div>
          </div>

          {/* Metric Value & Progress */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                {formatCurrencyVND(metrics.totalSavings)}
              </p>
              <div className="flex items-center gap-2 text-xs font-mono mt-1 text-slate-500 dark:text-slate-400">
                <span>Tỷ lệ tích lũy kỳ:</span>
                <span
                  className={`font-bold ${
                    metrics.savingsRatePercent >= metrics.targetSavingsRatePercent
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {metrics.savingsRatePercent}%
                </span>
                <span className="text-slate-400">/</span>
                <span>Mục tiêu {metrics.targetSavingsRatePercent}%</span>
              </div>
            </div>

            {/* Target Progress Bar */}
            <div className="w-full sm:w-44 space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <span>Tiến độ tích lũy</span>
                <span className="text-amber-700 dark:text-amber-300 font-bold">
                  {Math.min(
                    100,
                    Math.round(
                      (metrics.savingsRatePercent / Math.max(1, metrics.targetSavingsRatePercent)) *
                        100
                    )
                  )}
                  %
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800/80 overflow-hidden border border-slate-300/40 dark:border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (metrics.savingsRatePercent / Math.max(1, metrics.targetSavingsRatePercent)) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CARD: TỔNG DOANH THU & THU NHẬP (2 cột trên desktop / 1 cột trên tablet) */}
      <div className="col-span-1 sm:col-span-1 lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/70 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
              DOANH THU & THU NHẬP
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20 font-bold px-2 py-0.5 rounded">
            DÒNG TIỀN VÀO
          </span>
        </div>

        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{formatCurrencyVND(metrics.monthlyIncome)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">
              {metrics.monthlyIncome > 0
                ? "Đã ghi nhận đầy đủ vào sổ cái kế toán kỳ này"
                : "Chưa ghi nhận nguồn thu nào trong kỳ này"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. CARD: CHI PHÍ & VẬN HÀNH THỰC TẾ (2 cột trên desktop / 1 cột trên tablet) */}
      <div className="col-span-1 sm:col-span-1 lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100/70 border border-rose-200 text-rose-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
              CHI TIÊU & VẬN HÀNH
            </span>
          </div>
          <span className="text-[10px] font-mono text-rose-700 bg-rose-50 border border-rose-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20 font-bold px-2 py-0.5 rounded">
            DÒNG TIỀN RA
          </span>
        </div>

        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-bold font-mono text-rose-600 dark:text-white tabular-nums">
            -{formatCurrencyVND(metrics.monthlyExpense)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">
              {metrics.monthlyExpense > 0
                ? "Bao gồm định phí vận hành & chi phí phát sinh"
                : "Chưa có phát sinh chi phí nào trong kỳ này"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
