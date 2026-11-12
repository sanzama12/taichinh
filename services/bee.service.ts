import { connectDB } from "@/lib/db";
import { BeeOrder, IBeeOrder } from "@/models/BeeOrder";
import { Income } from "@/models/Income";
import { BonusLog } from "@/models/BonusLog";
import { User } from "@/models/User";
import { Result } from "@/lib/utils";
import { type BeeOrderInput } from "@/lib/validators";
import { invalidateDashboardCache } from "@/services/dashboard.service";

export interface HeaderRevenueDto {
  revenueThisMonth: number;
  walletBalance: number;
  allTimeEarnings: number;
  walletCode: string;
}

export interface UserIncomeWalletDto {
  walletCode: string;
  walletName: string;
  ownerName: string;
  balance: number;
  totalIncomeThisMonth: number;
  totalAllTimeEarnings: number;
}

export interface BeeOrderDto {
  id: string;
  orderCode: string;
  serviceType:
    | "beBike"
    | "beDeliveryExpress"
    | "beDeliveryEconomy"
    | "beDeliveryCorporate"
    | "beDelivery"
    | "beCar"
    | "beFood";
  customerFare: number;
  platformFee: number;
  taxTncn: number;
  driverEarnings: number;
  tip: number;
  tripCount: number;
  distanceKm: number;
  orderDate: string;
  tripTime?: string;
  imageUrl?: string;
  note?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface BeeSummaryDto {
  totalEarnings: number;
  totalCustomerFare: number;
  totalPlatformFee: number;
  totalTaxTncn: number;
  totalTip: number;
  totalTrips: number;
  avgFeePercent: number;
  netPerHourEstimate: number;
}

export interface BeePageDataDto {
  orders: BeeOrderDto[];
  summary: BeeSummaryDto;
  wallet: UserIncomeWalletDto;
  month: number;
  year: number;
}

export class BeeService {
  /**
   * Lấy toàn bộ dữ liệu trang Quản lý đơn Be theo tháng & năm
   */
  static async getBeePageData(
    userId: string,
    month: number,
    year: number
  ): Promise<Result<BeePageDataDto>> {
    try {
      await connectDB();

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const rawOrders = await BeeOrder.find({
        userId,
        orderDate: { $gte: startDate, $lte: endDate },
      })
        .sort({ orderDate: -1 })
        .lean();

      let totalEarnings = 0;
      let totalCustomerFare = 0;
      let totalPlatformFee = 0;
      let totalTaxTncn = 0;
      let totalTip = 0;
      let totalTrips = 0;

      const orders: BeeOrderDto[] = (rawOrders as any[]).map((o) => {
        const fare = Number(o.customerFare) || 0;
        const fee = Number(o.platformFee) || 0;
        const tax = Number(o.taxTncn) || 0;
        const earnings = Number(o.driverEarnings) || 0;
        const tip = Number(o.tip) || 0;
        const trips = Number(o.tripCount) || 1;

        totalEarnings += earnings;
        totalCustomerFare += fare;
        totalPlatformFee += fee;
        totalTaxTncn += tax;
        totalTip += tip;
        totalTrips += trips;

        return {
          id: String(o._id),
          orderCode: o.orderCode,
          serviceType: o.serviceType || "beBike",
          customerFare: fare,
          platformFee: fee,
          taxTncn: tax,
          driverEarnings: earnings,
          tip,
          tripCount: trips,
          distanceKm: Number(o.distanceKm) || 0,
          orderDate: o.orderDate ? new Date(o.orderDate).toISOString() : new Date().toISOString(),
          tripTime: (o as any).tripTime || "",
          imageUrl: (o as any).imageUrl || "",
          note: o.note,
          approvalStatus: (o as any).approvalStatus || "approved",
          createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
        };
      });

      const avgFeePercent =
        totalCustomerFare > 0
          ? Math.round((totalPlatformFee / totalCustomerFare) * 100)
          : 0;

      const summary: BeeSummaryDto = {
        totalEarnings,
        totalCustomerFare,
        totalPlatformFee,
        totalTaxTncn,
        totalTip,
        totalTrips,
        avgFeePercent,
        netPerHourEstimate: totalTrips > 0 ? Math.round(totalEarnings / totalTrips) : 0,
      };

      // 3. Lấy và khởi tạo Ví Thu Nhập Riêng của User nếu chưa có
      const userDoc = await User.findById(userId).lean();
      const generatedCode =
        (userDoc as any)?.walletCode ||
        `VTHU-${String(userId).slice(-6).toUpperCase()}`;
      const ownerName = (userDoc as any)?.name || "Tài Xế Đối Tác";
      const walletName =
        (userDoc as any)?.walletName || `Ví Thu Nhập ${ownerName}`;

      // Tính tổng thu nhập toàn thời gian từ tất cả cuốc xe của user này
      const allOrders = await BeeOrder.find({ userId }).select("driverEarnings tip").lean();
      const totalAllTimeEarnings = (allOrders as any[]).reduce(
        (sum, o) => sum + (Number(o.driverEarnings) || 0) + (Number(o.tip) || 0),
        0
      );

      const balance =
        (userDoc as any)?.walletBalance !== undefined &&
        (userDoc as any)?.walletBalance !== null &&
        Number((userDoc as any).walletBalance) > 0
          ? Number((userDoc as any).walletBalance)
          : totalAllTimeEarnings;

      const wallet: UserIncomeWalletDto = {
        walletCode: generatedCode,
        walletName,
        ownerName,
        balance,
        totalIncomeThisMonth: totalEarnings,
        totalAllTimeEarnings,
      };

      // Tự động lưu thông tin ví cho user nếu chưa có walletCode
      if (!(userDoc as any)?.walletCode) {
        await User.findByIdAndUpdate(userId, {
          walletCode: generatedCode,
          walletName,
          walletBalance: balance,
        });
      }

      return Result.ok({
        orders,
        summary,
        wallet,
        month,
        year,
      });
    } catch (err: any) {
      console.error("[BeeService.getBeePageData] Error:", err);
      return Result.fail(err?.message || "Không thể tải dữ liệu đơn Be");
    }
  }

