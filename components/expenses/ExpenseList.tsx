"use client";

import * as React from "react";
import { format } from "date-fns";
import { Search, Filter, Edit2, Trash2, Calendar, Tag, FileText, ArrowUpDown } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { type ExpenseDto } from "@/services/expense.service";

interface ExpenseListProps {
  expenses: ExpenseDto[];
  availableCategories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onEdit: (item: ExpenseDto) => void;
  onDelete: (id: string) => void;
}

export function ExpenseList({
  expenses,
  availableCategories,
  selectedCategory,
  onSelectCategory,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredExpenses = React.useMemo(() => {
    return expenses.filter((item) => {
      const matchSearch =
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.note.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [expenses, searchTerm]);

  return (
    <div className="p-6 rounded-2xl bg-[#090e17] border border-white/[0.08] shadow-md">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
            NHẬT KÝ CHI TIÊU HÀNG NGÀY
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng cộng: {filteredExpenses.length} giao dịch
          </p>
        </div>

        {/* Tìm kiếm & Lọc danh mục */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Input Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl bg-[#030712] border border-white/[0.1] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors w-44 sm:w-56"
            />
          </div>

          {/* Select Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              aria-label="Lọc theo danh mục chi tiêu"
              className="py-1.5 px-3 rounded-xl bg-[#030712] border border-white/[0.1] text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="all">Tất cả danh mục</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table / List */}
      {filteredExpenses.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <span>Không tìm thấy giao dịch chi tiêu nào trong khoảng thời gian này.</span>
        </div>
      ) : (
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-400 uppercase text-[11px]">
                <th className="py-3 px-3 font-semibold">Ngày chi</th>
                <th className="py-3 px-3 font-semibold">Danh mục</th>
                <th className="py-3 px-3 font-semibold">Ghi chú</th>
                <th className="py-3 px-3 font-semibold text-right">Số tiền</th>
                <th className="py-3 px-3 font-semibold text-center w-20">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredExpenses.map((expense) => {
                const dateObj = new Date(expense.date);
                const formattedDate = format(dateObj, "dd/MM/yyyy");

                return (
                  <tr
                    key={expense.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
                        <Tag className="w-3 h-3" />
                        {expense.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-300 max-w-xs truncate">
                      {expense.note || <span className="text-slate-600 italic">Không có ghi chú</span>}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap font-bold text-rose-400 tabular-nums text-sm">
                      -{formatCurrencyVND(expense.amount)}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEdit(expense)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                          title="Sửa chi tiêu"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(expense.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Xóa chi tiêu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

