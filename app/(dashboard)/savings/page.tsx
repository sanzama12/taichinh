"use client";

import * as React from "react";
import {
  PiggyBank,
  Plus,
  RefreshCw,
  Target,
  Sparkles,
} from "lucide-react";
import { BidvLogo } from "@/components/icons/BrandLogos";
import {
  getSavingsPageDataAction,
  createSavingsGoalAction,
  updateSavingsGoalAction,
  deleteSavingsGoalAction,
  recordSavingsTransactionAction,
  initEmergencyFundAction,
} from "@/actions/savings";
import {
  type SavingsGoalItemDto,
  type SavingsTransactionDto,
  type SavingsSummaryDto,
} from "@/services/savings.service";
import { type SavingsGoalInput, type SavingsTransactionInput } from "@/lib/validators";
import { SavingsSummaryCards } from "@/components/savings/SavingsSummaryCards";
import { SavingsGoalCard } from "@/components/savings/SavingsGoalCard";
import { SavingsGoalModal } from "@/components/savings/SavingsGoalModal";
import { SavingsTransactionModal } from "@/components/savings/SavingsTransactionModal";
import { SavingsTransactionHistory } from "@/components/savings/SavingsTransactionHistory";

export default function SavingsPage() {
  const [goals, setGoals] = React.useState<SavingsGoalItemDto[]>([]);
  const [transactions, setTransactions] = React.useState<SavingsTransactionDto[]>([]);
  const [summary, setSummary] = React.useState<SavingsSummaryDto>({
    totalCurrentSavings: 0,
    totalTargetSavings: 0,
    overallProgressPercent: 0,
    totalMonthlyRequired: 0,
    recommendedEmergencyFund: 0,
    averageMonthlyExpense: 0,
    activeGoalsCount: 0,
    completedGoalsCount: 0,
    totalDailyTarget: 0,
    todayTotalDeposited: 0,
    isTodayTargetMet: false,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  // Modals state
  const [isGoalModalOpen, setIsGoalModalOpen] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState<SavingsGoalItemDto | null>(null);

  const [isTxModalOpen, setIsTxModalOpen] = React.useState(false);
  const [activeGoalForTx, setActiveGoalForTx] = React.useState<SavingsGoalItemDto | null>(null);
  const [txType, setTxType] = React.useState<"deposit" | "withdraw">("deposit");

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getSavingsPageDataAction();
      if (res.isSuccess) {
        setGoals(res.data.goals);
        setTransactions(res.data.transactions);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu mục tiêu tiết kiệm:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers for Goals
  const handleOpenAddGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal: SavingsGoalItemDto) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mục tiêu này cùng toàn bộ lịch sử giao dịch liên quan?")) return;
    const res = await deleteSavingsGoalAction(goalId);
    if (res.isSuccess) {
      loadData();
    } else {
      alert(res.error);
    }
  };

  const handleSubmitGoal = async (input: SavingsGoalInput): Promise<boolean> => {
    if (editingGoal) {
      const res = await updateSavingsGoalAction(editingGoal.id, input);
      if (res.isSuccess) {
        loadData();
        return true;
      }
      alert(res.error);
      return false;
    } else {
      const res = await createSavingsGoalAction(input);
      if (res.isSuccess) {
        loadData();
        return true;
      }
      alert(res.error);
      return false;
    }
  };

  // Handlers for Transactions (Nạp / Rút)
  const handleOpenDeposit = (goal: SavingsGoalItemDto) => {
    setActiveGoalForTx(goal);
    setTxType("deposit");
    setIsTxModalOpen(true);
  };

  const handleOpenWithdraw = (goal: SavingsGoalItemDto) => {
    setActiveGoalForTx(goal);
    setTxType("withdraw");
    setIsTxModalOpen(true);
  };

  // 1-Click nạp nhanh chỉ tiêu hôm nay
  const handleQuickDepositToday = async (goal: SavingsGoalItemDto) => {
    const needAmount = Math.max(goal.dailyTarget - goal.todayDepositedAmount, 0);
    if (needAmount <= 0) return;

    const res = await recordSavingsTransactionAction({
      goalId: goal.id,
      type: "deposit",
      amount: needAmount,
      date: new Date(),
      note: `Nạp chỉ tiêu ngày ${new Date().toLocaleDateString("vi-VN")}`,
    });

    if (res.isSuccess) {
      loadData();
    } else {
      alert(res.error);
    }
  };

  const handleSubmitTransaction = async (input: SavingsTransactionInput): Promise<boolean> => {
    const res = await recordSavingsTransactionAction(input);
    if (res.isSuccess) {
      loadData();
      return true;
    }
    alert(res.error);
    return false;
  };

  // 1-Click Init Emergency Fund
  const handleInitEmergencyFund = async () => {
    const res = await initEmergencyFundAction();
    if (res.isSuccess) {
      loadData();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-3.5">
          <BidvLogo size={42} variant="square" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Sổ Tiết Kiệm & Quỹ Dự Phòng (BIDV & Ngân Hàng)
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#005B38] text-white">
                BIDV
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-mono">
              Đặt mục tiêu nạp mỗi ngày để tích lũy trọn 1 tháng (VD: 100.000 ₫/ngày = 3.000.000 ₫/tháng).
            </p>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs font-mono text-slate-200 hover:bg-white/[0.1] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Đồng bộ</span>
          </button>

          <button
            onClick={handleOpenAddGoal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-mono font-bold text-white shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Mục tiêu mới</span>
          </button>
        </div>
      </div>

      {/* 2. Thẻ Số Liệu Tổng Hợp */}
      <SavingsSummaryCards
        summary={summary}
        onInitEmergencyFund={handleInitEmergencyFund}
      />

      {/* 3. Danh Sách Các Mục Tiêu Tiết Kiệm (Bento Cards Grid) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
              DANH SÁCH MỤC TIÊU TÍCH LŨY ({goals.length})
            </h3>
          </div>
        </div>

        {goals.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#090e17] border border-white/[0.08]">
            <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white font-mono">Chưa có mục tiêu tiết kiệm nào</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Hãy thiết lập mục tiêu mua sắm tài sản, quỹ đầu tư hoặc khởi tạo ngay Quỹ Khẩn Cấp để bảo vệ an toàn tài chính.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={handleInitEmergencyFund}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium hover:bg-indigo-600/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tạo Quỹ Khẩn Cấp 6 tháng</span>
              </button>
              <button
                onClick={handleOpenAddGoal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-mono font-bold text-white transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm mục tiêu mới</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                onOpenDeposit={handleOpenDeposit}
                onOpenWithdraw={handleOpenWithdraw}
                onQuickDepositToday={handleQuickDepositToday}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. Lịch Sử Biến Động Nạp / Rút Tiền */}
      <SavingsTransactionHistory transactions={transactions} />

      {/* Modals */}
      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSubmit={handleSubmitGoal}
        initialData={editingGoal}
      />

      <SavingsTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSubmit={handleSubmitTransaction}
        goal={activeGoalForTx}
        defaultType={txType}
      />
    </div>
  );
}

