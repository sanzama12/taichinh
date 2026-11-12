import { connectDB } from "@/lib/db";
import { Debt, IDebt, DebtCategory, DebtStatus } from "@/models/Debt";
import { Expense } from "@/models/Expense";
import { Result } from "@/lib/utils";
import { type DebtInput, type DebtPaymentInput } from "@/lib/validators";

export interface DebtDto {
  id: string;
  title: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  dueDay: number;
  nextDueDate?: string;
  interestRate: number;
  category: DebtCategory;
  status: DebtStatus;
  progressPercent: number;
  note?: string;
  createdAt: string;
}

export interface DebtSummaryDto {
  totalInitialDebt: number;
  totalPaidDebt: number;
  totalRemainingDebt: number;
  totalMonthlyPayment: number;
  overallPayoffPercent: number;
  activeDebtCount: number;
  paidOffDebtCount: number;
}

export interface DebtPageDataDto {
  debts: DebtDto[];
  summary: DebtSummaryDto;
}

export class DebtService {
  /**
   * Lấy toàn bộ danh sách nợ và bảng tổng hợp tiến độ thanh toán
   */
  static async getDebtPageData(userId: string): Promise<Result<DebtPageDataDto>> {
    try {
      await connectDB();

      const rawDebts = await Debt.find({ userId })
        .sort({ status: 1, nextDueDate: 1, createdAt: -1 })
        .lean();

      let totalInitialDebt = 0;
      let totalPaidDebt = 0;
      let totalRemainingDebt = 0;
      let totalMonthlyPayment = 0;
      let activeDebtCount = 0;
      let paidOffDebtCount = 0;

      const debts: DebtDto[] = (rawDebts as any[]).map((d) => {
        const total = Number(d.totalAmount) || 0;
        const paid = Number(d.paidAmount) || 0;
        const remaining = Math.max(0, total - paid);
        const monthly = Number(d.monthlyPayment) || 0;
        const status = d.status || (remaining === 0 ? "paid_off" : "active");

        totalInitialDebt += total;
        totalPaidDebt += paid;
        totalRemainingDebt += remaining;

        if (status === "active" || status === "overdue") {
          totalMonthlyPayment += monthly;
          activeDebtCount++;
        } else {
          paidOffDebtCount++;
        }

        const progressPercent =
          total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 100;

        return {
          id: String(d._id),
          title: d.title,
          totalAmount: total,
          paidAmount: paid,
          remainingAmount: remaining,
          monthlyPayment: monthly,
          dueDay: Number(d.dueDay) || 1,
          nextDueDate: d.nextDueDate ? new Date(d.nextDueDate).toISOString() : undefined,
          interestRate: Number(d.interestRate) || 0,
          category: d.category || "vehicle_installment",
          status,
          progressPercent,
          note: d.note,
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        };
      });

      const overallPayoffPercent =
        totalInitialDebt > 0
          ? Math.min(100, Math.round((totalPaidDebt / totalInitialDebt) * 100))
          : 100;

      const summary: DebtSummaryDto = {
        totalInitialDebt,
        totalPaidDebt,
        totalRemainingDebt,
        totalMonthlyPayment,
        overallPayoffPercent,
        activeDebtCount,
        paidOffDebtCount,
      };

      return Result.ok({
        debts,
        summary,
      });
    } catch (err: any) {
      console.error("[DebtService.getDebtPageData] Error:", err);
      return Result.fail(err?.message || "Không thể tải danh sách khoản nợ");
    }
  }

