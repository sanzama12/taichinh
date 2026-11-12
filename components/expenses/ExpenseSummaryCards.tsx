"use client";

import { CreditCard, Wallet, TrendingDown, DollarSign } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { type ExpenseSummaryDto } from "@/services/expense.service";

interface ExpenseSummaryCardsProps {
  summary: ExpenseSummaryDto;
}

export function ExpenseSummaryCards({ summary }: ExpenseSummaryCardsProps) {
  const isOverBudget = summary.exceededCategoriesCount > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Thẻ 1: Tổng Chi Tiêu Tháng */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
            TỔNG CHI TIÊU THÁNG
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
            -{formatCurrencyVND(summary.totalSpentThisMonth)}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Chi phí vận hành đã ghi nhận
          </span>
        </div>
      </div>

      {/* Thẻ 2: Hạn Mức Ngân Sách Đã Thiết Lập */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
            HẠN MỨC NGÂN SÁCH THÁNG
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatCurrencyVND(summary.totalBudgetLimit)}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Đã phân bổ cho các danh mục
          </span>
        </div>
      </div>

      {/* Thẻ 3: Tỷ Lệ Giải Ngân Ngân Sách */}
      <div
        className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden group ${
          isOverBudget
            ? "bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30"
            : "bg-white dark:bg-[#090e17] border-slate-200 dark:border-white/[0.08]"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-mono uppercase tracking-wider font-bold ${
              isOverBudget ? "text-rose-700 dark:text-rose-400" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            TỶ LỆ GIẢI NGÂN
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isOverBudget
                ? "bg-rose-100 border-rose-200 text-rose-700 dark:bg-rose-500/20 dark:border-rose-500/40 dark:text-rose-300"
                : "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-400"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p
            className={`text-2xl font-bold font-mono tabular-nums ${
              isOverBudget ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"
            }`}
          >
            {summary.budgetUtilizationPercent}%
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            {isOverBudget
              ? `Có ${summary.exceededCategoriesCount} danh mục vượt trần`
              : "Nằm trong tầm kiểm soát an toàn"}
          </span>
        </div>
      </div>

      {/* Thẻ 4: Cảnh Báo Ngân Sách */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
            DANH MỤC CẢNH BÁO
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
            {summary.warningCategoriesCount} Nhóm
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Đã tiêu thụ &ge; 80% hạn mức
          </span>
        </div>
      </div>
    </div>
  );
}
