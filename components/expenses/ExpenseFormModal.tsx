"use client";

import * as React from "react";
import { X, Wallet, Tag, Calendar, FileText, Check } from "lucide-react";
import { type ExpenseDto } from "@/services/expense.service";
import { type ExpenseInput } from "@/lib/validators";

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: ExpenseInput) => Promise<boolean>;
  initialData?: ExpenseDto | null;
  suggestedCategories?: string[];
}

const DEFAULT_CATEGORIES = [
  "Ăn uống & Thực phẩm",
  "Di chuyển & Xăng xe",
  "Mua sắm & Đồ dùng",
  "Nhà ở & Tiện ích",
  "Y tế & Sức khỏe",
  "Giáo dục & Phát triển",
  "Giải trí & Du lịch",
  "Tiếp khách & Đối tác",
  "Vật tư & Thiết bị",
  "Chi phí khác",
];

export function ExpenseFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  suggestedCategories = [],
}: ExpenseFormModalProps) {
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = React.useState("");
  const [category, setCategory] = React.useState(DEFAULT_CATEGORIES[0]);
  const [note, setNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const allCategories = React.useMemo(() => {
    const set = new Set([...DEFAULT_CATEGORIES, ...suggestedCategories]);
    return Array.from(set);
  }, [suggestedCategories]);

  React.useEffect(() => {
    if (initialData) {
      setDate(new Date(initialData.date).toISOString().split("T")[0]);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setNote(initialData.note || "");
    } else {
      setDate(new Date().toISOString().split("T")[0]);
      setAmount("");
      setCategory(DEFAULT_CATEGORIES[0]);
      setNote("");
    }
    setErrorMsg("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const parsedAmount = parseInt(amount.replace(/\D/g, ""), 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Vui lòng nhập số tiền chi tiêu hợp lệ");
      return;
    }

    if (!category.trim()) {
      setErrorMsg("Vui lòng nhập hoặc chọn danh mục");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit({
        date: new Date(date),
        amount: parsedAmount,
        category: category.trim(),
        note: note.trim() || undefined,
      });

      if (success) {
        onClose();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu chi tiêu";
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
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-white font-mono">
              {initialData ? "CHỈNH SỬA CHI TIÊU" : "GHI NHẬN CHI TIÊU MỚI"}
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
          {/* Ngày chi */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Ngày chi tiêu</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/[0.1] text-xs font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Số tiền */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-rose-400" />
              <span>Số tiền (VND)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Ví dụ: 150.000"
                value={amount}
                onChange={handleAmountChange}
                className="w-full px-3 py-2 pr-10 rounded-xl bg-[#030712] border border-white/[0.1] text-sm font-mono font-bold text-rose-400 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                ₫
              </span>
            </div>
          </div>

          {/* Danh mục */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Danh mục chi tiêu</span>
            </label>
            <input
              type="text"
              required
              list="category-suggestions"
              placeholder="Chọn hoặc nhập danh mục mới..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/[0.1] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <datalist id="category-suggestions">
              {allCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>

            {/* Quick Category Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {DEFAULT_CATEGORIES.slice(0, 5).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all ${
                    category === c
                      ? "bg-blue-600/25 border-blue-500 text-blue-300 font-bold"
                      : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Ghi chú */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Ghi chú / Diễn giải (tùy chọn)</span>
            </label>
            <textarea
              rows={2}
              placeholder="VD: Cà phê gặp gỡ đối tác sáng thứ 2..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/[0.1] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
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
              <span>{isSubmitting ? "Đang lưu..." : "Xác nhận lưu"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

