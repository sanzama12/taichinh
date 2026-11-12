import { connectDB } from "@/lib/db";
import { User, type IUser, type IUserPermissions, DEFAULT_USER_PERMISSIONS } from "@/models/User";
import { AccessKey, type IAccessKey } from "@/models/AccessKey";
import { BeeOrder, type IBeeOrder } from "@/models/BeeOrder";
import { Income, type IIncome } from "@/models/Income";
import { Debt, type IDebt } from "@/models/Debt";
import { SupportTicket, type ISupportTicket } from "@/models/SupportTicket";
import { Expense } from "@/models/Expense";
import { Bill } from "@/models/Bill";
import { BillPayment } from "@/models/BillPayment";
import { Budget } from "@/models/Budget";
import { SavingsGoal } from "@/models/SavingsGoal";
import { SavingsTransaction } from "@/models/SavingsTransaction";
import { FuelLog } from "@/models/FuelLog";
import { BonusLog } from "@/models/BonusLog";
import { Result, getErrorMessage } from "@/lib/utils";
import { invalidateDashboardCache } from "@/services/dashboard.service";
import { type SupportTicketDto } from "@/services/ticket.service";
import type {
  AdminCreateUserInput,
  AdminUpdateUserInput,
} from "@/lib/validators";

export interface AdminUserItemDto {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  role: "admin" | "user";
  accessKey?: string;
  accessKeyId?: string;
  isActive: boolean;
  walletCode?: string;
  walletBalance: number;
  permissions?: IUserPermissions;
  lastLoginAt?: string;
  createdAt: string;
}

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

export interface AdminUnifiedSummaryDto {
  totalUsers: number;
  activeUsers: number;
  pendingOrLockedUsers: number;
  totalAdminCount: number;
  totalWalletBalances: number;
  pendingOrdersCount: number;
  pendingIncomesCount: number;
  pendingDebtsCount: number;
  openTicketsCount: number;
  totalPendingCount: number;
}

export interface AdminUsersPageDataDto {
  users: AdminUserItemDto[];
  totalUsers: number;
  activeUsers: number;
  pendingOrLockedUsers: number;
  totalAdminCount: number;
  totalWalletBalances: number;
}

export interface AdminUnifiedDataDto {
  users: AdminUserItemDto[];
  orders: PendingBeeOrderItemDto[];
  incomes: PendingIncomeItemDto[];
  debts: PendingDebtItemDto[];
  tickets: SupportTicketDto[];
  summary: AdminUnifiedSummaryDto;
}

export class AdminService {
  /**
   * Kiểm tra quyền Quản trị viên
   */
  private static async verifyAdmin(adminUserId: string): Promise<Result<boolean>> {
    const admin = await User.findById(adminUserId).select("role").lean();
    if (!admin || (admin as any).role !== "admin") {
      return Result.fail("Bạn không có quyền quản trị viên tối cao (Admin)");
    }
    return Result.ok(true);
  }

