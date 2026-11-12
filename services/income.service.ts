import { connectDB } from "@/lib/db";
import { Income, type IIncome } from "@/models/Income";
import { User } from "@/models/User";
import { type IncomeInput } from "@/lib/validators";
import { Result } from "@/lib/utils";
import { type UserIncomeWalletDto } from "@/services/bee.service";

export interface IncomeSummaryDto {
  monthlyFixed: number;      // Thu nhập cố định hàng tháng
  oneTimeThisMonth: number;  // Thu nhập một lần trong tháng này
  totalThisMonth: number;    // Tổng thu nhập tháng này (cố định + một lần)
  estimatedYearly: number;   // Ước tính tổng thu nhập cả năm
}

export interface IncomeDto {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  type: "monthly" | "oneTime";
  date?: string;
  note?: string;
  createdAt: string;
}

export interface IncomePageDataDto {
  incomes: IncomeDto[];
  summary: IncomeSummaryDto;
  wallet?: UserIncomeWalletDto;
}

/**
 * Service Layer: Xử lý toàn bộ nghiệp vụ Thu nhập (Income)
 * Tối ưu hóa hiệu năng cao độ: Single-Pass Computation & .lean()
 */
export class IncomeService {
  /**
   * Tải toàn bộ dữ liệu trang thu nhập trong 1 truy vấn duy nhất (High Speed Single Pass)
   */
  static async getIncomePageData(
    userId: string,
    month: number,
    year: number
  ): Promise<Result<IncomePageDataDto>> {
    await connectDB();

    // Dùng .lean() và sắp xếp tối ưu qua Index
    const incomes = await Income.find({ userId })
      .select("_id name amount dayOfMonth type date note createdAt")
      .sort({ type: 1, dayOfMonth: 1, createdAt: -1 })
      .lean();

    let monthlyFixed = 0;
    let oneTimeThisMonth = 0;
    let oneTimeThisYear = 0;

    const formattedIncomes: IncomeDto[] = new Array(incomes.length);

    for (let i = 0; i < incomes.length; i++) {
      const item = incomes[i];
      const amount = item.amount || 0;

      if (item.type === "monthly") {
        monthlyFixed += amount;
      } else if (item.type === "oneTime" && item.date) {
        const itemDate = new Date(item.date);
        const itemMonth = itemDate.getMonth() + 1;
        const itemYear = itemDate.getFullYear();

        if (itemYear === year) {
          oneTimeThisYear += amount;
          if (itemMonth === month) {
            oneTimeThisMonth += amount;
          }
        }
      }

      formattedIncomes[i] = {
        id: item._id.toString(),
        name: item.name,
        amount: item.amount,
        dayOfMonth: item.dayOfMonth,
        type: item.type,
        date: item.date ? item.date.toISOString() : undefined,
        note: item.note,
        createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
      };
    }

    const totalThisMonth = monthlyFixed + oneTimeThisMonth;
    const estimatedYearly = monthlyFixed * 12 + oneTimeThisYear;

    // Lấy Ví Thu Nhập Riêng của User
    const userDoc = await User.findById(userId).lean();
    const generatedCode =
      (userDoc as any)?.walletCode ||
      `VTHU-${String(userId).slice(-6).toUpperCase()}`;
    const ownerName = (userDoc as any)?.name || "Người Dùng";
    const walletName =
      (userDoc as any)?.walletName || `Ví Thu Nhập ${ownerName}`;
    const balance =
      (userDoc as any)?.walletBalance !== undefined &&
      (userDoc as any)?.walletBalance !== null &&
      Number((userDoc as any).walletBalance) > 0
        ? Number((userDoc as any).walletBalance)
        : totalThisMonth;

    const wallet: UserIncomeWalletDto = {
      walletCode: generatedCode,
      walletName,
      ownerName,
      balance,
      totalIncomeThisMonth: totalThisMonth,
      totalAllTimeEarnings: balance,
    };

    if (!(userDoc as any)?.walletCode) {
      await User.findByIdAndUpdate(userId, {
        walletCode: generatedCode,
        walletName,
        walletBalance: balance,
      });
    }

    return Result.ok({
      incomes: formattedIncomes,
      summary: {
        monthlyFixed,
        oneTimeThisMonth,
        totalThisMonth,
        estimatedYearly,
      },
      wallet,
    });
  }

  /**
   * Thêm nguồn thu nhập mới
   */
  static async createIncome(userId: string, dto: IncomeInput): Promise<Result<IncomeDto>> {
    await connectDB();

    const newIncome = await Income.create({
      userId,
      name: dto.name.trim(),
      amount: Math.round(dto.amount),
      type: dto.type,
      dayOfMonth: dto.dayOfMonth || 1,
      date: dto.date,
      note: dto.note?.trim(),
    });

    return Result.ok({
      id: newIncome._id.toString(),
      name: newIncome.name,
      amount: newIncome.amount,
      dayOfMonth: newIncome.dayOfMonth,
      type: newIncome.type,
      date: newIncome.date ? newIncome.date.toISOString() : undefined,
      note: newIncome.note,
      createdAt: newIncome.createdAt.toISOString(),
    });
  }

  /**
   * Cập nhật nguồn thu nhập
   */
  static async updateIncome(
    userId: string,
    incomeId: string,
    dto: Partial<IncomeInput>
  ): Promise<Result<IncomeDto>> {
    await connectDB();

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name.trim();
    if (dto.amount !== undefined) updateData.amount = Math.round(dto.amount);
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.dayOfMonth !== undefined) updateData.dayOfMonth = dto.dayOfMonth;
    if (dto.date !== undefined) updateData.date = dto.date;
    if (dto.note !== undefined) updateData.note = dto.note?.trim();

    const updated = await Income.findOneAndUpdate(
      { _id: incomeId, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return Result.fail("Không tìm thấy nguồn thu nhập cần cập nhật");
    }

    return Result.ok({
      id: updated._id.toString(),
      name: updated.name,
      amount: updated.amount,
      dayOfMonth: updated.dayOfMonth,
      type: updated.type,
      date: updated.date ? updated.date.toISOString() : undefined,
      note: updated.note,
      createdAt: updated.createdAt.toISOString(),
    });
  }

  /**
   * Xóa nguồn thu nhập
   */
  static async deleteIncome(userId: string, incomeId: string): Promise<Result<boolean>> {
    await connectDB();

    const deleted = await Income.findOneAndDelete({ _id: incomeId, userId });
    if (!deleted) {
      return Result.fail("Không tìm thấy nguồn thu nhập để xóa");
    }

    return Result.ok(true);
  }
}
