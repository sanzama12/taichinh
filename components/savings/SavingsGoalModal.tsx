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
  const [dailyTarget, setDailyTarget] = React.useState("");
  const [targetAmount, setTargetAmount] = React.useState("");
  const [currentAmount, setCurrentAmount] = React.useState("");
  const [deadline, setDeadline] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDailyTarget(
        initialData.dailyTarget
          ? new Intl.NumberFormat("vi-VN").format(initialData.dailyTarget)
          : new Intl.NumberFormat("vi-VN").format(Math.round(initialData.targetAmount / 30))
      );
      setTargetAmount(new Intl.NumberFormat("vi-VN").format(initialData.targetAmount));
      setCurrentAmount(new Intl.NumberFormat("vi-VN").format(initialData.currentAmount));
      setDeadline(new Date(initialData.deadline).toISOString().split("T")[0]);
    } else {
      const now = new Date();
      const monthStr = `${now.getMonth() + 1}/${now.getFullYear()}`;
      setName(`Tiết kiệm tích lũy tháng ${monthStr}`);
      setDailyTarget("100.000");
      setTargetAmount("3.000.000");
      setCurrentAmount("0");
      // Mặc định hạn chót là cuối tháng hiện tại
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setDeadline(endOfMonth.toISOString().split("T")[0]);
    }
    setErrorMsg("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const parsedTarget = parseInt(targetAmount.replace(/\D/g, ""), 10);
    const parsedDaily =
      parseInt(dailyTarget.replace(/\D/g, ""), 10) || Math.round(parsedTarget / 30);
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
        dailyTarget: parsedDaily,
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

  // Khi thay đổi mục tiêu nạp mỗi ngày -> Tự động tính Tổng 1 tháng (x 30 ngày)
  const handleDailyTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      setDailyTarget("");
      return;
    }
    const dailyNum = parseInt(rawVal, 10);
    setDailyTarget(new Intl.NumberFormat("vi-VN").format(dailyNum));
    const monthlyTotal = dailyNum * 30;
    setTargetAmount(new Intl.NumberFormat("vi-VN").format(monthlyTotal));
  };

  // Khi thay đổi tổng mục tiêu 1 tháng -> Tự động tính Mục tiêu mỗi ngày (/ 30 ngày)
  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      setTargetAmount("");
      return;
    }
    const num = parseInt(rawVal, 10);
    setTargetAmount(new Intl.NumberFormat("vi-VN").format(num));
    const dailyNum = Math.round(num / 30);
    setDailyTarget(new Intl.NumberFormat("vi-VN").format(dailyNum));
  };

  const handleSelectPreset = (daily: number) => {
    setDailyTarget(new Intl.NumberFormat("vi-VN").format(daily));
    setTargetAmount(new Intl.NumberFormat("vi-VN").format(daily * 30));
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
              <span>Tên sổ tiết kiệm / mục tiêu</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Tiết kiệm tích lũy tháng 11, Nuôi heo mỗi ngày..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/[0.1] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Mục tiêu nạp mỗi ngày & Tổng mục tiêu 1 tháng */}
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-blue-300 flex items-center justify-between">
                <span>🎯 Mục tiêu nạp MỖI NGÀY (₫/ngày) *</span>
                <span className="text-[10px] text-amber-400 font-normal">Nạp đều mỗi ngày</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="VD: 100.000"
                  value={dailyTarget}
                  onChange={handleDailyTargetChange}
                  className="w-full px-3 py-2 pr-10 rounded-xl bg-[#030712] border border-amber-400/50 text-sm font-mono font-bold text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                  ₫/ngày
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono text-slate-400">Chọn nhanh:</span>
              <button
                type="button"
                onClick={() => handleSelectPreset(50000)}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/10 transition-colors cursor-pointer"
              >
                50k/ngày (1.5tr)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset(100000)}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
              >
                ⭐ 100k/ngày (3tr)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset(200000)}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/10 transition-colors cursor-pointer"
              >
                200k/ngày (6tr)
              </button>
            </div>

            {/* Tổng mục tiêu 1 tháng */}
            <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
              <label className="text-xs font-mono font-medium text-slate-300 flex items-center justify-between">
                <span>Tổng tích lũy 1 THÁNG (30 ngày)</span>
                <span className="text-[10px] text-emerald-400 font-normal">= Mỗi ngày x 30</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="VD: 3.000.000"
                  value={targetAmount}
                  onChange={handleTargetChange}
                  className="w-full px-3 py-2 pr-10 rounded-xl bg-[#030712] border border-white/[0.1] text-sm font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                  ₫/tháng
                </span>
              </div>
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

