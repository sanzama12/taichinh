import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { BeeOrder, type IBeeOrder } from "@/models/BeeOrder";
import { Income, type IIncome } from "@/models/Income";
import { Debt, type IDebt } from "@/models/Debt";
import { SupportTicket, type ISupportTicket } from "@/models/SupportTicket";
import { Result } from "@/lib/utils";
import { invalidateDashboardCache } from "@/services/dashboard.service";
import { type SupportTicketDto } from "@/services/ticket.service";

export interface PendingBeeOrderItemDto {
  id: string;
  orderCode: string;
  serviceType: string;
  customerFare: number;
  platformFee: number;
  driverEarnings: number;
  tip: number;
  orderDate: string;
  tripTime?: string;
  imageUrl?: string;
  note?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  adminNote?: string;
  userId: string;
  userName: string;
  userPhone?: string;
  walletCode?: string;
  createdAt: string;
}

export interface PendingIncomeItemDto {
  id: string;
  name: string;
  amount: number;
  type: string;
  date?: string;
  note?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  adminNote?: string;
  userId: string;
  userName: string;
  userPhone?: string;
  walletCode?: string;
  createdAt: string;
}

export interface PendingDebtItemDto {
  id: string;
  title: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  dueDay: number;
  category: string;
  note?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  adminNote?: string;
  userId: string;
  userName: string;
  userPhone?: string;
  createdAt: string;
}

export interface ApprovalCenterDataDto {
  orders: PendingBeeOrderItemDto[];
  incomes: PendingIncomeItemDto[];
  debts: PendingDebtItemDto[];
  tickets: SupportTicketDto[];
  counts: {
    pendingOrders: number;
    pendingIncomes: number;
    pendingDebts: number;
    openTickets: number;
    totalPending: number;
  };
}

export class AdminApprovalService {
  /**
   * Kiểm tra quyền Admin
   */
  private static async verifyAdmin(adminUserId: string): Promise<Result<boolean>> {
    const admin = await User.findById(adminUserId).select("role").lean();
    if (!admin || (admin as any).role !== "admin") {
      return Result.fail("Bạn không có quyền quản trị viên tối cao (Admin)");
    }
    return Result.ok(true);
  }