  /**
   * Lấy toàn bộ dữ liệu gộp chung của Ban Quản Trị (Users, Orders, Incomes, Debts, Tickets)
   */
  static async getAdminUnifiedData(
    adminUserId: string
  ): Promise<Result<AdminUnifiedDataDto>> {
    try {
      await connectDB();
      const authCheck = await this.verifyAdmin(adminUserId);
      if (!authCheck.isSuccess) return Result.fail(authCheck.error);

      // Tải song song tất cả collections trong 1 lượt (High Speed Single Pass)
      const [rawUsers, rawKeys, rawOrders, rawIncomes, rawDebts, rawTickets] = await Promise.all([
        User.find()
          .select("_id name email phone avatar image address role accessKey walletCode walletBalance permissions createdAt")
          .sort({ createdAt: -1 })
          .lean(),
        AccessKey.find().select("_id key userId isActive lastLoginAt role").lean(),
        BeeOrder.find().sort({ createdAt: -1 }).limit(100).lean(),
        Income.find().sort({ createdAt: -1 }).limit(100).lean(),
        Debt.find().sort({ createdAt: -1 }).limit(100).lean(),
        SupportTicket.find().sort({ createdAt: -1 }).limit(100).lean(),
      ]);

      // Map User và AccessKey tra cứu O(1)
      const userMap = new Map<string, any>();
      const keyByUserMap = new Map<string, any>();
      const keyByStringMap = new Map<string, any>();

      for (const k of rawKeys as any[]) {
        if (k.userId) keyByUserMap.set(String(k.userId), k);
        if (k.key) keyByStringMap.set(String(k.key).toUpperCase(), k);
      }

      let activeUsers = 0;
      let pendingOrLockedUsers = 0;
      let totalAdminCount = 0;
      let totalWalletBalances = 0;

      const users: AdminUserItemDto[] = (rawUsers as any[]).map((u) => {
        const uId = String(u._id);
        userMap.set(uId, u);

        const userKey = u.accessKey ? String(u.accessKey).toUpperCase() : "";
        const linkedKey = keyByUserMap.get(uId) || (userKey ? keyByStringMap.get(userKey) : null);
        const isActive = linkedKey ? Boolean(linkedKey.isActive) : true;
        const role = (u.role as "admin" | "user") || "user";
        const balance = Number(u.walletBalance) || 0;

        if (isActive) activeUsers++;
        else pendingOrLockedUsers++;

        if (role === "admin") totalAdminCount++;
        totalWalletBalances += balance;

        return {
          id: uId,
          name: u.name || "Người Dùng",
          email: u.email || "",
          phone: u.phone || "",
          avatar:
            u.avatar ||
            u.image ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          address: u.address || "",
          role,
          accessKey: userKey || (linkedKey ? linkedKey.key : ""),
          accessKeyId: linkedKey ? String(linkedKey._id) : undefined,
          isActive,
          walletCode: u.walletCode || `VTHU-${uId.slice(-6).toUpperCase()}`,
          walletBalance: balance,
          permissions: (u as any).permissions || { ...DEFAULT_USER_PERMISSIONS },
          lastLoginAt: linkedKey?.lastLoginAt ? new Date(linkedKey.lastLoginAt).toISOString() : undefined,
          createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
        };
      });

      // 2. Map Đơn Be
      let pendingOrdersCount = 0;
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

      // 3. Map Doanh Thu
      let pendingIncomesCount = 0;
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

      // 4. Map Khoản Nợ
      let pendingDebtsCount = 0;
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

      // 5. Map Tickets Hỗ Trợ
      let openTicketsCount = 0;
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

      const summary: AdminUnifiedSummaryDto = {
        totalUsers: users.length,
        activeUsers,
        pendingOrLockedUsers,
        totalAdminCount,
        totalWalletBalances,
        pendingOrdersCount,
        pendingIncomesCount,
        pendingDebtsCount,
        openTicketsCount,
        totalPendingCount: pendingOrdersCount + pendingIncomesCount + pendingDebtsCount + openTicketsCount,
      };

      return Result.ok({
        users,
        orders,
        incomes,
        debts,
        tickets,
        summary,
      });
    } catch (err: any) {
      console.error("[AdminService.getAdminUnifiedData] Error:", err);
      return Result.fail(err?.message || "Lỗi tải dữ liệu tổng thể cho Admin");
    }
  }

  /**
   * Xác duyệt hoặc Khóa/Mở khóa User
   */
  static async toggleUserApproval(
    adminUserId: string,
    targetUserId: string,
    shouldActivate: boolean
  ): Promise<Result<boolean>> {
    try {
      await connectDB();
      const authCheck = await this.verifyAdmin(adminUserId);
      if (!authCheck.isSuccess) return Result.fail(authCheck.error);

      const targetUser = await User.findById(targetUserId);
      if (!targetUser) return Result.fail("Không tìm thấy người dùng");

      let targetKey = await AccessKey.findOne({ userId: targetUser._id });
      if (!targetKey && targetUser.accessKey) {
        targetKey = await AccessKey.findOne({ key: targetUser.accessKey.toUpperCase() });
      }

      if (targetKey) {
        targetKey.isActive = shouldActivate;
        await targetKey.save();
      } else {
        const newKeyStr = targetUser.accessKey || `KEY-${targetUserId.slice(-6).toUpperCase()}`;
        await AccessKey.create({
          key: newKeyStr,
          name: targetUser.name,
          userId: targetUser._id,
          role: targetUser.role,
          isActive: shouldActivate,
        });
      }

      return Result.ok(true);
    } catch (err: any) {
      console.error("[AdminService.toggleUserApproval] Error:", err);
      return Result.fail(err?.message || "Lỗi khi cập nhật trạng thái người dùng");
    }
  }

