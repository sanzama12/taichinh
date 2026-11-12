import mongoose from "mongoose";
import { differenceInMonths, differenceInDays } from "date-fns";
import { connectDB } from "@/lib/db";
import { SavingsGoal } from "@/models/SavingsGoal";
import { SavingsTransaction } from "@/models/SavingsTransaction";
import { Expense } from "@/models/Expense";
import { Bill } from "@/models/Bill";
import { Result } from "@/lib/utils";
import { type SavingsGoalInput, type SavingsTransactionInput } from "@/lib/validators";

export interface SavingsGoalItemDto {
  id: string;
  name: string;
  targetAmount: number;
  dailyTarget: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercent: number;
  deadline: string;
  daysRemaining: number;
  monthsRemaining: number;
  requiredMonthlySavings: number;
  todayDepositedAmount: number;
  isCompletedToday: boolean;
  monthDepositedDays: number;
  totalDaysInMonth: number;
  currentDayOfMonth: number;
  isCompleted: boolean;
  isOverdue: boolean;
  createdAt: string;
}

export interface SavingsTransactionDto {
  id: string;
  goalId: string;
  goalName: string;
  type: "deposit" | "withdraw";
  amount: number;
  date: string;
  note: string;
}

export interface SavingsSummaryDto {
  totalCurrentSavings: number;
  totalTargetSavings: number;
  overallProgressPercent: number;
  totalDailyTarget: number;
  todayTotalDeposited: number;
  isTodayTargetMet: boolean;
  totalMonthlyRequired: number;
  recommendedEmergencyFund: number;
  averageMonthlyExpense: number;
  activeGoalsCount: number;
  completedGoalsCount: number;
}

export interface SavingsPageDataDto {
  goals: SavingsGoalItemDto[];
  transactions: SavingsTransactionDto[];
  summary: SavingsSummaryDto;
}

/**
 * Service Layer: Quản lý Mục Tiêu Tiết Kiệm & Quỹ Khẩn Cấp
 * Tính toán tự động hạn ngạch tiết kiệm hàng tháng theo hạn chót
 */
