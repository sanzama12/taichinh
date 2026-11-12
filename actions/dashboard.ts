"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardService, type DashboardDataDto } from "@/services/dashboard.service";
import { Result } from "@/lib/utils";

/**
 * Controller Layer: Nhận request và tổng hợp dữ liệu Bảng Điều Khiển
 * Tuân thủ mô hình MVC + Service Layer
 */
export async function getDashboardDataAction(
  month?: number,
  year?: number
): Promise<Result<DashboardDataDto>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Result.fail("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");
  }

  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  return await DashboardService.getDashboardData(session.user.id, targetMonth, targetYear);
}