  /**
   * Tạo đơn Be mới và đồng bộ vào dòng thu nhập thực tế
   */
  static async createBeeOrder(
    userId: string,
    input: BeeOrderInput
  ): Promise<Result<BeeOrderDto>> {
    try {
      await connectDB();

      const customerFare = Math.round(input.customerFare);
      const platformFee = Math.round(input.platformFee || 0);
      const taxTncn = Math.round(input.taxTncn || 0);
      const driverEarnings =
        input.driverEarnings !== undefined && input.driverEarnings > 0
          ? Math.round(input.driverEarnings)
          : Math.max(0, customerFare - platformFee - taxTncn);

      // Lấy vai trò user: nếu Admin thêm thì duyệt ngay, User gửi lên thì chờ Admin xét duyệt
      const userDoc = await User.findById(userId).select("role").lean();
      const isAdmin = (userDoc as any)?.role === "admin";
      const approvalStatus = isAdmin ? "approved" : "pending";

      const newOrder = await BeeOrder.create({
        userId,
        orderCode: input.orderCode,
        serviceType: input.serviceType,
        customerFare,
        platformFee,
        taxTncn,
        driverEarnings,
        tip: Math.round(input.tip || 0),
        tripCount: input.tripCount || 1,
        distanceKm: input.distanceKm || 0,
        orderDate: input.orderDate,
        tripTime: input.tripTime || "",
        imageUrl: input.imageUrl || "",
        note: input.note,
        approvalStatus,
      });

      // Nếu Admin tạo: Tự động ghi nhận khoản thu và tích lũy vào Ví ngay
      const totalIncome = driverEarnings + (input.tip || 0);
      if (isAdmin && totalIncome > 0) {
        await Income.create({
          userId,
          name: `Cuốc Be [${input.orderCode}] - ${input.serviceType}`,
          amount: totalIncome,
          type: "oneTime",
          date: input.orderDate,
          approvalStatus: "approved",
          note: `Đơn Be ${input.orderCode} (${input.tripCount || 1} chuyến, tip: ${input.tip || 0}đ)`,
        });

        // Tích lũy trực tiếp vào Ví Thu Nhập Riêng của User này
        await User.findByIdAndUpdate(userId, {
          $inc: { walletBalance: totalIncome },
        });
      }

      invalidateDashboardCache(userId);

      return Result.ok({
        id: String(newOrder._id),
        orderCode: newOrder.orderCode,
        serviceType: newOrder.serviceType,
        customerFare: newOrder.customerFare,
        platformFee: newOrder.platformFee,
        taxTncn: Number((newOrder as any).taxTncn) || taxTncn,
        driverEarnings: newOrder.driverEarnings,
        tip: newOrder.tip,
        tripCount: newOrder.tripCount,
        distanceKm: Number(newOrder.distanceKm) || 0,
        orderDate: new Date(newOrder.orderDate).toISOString(),
        tripTime: (newOrder as any).tripTime || "",
        imageUrl: (newOrder as any).imageUrl || "",
        note: newOrder.note,
        approvalStatus: (newOrder as any).approvalStatus || approvalStatus,
        createdAt: new Date(newOrder.createdAt).toISOString(),
      });
    } catch (err: any) {
      console.error("[BeeService.createBeeOrder] Error:", err);
      return Result.fail(err?.message || "Lỗi khi tạo đơn Be");
    }
  }