  /**
   * Lấy toàn bộ dữ liệu Trung Tâm Xét Duyệt & Hỗ Trợ
   */
  static async getApprovalCenterData(
    adminUserId: string
  ): Promise<Result<ApprovalCenterDataDto>> {
    try {
      await connectDB();
      const authCheck = await this.verifyAdmin(adminUserId);
      if (!authCheck.isSuccess) return Result.fail(authCheck.error);

      // 1. Tải toàn bộ Users để tra cứu nhanh thông tin
      const rawUsers = await User.find()
        .select("_id name phone walletCode role")
        .lean();
      const userMap = new Map<string, any>();
      for (const u of rawUsers as any[]) {
        userMap.set(String(u._id), u);
      }

      // 2. Tải song song danh sách Đơn Be, Doanh Thu, Nợ, Tickets
      const [rawOrders, rawIncomes, rawDebts, rawTickets] = await Promise.all([
        BeeOrder.find().sort({ createdAt: -1 }).limit(100).lean(),
        Income.find().sort({ createdAt: -1 }).limit(100).lean(),
        Debt.find().sort({ createdAt: -1 }).limit(100).lean(),
        SupportTicket.find().sort({ createdAt: -1 }).limit(100).lean(),
      ]);

      let pendingOrdersCount = 0;
      let pendingIncomesCount = 0;
      let pendingDebtsCount = 0;
      let openTicketsCount = 0;

      // Map Đơn Be
      const orders: PendingBeeOrderItemDto[] = (rawOrders as any[]).map((o) => {
        const uId = String(o.userId);
        const user = userMap.get(uId);
        const status = (o.approvalStatus as "pending" | "approved" | "rejected") || "approved";
        if (status === "pending") pendingOrdersCount++;

        return {
          id: String(o._id),
          orderCode: o.orderCode || "BE-XXXXXX",
          serviceType: o.serviceType || "beBike",
          customerFare: Number(o.customerFare) || 0,
          platformFee: Number(o.platformFee) || 0,
          driverEarnings: Number(o.driverEarnings) || 0,
          tip: Number(o.tip) || 0,
          orderDate: o.orderDate ? new Date(o.orderDate).toISOString() : new Date().toISOString(),
          tripTime: o.tripTime || "",
          imageUrl: o.imageUrl || "",
          note: o.note || "",
          approvalStatus: status,
          adminNote: o.adminNote || "",
          userId: uId,
          userName: user?.name || "Người Dùng",
          userPhone: user?.phone || "",
          walletCode: user?.walletCode || `VTHU-${uId.slice(-6).toUpperCase()}`,
          createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
        };
      });

      // Map Doanh Thu
      const incomes: PendingIncomeItemDto[] = (rawIncomes as any[]).map((inc) => {
        const uId = String(inc.userId);
        const user = userMap.get(uId);
        const status = (inc.approvalStatus as "pending" | "approved" | "rejected") || "approved";
        if (status === "pending") pendingIncomesCount++;

        return {
          id: String(inc._id),
          name: inc.name,
          amount: Number(inc.amount) || 0,
          type: inc.type || "monthly",
          date: inc.date ? new Date(inc.date).toISOString() : undefined,
          note: inc.note || "",
          approvalStatus: status,
          adminNote: inc.adminNote || "",
          userId: uId,
          userName: user?.name || "Người Dùng",
          userPhone: user?.phone || "",
          walletCode: user?.walletCode || `VTHU-${uId.slice(-6).toUpperCase()}`,
          createdAt: inc.createdAt ? new Date(inc.createdAt).toISOString() : new Date().toISOString(),
        };
      });

      // Map Nợ
      const debts: PendingDebtItemDto[] = (rawDebts as any[]).map((d) => {
        const uId = String(d.userId);
        const user = userMap.get(uId);
        const status = (d.approvalStatus as "pending" | "approved" | "rejected") || "approved";
        if (status === "pending") pendingDebtsCount++;

        return {
          id: String(d._id),
          title: d.title,
          totalAmount: Number(d.totalAmount) || 0,
          remainingAmount: Number(d.remainingAmount) || 0,
          monthlyPayment: Number(d.monthlyPayment) || 0,
          dueDay: Number(d.dueDay) || 1,
          category: d.category || "other",
          note: d.note || "",
          approvalStatus: status,
          adminNote: d.adminNote || "",
          userId: uId,
          userName: user?.name || "Người Dùng",
          userPhone: user?.phone || "",
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        };
      });

      // Map Tickets
      const tickets: SupportTicketDto[] = (rawTickets as any[]).map((t) => {
        const uId = String(t.userId);
        const user = userMap.get(uId);
        if (t.status === "open" || t.status === "in_progress") openTicketsCount++;

        return {
          id: String(t._id),
          ticketCode: t.ticketCode,
          title: t.title,
          category: t.category,
          message: t.message,
          priority: t.priority,
          status: t.status,
          adminReply: t.adminReply || "",
          resolvedAt: t.resolvedAt ? new Date(t.resolvedAt).toISOString() : undefined,
          userName: user?.name || "Người Dùng",
          userPhone: user?.phone || "",
          userRole: user?.role || "user",
          createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
        };
      });

      return Result.ok({
        orders,
        incomes,
        debts,
        tickets,
        counts: {
          pendingOrders: pendingOrdersCount,
          pendingIncomes: pendingIncomesCount,
          pendingDebts: pendingDebtsCount,
          openTickets: openTicketsCount,
          totalPending: pendingOrdersCount + pendingIncomesCount + pendingDebtsCount + openTicketsCount,
        },
      });
    } catch (err: any) {
      console.error("[AdminApprovalService.getApprovalCenterData] Error:", err);
      return Result.fail(err?.message || "Lỗi tải dữ liệu xét duyệt");
    }
  }

  /**
   * Phê duyệt hoặc Từ chối Đơn Be
   */
  static async processBeeOrder(
    adminUserId: string,
    orderId: string,
    action: "approve" | "reject",
    adminNote?: string
  ): Promise<Result<boolean>> {
    try {
      await connectDB();
      const authCheck = await this.verifyAdmin(adminUserId);
      if (!authCheck.isSuccess) return Result.fail(authCheck.error);

      const order = await BeeOrder.findById(orderId);
      if (!order) return Result.fail("Không tìm thấy đơn cuốc xe");

      const prevStatus = order.approvalStatus;
      const newStatus = action === "approve" ? "approved" : "rejected";

      order.approvalStatus = newStatus;
      if (adminNote) order.adminNote = adminNote;
      await order.save();

      // Nếu duyệt và trước đó chưa được duyệt: cộng tiền vào ví user
      if (action === "approve" && prevStatus !== "approved") {
        const credit = (Number(order.driverEarnings) || 0) + (Number(order.tip) || 0);
        if (credit > 0) {
          await User.findByIdAndUpdate(order.userId, {
            $inc: { walletBalance: credit },
          });
        }
      } else if (action === "reject" && prevStatus === "approved") {
        // Nếu chuyển từ approved sang rejected: trừ lại tiền ví
        const deduct = (Number(order.driverEarnings) || 0) + (Number(order.tip) || 0);
        if (deduct > 0) {
          await User.findByIdAndUpdate(order.userId, {
            $inc: { walletBalance: -deduct },
          });
        }
      }

      invalidateDashboardCache(String(order.userId));
      return Result.ok(true);
    } catch (err: any) {
      console.error("[AdminApprovalService.processBeeOrder] Error:", err);
      return Result.fail(err?.message || "Lỗi khi xử lý đơn Be");
    }
  }

