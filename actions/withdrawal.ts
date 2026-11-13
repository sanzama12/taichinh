"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { WithdrawalSchema, type WithdrawalInput } from "@/lib/validators";
import {
  WithdrawalService,
  type WithdrawalDto,
  type WithdrawalPageDataDto,
} from "@/services/withdrawal.service";
import { Result } from "@/lib/utils";
import { revalidatePath } from "next/cache";

async function getAuthUserId(): Promise<Result<string>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Result.fail("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");
  }
  return Result.ok(session.user.id);
}

export async function getUserWithdrawalsAction(): Promise<Result<WithdrawalPageDataDto>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  return await WithdrawalService.getUserWithdrawals(auth.data);
}

export async function createWithdrawalAction(
  input: WithdrawalInput
): Promise<Result<WithdrawalDto>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  const valid = WithdrawalSchema.safeParse(input);
  if (!valid.success) {
    return Result.fail(valid.error.errors[0]?.message || "Thông tin rút tiền không hợp lệ");
  }

  const result = await WithdrawalService.createWithdrawal(auth.data, valid.data);
  if (result.isSuccess) {
    revalidatePath("/services/bee");
    revalidatePath("/income");
    revalidatePath("/dashboard");
  }
  return result;
}

