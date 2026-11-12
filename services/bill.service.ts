import { differenceInCalendarDays } from "date-fns";
import { connectDB } from "@/lib/db";
import { Bill } from "@/models/Bill";
import { BillPayment } from "@/models/BillPayment";
import { type BillInput } from "@/lib/validators";
import { Result, calculateActualDueDate } from "@/lib/utils";

export type BillUrgencyStatus = "OVERDUE" | "DUE_VERY_SOON" | "DUE_SOON" | "UPCOMING" | "PAID";

export interface BillItemDto {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  note?: string;
  isActive: boolean;
  actualDueDate: string;   // ISO string của ngày đến hạn thực tế trong tháng
  daysRemaining: number;   // Số ngày còn lại (âm nếu quá hạn)
  isPaid: boolean;         // Đã trả trong tháng này chưa
  paidAt?: string;         // Thời điểm thanh toán
  amountPaid?: number;     // Số tiền đã thanh toán
  status: BillUrgencyStatus;
  statusLabel: string;     // Nhãn tiếng Việt
  statusColor: "red" | "yellow" | "green";
}

export interface BillSummaryDto {
  totalBillsCount: number;
  totalBillsAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  urgentCount: number;     // Số khoản quá hạn hoặc ≤ 3 ngày
  warningCount: number;    // Số khoản ≤ 7 ngày
}

export interface BillsPageDataDto {
  bills: BillItemDto[];
  summary: BillSummaryDto;
}

/**
 * Service Layer: Xử lý toàn bộ nghiệp vụ Khoản phải trả (Bill) & Lịch sử thanh toán
 * Tối ưu hóa hiệu năng cao độ: Parallel Lean Queries & Single-Pass Accumulation
 */
export class BillService {
  /**
   * Tải toàn bộ dữ liệu trang Hóa đơn (Danh sách + Tổng kết) trong 1 lượt gọi siêu tốc
   */
  static async getBillsPageData(
    userId: string,
    month: number,
    year: number,
    statusFilter: "all" | "unpaid" | "paid" = "all"
  ): Promise<Result<BillsPageDataDto>> {
    await connectDB();

    // Chạy song song 2 câu truy vấn cực nhanh với .lean() và projection
    const [bills, payments] = await Promise.all([
      Bill.find({ userId, isActive: true })
        .select("_id name amount dueDay category note isActive")
        .lean(),
      BillPayment.find({ userId, month, year })
        .select("billId paidAt amountPaid")
        .lean(),
    ]);

    const paymentMap = new Map<string, { paidAt: Date; amountPaid: number }>();
    for (const p of payments) {
      paymentMap.set(p.billId.toString(), {
        paidAt: p.paidAt,
        amountPaid: p.amountPaid,
      });
    }

    const today = new Date();
    const resultItems: BillItemDto[] = [];

    let totalBillsAmount = 0;
    let paidAmount = 0;
    let urgentCount = 0;
    let warningCount = 0;

    for (let i = 0; i < bills.length; i++) {
      const b = bills[i];
      const billIdStr = b._id.toString();
      const payment = paymentMap.get(billIdStr);
      const isPaid = !!payment;

      const actualDueDate = calculateActualDueDate(b.dueDay, month, year);
      const daysRemaining = differenceInCalendarDays(actualDueDate, today);

      let status: BillUrgencyStatus = "UPCOMING";
      let statusLabel = "";
      let statusColor: "red" | "yellow" | "green" = "green";

      // Tính tổng tiền nghĩa vụ cho cả tháng
      totalBillsAmount += b.amount;

      if (isPaid) {
        status = "PAID";
        statusLabel = "Đã thanh toán";
        statusColor = "green";
        paidAmount += b.amount;
      } else {
        if (daysRemaining < 0) {
          status = "OVERDUE";
          statusLabel = `Quá hạn ${Math.abs(daysRemaining)} ngày`;
          statusColor = "red";
          urgentCount++;
        } else if (daysRemaining === 0) {
          status = "DUE_VERY_SOON";
          statusLabel = "Hạn chót hôm nay";
          statusColor = "red";
          urgentCount++;
        } else if (daysRemaining <= 3) {
          status = "DUE_VERY_SOON";
          statusLabel = `Còn ${daysRemaining} ngày`;
          statusColor = "red";
          urgentCount++;
        } else if (daysRemaining <= 7) {
          status = "DUE_SOON";
          statusLabel = `Còn ${daysRemaining} ngày`;
          statusColor = "yellow";
          warningCount++;
        } else {
          status = "UPCOMING";
          statusLabel = `Còn ${daysRemaining} ngày`;
          statusColor = "green";
        }
      }

      // Kiểm tra bộ lọc
      if (statusFilter === "unpaid" && isPaid) continue;
      if (statusFilter === "paid" && !isPaid) continue;

      resultItems.push({
        id: billIdStr,
        name: b.name,
        amount: b.amount,
        dueDay: b.dueDay,
        category: b.category,
        note: b.note,
        isActive: b.isActive,
        actualDueDate: actualDueDate.toISOString(),
        daysRemaining,
        isPaid,
        paidAt: payment?.paidAt ? payment.paidAt.toISOString() : undefined,
        amountPaid: payment?.amountPaid,
        status,
        statusLabel,
        statusColor,
      });
    }

    // Sắp xếp: Chưa trả lên trước (gần hạn nhất xếp đầu), Đã trả xuống sau
    resultItems.sort((a, b) => {
      if (a.isPaid !== b.isPaid) {
        return a.isPaid ? 1 : -1;
      }
      return a.daysRemaining - b.daysRemaining;
    });

    return Result.ok({
      bills: resultItems,
      summary: {
        totalBillsCount: bills.length,
        totalBillsAmount,
        paidAmount,
        unpaidAmount: totalBillsAmount - paidAmount,
        urgentCount,
        warningCount,
      },
    });
  }

