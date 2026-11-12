import { connectDB } from "@/lib/db";
import { BonusLog, IBonusLog } from "@/models/BonusLog";
import { Income } from "@/models/Income";
import { Result } from "@/lib/utils";
import { type BonusLogInput } from "@/lib/validators";
import { invalidateDashboardCache } from "@/services/dashboard.service";

export interface BonusLogDto {
  id: string;
  title: string;
  amount: number;
  bonusType: "milestone" | "weekly" | "peakHour" | "weather" | "other";
  date: string;
  status: "received" | "pending";
  targetTrips: number;
  note?: string;
  createdAt: string;
}

export interface BonusSummaryDto {
  totalReceived: number;
  totalPending: number;
  totalBonuses: number;
  receivedCount: number;
  pendingCount: number;
}

export interface BonusPageDataDto {
  bonuses: BonusLogDto[];
  summary: BonusSummaryDto;
  month: number;
  year: number;
}

export class BonusService {
  /**
   * Lấy danh sách tiền thưởng theo tháng & năm
   */
  static async getBonusPageData(
    userId: string,
    month: number,
    year: number
  ): Promise<Result<BonusPageDataDto>> {
    try {
      await connectDB();

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const rawBonuses = await BonusLog.find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      })
        .sort({ date: -1 })
        .lean();

      let totalReceived = 0;
      let totalPending = 0;
      let receivedCount = 0;
      let pendingCount = 0;

      const bonuses: BonusLogDto[] = (rawBonuses as any[]).map((b) => {
        const amount = Number(b.amount) || 0;
        const status = b.status || "received";

        if (status === "received") {
          totalReceived += amount;
          receivedCount++;
        } else {
          totalPending += amount;
          pendingCount++;
        }

        return {
          id: String(b._id),
          title: b.title,
          amount,
          bonusType: b.bonusType || "milestone",
          date: b.date ? new Date(b.date).toISOString() : new Date().toISOString(),
          status,
          targetTrips: Number(b.targetTrips) || 0,
          note: b.note,
          createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
        };
      });

      const summary: BonusSummaryDto = {
        totalReceived,
        totalPending,
        totalBonuses: totalReceived + totalPending,
        receivedCount,
        pendingCount,
      };

      return Result.ok({
        bonuses,
        summary,
        month,
        year,
      });
    } catch (err: any) {
      console.error("[BonusService.getBonusPageData] Error:", err);
      return Result.fail(err?.message || "Không thể tải danh sách tiền thưởng");
    }
  }

  /**
   * Tạo khoản tiền thưởng mới
   */
  static async createBonusLog(
    userId: string,
    input: BonusLogInput
  ): Promise<Result<BonusLogDto>> {
    try {
      await connectDB();

      const amount = Math.round(input.amount);
      const newBonus = await BonusLog.create({
        userId,
        title: input.title,
        amount,
        bonusType: input.bonusType,
        date: input.date,
        status: input.status,
        targetTrips: input.targetTrips || 0,
        note: input.note,
      });

      // Nếu đã nhận, đồng bộ vào dòng thu nhập (Income)
      if (input.status === "received") {
        await Income.create({
          userId,
          name: `Tiền thưởng Be: ${input.title}`,
          amount,
          type: "oneTime",
          date: input.date,
          note: `Thưởng ${input.bonusType} (${input.note || ""})`,
        });
      }

      invalidateDashboardCache(userId);

      return Result.ok({
        id: String(newBonus._id),
        title: newBonus.title,
        amount: newBonus.amount,
        bonusType: newBonus.bonusType,
        date: new Date(newBonus.date).toISOString(),
        status: newBonus.status,
        targetTrips: Number(newBonus.targetTrips) || 0,
        note: newBonus.note,
        createdAt: new Date(newBonus.createdAt).toISOString(),
      });
    } catch (err: any) {
      console.error("[BonusService.createBonusLog] Error:", err);
      return Result.fail(err?.message || "Lỗi khi lưu tiền thưởng");
    }
  }

  /**
   * Cập nhật trạng thái tiền thưởng (từ Chờ duyệt sang Đã nhận)
   */
  static async updateBonusStatus(
    userId: string,
    bonusId: string,
    status: "received" | "pending"
  ): Promise<Result<BonusLogDto>> {
    try {
      await connectDB();

      const bonus = await BonusLog.findOne({ _id: bonusId, userId });
      if (!bonus) {
        return Result.fail("Không tìm thấy tiền thưởng");
      }

      const prevStatus = bonus.status;
      bonus.status = status;
      await bonus.save();

      // Nếu chuyển sang Đã nhận mà trước đó chưa nhận -> ghi nhận thu nhập
      if (prevStatus !== "received" && status === "received") {
        await Income.create({
          userId,
          name: `Tiền thưởng Be: ${bonus.title}`,
          amount: bonus.amount,
          type: "oneTime",
          date: new Date(),
          note: `Đã giải ngân thưởng ${bonus.bonusType}`,
        });
      }

      invalidateDashboardCache(userId);

      return Result.ok({
        id: String(bonus._id),
        title: bonus.title,
        amount: bonus.amount,
        bonusType: bonus.bonusType,
        date: new Date(bonus.date).toISOString(),
        status: bonus.status,
        targetTrips: bonus.targetTrips || 0,
        note: bonus.note,
        createdAt: new Date(bonus.createdAt).toISOString(),
      });
    } catch (err: any) {
      console.error("[BonusService.updateBonusStatus] Error:", err);
      return Result.fail(err?.message || "Lỗi khi cập nhật trạng thái thưởng");
    }
  }

  /**
   * Xóa tiền thưởng
   */
  static async deleteBonusLog(userId: string, bonusId: string): Promise<Result<boolean>> {
    try {
      await connectDB();
      const deleted = await BonusLog.findOneAndDelete({ _id: bonusId, userId });
      if (!deleted) {
        return Result.fail("Không tìm thấy tiền thưởng để xóa");
      }
      invalidateDashboardCache(userId);
      return Result.ok(true);
    } catch (err: any) {
      console.error("[BonusService.deleteBonusLog] Error:", err);
      return Result.fail(err?.message || "Lỗi khi xóa tiền thưởng");
    }
  }
}