  /**
   * Đổi quyền User <-> Admin
   */
  static async changeUserRole(
    adminUserId: string,
    targetUserId: string,
    newRole: "admin" | "user"
  ): Promise<Result<boolean>> {
    try {
      await connectDB();
      const authCheck = await this.verifyAdmin(adminUserId);
      if (!authCheck.isSuccess) return Result.fail(authCheck.error);

      if (adminUserId === targetUserId && newRole === "user") {
        return Result.fail("Không thể tự hạ quyền Admin của chính tài khoản đang đăng nhập");
      }

      const targetUser = await User.findById(targetUserId).select("role").lean();
      if (!targetUser) return Result.fail("Không tìm thấy người dùng");
      if (targetUser.role === "admin" && newRole === "user") {
        const adminCount = await User.countDocuments({ role: "admin" });
        if (adminCount <= 1) return Result.fail("Hệ thống phải luôn có ít nhất một Admin");
      }

      await User.findByIdAndUpdate(targetUserId, { role: newRole });
      await AccessKey.updateMany({ userId: targetUserId }, { role: newRole });

      return Result.ok(true);
    } catch (err: any) {
      console.error("[AdminService.changeUserRole] Error:", err);
      return Result.fail(err?.message || "Lỗi khi đổi quyền người dùng");
    }
  }

  /**
   * Cấp tài khoản mới
   */
  static async createUserWithKey(
    adminUserId: string,
    input: AdminCreateUserInput
  ): Promise<Result<boolean>> {
    try {
      await connectDB();
      const authCheck = await this.verifyAdmin(adminUserId);
      if (!authCheck.isSuccess) return Result.fail(authCheck.error);

      const cleanKey = (input.key || input.phone || "").trim().replace(/[\s\-\.]/g, "").toUpperCase();
      const cleanPhone = (input.phone || input.key || "").trim().replace(/[\s\-\.]/g, "");
      if (!cleanKey) return Result.fail("Vui lòng nhập số điện thoại hoặc mã khóa");

      const existingKey = await AccessKey.findOne({ key: cleanKey });
      if (existingKey) return Result.fail("Số điện thoại / Mã khóa này đã tồn tại trên hệ thống");

      const cleanName = input.name.trim() || "Người Dùng Mới";
      const cleanRole = input.role || "user";
      const initialBalance = Number(input.balance) || 0;

      const newUser = await User.create({
        name: cleanName,
        phone: cleanPhone || undefined,
        accessKey: cleanKey,
        role: cleanRole,
        walletBalance: initialBalance,
        walletCode: `VTHU-${cleanKey}`,
        permissions: (input as any).permissions || DEFAULT_USER_PERMISSIONS,
        settings: {
          savingsRatePercent: 20,
          remindDaysBefore: 3,
          emailReminder: true,
          currency: "VND",
        },
      });

      await AccessKey.create({
        key: cleanKey,
        name: cleanName,
        userId: newUser._id,
        role: cleanRole,
        isActive: true,
      });

      return Result.ok(true);
    } catch (err: any) {
      console.error("[AdminService.createUserWithKey] Error:", err);
      return Result.fail(err?.message || "Lỗi khi tạo người dùng mới");
    }
  }