  /**
   * Tạo khoản phải trả mới
   */
  static async createBill(userId: string, dto: BillInput): Promise<Result<BillItemDto>> {
    await connectDB();

    const newBill = await Bill.create({
      userId,
      name: dto.name.trim(),
      amount: Math.round(dto.amount),
      dueDay: dto.dueDay,
      category: dto.category.trim(),
      note: dto.note?.trim(),
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    const now = new Date();
    const actualDue = calculateActualDueDate(newBill.dueDay, now.getMonth() + 1, now.getFullYear());
    const daysRemaining = differenceInCalendarDays(actualDue, now);

    return Result.ok({
      id: newBill._id.toString(),
      name: newBill.name,
      amount: newBill.amount,
      dueDay: newBill.dueDay,
      category: newBill.category,
      note: newBill.note,
      isActive: newBill.isActive,
      actualDueDate: actualDue.toISOString(),
      daysRemaining,
      isPaid: false,
      status: daysRemaining < 0 ? "OVERDUE" : daysRemaining <= 3 ? "DUE_VERY_SOON" : "UPCOMING",
      statusLabel: daysRemaining < 0 ? `Quá hạn ${Math.abs(daysRemaining)} ngày` : `Còn ${daysRemaining} ngày`,
      statusColor: daysRemaining <= 3 ? "red" : "green",
    });
  }

  /**
   * Cập nhật khoản phải trả
   */
  static async updateBill(
    userId: string,
    billId: string,
    dto: Partial<BillInput>
  ): Promise<Result<boolean>> {
    await connectDB();

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name.trim();
    if (dto.amount !== undefined) updateData.amount = Math.round(dto.amount);
    if (dto.dueDay !== undefined) updateData.dueDay = dto.dueDay;
    if (dto.category !== undefined) updateData.category = dto.category.trim();
    if (dto.note !== undefined) updateData.note = dto.note?.trim();
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const updated = await Bill.findOneAndUpdate(
      { _id: billId, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return Result.fail("Không tìm thấy khoản phải trả cần cập nhật");
    }

    return Result.ok(true);
  }

  /**
   * Xóa khoản phải trả (và lịch sử thanh toán liên quan)
   */
  static async deleteBill(userId: string, billId: string): Promise<Result<boolean>> {
    await connectDB();

    const deleted = await Bill.findOneAndDelete({ _id: billId, userId });
    if (!deleted) {
      return Result.fail("Không tìm thấy khoản phải trả để xóa");
    }

    // Xóa ngầm lịch sử thanh toán mà không làm nghẽn
    BillPayment.deleteMany({ billId, userId }).exec();

    return Result.ok(true);
  }

  /**
   * Đánh dấu "Đã trả" hoặc "Hủy đã trả" cho hóa đơn trong tháng/năm chỉ định
   */
  static async togglePaidStatus(
    userId: string,
    billId: string,
    month: number,
    year: number
  ): Promise<Result<{ isPaid: boolean }>> {
    await connectDB();

    const [bill, existingPayment] = await Promise.all([
      Bill.findOne({ _id: billId, userId }).select("amount").lean(),
      BillPayment.findOne({ userId, billId, month, year }),
    ]);

    if (!bill) {
      return Result.fail("Không tìm thấy khoản phải trả");
    }

    if (existingPayment) {
      await BillPayment.deleteOne({ _id: existingPayment._id });
      return Result.ok({ isPaid: false });
    } else {
      await BillPayment.create({
        userId,
        billId,
        month,
        year,
        paidAt: new Date(),
        amountPaid: bill.amount,
      });
      return Result.ok({ isPaid: true });
    }
  }
}
