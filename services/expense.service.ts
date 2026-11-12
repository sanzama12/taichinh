import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Expense } from "@/models/Expense";
import { Budget } from "@/models/Budget";
import { Result } from "@/lib/utils";
import { type ExpenseInput, type BudgetInput } from "@/lib/validators";

export interface ExpenseDto {
  id: string;
  date: string;
  amount: number;
  category: string;
  note: string;
  createdAt: string;
}

export interface CategoryBudgetStatusDto {
  id?: string;
  category: string;
  monthlyLimit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: "normal" | "warning" | "exceeded"; // >=80% là warning (vàng), >100% là exceeded (đỏ)
}

export interface ExpenseSummaryDto {
  totalSpentThisMonth: number;
  totalBudgetLimit: number;
  budgetUtilizationPercent: number;
  exceededCategoriesCount: number;
  warningCategoriesCount: number;
}

export interface ExpensePageDataDto {
  expenses: ExpenseDto[];
  budgets: CategoryBudgetStatusDto[];
  summary: ExpenseSummaryDto;
  availableCategories: string[];
}

/**
 * Service Layer: Quản lý Chi Tiêu Hàng Ngày & Ngân Sách Danh Mục
 * Chuẩn ProMax MVC - Truy vấn song song siêu tốc
 */
export class ExpenseService {
  /**
   * Lấy dữ liệu trang chi tiêu (danh sách chi tiêu, ngân sách danh mục, tỷ lệ sử dụng)
   */
  static async getExpensePageData(
    userId: string,
    month: number,
    year: number,
    categoryFilter?: string
  ): Promise<Result<ExpensePageDataDto>> {
    try {
      await connectDB();
      const userObjId = new mongoose.Types.ObjectId(userId);

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      // Query filter
      const expenseQuery: Record<string, unknown> = {
        userId: userObjId,
        date: { $gte: startDate, $lte: endDate },
      };

      if (categoryFilter && categoryFilter.trim() !== "" && categoryFilter !== "all") {
        expenseQuery.category = categoryFilter;
      }

      // Chạy song song: (1) Lấy danh sách chi tiêu, (2) Lấy toàn bộ ngân sách, (3) Lấy tất cả danh mục của user
      const [rawExpenses, userBudgets, allDistinctCategories] = await Promise.all([
        Expense.find(expenseQuery)
          .sort({ date: -1, createdAt: -1 })
          .lean()
          .exec(),
        Budget.find({ userId: userObjId }).lean().exec(),
        Expense.distinct("category", { userId: userObjId }).exec(),
      ]);

      // Tính tổng chi tiêu theo từng danh mục trong tháng (dùng tất cả chi tiêu của tháng, không phụ thuộc categoryFilter)
      const allMonthExpenses = await Expense.find({
        userId: userObjId,
        date: { $gte: startDate, $lte: endDate },
      })
        .select("category amount")
        .lean()
        .exec();

      const categorySpentMap = new Map<string, number>();
      let totalSpentThisMonth = 0;

      for (const item of allMonthExpenses) {
        totalSpentThisMonth += item.amount;
        const current = categorySpentMap.get(item.category) || 0;
        categorySpentMap.set(item.category, current + item.amount);
      }

      // Xây dựng danh sách trạng thái ngân sách danh mục
      const budgetMap = new Map<string, { id: string; limit: number }>();
      let totalBudgetLimit = 0;

      for (const b of userBudgets) {
        budgetMap.set(b.category, { id: b._id.toString(), limit: b.monthlyLimit });
        totalBudgetLimit += b.monthlyLimit;
      }

      // Hợp nhất danh mục từ Budget và chi tiêu thực tế
      const allCategoriesSet = new Set<string>([
        ...userBudgets.map((b) => b.category),
        ...Array.from(categorySpentMap.keys()),
        ...allDistinctCategories,
      ]);

      let exceededCount = 0;
      let warningCount = 0;

      const categoryStatuses: CategoryBudgetStatusDto[] = Array.from(allCategoriesSet)
        .map((cat) => {
          const budgetInfo = budgetMap.get(cat);
          const limit = budgetInfo ? budgetInfo.limit : 0;
          const spent = categorySpentMap.get(cat) || 0;
          const remaining = limit > 0 ? limit - spent : 0;
          const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

          let status: "normal" | "warning" | "exceeded" = "normal";
          if (limit > 0) {
            if (spent > limit) {
              status = "exceeded";
              exceededCount++;
            } else if (percentage >= 80) {
              status = "warning";
              warningCount++;
            }
          }

          return {
            id: budgetInfo?.id,
            category: cat,
            monthlyLimit: limit,
            spent,
            remaining,
            percentage,
            status,
          };
        })
        .sort((a, b) => {
          // Ưu tiên hiển thị danh mục vượt hạn mức, sau đó tới cảnh báo, rồi tới mức chi tiêu
          if (a.status === "exceeded" && b.status !== "exceeded") return -1;
          if (b.status === "exceeded" && a.status !== "exceeded") return 1;
          if (a.status === "warning" && b.status !== "warning") return -1;
          if (b.status === "warning" && a.status !== "warning") return 1;
          return b.spent - a.spent;
        });

      const budgetUtilizationPercent =
        totalBudgetLimit > 0 ? Math.round((totalSpentThisMonth / totalBudgetLimit) * 100) : 0;

      const expensesDto: ExpenseDto[] = rawExpenses.map((e) => ({
        id: e._id.toString(),
        date: e.date.toISOString(),
        amount: e.amount,
        category: e.category,
        note: e.note || "",
        createdAt: e.createdAt.toISOString(),
      }));

      return Result.ok({
        expenses: expensesDto,
        budgets: categoryStatuses,
        summary: {
          totalSpentThisMonth,
          totalBudgetLimit,
          budgetUtilizationPercent,
          exceededCategoriesCount: exceededCount,
          warningCategoriesCount: warningCount,
        },
        availableCategories: Array.from(allCategoriesSet).sort(),
      });
    } catch (error) {
      console.error("[ExpenseService.getExpensePageData] Error:", error);
      return Result.fail("Không thể tải dữ liệu chi tiêu và ngân sách");
    }
  }

