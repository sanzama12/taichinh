"use client";

import { TrendingUp, CreditCard, Wallet, Calculator } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { type ReportSummaryDto } from "@/services/report.service";

interface ReportSummaryCardsProps {
  summary: ReportSummaryDto;
}

export function ReportSummaryCards({ summary }: ReportSummaryCardsProps) {
  const isNetPositive = summary.totalNetRemaining >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng Thu Nhập Cả Năm */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
            TỔNG THU NHẬP NĂM {summary.year}
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{formatCurrencyVND(summary.totalIncome)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Trung bình: ~{formatCurrencyVND(summary.avgIncome)}/tháng
          </p>
        </div>
      </div>

      {/* 2. Tổng Chi Phí (Cố Định + Linh Hoạt) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
            TỔNG CHI PHÍ NĂM {summary.year}
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
            -{formatCurrencyVND(summary.totalSpent)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            <span>Cố định: {formatCurrencyVND(summary.totalFixedBills)}</span>
            <span>•</span>
            <span>Biến phí: {formatCurrencyVND(summary.totalFlexibleExpenses)}</span>
          </div>
        </div>
      </div>

      {/* 3. Dòng Tiền Thặng Dư / Thâm Hụt Cả Năm */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
            THẶNG DƯ RÒNG NĂM {summary.year}
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isNetPositive
                ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-400"
                : "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-400"
            }`}
          >
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p
            className={`text-2xl font-bold font-mono tabular-nums ${
              isNetPositive ? "text-slate-900 dark:text-white" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatCurrencyVND(summary.totalNetRemaining)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Trung bình: {formatCurrencyVND(summary.avgNetRemaining)}/tháng
          </p>
        </div>
      </div>

      {/* 4. Tỷ Lệ Tiết Kiệm Bình Quân */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
            TỶ SUẤT TÍCH LŨY RÒNG
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
            {summary.overallSavingsRatePercent}%
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Tổng dòng tiền thặng dư / Tổng thu nhập
          </p>
        </div>
      </div>
    </div>
  );
}
