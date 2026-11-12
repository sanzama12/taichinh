"use client";

import * as React from "react";
import { formatCurrencyVND, formatDateVN } from "@/lib/utils";
import { type IncomeDto } from "@/services/income.service";
import { deleteIncomeAction } from "@/actions/income";
import { toast } from "sonner";
import {
  Building,
  ArrowUpRight,
  Edit2,
  Trash2,
  Plus,
  Coins,
  Calendar,
  FileCheck2,
} from "lucide-react";

interface IncomeListProps {
  incomes: IncomeDto[];
  onEdit: (item: IncomeDto) => void;
  onRefresh: () => void;
  onAddNew: () => void;
}

export function IncomeList({ incomes, onEdit, onRefresh, onAddNew }: IncomeListProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xác nhận xóa bản ghi doanh thu / nguồn thu "${name}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await deleteIncomeAction(id);
      if (!res.isSuccess) {
        toast.error("Không thể xóa", { description: res.error });
        return;
      }
      toast.success(`Đã xóa nguồn thu "${name}" thành công`);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xóa nguồn thu");
    } finally {
      setDeletingId(null);
    }
  };

  if (incomes.length === 0) {
    return (
      <div className="p-10 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] text-center my-6 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 dark:bg-white/[0.04] dark:border-white/10 dark:text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Coins className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Chưa ghi nhận nguồn doanh thu nào</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Thêm các hợp đồng định kỳ (doanh thu hàng tháng) hoặc doanh thu phát sinh từ dự án để quản lý dòng tiền vào doanh nghiệp.
        </p>
        <button
          type="button"
          onClick={onAddNew}
          className="mt-5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi nhận khoản thu đầu tiên</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incomes.map((item) => {
        const isMonthly = item.type === "monthly";
        const isDeleting = deletingId === item.id;

        return (
          <div
            key={item.id}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/15 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-xs"
          >
            {/* Cột trái: Tên & Thông tin hợp đồng / ngày */}
            <div className="flex items-center gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  isMonthly
                    ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400"
                    : "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                }`}
              >
                {isMonthly ? <Building className="w-5 h-5" /> : <FileCheck2 className="w-5 h-5" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.name}</h4>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${
                      isMonthly
                        ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    }`}
                  >
                    {isMonthly ? "Hợp đồng định kỳ" : "Nghiệm thu một lần"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {isMonthly
                      ? `Kỳ quyết toán: Ngày ${item.dayOfMonth} hàng tháng`
                      : item.date
                      ? `Ngày nghiệm thu: ${formatDateVN(item.date)}`
                      : "Không xác định"}
                  </span>

                  {item.note && (
                    <span className="text-slate-400 truncate max-w-[200px] sm:max-w-[300px]">
                      • {item.note}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Cột phải: Số tiền & Hành động */}
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-white/[0.06]">
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{formatCurrencyVND(item.amount)}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  title="Chỉnh sửa bản ghi"
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.name)}
                  disabled={isDeleting}
                  title="Xóa bản ghi"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
