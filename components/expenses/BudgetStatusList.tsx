"use client";

import { PieChart, Plus, SlidersHorizontal, AlertCircle, AlertTriangle, CheckCircle2, Trash2, Edit2 } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { type CategoryBudgetStatusDto } from "@/services/expense.service";

interface BudgetStatusListProps {
  budgets: CategoryBudgetStatusDto[];
  onOpenSetBudget: (category?: string, currentLimit?: number) => void;
  onDeleteBudget: (budgetId: string) => void;
}

export function BudgetStatusList({
  budgets,
  onOpenSetBudget,
  onDeleteBudget,
}: BudgetStatusListProps) {
  return (
    <div className="p-6 rounded-2xl bg-[#090e17] border border-white/[0.08] shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
            HẠN MỨC NGÂN SÁCH THEO DANH MỤC
          </h3>
        </div>

        <button
          onClick={() => onOpenSetBudget()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-mono font-medium hover:bg-blue-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thiết lập hạn mức</span>
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-xs">
          <SlidersHorizontal className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <span>Chưa có hạn mức nào được thiết lập. Hãy bấm nút trên để đặt hạn mức cho danh mục chi tiêu.</span>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((item) => {
            const hasLimit = item.monthlyLimit > 0;
            const isExceeded = item.status === "exceeded";
            const isWarning = item.status === "warning";

            return (
              <div
                key={item.category}
                className={`p-4 rounded-xl border transition-all ${
                  isExceeded
                    ? "bg-rose-500/5 border-rose-500/30 shadow-sm shadow-rose-500/5"
                    : isWarning
                    ? "bg-amber-500/5 border-amber-500/30"
                    : "bg-[#030712] border-white/[0.06]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{item.category}</h4>
                      {isExceeded && (
                        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                          <AlertCircle className="w-3 h-3" /> VƯỢT NGÂN SÁCH
                        </span>
                      )}
                      {isWarning && (
                        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                          <AlertTriangle className="w-3 h-3" /> CẢNH BÁO {item.percentage}%
                        </span>
                      )}
                      {!isExceeded && !isWarning && hasLimit && (
                        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          <CheckCircle2 className="w-3 h-3" /> An toàn
                        </span>
                      )}
                      {!hasLimit && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                          Chưa đặt hạn mức
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-base font-mono font-bold text-white tabular-nums">
                        {formatCurrencyVND(item.spent)}
                      </span>
                      {hasLimit && (
                        <span className="text-xs font-mono text-slate-400">
                          / {formatCurrencyVND(item.monthlyLimit)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenSetBudget(item.category, item.monthlyLimit)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                      title="Sửa hạn mức"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {item.id && (
                      <button
                        onClick={() => onDeleteBudget(item.id!)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Xóa hạn mức"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {hasLimit ? (
                  <div className="mt-3">
                    <div className="w-full bg-white/[0.08] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isExceeded
                            ? "bg-rose-500 shadow-sm shadow-rose-500"
                            : isWarning
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-mono mt-1.5">
                      <span
                        className={
                          isExceeded
                            ? "text-rose-400 font-bold"
                            : isWarning
                            ? "text-amber-400 font-semibold"
                            : "text-slate-400"
                        }
                      >
                        {item.percentage}% hạn mức
                      </span>
                      <span
                        className={
                          isExceeded
                            ? "text-rose-400 font-bold"
                            : "text-slate-400"
                        }
                      >
                        {item.remaining >= 0
                          ? `Còn lại: ${formatCurrencyVND(item.remaining)}`
                          : `Vượt quá: ${formatCurrencyVND(Math.abs(item.remaining))}`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 pt-2 border-t border-white/[0.04]">
                    <button
                      onClick={() => onOpenSetBudget(item.category, 0)}
                      className="text-xs font-mono text-blue-400 hover:text-blue-300 underline underline-offset-2"
                    >
                      + Đặt hạn mức chi tiêu cho mục này
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