export class SavingsService {
  static async getSavingsPageData(userId: string): Promise<Result<SavingsPageDataDto>> {
    try {
      await connectDB();
      const userObjId = new mongoose.Types.ObjectId(userId);
      const today = new Date();

      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const currentDay = today.getDate();

      // Truy vấn song song: (1) Goals, (2) Transactions, (3) Expenses để tính Quỹ Khẩn Cấp 6 tháng, (4) Deposits tháng này
      const [rawGoals, rawTransactions, recentExpenses, activeBills, currentMonthDeposits] = await Promise.all([
        SavingsGoal.find({ userId: userObjId }).sort({ deadline: 1 }).lean().exec(),
        SavingsTransaction.find({ userId: userObjId })
          .sort({ date: -1, createdAt: -1 })
          .limit(30)
          .lean()
          .exec(),
        Expense.find({ userId: userObjId }).select("amount").lean().exec(),
        Bill.find({ userId: userObjId, isActive: true }).select("amount").lean().exec(),
        SavingsTransaction.find({
          userId: userObjId,
          type: "deposit",
          date: { $gte: monthStart },
        }).lean().exec(),
      ]);

      // Tính chi phí trung bình hàng tháng ước tính (Bill cố định + Chi tiêu hàng ngày)
      const monthlyBillsSum = activeBills.reduce((acc, b) => acc + b.amount, 0);
      const totalExpenseSum = recentExpenses.reduce((acc, e) => acc + e.amount, 0);
      // Giả định tối thiểu 1 tháng hoặc lấy trung bình
      const estimatedMonthlyExpense = Math.max(monthlyBillsSum + Math.round(totalExpenseSum / 3), 10_000_000);
      const recommendedEmergencyFund = estimatedMonthlyExpense * 6; // 6 tháng chi tiêu

      // Map tên goal cho transactions
      const goalNameMap = new Map<string, string>();
      for (const g of rawGoals) {
        goalNameMap.set(g._id.toString(), g.name);
      }

      let totalCurrent = 0;
      let totalTarget = 0;
      let totalMonthlyReq = 0;
      let totalDailyTarget = 0;
      let todayTotalDeposited = 0;
      let completedCount = 0;
      let activeCount = 0;

      const goalsDto: SavingsGoalItemDto[] = rawGoals.map((g) => {
        const target = g.targetAmount;
        const current = g.currentAmount;
        totalCurrent += current;
        totalTarget += target;

        const remaining = Math.max(target - current, 0);
        const progress = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
        const isCompleted = current >= target;

        if (isCompleted) {
          completedCount++;
        } else {
          activeCount++;
        }

        const deadlineDate = new Date(g.deadline);
        const daysRem = differenceInDays(deadlineDate, today);
        const monthsRem = Math.max(differenceInMonths(deadlineDate, today), 0);
        const isOverdue = daysRem < 0 && !isCompleted;

        // Cơ chế nạp mỗi ngày để tổng 1 tháng:
        const dailyTarget =
          (g as any).dailyTarget && (g as any).dailyTarget > 0
            ? (g as any).dailyTarget
            : Math.round(target / daysInCurrentMonth);

        // Các giao dịch nạp vào sổ này trong tháng
        const goalMonthTxs = currentMonthDeposits.filter(
          (tx) => tx.goalId.toString() === g._id.toString()
        );
        const todayTxs = goalMonthTxs.filter((tx) => new Date(tx.date) >= todayStart);
        const todayDepositedAmount = todayTxs.reduce((sum, tx) => sum + tx.amount, 0);
        const isCompletedToday = dailyTarget > 0 && todayDepositedAmount >= dailyTarget;

        const depositedDaysSet = new Set(
          goalMonthTxs.map((tx) => new Date(tx.date).getDate())
        );
        const monthDepositedDays = depositedDaysSet.size;

        if (!isCompleted) {
          totalDailyTarget += dailyTarget;
          todayTotalDeposited += todayDepositedAmount;
        }

        // Tính số tiền cần tiết kiệm mỗi tháng để đạt đúng hạn
        let reqMonthly = 0;
        if (!isCompleted) {
          if (monthsRem > 0) {
            reqMonthly = Math.ceil(remaining / monthsRem);
          } else {
            reqMonthly = remaining;
          }
          totalMonthlyReq += reqMonthly;
        }

        return {
          id: g._id.toString(),
          name: g.name,
          targetAmount: target,
          dailyTarget,
          currentAmount: current,
          remainingAmount: remaining,
          progressPercent: progress,
          deadline: g.deadline.toISOString(),
          daysRemaining: daysRem,
          monthsRemaining: monthsRem,
          requiredMonthlySavings: reqMonthly,
          todayDepositedAmount,
          isCompletedToday,
          monthDepositedDays,
          totalDaysInMonth: daysInCurrentMonth,
          currentDayOfMonth: currentDay,
          isCompleted,
          isOverdue,
          createdAt: g.createdAt.toISOString(),
        };
      });

      const overallProgress =
        totalTarget > 0 ? Math.min(Math.round((totalCurrent / totalTarget) * 100), 100) : 0;

      const transactionsDto: SavingsTransactionDto[] = rawTransactions.map((tx) => ({
        id: tx._id.toString(),
        goalId: tx.goalId.toString(),
        goalName: goalNameMap.get(tx.goalId.toString()) || "Mục tiêu đã xóa",
        type: tx.type,
        amount: tx.amount,
        date: tx.date.toISOString(),
        note: tx.note || "",
      }));

      return Result.ok({
        goals: goalsDto,
        transactions: transactionsDto,
        summary: {
          totalCurrentSavings: totalCurrent,
          totalTargetSavings: totalTarget,
          overallProgressPercent: overallProgress,
          totalDailyTarget,
          todayTotalDeposited,
          isTodayTargetMet: totalDailyTarget > 0 && todayTotalDeposited >= totalDailyTarget,
          totalMonthlyRequired: totalMonthlyReq,
          recommendedEmergencyFund,
          averageMonthlyExpense: estimatedMonthlyExpense,
          activeGoalsCount: activeCount,
          completedGoalsCount: completedCount,
        },
      });
    } catch (error) {
      console.error("[SavingsService.getSavingsPageData] Error:", error);
      return Result.fail("Không thể tải thông tin mục tiêu tiết kiệm");
    }
  }

