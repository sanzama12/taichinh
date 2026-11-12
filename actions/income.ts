"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { IncomeSchema, type IncomeInput } from "@/lib/validators";
import {
  IncomeService,
  type IncomeDto,
  type IncomePageDataDto,
} from "@/services/income.service";
import { Result } from "@/lib/utils";

/**
 * Helper lấy userId từ session
 */
async function getAuthenticatedUserId(): Promise<Result<string>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Result.fail("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");
  }
  return Result.ok(session.user.id);
}

/**
 * Controller: Tải toàn bộ dữ liệu trang Thu Nhập trong 1 lượt gọi siêu tốc (Single Network Round-Trip)
 */
export async function getIncomePageDataAction(
  month?: number,
  year?: number
): Promise<Result<IncomePageDataDto>> {
  const authRes = await getAuthenticatedUserId();
  if (!authRes.isSuccess) return authRes;

  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  return await IncomeService.getIncomePageData(authRes.data, targetMonth, targetYear);
}

/**
 * Controller: Thêm nguồn thu nhập mới
 */
export async function createIncomeAction(input: IncomeInput): Promise<Result<IncomeDto>> {
  const authRes = await getAuthenticatedUserId();
  if (!authRes.isSuccess) return authRes;

  const validation = IncomeSchema.safeParse(input);
  if (!validation.success) {
    return Result.fail(validation.error.errors[0]?.message || "Dữ liệu không hợp lệ");
  }

  return await IncomeService.createIncome(authRes.data, validation.data);
}

/**
 * Controller: Cập nhật nguồn thu nhập
 */
export async function updateIncomeAction(
  incomeId: string,
  input: Partial<IncomeInput>
): Promise<Result<IncomeDto>> {
  const authRes = await getAuthenticatedUserId();
  if (!authRes.isSuccess) return authRes;

  return await IncomeService.updateIncome(authRes.data, incomeId, input);
}

/**
 * Controller: Xóa nguồn thu nhập
 */
export async function deleteIncomeAction(incomeId: string): Promise<Result<boolean>> {
  const authRes = await getAuthenticatedUserId();
  if (!authRes.isSuccess) return authRes;

  return await IncomeService.deleteIncome(authRes.data, incomeId);
}
