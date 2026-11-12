"use client";

import * as React from "react";
import { Plus, RefreshCw, FileText } from "lucide-react";
import { EvnLogo } from "@/components/icons/BrandLogos";
import { BillSummaryCards } from "@/components/bills/BillSummaryCards";
import { BillList } from "@/components/bills/BillList";
import { BillFormModal } from "@/components/bills/BillFormModal";
import { getBillsPageDataAction } from "@/actions/bills";
import { type BillItemDto, type BillSummaryDto } from "@/services/bill.service";

export default function BillsPage() {
  const now = new Date();
  const [month, setMonth] = React.useState<number>(now.getMonth() + 1);
  const [year, setYear] = React.useState<number>(now.getFullYear());
  const [statusFilter, setStatusFilter] = React.useState<"all" | "unpaid" | "paid">("all");

  const [bills, setBills] = React.useState<BillItemDto[]>([]);
  const [summary, setSummary] = React.useState<BillSummaryDto>({
    totalBillsCount: 0,
    totalBillsAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    urgentCount: 0,
    warningCount: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingBill, setEditingBill] = React.useState<BillItemDto | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getBillsPageDataAction(month, year, statusFilter);
      if (res.isSuccess) {
        setBills(res.data.bills);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [month, year, statusFilter]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMonthChange = (newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  const handleOpenAdd = () => {
    setEditingBill(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: BillItemDto) => {
    setEditingBill(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Enterprise Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <EvnLogo size={42} variant="square" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Hóa Đơn & Lịch Đến Hạn (EVN, Nước & Viễn Thông)
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#003399] text-white">
                EVN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Kiểm soát hóa đơn điện lực EVN, nước sinh hoạt, cước internet/viễn thông và lịch nhắc nợ tự động.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            title="Đồng bộ dữ liệu công nợ"
            className="p-2.5 rounded-xl bg-[#090e17] border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-400" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi Nhận Nghĩa Vụ Công Nợ</span>
          </button>
        </div>
      </div>

      {/* 4 Cards Thống Kê Công Nợ */}
      <BillSummaryCards summary={summary} />

      {/* Danh sách & Bộ lọc Hóa đơn công nợ */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-[#090e17] border border-white/[0.08] animate-pulse" />
            ))}
          </div>
        ) : (
          <BillList
            bills={bills}
            month={month}
            year={year}
            statusFilter={statusFilter}
            onMonthChange={handleMonthChange}
            onFilterChange={setStatusFilter}
            onEdit={handleEdit}
            onRefresh={loadData}
            onAddNew={handleOpenAdd}
          />
        )}
      </div>

      {/* Form Modal Thêm/Sửa */}
      <BillFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        editingBill={editingBill}
      />
    </div>
  );
}
