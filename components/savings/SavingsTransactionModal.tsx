"use client";

import * as React from "react";
import { X, PlusCircle, MinusCircle, Calendar, FileText, Check } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { type SavingsGoalItemDto } from "@/services/savings.service";
import { type SavingsTransactionInput } from "@/lib/validators";

interface SavingsTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: SavingsTransactionInput) => Promise<boolean>;
  goal: SavingsGoalItemDto | null;
  defaultType: "deposit" | "withdraw";
}

export function SavingsTransactionModal({
  isOpen,
  onClose,
  onSubmit,
  goal,
  defaultType,
}: SavingsTransactionModalProps) {
  const [type, setType] = React.useState<"deposit" | "withdraw">(defaultType);
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => {
    setType(defaultType);
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setNote("");
    setErrorMsg("");
  }, [defaultType, goal, isOpen]);

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const parsedAmount = parseInt(amount.replace(/\D/g, ""), 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Vui lòng nhập số tiền giao dịch hợp lệ");
      return;
    }

    if (type === "withdraw" && parsedAmount > goal.currentAmount) {
      setErrorMsg(
        `Số dư hiện tại (${formatCurrencyVND(goal.currentAmount)}) không đủ để rút ${formatCurrencyVND(parsedAmount)}`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit({
        goalId: goal.id,
        type,
        amount: parsedAmount,
        date: new Date(date),
        note: note.trim() || undefined,
      });

      if (success) {
        onClose();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi ghi nhận giao dịch";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      setAmount("");
      return;
    }
    const num = parseInt(rawVal, 10);
    setAmount(new Intl.NumberFormat("vi-VN").format(num));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#090e17] border border-white/[0.1] shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                type === "deposit"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/15 border-rose-500/30 text-rose-400"
              }`}
            >
              {type === "deposit" ? <PlusCircle className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wide">
                {type === "deposit" ? "NẠP TIỀN TÍCH LŨY" : "RÚT TIỀN TỪ MỤC TIÊU"}
              </h3>
              <p className="text-xs text-slate-400 font-mono">Mục tiêu: {goal.name}</p>
            </div>
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
          {/* Chuyển đổi loại Nạp / Rút */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#030712] border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setType("deposit")}
              className={`py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                type === "deposit"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              + Nạp tích lũy
            </button>
            <button
              type="button"
              onClick={() => setType("withdraw")}
              className={`py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                type === "withdraw"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              - Rút tiền
            </button>
          </div>

          {/* Số dư hiện tại của mục tiêu */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Số dư hiện tại của mục tiêu:</span>
            <span className="font-bold text-emerald-400 tabular-nums">
              {formatCurrencyVND(goal.currentAmount)}
            </span>
          </div>

          {/* Số tiền giao dịch */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300">
              Số tiền {type === "deposit" ? "nạp vào" : "rút ra"} (VND)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="VD: 2.000.000"
                value={amount}
                onChange={handleAmountChange}
                className={`w-full px-3 py-2 pr-10 rounded-xl bg-[#030712] border border-white/[0.1] text-sm font-mono font-bold placeholder-slate-600 focus:outline-none transition-colors ${
                  type === "deposit"
                    ? "text-emerald-400 focus:border-emerald-500"
                    : "text-rose-400 focus:border-rose-500"
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                ₫
              </span>
            </div>
          </div>

          {/* Ngày thực hiện */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Ngày giao dịch</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Ghi chú */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Ghi chú diễn giải (tùy chọn)</span>
            </label>
            <input
              type="text"
              placeholder="VD: Tiền thưởng quý, trích từ lương tháng 11..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/[0.1] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
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
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold text-white shadow-lg transition-all disabled:opacity-50 ${
                type === "deposit"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                  : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Đang xử lý..." : "Xác nhận giao dịch"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

