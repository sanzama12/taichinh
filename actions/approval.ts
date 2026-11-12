"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Result } from "@/lib/utils";
import {
  AdminApprovalService,
  type ApprovalCenterDataDto,
} from "@/services/admin-approval.service";

async function getAdminAuth(): Promise<Result<string>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Result.fail("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");
  }
  if (session.user.role !== "admin") {
    return Result.fail("Chỉ Quản trị viên (Admin) mới có quyền xét duyệt");
  }
  return Result.ok(session.user.id);
}

export async function getApprovalCenterDataAction(): Promise<Result<ApprovalCenterDataDto>> {
  const auth = await getAdminAuth();
  if (!auth.isSuccess) return auth;

  return await AdminApprovalService.getApprovalCenterData(auth.data);
}

export async function processBeeOrderApprovalAction(
  orderId: string,
  action: "approve" | "reject",
  adminNote?: string
): Promise<Result<boolean>> {
  const auth = await getAdminAuth();
  if (!auth.isSuccess) return auth;

  return await AdminApprovalService.processBeeOrder(auth.data, orderId, action, adminNote);
}

export async function processIncomeApprovalAction(
  incomeId: string,
  action: "approve" | "reject",
  adminNote?: string
): Promise<Result<boolean>> {
  const auth = await getAdminAuth();
  if (!auth.isSuccess) return auth;

  return await AdminApprovalService.processIncome(auth.data, incomeId, action, adminNote);
}

export async function processDebtApprovalAction(
  debtId: string,
  action: "approve" | "reject",
  adminNote?: string
): Promise<Result<boolean>> {
  const auth = await getAdminAuth();
  if (!auth.isSuccess) return auth;

  return await AdminApprovalService.processDebt(auth.data, debtId, action, adminNote);
}

export async function replyTicketAction(
  ticketId: string,
  reply: string,
  status: "in_progress" | "resolved" | "closed"
): Promise<Result<boolean>> {
  const auth = await getAdminAuth();
  if (!auth.isSuccess) return auth;

  return await AdminApprovalService.replyTicket(auth.data, ticketId, reply, status);
}