  /**
   * Tạo khoản nợ mới (Trả góp, ứng sàn, vay ngân hàng...)
   */
  static async createDebt(userId: string, input: DebtInput): Promise<Result<DebtDto>> {
    try {
      await connectDB();

      const totalAmount = Math.round(input.totalAmount);
      const paidAmount = Math.round(input.paidAmount || 0);
      const remainingAmount = Math.max(0, totalAmount - paidAmount);
      const status: DebtStatus = remainingAmount === 0 ? "paid_off" : "active";

      const newDebt = await Debt.create({
        userId,
        title: input.title,
        totalAmount,
        paidAmount,
        remainingAmount,
        monthlyPayment: Math.round(input.monthlyPayment || 0),
        dueDay: input.dueDay || 1,
        nextDueDate: input.nextDueDate,
        interestRate: input.interestRate || 0,
        category: input.category,
        status,
        note: input.note,
      });

      const progressPercent =
        totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 100;

      return Result.ok({
        id: String(newDebt._id),
        title: newDebt.title,
        totalAmount: newDebt.totalAmount,
        paidAmount: newDebt.paidAmount,
        remainingAmount: newDebt.remainingAmount,
        monthlyPayment: newDebt.monthlyPayment,
        dueDay: newDebt.dueDay,
        nextDueDate: newDebt.nextDueDate ? new Date(newDebt.nextDueDate).toISOString() : undefined,
        interestRate: Number(newDebt.interestRate) || 0,
        category: newDebt.category,
        status: newDebt.status,
        progressPercent,
        note: newDebt.note,
        createdAt: new Date(newDebt.createdAt).toISOString(),
      });
    } catch (err: any) {
      console.error("[DebtService.createDebt] Error:", err);
      return Result.fail(err?.message || "Lỗi khi tạo khoản nợ");
    }
  }

  /**
   * Ghi nhận thanh toán trả nợ (trả bớt hoặc tất toán)
   */
  static async recordDebtPayment(
    userId: string,
    input: DebtPaymentInput
  ): Promise<Result<DebtDto>> {
    try {
      await connectDB();

      const debt = await Debt.findOne({ _id: input.debtId, userId });
      if (!debt) {
        return Result.fail("Không tìm thấy khoản nợ");
      }

      const paymentAmount = Math.round(input.amount);
      const newPaidAmount = (debt.paidAmount || 0) + paymentAmount;
      const newRemainingAmount = Math.max(0, debt.totalAmount - newPaidAmount);

      debt.paidAmount = newPaidAmount;
      debt.remainingAmount = newRemainingAmount;

      if (newRemainingAmount === 0) {
        debt.status = "paid_off";
      }

      await debt.save();

      // Ghi nhận vào chi phí thực tế (Expense)
      await Expense.create({
        userId,
        amount: paymentAmount,
        category: "Nợ & Vay trả góp",
        date: input.date,
        note: `Trả nợ: ${debt.title} (Còn lại: ${newRemainingAmount.toLocaleString("vi-VN")} ₫)${input.note ? ` - ${input.note}` : ""}`,
      });

      const progressPercent =
        debt.totalAmount > 0
          ? Math.min(100, Math.round((newPaidAmount / debt.totalAmount) * 100))
          : 100;

      return Result.ok({
        id: String(debt._id),
        title: debt.title,
        totalAmount: debt.totalAmount,
        paidAmount: debt.paidAmount,
        remainingAmount: debt.remainingAmount,
        monthlyPayment: debt.monthlyPayment,
        dueDay: debt.dueDay,
        nextDueDate: debt.nextDueDate ? new Date(debt.nextDueDate).toISOString() : undefined,
        interestRate: Number(debt.interestRate) || 0,
        category: debt.category,
        status: debt.status,
        progressPercent,
        note: debt.note,
        createdAt: new Date(debt.createdAt).toISOString(),
      });
    } catch (err: any) {
      console.error("[DebtService.recordDebtPayment] Error:", err);
      return Result.fail(err?.message || "Lỗi khi ghi nhận trả nợ");
    }
  }

  /**
   * Xóa khoản nợ
   */
  static async deleteDebt(userId: string, debtId: string): Promise<Result<boolean>> {
    try {
      await connectDB();
      const deleted = await Debt.findOneAndDelete({ _id: debtId, userId });
      if (!deleted) {
        return Result.fail("Không tìm thấy khoản nợ để xóa");
      }
      return Result.ok(true);
    } catch (err: any) {
      console.error("[DebtService.deleteDebt] Error:", err);
      return Result.fail(err?.message || "Lỗi khi xóa khoản nợ");
    }
  }
}
