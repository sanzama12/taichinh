import { connectDB } from "@/lib/db";
import { FuelLog, IFuelLog } from "@/models/FuelLog";
import { Expense } from "@/models/Expense";
import { Result } from "@/lib/utils";
import { type FuelLogInput } from "@/lib/validators";
import { invalidateDashboardCache } from "@/services/dashboard.service";

export interface FuelLogDto {
  id: string;
  amount: number;
  liters: number;
  pricePerLiter: number;
  odoKm: number;
  fuelType: "RON 95" | "E5 RON 92" | "Dầu DO";
  gasStation?: string;
  date: string;
  note?: string;
  createdAt: string;
}

export interface FuelSummaryDto {
  totalCost: number;
  totalLiters: number;
  avgPricePerLiter: number;
  totalFillCount: number;
  avgCostPerFill: number;
  estimatedKmRun: number;
}

export interface FuelPageDataDto {
  logs: FuelLogDto[];
  summary: FuelSummaryDto;
  month: number;
  year: number;
}

export class FuelService {
  /**
   * Lấy toàn bộ nhật ký xăng theo tháng & năm
   */
  static async getFuelPageData(
    userId: string,
    month: number,
    year: number
  ): Promise<Result<FuelPageDataDto>> {
    try {
      await connectDB();

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const rawLogs = await FuelLog.find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      })
        .sort({ date: -1 })
        .lean();

      let totalCost = 0;
      let totalLiters = 0;
      let minOdo = Number.MAX_SAFE_INTEGER;
      let maxOdo = 0;

      const logs: FuelLogDto[] = (rawLogs as any[]).map((l) => {
        const cost = Number(l.amount) || 0;
        const liters = Number(l.liters) || 0;
        const odo = Number(l.odoKm) || 0;

        totalCost += cost;
        totalLiters += liters;

        if (odo > 0) {
          if (odo < minOdo) minOdo = odo;
          if (odo > maxOdo) maxOdo = odo;
        }

        const calculatedPricePerLiter =
          l.pricePerLiter && l.pricePerLiter > 0
            ? l.pricePerLiter
            : liters > 0
            ? Math.round(cost / liters)
            : 0;

        return {
          id: String(l._id),
          amount: cost,
          liters,
          pricePerLiter: calculatedPricePerLiter,
          odoKm: odo,
          fuelType: l.fuelType || "RON 95",
          gasStation: l.gasStation,
          date: l.date ? new Date(l.date).toISOString() : new Date().toISOString(),
          note: l.note,
          createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
        };
      });

      const totalFillCount = logs.length;
      const avgPricePerLiter =
        totalLiters > 0 ? Math.round(totalCost / totalLiters) : 0;
      const avgCostPerFill =
        totalFillCount > 0 ? Math.round(totalCost / totalFillCount) : 0;
      const estimatedKmRun = maxOdo > minOdo && minOdo !== Number.MAX_SAFE_INTEGER ? maxOdo - minOdo : 0;

      const summary: FuelSummaryDto = {
        totalCost,
        totalLiters: Math.round(totalLiters * 10) / 10,
        avgPricePerLiter,
        totalFillCount,
        avgCostPerFill,
        estimatedKmRun,
      };

      return Result.ok({
        logs,
        summary,
        month,
        year,
      });
    } catch (err: any) {
      console.error("[FuelService.getFuelPageData] Error:", err);
      return Result.fail(err?.message || "Không thể tải nhật ký đổ xăng");
    }
  }

  /**
   * Ghi nhận lần đổ xăng mới và đồng bộ vào chi phí vận hành (Expense)
   */
  static async createFuelLog(
    userId: string,
    input: FuelLogInput
  ): Promise<Result<FuelLogDto>> {
    try {
      await connectDB();

      const amount = Math.round(input.amount);
      const liters = Number(input.liters);
      const calculatedPrice =
        input.pricePerLiter && input.pricePerLiter > 0
          ? Math.round(input.pricePerLiter)
          : liters > 0
          ? Math.round(amount / liters)
          : 0;

      const newLog = await FuelLog.create({
        userId,
        amount,
        liters,
        pricePerLiter: calculatedPrice,
        odoKm: input.odoKm || 0,
        fuelType: input.fuelType,
        gasStation: input.gasStation,
        date: input.date,
        note: input.note,
      });

      // Tự động ghi vào chi phí vận hành (Expense) mục "Xăng xe & Di chuyển"
      await Expense.create({
        userId,
        amount,
        category: "Di chuyển & Công tác",
        date: input.date,
        note: `Đổ xăng ${input.fuelType} (${liters}L${input.odoKm ? `, ODO: ${input.odoKm}km` : ""}${input.gasStation ? ` tại ${input.gasStation}` : ""})`,
      });

      invalidateDashboardCache(userId);

      return Result.ok({
        id: String(newLog._id),
        amount: newLog.amount,
        liters: newLog.liters,
        pricePerLiter: Number(newLog.pricePerLiter) || 0,
        odoKm: Number(newLog.odoKm) || 0,
        fuelType: newLog.fuelType,
        gasStation: newLog.gasStation,
        date: new Date(newLog.date).toISOString(),
        note: newLog.note,
        createdAt: new Date(newLog.createdAt).toISOString(),
      });
    } catch (err: any) {
      console.error("[FuelService.createFuelLog] Error:", err);
      return Result.fail(err?.message || "Lỗi khi lưu nhật ký đổ xăng");
    }
  }

  /**
   * Xóa nhật ký đổ xăng
   */
  static async deleteFuelLog(userId: string, logId: string): Promise<Result<boolean>> {
    try {
      await connectDB();
      const deleted = await FuelLog.findOneAndDelete({ _id: logId, userId });
      if (!deleted) {
        return Result.fail("Không tìm thấy dữ liệu đổ xăng để xóa");
      }
      invalidateDashboardCache(userId);
      return Result.ok(true);
    } catch (err: any) {
      console.error("[FuelService.deleteFuelLog] Error:", err);
      return Result.fail(err?.message || "Lỗi khi xóa nhật ký đổ xăng");
    }
  }
}
