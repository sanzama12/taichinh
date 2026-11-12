"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  DebtSchema,
  DebtPaymentSchema,
  type DebtInput,
  type DebtPaymentInput,
} from "@/lib/validators";
import {
  DebtService,
  type DebtDto,
  type DebtPageDataDto,
} from "@/services/debt.service";
import { Result } from "@/lib/utils";

async function getAuthUserId(): Promise<Result<string>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Result.fail("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");
  }
  return Result.ok(session.user.id);
}

export async function getDebtPageDataAction(): Promise<Result<DebtPageDataDto>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  return await DebtService.getDebtPageData(auth.data);
}

export async function createDebtAction(input: DebtInput): Promise<Result<DebtDto>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  const valid = DebtSchema.safeParse(input);
  if (!valid.success) {
    return Result.fail(valid.error.errors[0]?.message || "Dữ liệu khoản nợ không hợp lệ");
  }

  return await DebtService.createDebt(auth.data, valid.data);
}

export async function recordDebtPaymentAction(input: DebtPaymentInput): Promise<Result<DebtDto>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  const valid = DebtPaymentSchema.safeParse(input);
  if (!valid.success) {
    return Result.fail(valid.error.errors[0]?.message || "Dữ liệu trả nợ không hợp lệ");
  }

  return await DebtService.recordDebtPayment(auth.data, valid.data);
}

export async function deleteDebtAction(debtId: string): Promise<Result<boolean>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  return await DebtService.deleteDebt(auth.data, debtId);
}

