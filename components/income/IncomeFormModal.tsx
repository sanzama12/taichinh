"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { X, Loader2, Plus, Edit2, Calendar, DollarSign, FileText } from "lucide-react";
import { type IncomeDto } from "@/services/income.service";
import { createIncomeAction, updateIncomeAction } from "@/actions/income";
import { IncomeSchema } from "@/lib/validators";

interface IncomeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingIncome?: IncomeDto | null;
}

export function IncomeFormModal({
  isOpen,
  onClose,
  onSuccess,
  editingIncome,
}: IncomeFormModalProps) {
  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState<number | string>("");
  const [type, setType] = React.useState<"monthly" | "oneTime">("monthly");
  const [dayOfMonth, setDayOfMonth] = React.useState<number>(1);
  const [date, setDate] = React.useState<string>(new Date().toISOString().split("T")[0]);
  const [note, setNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (editingIncome) {
      setName(editingIncome.name);
      setAmount(editingIncome.amount);
      setType(editingIncome.type);
      setDayOfMonth(editingIncome.dayOfMonth || 1);
      setDate(
        editingIncome.date
          ? editingIncome.date.split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setNote(editingIncome.note || "");
    } else {
      setName("");
      setAmount("");
      setType("monthly");
      setDayOfMonth(5);
      setDate(new Date().toISOString().split("T")[0]);
      setNote("");
    }
  }, [editingIncome, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = typeof amount === "string" ? parseInt(amount.replace(/\D/g, ""), 10) : amount;
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ lớn hơn 0");
      return;
    }

    const payload = {
      name,
      amount: numericAmount,
      type,
      dayOfMonth: type === "monthly" ? Number(dayOfMonth) : undefined,
      date: type === "oneTime" ? new Date(date) : undefined,
      note,
    };

    const validation = IncomeSchema.safeParse(payload);
    if (!validation.success) {
      toast.error(validation.error.errors[0]?.message || "Dữ liệu không hợp lệ");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingIncome) {
        const res = await updateIncomeAction(editingIncome.id, validation.data);
        if (!res.isSuccess) {
          toast.error("Cập nhật thất bại", { description: res.error });
          setIsSubmitting(false);
          return;
        }
        toast.success("Đã cập nhật nguồn thu nhập thành công");
      } else {
        const res = await createIncomeAction(validation.data);
        if (!res.isSuccess) {
          toast.error("Thêm nguồn thu thất bại", { description: res.error });
          setIsSubmitting(false);
          return;
        }
        toast.success("Đã thêm nguồn thu nhập mới thành công");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#090e17] border border-white/10 shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {editingIncome ? (
                <>
                  <Edit2 className="w-5 h-5 text-emerald-400" />
                  <span>Sửa Nguồn Thu Nhập</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-emerald-400" />
                  <span>Thêm Nguồn Thu Nhập Mới</span>
                </>
              )}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-5">
            {/* Tên nguồn thu */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Tên nguồn thu nhập
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Lương công ty, Tiền làm thêm, Cổ tức..."
                required
                className="w-full h-11 px-4 rounded-xl bg-[#05080f] border border-white/10 text-white text-sm focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>

            {/* Số tiền */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Số tiền (VND)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="VD: 25000000"
                  required
                  min="1000"
                  step="1000"
                  className="w-full h-11 pl-4 pr-12 rounded-xl bg-[#05080f] border border-white/10 text-white font-mono text-sm focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 font-bold">
                  ₫
                </span>
              </div>
            </div>

            {/* Loại thu nhập: Cố định hàng tháng vs Một lần */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Hình thức phân bổ
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("monthly")}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    type === "monthly"
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold"
                      : "bg-[#05080f] border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <span className="text-xs block">Lặp lại hàng tháng</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Lương, cho thuê nhà...</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType("oneTime")}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    type === "oneTime"
                      ? "bg-blue-500/15 border-blue-500 text-blue-400 font-bold"
                      : "bg-[#05080f] border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <span className="text-xs block">Thu nhập một lần</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Thưởng tết, bán tài sản...</span>
                </button>
              </div>
            </div>

            {/* Ngày nhận trong tháng hoặc ngày cụ thể */}
            {type === "monthly" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Ngày nhận tiền hàng tháng (1 - 31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(parseInt(e.target.value, 10))}
                  required
                  className="w-full h-11 px-4 rounded-xl bg-[#05080f] border border-white/10 text-white font-mono text-sm focus:border-emerald-500/80 outline-none"
                />
                <span className="text-[11px] text-slate-500 block">
                  Ví dụ: Chọn ngày 5 nếu nhận lương vào mùng 5 hàng tháng
                </span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Ngày nhận thực tế
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl bg-[#05080f] border border-white/10 text-white text-sm focus:border-emerald-500/80 outline-none"
                />
              </div>
            )}

            {/* Ghi chú */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ghi chú (Tùy chọn)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú chi tiết về nguồn thu này..."
                rows={2}
                className="w-full p-3 rounded-xl bg-[#05080f] border border-white/10 text-white text-sm focus:border-emerald-500/80 outline-none resize-none"
              />
            </div>

            {/* Nút hành động */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <span>{editingIncome ? "Cập Nhật" : "Thêm Nguồn Thu"}</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

