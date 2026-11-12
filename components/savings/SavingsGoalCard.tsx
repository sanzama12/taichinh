"use client";

import { format } from "date-fns";
import {
  Target,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  MinusCircle,
  Edit2,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { type SavingsGoalItemDto } from "@/services/savings.service";

interface SavingsGoalCardProps {
  goal: SavingsGoalItemDto;
  onOpenDeposit: (goal: SavingsGoalItemDto) => void;
  onOpenWithdraw: (goal: SavingsGoalItemDto) => void;
  onQuickDepositToday?: (goal: SavingsGoalItemDto) => void;
  onEdit: (goal: SavingsGoalItemDto) => void;
  onDelete: (goalId: string) => void;
}

export function SavingsGoalCard({
  goal,
  onOpenDeposit,
  onOpenWithdraw,
  onQuickDepositToday,
  onEdit,
  onDelete,
}: SavingsGoalCardProps) {
  const deadlineDate = new Date(goal.deadline);
  const formattedDeadline = format(deadlineDate, "dd/MM/yyyy");

  return (
    <div
      className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
        goal.isCompleted
          ? "bg-[#090e17] border-emerald-500/30 shadow-lg shadow-emerald-500/5"
          : goal.isCompletedToday
          ? "bg-[#090e17] border-emerald-500/20 shadow-md shadow-emerald-500/5"
          : goal.isOverdue
          ? "bg-[#090e17] border-rose-500/30 shadow-lg shadow-rose-500/5"
          : "bg-[#090e17] border-white/[0.08] hover:border-white/[0.15]"
      }`}
    >
      <div>
        {/* Header card */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-white tracking-wide">{goal.name}</h3>
              {goal.isCompleted ? (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-bold">
                  <CheckCircle2 className="w-3 h-3" /> ĐÃ HOÀN THÀNH THÁNG
                </span>
              ) : goal.isCompletedToday ? (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-bold">
                  ☀️ ĐÃ NẠP HÔM NAY
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 font-bold">
                  ⏳ CHƯA NẠP HÔM NAY
                </span>
              )}
              {goal.isOverdue && !goal.isCompleted && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/25 font-bold">
                  <AlertCircle className="w-3 h-3" /> QUÁ HẠN
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Hạn chót: {formattedDeadline}</span>
              <span>•</span>
              <span className={goal.daysRemaining < 30 && !goal.isCompleted ? "text-amber-400 font-bold" : ""}>
                {goal.daysRemaining > 0
                  ? `Còn ${goal.daysRemaining} ngày`
                  : goal.daysRemaining === 0
                  ? "Hạn chót hôm nay"
                  : `Đã quá hạn ${Math.abs(goal.daysRemaining)} ngày`}
              </span>
            </div>
          </div>

          {/* Quick Edit & Delete */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Sửa mục tiêu"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Xóa mục tiêu"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tiến độ và Số tiền */}
        <div className="mt-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                ĐÃ TÍCH LŨY
              </span>
              <p className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {formatCurrencyVND(goal.currentAmount)}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                MỤC TIÊU 1 THÁNG
              </span>
              <p className="text-xl font-bold font-mono text-white tabular-nums">
                {formatCurrencyVND(goal.targetAmount)}
              </p>
            </div>
          </div>

          {/* Thanh tiến độ % */}
          <div className="space-y-1">
            <div className="w-full bg-white/[0.08] rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  goal.isCompleted
                    ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                    : "bg-blue-500 shadow-sm shadow-blue-500/50"
                }`}
                style={{ width: `${goal.progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
              <span className="font-bold text-white">{goal.progressPercent}% hoàn thành</span>
              <span>
                {goal.remainingAmount > 0
                  ? `Còn thiếu ${formatCurrencyVND(goal.remainingAmount)}`
                  : "Đã đạt 100% mục tiêu"}
              </span>
            </div>
          </div>

          {/* Hộp cơ chế: Đặt mục tiêu nạp mỗi ngày để tổng 1 tháng */}
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Chỉ tiêu mỗi ngày:</span>
              <span className="text-amber-400 font-bold tabular-nums">
                {formatCurrencyVND(goal.dailyTarget)} / ngày
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Hôm nay:</span>
              {goal.isCompletedToday ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã nạp {formatCurrencyVND(goal.todayDepositedAmount)}</span>
                </span>
              ) : (
                <span className="text-amber-300 font-medium">
                  {goal.todayDepositedAmount > 0
                    ? `Đã nạp ${formatCurrencyVND(goal.todayDepositedAmount)} / ${formatCurrencyVND(goal.dailyTarget)}`
                    : "Chưa nạp hôm nay"}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.06] text-[11px]">
              <span className="text-slate-400">Đã nạp tháng này:</span>
              <span className="font-bold text-white">
                {goal.monthDepositedDays} / {goal.totalDaysInMonth} ngày
              </span>
            </div>
          </div>

          {/* Nút nạp nhanh 1-chạm chỉ tiêu hôm nay */}
          {!goal.isCompleted && !goal.isCompletedToday && (
            <button
              type="button"
              onClick={() => onQuickDepositToday ? onQuickDepositToday(goal) : onOpenDeposit(goal)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FFC700] hover:bg-[#FBBF24] text-[#111827] text-xs font-mono font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer border border-amber-400 active:scale-98"
            >
              <Zap className="w-4 h-4 fill-current stroke-none" />
              <span>
                Nạp nhanh chỉ tiêu hôm nay: {formatCurrencyVND(Math.max(goal.dailyTarget - goal.todayDepositedAmount, 0))}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Footer Action buttons: Nạp / Rút */}
      <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center gap-2">
        <button
          onClick={() => onOpenDeposit(goal)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/25 text-xs font-mono font-medium transition-all cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ Nạp tùy chọn</span>
        </button>

        <button
          onClick={() => onOpenWithdraw(goal)}
          disabled={goal.currentAmount <= 0}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08] text-xs font-mono font-medium transition-all disabled:opacity-40 cursor-pointer"
        >
          <MinusCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>- Rút tiền</span>
        </button>
      </div>
    </div>
  );
}

