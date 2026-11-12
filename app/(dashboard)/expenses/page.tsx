"use client";

import * as React from "react";
import {
  Wallet,
  Plus,
  SlidersHorizontal,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MastercardLogo } from "@/components/icons/BrandLogos";
import {
  getExpensePageDataAction,
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
  upsertBudgetAction,
  deleteBudgetAction,
} from "@/actions/expenses";
import {
  type ExpenseDto,
  type CategoryBudgetStatusDto,
  type ExpenseSummaryDto,
} from "@/services/expense.service";
import { type ExpenseInput, type BudgetInput } from "@/lib/validators";
import { ExpenseSummaryCards } from "@/components/expenses/ExpenseSummaryCards";
import { BudgetStatusList } from "@/components/expenses/BudgetStatusList";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";
import { BudgetModal } from "@/components/expenses/BudgetModal";

export default function ExpensesPage() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = React.useState(now.getFullYear());
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  const [expenses, setExpenses] = React.useState<ExpenseDto[]>([]);
  const [budgets, setBudgets] = React.useState<CategoryBudgetStatusDto[]>([]);
  const [summary, setSummary] = React.useState<ExpenseSummaryDto>({
    totalSpentThisMonth: 0,
    totalBudgetLimit: 0,
    budgetUtilizationPercent: 0,
    exceededCategoriesCount: 0,
    warningCategoriesCount: 0,
  });
  const [availableCategories, setAvailableCategories] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<ExpenseDto | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = React.useState(false);
  const [budgetModalCategory, setBudgetModalCategory] = React.useState<string | undefined>();
  const [budgetModalLimit, setBudgetModalLimit] = React.useState<number | undefined>();

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getExpensePageDataAction(currentMonth, currentYear, categoryFilter);
      if (res.isSuccess) {
        setExpenses(res.data.expenses);
        setBudgets(res.data.budgets);
        setSummary(res.data.summary);
        setAvailableCategories(res.data.availableCategories);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu chi tiêu:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, currentYear, categoryFilter]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers for Expenses
  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (item: ExpenseDto) => {
    setEditingExpense(item);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bản ghi chi tiêu này không?")) return;
    const res = await deleteExpenseAction(id);
    if (res.isSuccess) {
      loadData();
    } else {
      alert(res.error);
    }
  };

  const handleSubmitExpense = async (input: ExpenseInput): Promise<boolean> => {
    if (editingExpense) {
      const res = await updateExpenseAction(editingExpense.id, input);
      if (res.isSuccess) {
        loadData();
        return true;
      }
      alert(res.error);
      return false;
    } else {
      const res = await createExpenseAction(input);
      if (res.isSuccess) {
        loadData();
        return true;
      }
      alert(res.error);
      return false;
    }
  };

  // Handlers for Budget
  const handleOpenSetBudget = (category?: string, currentLimit?: number) => {
    setBudgetModalCategory(category);
    setBudgetModalLimit(currentLimit);
    setIsBudgetModalOpen(true);
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm("Bạn có chắc muốn xóa hạn mức ngân sách của danh mục này không?")) return;
    const res = await deleteBudgetAction(budgetId);
    if (res.isSuccess) {
      loadData();
    } else {
      alert(res.error);
    }
  };

  const handleSubmitBudget = async (input: BudgetInput): Promise<boolean> => {
    const res = await upsertBudgetAction(input);
    if (res.isSuccess) {
      loadData();
      return true;
    }
    alert(res.error);
    return false;
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-3.5">
          <MastercardLogo size={42} variant="square" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Quản Lý Chi Phí & Ngân Sách (Mastercard & Vận Hành)
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#EB001B]/20 text-rose-400 border border-[#EB001B]/40">
                MASTERCARD
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Kiểm soát dòng tiền chi tiêu hàng ngày, chi phí vận hành xe và giám sát cảnh báo vượt hạn mức danh mục.
            </p>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenSetBudget()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs font-mono font-medium text-slate-200 hover:bg-white/[0.1] transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span>Hạn mức danh mục</span>
          </button>

          <button
            onClick={handleOpenAddExpense}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-mono font-bold text-white shadow-lg shadow-rose-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi chi tiêu</span>
          </button>
        </div>
      </div>

      {/* 2. Control Bar (Tháng & Tải lại) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#090e17]/80 border border-white/[0.08] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-50"
            title="Tháng trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#030712] border border-white/[0.1]">
            <Calendar className="w-4 h-4 text-rose-400" />
            <span className="font-mono text-sm font-bold text-white tracking-wide">
              THÁNG {String(currentMonth).padStart(2, "0")} / {currentYear}
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-50"
            title="Tháng sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* 3. Thẻ Số Liệu Tổng Hợp */}
      <ExpenseSummaryCards summary={summary} />

      {/* 4. Giám Sát Hạn Mức Ngân Sách Danh Mục */}
      <BudgetStatusList
        budgets={budgets}
        onOpenSetBudget={handleOpenSetBudget}
        onDeleteBudget={handleDeleteBudget}
      />

      {/* 5. Nhật Ký Chi Tiêu Hàng Ngày */}
      <ExpenseList
        expenses={expenses}
        availableCategories={availableCategories}
        selectedCategory={categoryFilter}
        onSelectCategory={setCategoryFilter}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
      />

      {/* Modals */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={handleSubmitExpense}
        initialData={editingExpense}
        suggestedCategories={availableCategories}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSubmit={handleSubmitBudget}
        initialCategory={budgetModalCategory}
        initialLimit={budgetModalLimit}
        availableCategories={availableCategories}
      />
    </div>
  );
}

