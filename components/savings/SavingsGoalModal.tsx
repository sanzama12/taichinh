"use client";

import * as React from "react";
import { X, Target, Calendar, Wallet, Check } from "lucide-react";
import { type SavingsGoalItemDto } from "@/services/savings.service";
import { type SavingsGoalInput } from "@/lib/validators";

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: SavingsGoalInput) => Promise<boolean>;
  initialData?: SavingsGoalItemDto | null;
}

export function SavingsGoalModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: SavingsGoalModalProps) {
  const [name, setName] = React.useState("");
  const [targetAmount, setTargetAmount] = React.useState("");
  const [currentAmount, setCurrentAmount] = React.useState("");
  const [deadline, setDeadline] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTargetAmount(new Intl.NumberFormat("vi-VN").format(initialData.targetAmount));
      setCurrentAmount(new Intl.NumberFormat("vi-VN").format(initialData.currentAmount));
      setDeadline(new Date(initialData.deadline).toISOString().split("T")[0]);
    } else {
      setName("");
      setTargetAmount("");
      setCurrentAmount("0");
      // Mặc định hạn chót là 6 tháng tới
      const sixMonthsLater = new Date();
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
      setDeadline(sixMonthsLater.toISOString().split("T")[0]);
    }
    setErrorMsg("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const parsedTarget = parseInt(targetAmount.replace(/\D/g, ""), 10);
    const parsedCurrent = parseInt(currentAmount.replace(/\D/g, ""), 10) || 0;

    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập tên mục tiêu tiết kiệm");
      return;
    }

    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setErrorMsg("Vui lòng nhập số tiền mục tiêu lớn hơn 0");
      return;
    }

    if (!deadline) {
      setErrorMsg("Vui lòng chọn ngày hạn chót");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit({
        name: name.trim(),
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        deadline: new Date(deadline),
      });

      if (success) {
        onClose();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu mục tiêu";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      setTargetAmount("");
      return;
    }
    const num = parseInt(rawVal, 10);
    setTargetAmount(new Intl.NumberFormat("vi-VN").format(num));
  };

  const handleCurrentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      setCurrentAmount("");
      return;
    }
    const num = parseInt(rawVal, 10);
    setCurrentAmount(new Intl.NumberFormat("vi-VN").format(num));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#090e17] border border-white/[0.1] shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-white font-mono">
              {initialData ? "CHỈNH SỬA MỤC TIÊU TIẾT KIỆM" : "TẠO MỤC TIÊU TIẾT KIỆM MỚI"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên mục tiêu */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <span>Tên mục tiêu tích lũy</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Mua xe máy mới, Quỹ du lịch Châu Âu, Quỹ khởi nghiệp..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/[0.1] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Số tiền mục tiêu */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Số tiền mục tiêu cần đạt (VND)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="VD: 50.000.000"
                value={targetAmount}
                onChange={handleTargetChange}
                className="w-full px-3 py-2 pr-10 rounded-xl bg-[#030712] border border-white/[0.1] text-sm font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                ₫
              </span>
            </div>
          </div>

          {/* Số tiền ban đầu đã có */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-slate-400" />
              <span>Số tiền hiện có (VND)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="VD: 5.000.000"
                value={currentAmount}
                onChange={handleCurrentChange}
                className="w-full px-3 py-2 pr-10 rounded-xl bg-[#030712] border border-white/[0.1] text-xs font-mono text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                ₫
              </span>
            </div>
          </div>

          {/* Hạn chót */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Hạn chót hoàn thành</span>
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-slate-300 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-mono font-bold text-white shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Đang lưu..." : "Xác nhận"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

