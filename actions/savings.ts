"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SavingsService, type SavingsPageDataDto, type SavingsGoalItemDto } from "@/services/savings.service";
import {
  SavingsGoalSchema,
  SavingsTransactionSchema,
  type SavingsGoalInput,
  type SavingsTransactionInput,
} from "@/lib/validators";
import { Result } from "@/lib/utils";

/**
 * Controller Layer: Quản lý Tiết Kiệm & Quỹ Khẩn Cấp
 * Skinny Controllers (<25 dòng)
 */

export async function getSavingsPageDataAction(): Promise<Result<SavingsPageDataDto>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");

  return await SavingsService.getSavingsPageData(session.user.id);
}

export async function createSavingsGoalAction(input: SavingsGoalInput): Promise<Result<SavingsGoalItemDto>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Phiên đăng nhập đã kết thúc");

  const parsed = SavingsGoalSchema.safeParse(input);
  if (!parsed.success) return Result.fail(parsed.error.errors[0]?.message || "Dữ liệu mục tiêu không hợp lệ");

  return await SavingsService.createSavingsGoal(session.user.id, parsed.data);
}

export async function updateSavingsGoalAction(goalId: string, input: SavingsGoalInput): Promise<Result<boolean>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Phiên đăng nhập đã kết thúc");

  const parsed = SavingsGoalSchema.safeParse(input);
  if (!parsed.success) return Result.fail(parsed.error.errors[0]?.message || "Dữ liệu mục tiêu không hợp lệ");

  return await SavingsService.updateSavingsGoal(session.user.id, goalId, parsed.data);
}

export async function deleteSavingsGoalAction(goalId: string): Promise<Result<boolean>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Phiên đăng nhập đã kết thúc");

  return await SavingsService.deleteSavingsGoal(session.user.id, goalId);
}

export async function recordSavingsTransactionAction(input: SavingsTransactionInput): Promise<Result<boolean>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Phiên đăng nhập đã kết thúc");

  const parsed = SavingsTransactionSchema.safeParse(input);
  if (!parsed.success) return Result.fail(parsed.error.errors[0]?.message || "Dữ liệu giao dịch không hợp lệ");

  return await SavingsService.recordTransaction(session.user.id, parsed.data);
}

export async function initEmergencyFundAction(): Promise<Result<boolean>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Phiên đăng nhập đã kết thúc");

  return await SavingsService.initEmergencyFund(session.user.id);
}