  /**
   * Phê duyệt hoặc Từ chối Doanh Thu (Income)
   */
  static async processIncome(
    adminUserId: string,
    incomeId: string,
    action: "approve" | "reject",
    adminNote?: string
  ): Promise<Result<boolean>> {
    try {
      await connectDB();
      const authCheck = await this.verifyAdmin(adminUserId);
      if (!authCheck.isSuccess) return Result.fail(authCheck.error);

      const income = await Income.findById(incomeId);
      if (!income) return Result.fail("Không tìm thấy khoản thu nhập");

      const prevStatus = income.approvalStatus;
      const newStatus = action === "approve" ? "approved" : "rejected";

      income.approvalStatus = newStatus;
      if (adminNote) income.adminNote = adminNote;
      await income.save();

      // Nếu duyệt: cộng tiền vào ví
      if (action === "approve" && prevStatus !== "approved") {
        const amount = Number(income.amount) || 0;
        if (amount > 0) {
          await User.findByIdAndUpdate(income.userId, {
            $inc: { walletBalance: amount },
          });
        }
      } else if (action === "reject" && prevStatus === "approved") {
        const amount = Number(income.amount) || 0;
        if (amount > 0) {
          await User.findByIdAndUpdate(income.userId, {
            $inc: { walletBalance: -amount },
          });
        }
      }

      invalidateDashboardCache(String(income.userId));
      return Result.ok(true);
    } catch (err: any) {
      console.error("[AdminApprovalService.processIncome] Error:", err);
      return Result.fail(err?.message || "Lỗi khi xử lý khoản thu");
    }
  }

  /**
   * Phê duyệt hoặc Từ chối Khoản Nợ (Debt)
   */
  static async processDebt(
    adminUserId: string,
    debtId: string,
    action: "approve" | "reject",
    adminNote?: string
  ): Promise<Result<boolean>> {
    try {
      await connectDB();
      const authCheck = await this.verifyAdmin(adminUserId);
      if (!authCheck.isSuccess) return Result.fail(authCheck.error);

      const debt = await Debt.findById(debtId);
      if (!debt) return Result.fail("Không tìm thấy khoản nợ");

      debt.approvalStatus = action === "approve" ? "approved" : "rejected";
      if (adminNote) debt.adminNote = adminNote;
      await debt.save();

      invalidateDashboardCache(String(debt.userId));
      return Result.ok(true);
    } catch (err: any) {
      console.error("[AdminApprovalService.processDebt] Error:", err);
      return Result.fail(err?.message || "Lỗi khi xử lý khoản nợ");
    }
  }

  /**
   * Admin phản hồi và xử lý Ticket hỗ trợ
   */
  static async replyTicket(
    adminUserId: string,
    ticketId: string,
    reply: string,
    status: "in_progress" | "resolved" | "closed"
  ): Promise<Result<boolean>> {
    try {
      await connectDB();
      const authCheck = await this.verifyAdmin(adminUserId);
      if (!authCheck.isSuccess) return Result.fail(authCheck.error);

      const ticket = await SupportTicket.findById(ticketId);
      if (!ticket) return Result.fail("Không tìm thấy yêu cầu hỗ trợ");

      ticket.adminReply = reply.trim();
      ticket.status = status;
      if (status === "resolved" || status === "closed") {
        ticket.resolvedAt = new Date();
      }
      await ticket.save();

      return Result.ok(true);
    } catch (err: any) {
      console.error("[AdminApprovalService.replyTicket] Error:", err);
      return Result.fail(err?.message || "Lỗi khi phản hồi yêu cầu hỗ trợ");
    }
  }
}

