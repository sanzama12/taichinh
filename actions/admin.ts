"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Result } from "@/lib/utils";
import {
  AdminService,
  type AdminUnifiedDataDto,
  type AdminUsersPageDataDto,
} from "@/services/admin.service";
import type { IUserPermissions } from "@/types/permissions";
import {
  AdminCreateUserSchema,
  AdminUpdateUserSchema,
} from "@/lib/validators";

async function getAdminAuth(): Promise<Result<string>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Result.fail("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");
  }
  if (session.user.role !== "admin") {
    return Result.fail("Chỉ Quản trị viên tối cao (Admin) mới có quyền truy cập");
  }
  return Result.ok(session.user.id);
}

/**
 * Lấy toàn bộ dữ liệu điều hành gộp chung của Admin (Users, Orders, Incomes, Debts, Tickets)
 */
export async function getAdminUnifiedDataAction(): Promise<Result<AdminUnifiedDataDto>> {
  const auth = await getAdminAuth();
  if (!auth.isSuccess) return auth;

  return await AdminService.getAdminUnifiedData(auth.data);
}

/**
 * Khóa hoặc mở khóa tài khoản người dùng
 */
export async function toggleUserApprovalAction(
  targetUserId: string,
  shouldActivate: boolean
): Promise<Result<boolean>> {
  const auth = await getAdminAuth();
  if (!auth.isSuccess) return auth;

  return await AdminService.toggleUserApproval(auth.data, targetUserId, shouldActivate);
}

/**
 * Đổi quyền hạn thành viên Admin <-> User
 */
export async function changeUserRoleAction(
  targetUserId: string,
  newRole: "admin" | "user"
): Promise<Result<boolean>> {
  const auth = await getAdminAuth();
  if (!auth.isSuccess) return auth;

  return await AdminService.changeUserRole(auth.data, targetUserId, newRole);
}

/**
 * Tạo tài khoản người dùng mới kèm mã khóa truy cập
 */
export async function createUserWithKeyAction(input: unknown): Promise<Result<boolean>> {
  const auth = await getAdminAuth();
  if (!auth.isSuccess) return auth;

  const validation = AdminCreateUserSchema.safeParse(input);
  if (!validation.success) {
    return Result.fail(validation.error.errors[0]?.message ?? "Dữ liệu thành viên không hợp lệ");
  }

  return await AdminService.createUserWithKey(auth.data, validation.data);
}

export async function updateAdminUserAction(
  targetUserId: string,
  input: unknown
): Promise<Result<boolean>> {
  const auth = await getAdminAuth();
  if (!auth.isSuccess) return auth;

  const validation = AdminUpdateUserSchema.safeParse(input);
  if (!validation.success) {
    return Result.fail(validation.error.errors[0]?.message ?? "Dữ liệu cập nhật không hợp lệ");
  }

  return await AdminService.updateUser(auth.data, targetUserId, validation.data);
}

export async function deleteAdminUserAction(targetUserId: string): Promise<Result<boolean>> {
  const auth = await getAdminAuth();
  if (!auth.isSuccess) return auth;

  return await AdminService.deleteUser(auth.data, targetUserId);
}

/**
 * Cập nhật Bảng Phân Quyền chức năng cho User
 */
export async function updateUserPermissionsAction(
  targetUserId: string,
  permissions: Partial<IUserPermissions>
): Promise<Result<IUserPermissions>> {
  const auth = await getAdminAuth();
  if (!auth.isSuccess) return auth;

  return await AdminService.updateUserPermissions(auth.data, targetUserId, permissions);
}

/**
 * Duyệt hoặc từ chối đơn cuốc xe Be / Khách hàng
 */
export async function processBeeOrderApprovalAction(
  orderId: string,
  action: "approve" | "reject",
  adminNote?: string
): Promise<Result<boolean>> {
  const auth = await getAdminAuth();
  if (!auth.isSuccess) return auth;

  return await AdminService.processBeeOrder(auth.data, orderId, action, adminNote);
}

/**
 * Duyệt hoặc từ chối doanh thu
 */
export async function processIncomeApprovalAction(
  incomeId: string,
  action: "approve" | "reject",
  adminNote?: string
): Promise<Result<boolean>> {
  const auth = await getAdminAuth();
  if (!auth.isSuccess) return auth;

  return await AdminService.processIncome(auth.data, incomeId, action, adminNote);
}

/**
 * Duyệt hoặc từ chối khoản nợ
 */
export async function processDebtApprovalAction(
  debtId: string,
  action: "approve" | "reject",
  adminNote?: string
): Promise<Result<boolean>> {
  const auth = await getAdminAuth();
  if (!auth.isSuccess) return auth;

  return await AdminService.processDebt(auth.data, debtId, action, adminNote);
}

/**
 * Phản hồi & cập nhật trạng thái Ticket hỗ trợ
 */
export async function replyTicketAction(
  ticketId: string,
  reply: string,
  status: "in_progress" | "resolved" | "closed"
): Promise<Result<boolean>> {
  const auth = await getAdminAuth();
  if (!auth.isSuccess) return auth;

  return await AdminService.replyTicket(auth.data, ticketId, reply, status);
}

/**
 * Tương thích ngược: lấy trang users
 */
export async function getAdminUsersPageDataAction(): Promise<Result<AdminUsersPageDataDto>> {
  const auth = await getAdminAuth();
  if (!auth.isSuccess) return auth;

  return await AdminService.getAdminUsersPageData(auth.data);
}
