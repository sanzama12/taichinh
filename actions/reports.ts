"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ReportService, type FinancialReportDataDto } from "@/services/report.service";
import { Result } from "@/lib/utils";

/**
 * Controller Layer: Báo Cáo Tài Chính Tổng Hợp
 * Skinny Controllers (<25 dòng)
 */

export async function getFinancialReportAction(year: number): Promise<Result<FinancialReportDataDto>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");

  const targetYear = year || new Date().getFullYear();
  return await ReportService.getFinancialReportData(session.user.id, targetYear);
}

export async function exportFinancialReportCsvAction(year: number): Promise<Result<{ csvContent: string; filename: string }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");

  const targetYear = year || new Date().getFullYear();
  const res = await ReportService.getFinancialReportData(session.user.id, targetYear);
  if (!res.isSuccess) return Result.fail(res.error);

  const csv = ReportService.generateCsvContent(res.data);
  const filename = `Bao_Cao_Tai_Chinh_Nam_${targetYear}.csv`;

  return Result.ok({ csvContent: csv, filename });
}

