"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BeeOrderSchema, type BeeOrderInput } from "@/lib/validators";
import {
  BeeService,
  type BeeOrderDto,
  type BeePageDataDto,
  type HeaderRevenueDto,
} from "@/services/bee.service";
import { Result } from "@/lib/utils";

async function getAuthUserId(): Promise<Result<string>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Result.fail("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");
  }
  return Result.ok(session.user.id);
}

export async function getBeePageDataAction(
  month?: number,
  year?: number
): Promise<Result<BeePageDataDto>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  const now = new Date();
  return await BeeService.getBeePageData(
    auth.data,
    month || now.getMonth() + 1,
    year || now.getFullYear()
  );
}

export async function createBeeOrderAction(input: BeeOrderInput): Promise<Result<BeeOrderDto>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  const valid = BeeOrderSchema.safeParse(input);
  if (!valid.success) {
    return Result.fail(valid.error.errors[0]?.message || "Dữ liệu đơn Be không hợp lệ");
  }

  return await BeeService.createBeeOrder(auth.data, valid.data);
}

export async function deleteBeeOrderAction(orderId: string): Promise<Result<boolean>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  return await BeeService.deleteBeeOrder(auth.data, orderId);
}

export async function getHeaderRevenueAction(): Promise<Result<HeaderRevenueDto>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  return await BeeService.getHeaderRevenue(auth.data);
}