  /**
   * Xóa đơn Be
   */
  static async deleteBeeOrder(userId: string, orderId: string): Promise<Result<boolean>> {
    try {
      await connectDB();
      const orderToDelete = await BeeOrder.findOne({ _id: orderId, userId }).lean();
      const deleted = await BeeOrder.findOneAndDelete({ _id: orderId, userId });
      if (!deleted) {
        return Result.fail("Không tìm thấy đơn Be để xóa");
      }

      if (orderToDelete) {
        const deduct =
          (Number((orderToDelete as any).driverEarnings) || 0) +
          (Number((orderToDelete as any).tip) || 0);
        if (deduct > 0) {
          await User.findByIdAndUpdate(userId, {
            $inc: { walletBalance: -deduct },
          });
        }
      }

      invalidateDashboardCache(userId);
      return Result.ok(true);
    } catch (err: any) {
      console.error("[BeeService.deleteBeeOrder] Error:", err);
      return Result.fail(err?.message || "Lỗi khi xóa đơn Be");
    }
  }

  /**
   * Lấy nhanh thông tin doanh thu thời gian thực hiển thị trên thanh Header
   */
  static async getHeaderRevenue(userId: string): Promise<Result<HeaderRevenueDto>> {
    try {
      await connectDB();
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // 1. Thu nhập cuốc xe Be tháng này
      const monthBeeOrders = await BeeOrder.find({
        userId,
        orderDate: { $gte: startDate, $lte: endDate },
      })
        .select("driverEarnings tip")
        .lean();

      let beeEarnings = 0;
      for (const o of monthBeeOrders as any[]) {
        beeEarnings += (Number(o.driverEarnings) || 0) + (Number(o.tip) || 0);
      }

      // 2. Thu nhập từ nguồn khác (Income)
      const incomes = await Income.find({ userId }).select("amount type date").lean();
      let otherIncome = 0;
      for (const inc of incomes as any[]) {
        if (inc.type === "monthly") {
          otherIncome += Number(inc.amount) || 0;
        } else if (inc.type === "oneTime" && inc.date) {
          const d = new Date(inc.date);
          if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
            otherIncome += Number(inc.amount) || 0;
          }
        }
      }

      // 3. Tiền thưởng nhận được tháng này
      const bonuses = await BonusLog.find({
        userId,
        status: "received",
        date: { $gte: startDate, $lte: endDate },
      })
        .select("amount")
        .lean();
      let bonusIncome = 0;
      for (const b of bonuses as any[]) {
        bonusIncome += Number(b.amount) || 0;
      }

      const revenueThisMonth = beeEarnings + otherIncome + bonusIncome;

      // 4. Lấy số dư ví & tổng tích lũy
      const userDoc = await User.findById(userId)
        .select("walletCode walletBalance name")
        .lean();
      const walletCode =
        (userDoc as any)?.walletCode ||
        `VTHU-${String(userId).slice(-6).toUpperCase()}`;

      const allOrders = await BeeOrder.find({ userId })
        .select("driverEarnings tip")
        .lean();
      const allTimeEarnings = (allOrders as any[]).reduce(
        (sum, o) => sum + (Number(o.driverEarnings) || 0) + (Number(o.tip) || 0),
        0
      );

      const walletBalance =
        (userDoc as any)?.walletBalance !== undefined &&
        (userDoc as any)?.walletBalance !== null &&
        Number((userDoc as any).walletBalance) > 0
          ? Number((userDoc as any).walletBalance)
          : allTimeEarnings > 0
          ? allTimeEarnings
          : revenueThisMonth;

      return Result.ok({
        revenueThisMonth,
        walletBalance,
        allTimeEarnings,
        walletCode,
      });
    } catch (err: any) {
      console.error("[BeeService.getHeaderRevenue] Error:", err);
      return Result.fail(err?.message || "Lỗi tải doanh thu");
    }
  }
}
