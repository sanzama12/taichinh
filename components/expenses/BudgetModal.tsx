"use client";

import * as React from "react";
import { X, PieChart, Tag, Check } from "lucide-react";
import { type BudgetInput } from "@/lib/validators";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: BudgetInput) => Promise<boolean>;
  initialCategory?: string;
  initialLimit?: number;
  availableCategories?: string[];
}

export function BudgetModal({
  isOpen,
  onClose,
  onSubmit,
  initialCategory = "",
  initialLimit = 0,
  availableCategories = [],
}: BudgetModalProps) {
  const [category, setCategory] = React.useState("");
  const [monthlyLimit, setMonthlyLimit] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    } else {
      setCategory("");
    }

    if (initialLimit && initialLimit > 0) {
      setMonthlyLimit(new Intl.NumberFormat("vi-VN").format(initialLimit));
    } else {
      setMonthlyLimit("");
    }
    setErrorMsg("");
  }, [initialCategory, initialLimit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const parsedLimit = parseInt(monthlyLimit.replace(/\D/g, ""), 10);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      setErrorMsg("Vui lòng nhập hạn mức lớn hơn 0 ₫");
      return;
    }

    if (!category.trim()) {
      setErrorMsg("Vui lòng chọn hoặc nhập danh mục");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit({
        category: category.trim(),
        monthlyLimit: parsedLimit,
      });

      if (success) {
        onClose();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu hạn mức";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      setMonthlyLimit("");
      return;
    }
    const num = parseInt(rawVal, 10);
    setMonthlyLimit(new Intl.NumberFormat("vi-VN").format(num));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#090e17] border border-white/[0.1] shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-white font-mono">
              THIẾT LẬP HẠN MỨC NGÂN SÁCH
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
          {/* Danh mục */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              <span>Danh mục áp dụng</span>
            </label>
            <input
              type="text"
              required
              list="budget-categories"
              placeholder="VD: Ăn uống & Tiếp khách"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/[0.1] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <datalist id="budget-categories">
              {availableCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Hạn mức tối đa tháng */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hạn mức tối đa hàng tháng (VND)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="VD: 5.000.000"
                value={monthlyLimit}
                onChange={handleLimitChange}
                className="w-full px-3 py-2 pr-10 rounded-xl bg-[#030712] border border-white/[0.1] text-sm font-mono font-bold text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                ₫
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Hệ thống sẽ báo vàng khi chi tiêu đạt 80% và báo đỏ khi vượt quá 100%.
            </p>
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
              <span>{isSubmitting ? "Đang lưu..." : "Áp dụng hạn mức"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

