"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BonusLogSchema, type BonusLogInput } from "@/lib/validators";
import {
  BonusService,
  type BonusLogDto,
  type BonusPageDataDto,
} from "@/services/bonus.service";
import { Result } from "@/lib/utils";

async function getAuthUserId(): Promise<Result<string>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Result.fail("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");
  }
  return Result.ok(session.user.id);
}

export async function getBonusPageDataAction(
  month?: number,
  year?: number
): Promise<Result<BonusPageDataDto>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  const now = new Date();
  return await BonusService.getBonusPageData(
    auth.data,
    month || now.getMonth() + 1,
    year || now.getFullYear()
  );
}

export async function createBonusLogAction(input: BonusLogInput): Promise<Result<BonusLogDto>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  const valid = BonusLogSchema.safeParse(input);
  if (!valid.success) {
    return Result.fail(valid.error.errors[0]?.message || "Dữ liệu tiền thưởng không hợp lệ");
  }

  return await BonusService.createBonusLog(auth.data, valid.data);
}

export async function updateBonusStatusAction(
  bonusId: string,
  status: "received" | "pending"
): Promise<Result<BonusLogDto>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  return await BonusService.updateBonusStatus(auth.data, bonusId, status);
}

export async function deleteBonusLogAction(bonusId: string): Promise<Result<boolean>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  return await BonusService.deleteBonusLog(auth.data, bonusId);
}