  /**
   * Tạo bản ghi chi tiêu mới
   */
  static async createExpense(userId: string, input: ExpenseInput): Promise<Result<ExpenseDto>> {
    try {
      await connectDB();
      const expense = await Expense.create({
        userId: new mongoose.Types.ObjectId(userId),
        date: input.date,
        amount: Math.round(input.amount),
        category: input.category.trim(),
        note: input.note?.trim() || "",
      });

      return Result.ok({
        id: expense._id.toString(),
        date: expense.date.toISOString(),
        amount: expense.amount,
        category: expense.category,
        note: expense.note || "",
        createdAt: expense.createdAt.toISOString(),
      });
    } catch (error) {
      console.error("[ExpenseService.createExpense] Error:", error);
      return Result.fail("Không thể lưu chi tiêu");
    }
  }

  /**
   * Cập nhật bản ghi chi tiêu
   */
  static async updateExpense(
    userId: string,
    id: string,
    input: ExpenseInput
  ): Promise<Result<boolean>> {
    try {
      await connectDB();
      const updated = await Expense.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id), userId: new mongoose.Types.ObjectId(userId) },
        {
          date: input.date,
          amount: Math.round(input.amount),
          category: input.category.trim(),
          note: input.note?.trim() || "",
        }
      ).exec();

      if (!updated) {
        return Result.fail("Không tìm thấy chi tiêu cần cập nhật");
      }

      return Result.ok(true);
    } catch (error) {
      console.error("[ExpenseService.updateExpense] Error:", error);
      return Result.fail("Lỗi khi cập nhật chi tiêu");
    }
  }

  /**
   * Xóa bản ghi chi tiêu
   */
  static async deleteExpense(userId: string, id: string): Promise<Result<boolean>> {
    try {
      await connectDB();
      const deleted = await Expense.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      }).exec();

      if (!deleted) {
        return Result.fail("Không tìm thấy chi tiêu cần xóa");
      }

      return Result.ok(true);
    } catch (error) {
      console.error("[ExpenseService.deleteExpense] Error:", error);
      return Result.fail("Lỗi khi xóa chi tiêu");
    }
  }

  /**
   * Cập nhật hoặc tạo mới hạn mức ngân sách cho danh mục
   */
  static async upsertBudget(userId: string, input: BudgetInput): Promise<Result<boolean>> {
    try {
      await connectDB();
      const userObjId = new mongoose.Types.ObjectId(userId);
      const category = input.category.trim();
      const monthlyLimit = Math.round(input.monthlyLimit);

      await Budget.findOneAndUpdate(
        { userId: userObjId, category },
        { $set: { monthlyLimit } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).exec();

      return Result.ok(true);
    } catch (error) {
      console.error("[ExpenseService.upsertBudget] Error:", error);
      return Result.fail("Không thể lưu hạn mức ngân sách");
    }
  }

  /**
   * Xóa hạn mức ngân sách của một danh mục
   */
  static async deleteBudget(userId: string, budgetId: string): Promise<Result<boolean>> {
    try {
      await connectDB();
      const deleted = await Budget.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(budgetId),
        userId: new mongoose.Types.ObjectId(userId),
      }).exec();

      if (!deleted) {
        return Result.fail("Không tìm thấy ngân sách để xóa");
      }

      return Result.ok(true);
    } catch (error) {
      console.error("[ExpenseService.deleteBudget] Error:", error);
      return Result.fail("Lỗi khi xóa hạn mức ngân sách");
    }
  }
}