  static async updateUser(
    adminUserId: string,
    targetUserId: string,
    input: AdminUpdateUserInput
  ): Promise<Result<boolean>> {
    try {
      await connectDB();
      const authCheck = await this.verifyAdmin(adminUserId);
      if (!authCheck.isSuccess) return Result.fail(authCheck.error);

      const targetUser = await User.findById(targetUserId);
      if (!targetUser) return Result.fail("Không tìm thấy người dùng");
      if (adminUserId === targetUserId && input.role !== "admin") {
        return Result.fail("Không thể tự hạ quyền Admin của tài khoản đang đăng nhập");
      }
      if (targetUser.role === "admin" && input.role === "user") {
        const adminCount = await User.countDocuments({ role: "admin" });
        if (adminCount <= 1) return Result.fail("Hệ thống phải luôn có ít nhất một Admin");
      }

      const cleanKey = input.key.trim().toUpperCase();
      let targetKey = await AccessKey.findOne({ userId: targetUser._id });
      if (!targetKey && targetUser.accessKey) {
        targetKey = await AccessKey.findOne({ key: targetUser.accessKey.toUpperCase() });
      }

      const duplicateKey = await AccessKey.findOne({
        key: cleanKey,
        ...(targetKey ? { _id: { $ne: targetKey._id } } : {}),
      });
      if (duplicateKey) return Result.fail("Mã khóa này đã được cấp cho thành viên khác");

      if (input.email) {
        const duplicateEmail = await User.findOne({
          email: input.email.toLowerCase(),
          _id: { $ne: targetUser._id },
        });
        if (duplicateEmail) return Result.fail("Email này đã được sử dụng");
      }

      const updateData: any = {
        name: input.name.trim(),
        email: input.email?.toLowerCase() || undefined,
        phone: input.phone || undefined,
        accessKey: cleanKey,
        role: input.role,
        walletBalance: input.balance,
      };
      if ((input as any).permissions) {
        updateData.permissions = (input as any).permissions;
      }

      await User.findByIdAndUpdate(targetUserId, updateData);

      if (targetKey) {
        await AccessKey.findOneAndUpdate(
          { _id: targetKey._id },
          {
            key: cleanKey,
            name: input.name.trim(),
            role: input.role,
            isActive: input.isActive,
          }
        );
      } else {
        await AccessKey.create({
          key: cleanKey,
          name: input.name.trim(),
          userId: targetUser._id,
          role: input.role,
          isActive: input.isActive,
        });
      }

      invalidateDashboardCache(targetUserId);
      return Result.ok(true);
    } catch (error: unknown) {
      console.error("[AdminService.updateUser] Error:", error);
      return Result.fail(getErrorMessage(error, "Lỗi khi cập nhật người dùng"));
    }
  }

