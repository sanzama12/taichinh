"use client";

import { TrendingUp, Building, ArrowUpRight, BarChart2 } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { type IncomeSummaryDto } from "@/services/income.service";

interface IncomeSummaryCardsProps {
  summary: IncomeSummaryDto;
}

export function IncomeSummaryCards({ summary }: IncomeSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Thẻ 1: Doanh thu định kỳ (MRR) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
            DOANH THU ĐỊNH KỲ (MRR)
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 flex items-center justify-center">
            <Building className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatCurrencyVND(summary.monthlyFixed)}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Hợp đồng & nguồn thu cố định
          </span>
        </div>
      </div>

      {/* Thẻ 2: Doanh thu dự án / phát sinh */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
            DOANH THU PHÁT SINH
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatCurrencyVND(summary.oneTimeThisMonth)}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Nghiệm thu dự án & bán hàng
          </span>
        </div>
      </div>

      {/* Thẻ 3: Tổng dòng tiền vào tháng */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-emerald-200 dark:border-emerald-500/30 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-bold">
            TỔNG DÒNG TIỀN VÀO THÁNG
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{formatCurrencyVND(summary.totalThisMonth)}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Tổng thực thu kỳ tháng này
          </span>
        </div>
      </div>

      {/* Thẻ 4: Dự báo doanh thu năm */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
            DỰ BÁO DOANH THU NĂM
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 flex items-center justify-center">
            <BarChart2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            ~{formatCurrencyVND(summary.estimatedYearly)}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Dự phóng định kỳ 12 tháng
          </span>
        </div>
      </div>
    </div>
  );
}
