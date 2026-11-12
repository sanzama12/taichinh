"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FuelLogSchema, type FuelLogInput } from "@/lib/validators";
import {
  FuelService,
  type FuelLogDto,
  type FuelPageDataDto,
} from "@/services/fuel.service";
import { Result } from "@/lib/utils";

async function getAuthUserId(): Promise<Result<string>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Result.fail("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");
  }
  return Result.ok(session.user.id);
}

export async function getFuelPageDataAction(
  month?: number,
  year?: number
): Promise<Result<FuelPageDataDto>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  const now = new Date();
  return await FuelService.getFuelPageData(
    auth.data,
    month || now.getMonth() + 1,
    year || now.getFullYear()
  );
}

export async function createFuelLogAction(input: FuelLogInput): Promise<Result<FuelLogDto>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  const valid = FuelLogSchema.safeParse(input);
  if (!valid.success) {
    return Result.fail(valid.error.errors[0]?.message || "Dữ liệu đổ xăng không hợp lệ");
  }

  return await FuelService.createFuelLog(auth.data, valid.data);
}

export async function deleteFuelLogAction(logId: string): Promise<Result<boolean>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  return await FuelService.deleteFuelLog(auth.data, logId);
}

