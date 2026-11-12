"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BillSchema, type BillInput } from "@/lib/validators";
import {
  BillService,
  type BillItemDto,
  type BillsPageDataDto,
} from "@/services/bill.service";
import { Result } from "@/lib/utils";

/**
 * Helper kiểm tra phiên đăng nhập và lấy userId
 */
async function getAuthenticatedUserId(): Promise<Result<string>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Result.fail("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");
  }
  return Result.ok(session.user.id);
}

/**
 * Controller: Tải toàn bộ dữ liệu trang Hóa đơn trong 1 lượt gọi siêu tốc (Single Network Round-Trip)
 */
export async function getBillsPageDataAction(
  month?: number,
  year?: number,
  statusFilter: "all" | "unpaid" | "paid" = "all"
): Promise<Result<BillsPageDataDto>> {
  const authRes = await getAuthenticatedUserId();
  if (!authRes.isSuccess) return authRes;

  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  return await BillService.getBillsPageData(authRes.data, targetMonth, targetYear, statusFilter);
}

/**
 * Controller: Tạo khoản phải trả mới
 */
export async function createBillAction(input: BillInput): Promise<Result<BillItemDto>> {
  const authRes = await getAuthenticatedUserId();
  if (!authRes.isSuccess) return authRes;

  const validation = BillSchema.safeParse(input);
  if (!validation.success) {
    return Result.fail(validation.error.errors[0]?.message || "Dữ liệu khoản phải trả không hợp lệ");
  }

  return await BillService.createBill(authRes.data, validation.data);
}

/**
 * Controller: Cập nhật khoản phải trả
 */
export async function updateBillAction(
  billId: string,
  input: Partial<BillInput>
): Promise<Result<boolean>> {
  const authRes = await getAuthenticatedUserId();
  if (!authRes.isSuccess) return authRes;

  return await BillService.updateBill(authRes.data, billId, input);
}

/**
 * Controller: Xóa khoản phải trả
 */
export async function deleteBillAction(billId: string): Promise<Result<boolean>> {
  const authRes = await getAuthenticatedUserId();
  if (!authRes.isSuccess) return authRes;

  return await BillService.deleteBill(authRes.data, billId);
}

/**
 * Controller: Đánh dấu đã trả / Hủy đã trả cho hóa đơn trong tháng
 */
export async function toggleBillPaidAction(
  billId: string,
  month: number,
  year: number
): Promise<Result<{ isPaid: boolean }>> {
  const authRes = await getAuthenticatedUserId();
  if (!authRes.isSuccess) return authRes;

  return await BillService.togglePaidStatus(authRes.data, billId, month, year);
}

/**
 * Controller: Lấy danh sách các khoản cần chú ý cho chuông thông báo Header
 */
export async function getNotificationItemsAction(): Promise<
  Result<{
    attentionCount: number;
    items: Array<{ id: string; name: string; amount: number; daysRemaining: number; color: "red" | "yellow" | "green"; statusLabel: string }>;
  }>
> {
  const authRes = await getAuthenticatedUserId();
  if (!authRes.isSuccess) return authRes;

  const now = new Date();
  const res = await BillService.getBillsPageData(authRes.data, now.getMonth() + 1, now.getFullYear(), "unpaid");
  if (!res.isSuccess) return Result.fail(res.error);

  const attentionItems = res.data.bills
    .filter((b) => !b.isPaid && (b.statusColor === "red" || b.statusColor === "yellow"))
    .map((b) => ({
      id: b.id,
      name: b.name,
      amount: b.amount,
      daysRemaining: b.daysRemaining,
      color: b.statusColor,
      statusLabel: b.statusLabel,
    }));

  return Result.ok({
    attentionCount: attentionItems.length,
    items: attentionItems,
  });
}

