"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { X, Loader2, Plus, Edit2, Receipt, Calendar } from "lucide-react";
import { type BillItemDto } from "@/services/bill.service";
import { createBillAction, updateBillAction } from "@/actions/bills";
import { BillSchema } from "@/lib/validators";

interface BillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingBill?: BillItemDto | null;
}

const CATEGORIES = [
  "Điện, Nước & Tiện ích",
  "Nhà ở & Tiền thuê",
  "Internet & Viễn thông",
  "Trả góp & Nợ vay",
  "Bảo hiểm & Y tế",
  "Học phí & Giáo dục",
  "Dịch vụ đăng ký (Netflix, Spotify...)",
  "Khác",
];

export function BillFormModal({
  isOpen,
  onClose,
  onSuccess,
  editingBill,
}: BillFormModalProps) {
  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState<number | string>("");
  const [dueDay, setDueDay] = React.useState<number>(1);
  const [category, setCategory] = React.useState(CATEGORIES[0]);
  const [note, setNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (editingBill) {
      setName(editingBill.name);
      setAmount(editingBill.amount);
      setDueDay(editingBill.dueDay);
      setCategory(editingBill.category);
      setNote(editingBill.note || "");
    } else {
      setName("");
      setAmount("");
      setDueDay(10);
      setCategory(CATEGORIES[0]);
      setNote("");
    }
  }, [editingBill, isOpen]);

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
      dueDay: Number(dueDay),
      category,
      note,
      isActive: true,
    };

    const validation = BillSchema.safeParse(payload);
    if (!validation.success) {
      toast.error(validation.error.errors[0]?.message || "Dữ liệu không hợp lệ");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingBill) {
        const res = await updateBillAction(editingBill.id, validation.data);
        if (!res.isSuccess) {
          toast.error("Cập nhật thất bại", { description: res.error });
          setIsSubmitting(false);
          return;
        }
        toast.success("Đã cập nhật khoản phải trả thành công");
      } else {
        const res = await createBillAction(validation.data);
        if (!res.isSuccess) {
          toast.error("Thêm khoản phải trả thất bại", { description: res.error });
          setIsSubmitting(false);
          return;
        }
        toast.success("Đã thêm khoản phải trả mới thành công");
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
              {editingBill ? (
                <>
                  <Edit2 className="w-5 h-5 text-amber-400" />
                  <span>Sửa Khoản Phải Trả</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-amber-400" />
                  <span>Thêm Khoản Phải Trả Mới</span>
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
            {/* Tên khoản phải trả */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Tên khoản phải trả
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Tiền điện tháng, Trả góp FE Credit..."
                required
                className="w-full h-11 px-4 rounded-xl bg-[#05080f] border border-white/10 text-white text-sm focus:border-amber-500/80 outline-none"
              />
            </div>

            {/* Số tiền */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Số tiền phải trả (VND)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="VD: 1250000"
                  required
                  min="1000"
                  step="1000"
                  className="w-full h-11 pl-4 pr-12 rounded-xl bg-[#05080f] border border-white/10 text-white font-mono text-sm focus:border-amber-500/80 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 font-bold">
                  ₫
                </span>
              </div>
            </div>

            {/* Ngày đến hạn trong tháng */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ngày đến hạn hàng tháng (1 - 31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(parseInt(e.target.value, 10))}
                required
                className="w-full h-11 px-4 rounded-xl bg-[#05080f] border border-white/10 text-white font-mono text-sm focus:border-amber-500/80 outline-none"
              />
              <span className="text-[11px] text-slate-500 block">
                Hệ thống tự động xử lý ngày 29-31 nếu tháng ngắn (ví dụ tháng 2 = ngày cuối tháng).
              </span>
            </div>

            {/* Danh mục */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Danh mục phân loại
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#05080f] border border-white/10 text-white text-sm focus:border-amber-500/80 outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#090e17] text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Ghi chú */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ghi chú thêm (Tùy chọn)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Số hợp đồng, tài khoản ngân hàng chuyển khoản..."
                rows={2}
                className="w-full p-3 rounded-xl bg-[#05080f] border border-white/10 text-white text-sm focus:border-amber-500/80 outline-none resize-none"
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
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <span>{editingBill ? "Cập Nhật" : "Thêm Khoản Phải Trả"}</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