  /**
   * Tạo mục tiêu tiết kiệm mới
   */
  static async createSavingsGoal(
    userId: string,
    input: SavingsGoalInput
  ): Promise<Result<SavingsGoalItemDto>> {
    try {
      await connectDB();
      const dailyTarget =
        input.dailyTarget && input.dailyTarget > 0
          ? Math.round(input.dailyTarget)
          : Math.round(input.targetAmount / 30);

      const goal = await SavingsGoal.create({
        userId: new mongoose.Types.ObjectId(userId),
        name: input.name.trim(),
        targetAmount: Math.round(input.targetAmount),
        dailyTarget,
        currentAmount: Math.round(input.currentAmount || 0),
        deadline: input.deadline,
      });

      const target = goal.targetAmount;
      const current = goal.currentAmount;
      const remaining = Math.max(target - current, 0);
      const progress = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
      const monthsRem = Math.max(differenceInMonths(new Date(goal.deadline), new Date()), 0);
      const reqMonthly = monthsRem > 0 ? Math.ceil(remaining / monthsRem) : remaining;

      return Result.ok({
        id: goal._id.toString(),
        name: goal.name,
        targetAmount: target,
        dailyTarget,
        currentAmount: current,
        remainingAmount: remaining,
        progressPercent: progress,
        deadline: goal.deadline.toISOString(),
        daysRemaining: differenceInDays(new Date(goal.deadline), new Date()),
        monthsRemaining: monthsRem,
        requiredMonthlySavings: reqMonthly,
        todayDepositedAmount: 0,
        isCompletedToday: false,
        monthDepositedDays: 0,
        totalDaysInMonth: 30,
        currentDayOfMonth: new Date().getDate(),
        isCompleted: current >= target,
        isOverdue: false,
        createdAt: goal.createdAt.toISOString(),
      });
    } catch (error) {
      console.error("[SavingsService.createSavingsGoal] Error:", error);
      return Result.fail("Không thể tạo mục tiêu tiết kiệm");
    }
  }

  /**
   * Cập nhật thông tin mục tiêu tiết kiệm
   */
  static async updateSavingsGoal(
    userId: string,
    goalId: string,
    input: SavingsGoalInput
  ): Promise<Result<boolean>> {
    try {
      await connectDB();
      const dailyTarget =
        input.dailyTarget && input.dailyTarget > 0
          ? Math.round(input.dailyTarget)
          : Math.round(input.targetAmount / 30);

      const updated = await SavingsGoal.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(goalId), userId: new mongoose.Types.ObjectId(userId) },
        {
          name: input.name.trim(),
          targetAmount: Math.round(input.targetAmount),
          dailyTarget,
          currentAmount: Math.round(input.currentAmount || 0),
          deadline: input.deadline,
        }
      ).exec();

      if (!updated) {
        return Result.fail("Không tìm thấy mục tiêu cần cập nhật");
      }

