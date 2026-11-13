"use client";

import * as React from "react";
import { Info, ArrowUpRight, ArrowDownRight, Minus, Fuel, Award, Wallet, DollarSign } from "lucide-react";
import { type MetricCardData } from "@/services/dashboard.service";
import { BeeIconSvg } from "@/components/icons/BeeLogo";
import { formatCurrencyVND } from "@/lib/utils";

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
  bonusSummary,
}: FinFlowMetricCardsProps) {
  // Định dạng tiền tệ VND chuẩn (VD: 15.450.000 ₫)
  const formatMoney = (val: number) => {
    return formatCurrencyVND(val || 0);
  };

  // 1. Tiền cuốc xe Be (Doanh thu thuần từ cuốc xe thực tế, không gộp tiết kiệm hay khoản khác)
  const tripEarnings = beeSummary ? beeSummary.totalEarnings : 0;
  const tripTip = beeSummary ? beeSummary.totalTip : 0;
  const totalTripRevenue = tripEarnings + tripTip;
  const tripCount = beeSummary ? beeSummary.totalTrips : 0;

  // 2. Chi phí xăng xe Petrolimex
  const fuelExpense = fuelSummary && fuelSummary.totalCost > 0
    ? fuelSummary.totalCost
    : (metrics.monthlyExpense || 0);
  const fuelLiters = fuelSummary?.totalLiters || 0;
  const fuelFills = fuelSummary?.totalFills || 0;

  // 3. Tiền thưởng Be
  const bonusReceived = bonusSummary?.totalReceived || 0;
  const bonusPending = bonusSummary?.totalPending || 0;

  // 4. Dòng tiền thực còn lại = (Tiền cuốc + Thưởng) - Chi phí xăng xe (Tuyệt đối KHÔNG gộp tiền tiết kiệm)
  const netOperatingCashflow = (totalTripRevenue + bonusReceived) - fuelExpense;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: TỔNG TIỀN CUỐC XE BE (DOANH THU THỰC RIÊNG BIỆT) */}
      <div className="bg-white dark:bg-[#0c121e] rounded-3xl border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-[#FFC700] shadow-xs pt-4 px-4 pb-0 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,0.85)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:border-slate-900 dark:hover:border-white transition-all">
        <div className="space-y-1">
          {/* Header & Info */}
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                TỔNG TIỀN CUỐC (BE)
              </span>
              <div title="Tổng doanh thu thuần từ các cuốc xe Be tháng này (đã trừ phí sàn và thuế TNCN). Độc lập, không gộp tiền tiết kiệm." className="cursor-help">
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
              </div>
            </div>
            <BeeIconSvg size={20} variant="square" />
          </div>

          {/* Value */}
          <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white font-mono tracking-tight tabular-nums">
            {formatMoney(totalTripRevenue)}
          </div>

          {/* Subtext */}
          <div className="flex items-center gap-1 text-[11px] font-bold">
            {tripCount > 0 ? (
              <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                <span>{tripCount} cuốc hoàn thành{tripTip > 0 ? ` (+${formatMoney(tripTip)} tip)` : ""}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <Minus className="w-3.5 h-3.5 shrink-0" />
                Chưa có cuốc xe nào trong tháng
              </span>
            )}
          </div>
        </div>

        {/* Edge-to-Edge Sparkline Wave Amber */}
        <div className="w-full h-12 -mx-4 mt-2 overflow-hidden shrink-0">
          <svg
            className="w-full h-full block"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sparkGradTrip" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFC700" stopOpacity={totalTripRevenue > 0 ? 0.35 : 0.08} />
                <stop offset="100%" stopColor="#FFC700" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={
                totalTripRevenue > 0
                  ? "M 0 25 C 20 20, 35 24, 50 14 C 65 8, 80 12, 100 4 L 100 30 L 0 30 Z"
                  : "M 0 26 C 25 26, 50 26, 75 26, 100 26 L 100 30 L 0 30 Z"
              }
              fill="url(#sparkGradTrip)"
            />
            <path
              d={
                totalTripRevenue > 0
                  ? "M 0 25 C 20 20, 35 24, 50 14 C 65 8, 80 12, 100 4"
                  : "M 0 26 C 25 26, 50 26, 75 26, 100 26"
              }
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* CARD 2: CHI PHÍ XĂNG XE PETROLIMEX */}
      <div className="bg-white dark:bg-[#0c121e] rounded-3xl border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-orange-500 shadow-xs pt-4 px-4 pb-0 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,0.85)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:border-slate-900 dark:hover:border-white transition-all">
        <div className="space-y-1">
          {/* Header & Info */}
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                XĂNG XE PETROLIMEX
              </span>
              <div title="Chi phí đổ xăng xe máy phục vụ chạy Be trong tháng" className="cursor-help">
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
              </div>
            </div>
            <div className="w-5 h-5 rounded-md bg-orange-100 dark:bg-orange-500/20 text-orange-600 flex items-center justify-center font-bold">
              <Fuel className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Value */}
          <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white font-mono tracking-tight tabular-nums">
            {formatMoney(fuelExpense)}
          </div>

          {/* Subtext */}
          <div className="flex items-center gap-1 text-[11px] font-bold">
            {fuelFills > 0 ? (
              <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                {fuelFills} lần đổ xăng ({fuelLiters} Lít)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <Minus className="w-3.5 h-3.5 shrink-0" />
                Chưa ghi nhận chi phí xăng
              </span>
            )}
          </div>
        </div>

        {/* Edge-to-Edge Sparkline Wave Orange */}
        <div className="w-full h-12 -mx-4 mt-2 overflow-hidden shrink-0">
          <svg
            className="w-full h-full block"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sparkGradFuel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" stopOpacity={fuelExpense > 0 ? 0.3 : 0.08} />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={
                fuelExpense > 0
                  ? "M 0 27 C 20 24, 38 18, 55 17 C 72 16, 85 10, 100 8 L 100 30 L 0 30 Z"
                  : "M 0 26 C 25 26, 50 26, 75 26, 100 26 L 100 30 L 0 30 Z"
              }
              fill="url(#sparkGradFuel)"
            />
            <path
              d={
                fuelExpense > 0
                  ? "M 0 27 C 20 24, 38 18, 55 17 C 72 16, 85 10, 100 8"
                  : "M 0 26 C 25 26, 50 26, 75 26, 100 26"
              }
              fill="none"
              stroke="#EA580C"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* CARD 3: TIỀN THƯỞNG BE */}
      <div className="bg-white dark:bg-[#0c121e] rounded-3xl border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-sky-500 shadow-xs pt-4 px-4 pb-0 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,0.85)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:border-slate-900 dark:hover:border-white transition-all">
        <div className="space-y-1">
          {/* Header & Info */}
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
                TIỀN THƯỞNG BE
              </span>
              <div title="Tiền thưởng mốc cuốc, thưởng nóng, thưởng tuần từ ứng dụng Be" className="cursor-help">
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
              </div>
            </div>
            <div className="w-5 h-5 rounded-md bg-sky-100 dark:bg-sky-500/20 text-sky-600 flex items-center justify-center font-bold">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Value */}
          <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white font-mono tracking-tight tabular-nums">
            {formatMoney(bonusReceived)}
          </div>

          {/* Subtext */}
          <div className="flex items-center gap-1 text-[11px] font-bold">
            {bonusReceived > 0 ? (
              <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                {bonusPending > 0 ? `Đã nhận • Còn chờ ${formatMoney(bonusPending)}` : "Đã nhận về ví tài xế"}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <Minus className="w-3.5 h-3.5 shrink-0" />
                Chưa có tiền thưởng tháng này
              </span>
            )}
          </div>
        </div>

        {/* Edge-to-Edge Sparkline Wave Sky */}
        <div className="w-full h-12 -mx-4 mt-2 overflow-hidden shrink-0">
          <svg
            className="w-full h-full block"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sparkGradBonus" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284C7" stopOpacity={bonusReceived > 0 ? 0.3 : 0.08} />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={
                bonusReceived > 0
                  ? "M 0 26 C 25 24, 40 28, 55 16 C 70 8, 85 14, 100 8 L 100 30 L 0 30 Z"
                  : "M 0 26 C 25 26, 50 26, 75 26, 100 26 L 100 30 L 0 30 Z"
              }
              fill="url(#sparkGradBonus)"
            />
            <path
              d={
                bonusReceived > 0
                  ? "M 0 26 C 25 24, 40 28, 55 16 C 70 8, 85 14, 100 8"
                  : "M 0 26 C 25 26, 50 26, 75 26, 100 26"
              }
              fill="none"
              stroke="#0284C7"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* CARD 4: DÒNG TIỀN THỰC CÒN LẠI (TIỀN CUỐC + THƯỞNG - XĂNG, KHÔNG GỘP TIẾT KIỆM) */}
      <div className="bg-white dark:bg-[#0c121e] rounded-3xl border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-emerald-500 shadow-xs pt-4 px-4 pb-0 flex flex-col justify-between overflow-hidden relative group hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,0.85)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:border-slate-900 dark:hover:border-white transition-all">
        <div className="space-y-1">
          {/* Header & Info */}
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                THỰC CÒN LẠI (TÚI TÀI XẾ)
              </span>
              <div title="Thực tế tiền túi tài xế còn lại sau khi lấy (Tiền cuốc xe + Thưởng) trừ đi Chi phí xăng. Tuyệt đối không gộp tiền tiết kiệm vào đây." className="cursor-help">
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
              </div>
            </div>
            <div className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Value */}
          <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white font-mono tracking-tight tabular-nums">
            {formatMoney(netOperatingCashflow)}
          </div>

          {/* Subtext */}
          <div className="flex items-center gap-1 text-[11px] font-bold">
            {netOperatingCashflow > 0 ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                Dòng tiền dương • Tiền cuốc sạch
              </span>
            ) : netOperatingCashflow < 0 ? (
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <ArrowDownRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                Xăng vượt quá doanh thu cuốc
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <Minus className="w-3.5 h-3.5 shrink-0" />
                Cân bằng 0 ₫
              </span>
            )}
          </div>
        </div>

        {/* Edge-to-Edge Sparkline Wave Emerald */}
        <div className="w-full h-12 -mx-4 mt-2 overflow-hidden shrink-0">
          <svg
            className="w-full h-full block"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sparkGradNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={netOperatingCashflow > 0 ? 0.35 : 0.08} />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={
                netOperatingCashflow > 0
                  ? "M 0 28 C 15 27, 30 20, 48 19 C 65 18, 80 12, 100 6 L 100 30 L 0 30 Z"
                  : "M 0 26 C 25 26, 50 26, 75 26, 100 26 L 100 30 L 0 30 Z"
              }
              fill="url(#sparkGradNet)"
            />
            <path
              d={
                netOperatingCashflow > 0
                  ? "M 0 28 C 15 27, 30 20, 48 19 C 65 18, 80 12, 100 6"
                  : "M 0 26 C 25 26, 50 26, 75 26, 100 26"
              }
              fill="none"
              stroke="#059669"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
