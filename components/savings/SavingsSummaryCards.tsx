"use client";

import { PiggyBank, Target, Calendar, ShieldCheck, Sparkles } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { type SavingsSummaryDto } from "@/services/savings.service";

interface SavingsSummaryCardsProps {
  summary: SavingsSummaryDto;
  onInitEmergencyFund: () => void;
}

export function SavingsSummaryCards({
  summary,
  onInitEmergencyFund,
}: SavingsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng Tích Lũy Hiện Tại */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
            TỔNG TIỀN ĐÃ TÍCH LŨY
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrencyVND(summary.totalCurrentSavings)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            <span>Đạt {summary.overallProgressPercent}% tổng mục tiêu</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-white/[0.08] rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.min(summary.overallProgressPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Tổng Mục Tiêu Đặt Ra */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
            TỔNG MỤC TIÊU KỲ HẠN
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatCurrencyVND(summary.totalTargetSavings)}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            <span>{summary.activeGoalsCount} đang thực hiện</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {summary.completedGoalsCount} đã xong
            </span>
          </div>
        </div>
      </div>

      {/* 3. Tiền Cần Để Dành Mỗi Tháng */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
            CẦN TÍCH LŨY / THÁNG
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
            {formatCurrencyVND(summary.totalMonthlyRequired)}
          </p>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            <span>Để đạt 100% mục tiêu đúng hạn</span>
          </div>
        </div>
      </div>

      {/* 4. Khả Năng Bảo Vệ Khẩn Cấp */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-600 dark:text-slate-400">
            QUỸ KHẨN CẤP KHUYẾN NGHỊ
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {formatCurrencyVND(summary.recommendedEmergencyFund)}
          </p>
          <div className="flex items-center justify-between text-[11px] mt-1 font-mono">
            <span className="text-slate-500 dark:text-slate-400">
              Bộ đệm 6 tháng chi phí
            </span>
            <button
              type="button"
              onClick={onInitEmergencyFund}
              className="text-blue-600 dark:text-blue-400 hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Khởi tạo 6 tháng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