      return Result.ok(true);
    } catch (error) {
      console.error("[SavingsService.updateSavingsGoal] Error:", error);
      return Result.fail("Lỗi khi cập nhật mục tiêu");
    }
  }

  /**
   * Xóa mục tiêu tiết kiệm cùng các giao dịch liên quan
   */
  static async deleteSavingsGoal(userId: string, goalId: string): Promise<Result<boolean>> {
    try {
      await connectDB();
      const goalObjId = new mongoose.Types.ObjectId(goalId);
      const userObjId = new mongoose.Types.ObjectId(userId);

      const deleted = await SavingsGoal.findOneAndDelete({ _id: goalObjId, userId: userObjId }).exec();
      if (!deleted) {
        return Result.fail("Không tìm thấy mục tiêu tiết kiệm để xóa");
      }

      // Xóa các giao dịch liên quan
      await SavingsTransaction.deleteMany({ goalId: goalObjId, userId: userObjId }).exec();

      return Result.ok(true);
    } catch (error) {
      console.error("[SavingsService.deleteSavingsGoal] Error:", error);
      return Result.fail("Lỗi khi xóa mục tiêu tiết kiệm");
    }
  }

  /**
   * Nạp hoặc rút tiền vào mục tiêu tiết kiệm (kèm ghi log giao dịch)
   */
  static async recordTransaction(
    userId: string,
    input: SavingsTransactionInput
  ): Promise<Result<boolean>> {
    try {
      await connectDB();
      const userObjId = new mongoose.Types.ObjectId(userId);
      const goalObjId = new mongoose.Types.ObjectId(input.goalId);
      const txAmount = Math.round(input.amount);

      const goal = await SavingsGoal.findOne({ _id: goalObjId, userId: userObjId }).exec();
      if (!goal) {
        return Result.fail("Không tìm thấy mục tiêu tiết kiệm tương ứng");
      }

      // Kiểm tra nếu rút tiền thì số dư không được âm
      if (input.type === "withdraw") {
        if (goal.currentAmount < txAmount) {
          return Result.fail(
            `Số dư hiện tại (${goal.currentAmount.toLocaleString("vi-VN")} ₫) không đủ để rút ${txAmount.toLocaleString("vi-VN")} ₫`
          );
        }
        goal.currentAmount -= txAmount;
      } else {
        goal.currentAmount += txAmount;
      }

      // Lưu lại mục tiêu
      await goal.save();

      // Ghi nhật ký giao dịch
      await SavingsTransaction.create({
        userId: userObjId,
        goalId: goalObjId,
        type: input.type,
        amount: txAmount,
        date: input.date || new Date(),
        note: input.note?.trim() || "",
      });

      return Result.ok(true);
    } catch (error) {
      console.error("[SavingsService.recordTransaction] Error:", error);
      return Result.fail("Lỗi khi xử lý giao dịch nạp/rút tiền");
    }
  }

  /**
   * Tự động khởi tạo Quỹ Khẩn Cấp (6 tháng chi tiêu) nếu chưa có
   */
  static async initEmergencyFund(userId: string): Promise<Result<boolean>> {
    try {
      await connectDB();
      const userObjId = new mongoose.Types.ObjectId(userId);

      // Kiểm tra xem đã có Quỹ Khẩn Cấp chưa
      const existing = await SavingsGoal.findOne({
        userId: userObjId,
        name: { $regex: /khẩn cấp/i },
      }).exec();

      if (existing) {
        return Result.fail("Bạn đã có Quỹ Khẩn Cấp trong danh sách mục tiêu");
      }

      // Tính 6 tháng chi tiêu
      const activeBills = await Bill.find({ userId: userObjId, isActive: true }).select("amount").lean().exec();
      const monthlyBillsSum = activeBills.reduce((acc, b) => acc + b.amount, 0);
      const estimatedMonthlyExpense = Math.max(monthlyBillsSum + 5_000_000, 15_000_000);
      const targetEmergencyAmount = estimatedMonthlyExpense * 6;

      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

      await SavingsGoal.create({
        userId: userObjId,
        name: "Quỹ Khẩn Cấp (Dự Phòng 6 Tháng)",
        targetAmount: targetEmergencyAmount,
        currentAmount: 0,
        deadline: oneYearLater,
      });

      return Result.ok(true);
    } catch (error) {
      console.error("[SavingsService.initEmergencyFund] Error:", error);
      return Result.fail("Không thể khởi tạo Quỹ Khẩn Cấp");
    }
  }
}

