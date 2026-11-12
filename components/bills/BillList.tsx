"use client";

import * as React from "react";
import { formatCurrencyVND, formatDateVN } from "@/lib/utils";
import { type BillItemDto } from "@/services/bill.service";
import { toggleBillPaidAction, deleteBillAction } from "@/actions/bills";
import { toast } from "sonner";
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Edit2,
  Trash2,
  Plus,
  FileText,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CreditCard,
} from "lucide-react";

interface BillListProps {
  bills: BillItemDto[];
  month: number;
  year: number;
  statusFilter: "all" | "unpaid" | "paid";
  onMonthChange: (month: number, year: number) => void;
  onFilterChange: (filter: "all" | "unpaid" | "paid") => void;
  onEdit: (item: BillItemDto) => void;
  onRefresh: () => void;
  onAddNew: () => void;
}

export function BillList({
  bills,
  month,
  year,
  statusFilter,
  onMonthChange,
  onFilterChange,
  onEdit,
  onRefresh,
  onAddNew,
}: BillListProps) {
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12, year - 1);
    } else {
      onMonthChange(month - 1, year);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1, year + 1);
    } else {
      onMonthChange(month + 1, year);
    }
  };

  const handleTogglePaid = async (billId: string, billName: string) => {
    try {
      setUpdatingId(billId);
      const res = await toggleBillPaidAction(billId, month, year);
      if (!res.isSuccess) {
        toast.error("Không thể cập nhật trạng thái", { description: res.error });
        return;
      }

      if (res.data.isPaid) {
        toast.success(`Đã xác nhận giải ngân thanh toán cho "${billName}" trong kỳ ${month}/${year}`);
      } else {
        toast.info(`Đã hoàn tác trạng thái thanh toán của "${billName}"`);
      }

      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật trạng thái công nợ");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xác nhận xóa nghĩa vụ công nợ "${name}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await deleteBillAction(id);
      if (!res.isSuccess) {
        toast.error("Không thể xóa", { description: res.error });
        return;
      }
      toast.success(`Đã xóa khoản công nợ "${name}" thành công`);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xóa khoản công nợ");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Thanh công cụ: Chọn Kỳ Tài Chính & Bộ lọc */}
      <div className="p-4 rounded-2xl bg-[#090e17] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Bộ chuyển kỳ kế toán */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-[#05080f] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Kỳ trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-mono font-bold text-white px-3 py-1.5 rounded-xl bg-[#05080f] border border-white/10 min-w-[150px] text-center">
            Kỳ Tháng {month.toString().padStart(2, "0")} / {year}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-[#05080f] border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Kỳ sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bộ lọc trạng thái thanh toán */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#05080f] border border-white/10">
          {(["all", "unpaid", "paid"] as const).map((filter) => {
            const label = filter === "all" ? "Tất cả công nợ" : filter === "unpaid" ? "Chưa thanh toán" : "Đã thanh toán";
            const isSelected = statusFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => onFilterChange(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white/[0.1] text-blue-400 font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Danh sách các khoản công nợ */}
      {bills.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#090e17] border border-white/[0.08] text-center my-6">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Không ghi nhận khoản công nợ nào trong kỳ</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {statusFilter === "unpaid"
              ? `Doanh nghiệp đã hoàn tất giải ngân toàn bộ nghĩa vụ tài chính kỳ ${month}/${year}.`
              : "Thêm các khoản hóa đơn định kỳ, tiền thuê mặt bằng, dịch vụ đám mây, lương hoặc hợp đồng nhà cung cấp để quản lý công nợ chặt chẽ."}
          </p>
          {statusFilter === "all" && (
            <button
              type="button"
              onClick={onAddNew}
              className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi nhận khoản công nợ đầu tiên</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map((item) => {
            const isUpdating = updatingId === item.id;
            const isDeleting = deletingId === item.id;

            const isUrgent = item.statusColor === "red";
            const isWarning = item.statusColor === "yellow";
            const isPaid = item.isPaid;

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl bg-[#090e17] border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isPaid
                    ? "border-emerald-500/20 opacity-80"
                    : isUrgent
                    ? "border-rose-500/40 bg-rose-500/[0.02]"
                    : isWarning
                    ? "border-amber-500/40 bg-amber-500/[0.02]"
                    : "border-white/[0.08] hover:border-white/15"
                }`}
              >
                {/* Cột trái: Tên nghĩa vụ, Hạn quyết toán & Trạng thái */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      isPaid
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                        : isUrgent
                        ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                        : isWarning
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                        : "bg-white/[0.04] border-white/10 text-slate-400"
                    }`}
                  >
                    {isPaid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isUrgent ? (
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`font-bold text-sm ${
                          isPaid ? "line-through text-slate-400" : "text-white"
                        }`}
                      >
                        {item.name}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-white/10 bg-[#05080f] text-slate-400">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Hạn thanh toán: {formatDateVN(item.actualDueDate)} (Kỳ hạn ngày {item.dueDay})
                      </span>

                      {/* Badge trạng thái hạn nợ */}
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : isUrgent
                            ? "bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse"
                            : isWarning
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : "bg-white/[0.04] text-slate-400 border-white/10"
                        }`}
                      >
                        {item.statusLabel}
                      </span>

                      {item.note && (
                        <span className="text-slate-500 truncate max-w-[200px]">
                          • {item.note}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cột phải: Số tiền & Nút Giải Ngân / Thanh Toán */}
                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
                  <span
                    className={`text-base sm:text-lg font-bold font-mono tabular-nums ${
                      isPaid ? "text-slate-400 line-through" : isUrgent ? "text-rose-400" : "text-white"
                    }`}
                  >
                    {formatCurrencyVND(item.amount)}
                  </span>

                  {/* Nút bấm Thanh Toán / Hủy */}
                  <button
                    type="button"
                    onClick={() => handleTogglePaid(item.id, item.name)}
                    disabled={isUpdating}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                      isPaid
                        ? "bg-[#05080f] border border-white/10 text-slate-400 hover:text-white"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 active:scale-95"
                    }`}
                  >
                    {isPaid ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Hủy Xác Nhận</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Thanh Toán</span>
                      </>
                    )}
                  </button>

                  {/* Nút Sửa & Xóa */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      title="Chỉnh sửa khoản công nợ"
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.name)}
                      disabled={isDeleting}
                      title="Xóa khoản công nợ"
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
