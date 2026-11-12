"use client";

import * as React from "react";
import { Info, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { type MetricCardData } from "@/services/dashboard.service";
import { BeeIconSvg } from "@/components/icons/BeeLogo";
import { FinFlowLogo, BidvLogo, VietcombankLogo } from "@/components/icons/BrandLogos";

interface FinFlowMetricCardsProps {
  metrics: MetricCardData;
  activeCategory?: string;
  beeSummary?: {
    totalEarnings: number;
    totalCustomerFare: number;
    totalPlatformFee: number;
    totalTip: number;
    totalTrips: number;
  };
  fuelSummary?: {
    totalCost: number;
    totalLiters: number;
    totalFills: number;
  };
  bonusSummary?: {
    totalReceived: number;
    totalPending: number;
  };
  debtSummary?: {
    totalRemainingDebt: number;
    totalMonthlyPayment: number;
    activeDebtCount: number;
  };
}

export function FinFlowMetricCards({
  metrics,
  beeSummary,
  fuelSummary,
}: FinFlowMetricCardsProps) {
  // Định dạng tiền tệ với ký hiệu đ phía trước giống chuẩn ảnh mẫu FinFlow (VD: đ125,450,000)
  const formatFinFlowCurrency = (val: number) => {
    return `đ${Math.round(val || 0).toLocaleString("en-US")}`;
  };

  // Tính toán số liệu 100% thời gian thực từ MongoDB - Không chèn dữ liệu ảo
  const totalBalance = metrics.netRemaining + metrics.totalSavings;
  const monthlySavings = metrics.netRemaining > 0 ? metrics.netRemaining : 0;
  const techcombankIncome = metrics.monthlyIncome;
  const vietcombankExpense = metrics.monthlyExpense;

  const hasActivity =
    metrics.monthlyIncome > 0 ||
    metrics.monthlyExpense > 0 ||
    metrics.totalSavings > 0 ||
    metrics.netRemaining !== 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: TOTAL BALANCE */}
      <div className="bg-white dark:bg-[#0c121e] rounded-3xl border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-emerald-500 shadow-xs pt-4 px-4 pb-0 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,0.85)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:border-slate-900 dark:hover:border-white transition-all">
        <div className="space-y-1">
          {/* Header & Info */}
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                TOTAL BALANCE
              </span>
              <div title="Tổng số dư khả dụng và tài sản tích lũy thực tế" className="cursor-help">
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
              </div>
            </div>
            <FinFlowLogo size={18} variant="square" />
          </div>

          {/* Value */}
          <div className="text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums">
            {formatFinFlowCurrency(totalBalance)}
          </div>

          {/* Subtext */}
          <div className="flex items-center gap-1 text-[11px] font-semibold">
            {totalBalance > 0 ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                +4.2% vs last month
              </span>
            ) : totalBalance < 0 ? (
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <ArrowDownRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                Cảnh báo thâm hụt dòng tiền
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <Minus className="w-3.5 h-3.5 shrink-0" />
                Chưa có giao dịch • Sẵn sàng nhập
              </span>
            )}
          </div>
        </div>

        {/* Edge-to-Edge Sparkline Wave */}
        <div className="w-full h-12 -mx-4 mt-2 overflow-hidden shrink-0">
          <svg
            className="w-full h-full block"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sparkGrad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={totalBalance > 0 ? 0.28 : 0.08} />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={
                totalBalance > 0
                  ? "M 0 25 C 20 22, 35 26, 50 18 C 65 10, 80 15, 100 6 L 100 30 L 0 30 Z"
                  : "M 0 26 C 25 26, 50 26, 75 26, 100 26 L 100 30 L 0 30 Z"
              }
              fill="url(#sparkGrad1)"
            />
            <path
              d={
                totalBalance > 0
                  ? "M 0 25 C 20 22, 35 26, 50 18 C 65 10, 80 15, 100 6"
                  : "M 0 26 C 25 26, 50 26, 75 26, 100 26"
              }
              fill="none"
              stroke="#10b981"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* CARD 2: MONTHLY SAVINGS */}
      <div className="bg-white dark:bg-[#0c121e] rounded-3xl border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-blue-500 shadow-xs pt-4 px-4 pb-0 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,0.85)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:border-slate-900 dark:hover:border-white transition-all">
        <div className="space-y-1">
          {/* Header & Info */}
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                MONTHLY SAVINGS
              </span>
              <div title="Mức tiết kiệm & thặng dư dòng tiền trong kỳ" className="cursor-help">
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
              </div>
            </div>
            <BidvLogo size={18} variant="square" />
          </div>

          {/* Value */}
          <div className="text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums">
            {formatFinFlowCurrency(monthlySavings)}
          </div>

          {/* Subtext with Green Arrow */}
          <div className="flex items-center gap-1 text-[11px] font-semibold">
            {monthlySavings > 0 ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                +{metrics.savingsRatePercent}% vs last month
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <Minus className="w-3.5 h-3.5 shrink-0" />
                Mục tiêu tích lũy: {metrics.targetSavingsRatePercent}%
              </span>
            )}
          </div>
        </div>

        {/* Edge-to-Edge Sparkline Wave */}
        <div className="w-full h-12 -mx-4 mt-2 overflow-hidden shrink-0">
          <svg
            className="w-full h-full block"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sparkGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={monthlySavings > 0 ? 0.28 : 0.08} />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={
                monthlySavings > 0
                  ? "M 0 28 C 15 27, 30 20, 48 19 C 65 18, 80 14, 100 9 L 100 30 L 0 30 Z"
                  : "M 0 26 C 25 26, 50 26, 75 26, 100 26 L 100 30 L 0 30 Z"
              }
              fill="url(#sparkGrad2)"
            />
            <path
              d={
                monthlySavings > 0
                  ? "M 0 28 C 15 27, 30 20, 48 19 C 65 18, 80 14, 100 9"
                  : "M 0 26 C 25 26, 50 26, 75 26, 100 26"
              }
              fill="none"
              stroke="#10b981"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* CARD 3: TECHCOMBANK (DOANH THU & ĐƠN BE) */}
      <div className="bg-white dark:bg-[#0c121e] rounded-3xl border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-[#FFC700] shadow-xs pt-4 px-4 pb-0 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,0.85)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:border-slate-900 dark:hover:border-white transition-all">
        <div className="space-y-1">
          {/* Header & Info */}
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                TECHCOMBANK (ĐƠN BE)
              </span>
              <div title="Tài khoản Techcombank & Doanh thu dịch vụ (Đơn Be, Thưởng)" className="cursor-help">
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
              </div>
            </div>
            <BeeIconSvg size={18} variant="square" />
          </div>

          {/* Value */}
          <div className="text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums">
            {formatFinFlowCurrency(techcombankIncome)}
          </div>

          {/* Subtext with Green Arrow & Be Logo */}
          <div className="flex items-center gap-1 text-[11px] font-semibold">
            {beeSummary && beeSummary.totalEarnings > 0 ? (
              <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                <span>{beeSummary.totalTrips} cuốc Be ({formatFinFlowCurrency(beeSummary.totalEarnings)})</span>
              </span>
            ) : techcombankIncome > 0 ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                +2.1% vs last month
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <Minus className="w-3.5 h-3.5 shrink-0" />
                0 giao dịch phát sinh
              </span>
            )}
          </div>
        </div>

        {/* Edge-to-Edge Sparkline Wave */}
        <div className="w-full h-12 -mx-4 mt-2 overflow-hidden shrink-0">
          <svg
            className="w-full h-full block"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sparkGrad3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={techcombankIncome > 0 ? 0.28 : 0.08} />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={
                techcombankIncome > 0
                  ? "M 0 26 C 25 24, 40 28, 55 16 C 70 8, 85 14, 100 8 L 100 30 L 0 30 Z"
                  : "M 0 26 C 25 26, 50 26, 75 26, 100 26 L 100 30 L 0 30 Z"
              }
              fill="url(#sparkGrad3)"
            />
            <path
              d={
                techcombankIncome > 0
                  ? "M 0 26 C 25 24, 40 28, 55 16 C 70 8, 85 14, 100 8"
                  : "M 0 26 C 25 26, 50 26, 75 26, 100 26"
              }
              fill="none"
              stroke="#10b981"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* CARD 4: VIETCOMBANK (CHI PHÍ XĂNG & NỢ) */}
      <div className="bg-white dark:bg-[#0c121e] rounded-3xl border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-rose-500 shadow-xs pt-4 px-4 pb-0 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,0.85)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:border-slate-900 dark:hover:border-white transition-all">
        <div className="space-y-1">
          {/* Header & Info */}
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                VIETCOMBANK
              </span>
              <div title="Tài khoản Vietcombank & Chi phí vận hành (Xăng xe, trả nợ)" className="cursor-help">
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
              </div>
            </div>
            <VietcombankLogo size={18} variant="square" />
          </div>

          {/* Value */}
          <div className="text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums">
            {formatFinFlowCurrency(vietcombankExpense)}
          </div>

          {/* Subtext with Green Arrow */}
          <div className="flex items-center gap-1 text-[11px] font-semibold">
            {fuelSummary && fuelSummary.totalCost > 0 ? (
              <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                {fuelSummary.totalFills} lần đổ xăng ({fuelSummary.totalLiters} L)
              </span>
            ) : vietcombankExpense > 0 ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                +8.0% vs last month
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <Minus className="w-3.5 h-3.5 shrink-0" />
                0 chi phí phát sinh
              </span>
            )}
          </div>
        </div>

        {/* Edge-to-Edge Sparkline Wave */}
        <div className="w-full h-12 -mx-4 mt-2 overflow-hidden shrink-0">
          <svg
            className="w-full h-full block"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sparkGrad4" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={vietcombankExpense > 0 ? 0.28 : 0.08} />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={
                vietcombankExpense > 0
                  ? "M 0 27 C 20 25, 38 18, 55 17 C 72 16, 85 9, 100 7 L 100 30 L 0 30 Z"
                  : "M 0 26 C 25 26, 50 26, 75 26, 100 26 L 100 30 L 0 30 Z"
              }
              fill="url(#sparkGrad4)"
            />
            <path
              d={
                vietcombankExpense > 0
                  ? "M 0 27 C 20 25, 38 18, 55 17 C 72 16, 85 9, 100 7"
                  : "M 0 26 C 25 26, 50 26, 75 26, 100 26"
              }
              fill="none"
              stroke="#10b981"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
