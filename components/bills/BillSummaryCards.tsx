"use client";

import { FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { type BillSummaryDto } from "@/services/bill.service";

interface BillSummaryCardsProps {
  summary: BillSummaryDto;
}

export function BillSummaryCards({ summary }: BillSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Thẻ 1: Tổng công nợ phải trả */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
            TỔNG CÔNG NỢ PHẢI TRẢ (AP)
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 dark:bg-white/[0.04] dark:border-white/10 dark:text-slate-300 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatCurrencyVND(summary.totalBillsAmount)}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            {summary.totalBillsCount} khoản nghĩa vụ trong kỳ
          </span>
        </div>
      </div>

      {/* Thẻ 2: Đã giải ngân */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-emerald-200 dark:border-emerald-500/30 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-bold">
            ĐÃ GIẢI NGÂN / THANH TOÁN
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrencyVND(summary.paidAmount)}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Đã thanh toán đúng tiến độ
          </span>
        </div>
      </div>

      {/* Thẻ 3: Dư nợ còn phải trả */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
            DƯ NỢ CÒN PHẢI TRẢ
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
            {formatCurrencyVND(summary.unpaidAmount)}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Cần chuẩn bị dòng tiền chi trả
          </span>
        </div>
      </div>

      {/* Thẻ 4: Khoản nợ khẩn cấp */}
      <div
        className={`p-5 rounded-2xl border shadow-sm ${
          summary.urgentCount > 0
            ? "bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30"
            : "bg-white dark:bg-[#090e17] border-slate-200 dark:border-white/[0.08]"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-mono uppercase tracking-wider font-bold ${
              summary.urgentCount > 0 ? "text-rose-700 dark:text-rose-400" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            ĐẾN HẠN / QUÁ HẠN
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              summary.urgentCount > 0
                ? "bg-rose-100 border-rose-200 text-rose-700 dark:bg-rose-500/20 dark:border-rose-500/40 dark:text-rose-300 animate-pulse"
                : "bg-slate-100 border-slate-200 text-slate-500 dark:bg-white/[0.04] dark:border-white/10 dark:text-slate-400"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p
            className={`text-2xl font-bold font-mono tabular-nums ${
              summary.urgentCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"
            }`}
          >
            {summary.urgentCount} Khoản
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            {summary.urgentCount > 0
              ? "Cần giải ngân ngay để tránh phí phạt"
              : "Không có nợ khẩn cấp"}
          </span>
        </div>
      </div>
    </div>
  );
}