  static async deleteUser(
    adminUserId: string,
    targetUserId: string
  ): Promise<Result<boolean>> {
    try {
      await connectDB();
      const authCheck = await this.verifyAdmin(adminUserId);
      if (!authCheck.isSuccess) return Result.fail(authCheck.error);
      if (adminUserId === targetUserId) {
        return Result.fail("Không thể xóa tài khoản Admin đang đăng nhập");
      }

      const targetUser = await User.findById(targetUserId).select("role").lean();
      if (!targetUser) return Result.fail("Không tìm thấy người dùng");
      if (targetUser.role === "admin") {
        const adminCount = await User.countDocuments({ role: "admin" });
        if (adminCount <= 1) return Result.fail("Không thể xóa Admin cuối cùng của hệ thống");
      }

      await Promise.all([
        AccessKey.deleteMany({ userId: targetUserId }),
        BeeOrder.deleteMany({ userId: targetUserId }),
        Income.deleteMany({ userId: targetUserId }),
        Debt.deleteMany({ userId: targetUserId }),
        SupportTicket.deleteMany({ userId: targetUserId }),
        Expense.deleteMany({ userId: targetUserId }),
        Bill.deleteMany({ userId: targetUserId }),
        BillPayment.deleteMany({ userId: targetUserId }),
        Budget.deleteMany({ userId: targetUserId }),
        SavingsGoal.deleteMany({ userId: targetUserId }),
        SavingsTransaction.deleteMany({ userId: targetUserId }),
        FuelLog.deleteMany({ userId: targetUserId }),
        BonusLog.deleteMany({ userId: targetUserId }),
      ]);
      await User.findOneAndDelete({ _id: targetUserId });

      invalidateDashboardCache(targetUserId);
      return Result.ok(true);
    } catch (error: unknown) {
      console.error("[AdminService.deleteUser] Error:", error);
      return Result.fail(getErrorMessage(error, "Lỗi khi xóa người dùng"));
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

      // Nếu duyệt và trước đó chưa duyệt: cộng tiền ví
      if (action === "approve" && prevStatus !== "approved") {
        const credit = (Number(order.driverEarnings) || 0) + (Number(order.tip) || 0);
        if (credit > 0) {
          await User.findByIdAndUpdate(order.userId, {
            $inc: { walletBalance: credit },
          });
        }
      } else if (action === "reject" && prevStatus === "approved") {
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
      console.error("[AdminService.processBeeOrder] Error:", err);
      return Result.fail(err?.message || "Lỗi khi xử lý đơn Be");
    }
  }

  /**
   * Phê duyệt hoặc Từ chối Doanh Thu
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
      if (!income) return Result.fail("Không tìm thấy khoản thu");

      const prevStatus = income.approvalStatus;
      const newStatus = action === "approve" ? "approved" : "rejected";

      income.approvalStatus = newStatus;
      if (adminNote) income.adminNote = adminNote;
      await income.save();

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
      console.error("[AdminService.processIncome] Error:", err);
      return Result.fail(err?.message || "Lỗi khi xử lý khoản thu");
    }
  }

  /**
   * Phê duyệt hoặc Từ chối Khoản Nợ
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
      console.error("[AdminService.processDebt] Error:", err);
      return Result.fail(err?.message || "Lỗi khi xử lý khoản nợ");
    }
  }

  /**
   * Admin phản hồi và giải quyết Ticket
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
      console.error("[AdminService.replyTicket] Error:", err);
      return Result.fail(err?.message || "Lỗi khi phản hồi yêu cầu hỗ trợ");
    }
  }

  /**
   * Cập nhật Bảng Phân Quyền chức năng cho User
   */
  static async updateUserPermissions(
    adminUserId: string,
    targetUserId: string,
    permissions: Partial<IUserPermissions>
  ): Promise<Result<IUserPermissions>> {
    try {
      await connectDB();
      const authCheck = await this.verifyAdmin(adminUserId);
      if (!authCheck.isSuccess) return Result.fail(authCheck.error);

      const targetUser = await User.findById(targetUserId);
      if (!targetUser) return Result.fail("Không tìm thấy người dùng");

      const currentPerms = targetUser.permissions || { ...DEFAULT_USER_PERMISSIONS };
      const updatedPerms: IUserPermissions = {
        ...currentPerms,
        ...permissions,
      };

      targetUser.permissions = updatedPerms;
      await targetUser.save();

      invalidateDashboardCache(targetUserId);
      return Result.ok(updatedPerms);
    } catch (err: any) {
      console.error("[AdminService.updateUserPermissions] Error:", err);
      return Result.fail(err?.message || "Lỗi khi cập nhật phân quyền người dùng");
    }
  }

  /**
   * Tương thích ngược: Lấy dữ liệu quản trị User
   */
  static async getAdminUsersPageData(adminUserId: string): Promise<Result<AdminUsersPageDataDto>> {
    const res = await this.getAdminUnifiedData(adminUserId);
    if (!res.isSuccess) return Result.fail(res.error);
    return Result.ok({
      users: res.data.users,
      totalUsers: res.data.summary.totalUsers,
      activeUsers: res.data.summary.activeUsers,
      pendingOrLockedUsers: res.data.summary.pendingOrLockedUsers,
      totalAdminCount: res.data.summary.totalAdminCount,
      totalWalletBalances: res.data.summary.totalWalletBalances,
    });
  }
}
