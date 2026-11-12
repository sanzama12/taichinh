import { NextRequest, NextResponse } from "next/server";
import { differenceInCalendarDays, format } from "date-fns";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Bill } from "@/models/Bill";
import { BillPayment } from "@/models/BillPayment";
import { Income } from "@/models/Income";
import { calculateActualDueDate, formatCurrencyVND } from "@/lib/utils";
import { sendEmail, buildReminderEmailHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Kiểm tra xác thực CRON_SECRET
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");
    const queryKey = req.nextUrl.searchParams.get("key");

    if (cronSecret) {
      const isBearerValid = authHeader === `Bearer ${cronSecret}`;
      const isQueryValid = queryKey === cronSecret;

      if (!isBearerValid && !isQueryValid) {
        return NextResponse.json({ error: "Unauthorized: Invalid CRON_SECRET" }, { status: 401 });
      }
    }

    await connectDB();

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // 2. Tìm tất cả người dùng đã bật tính năng gửi email nhắc nhở
    const usersWithReminder = await User.find({
      "settings.emailReminder": true,
      email: { $exists: true, $ne: "" },
    }).lean().exec();

    let emailsSentCount = 0;
    const logs: string[] = [];

    for (const user of usersWithReminder) {
      const remindDays = user.settings?.remindDaysBefore ?? 3;
      const userObjId = user._id;

      // Lấy toàn bộ hóa đơn active và các khoản đã thanh toán trong tháng
      const [activeBills, paidRecords, activeIncomes] = await Promise.all([
        Bill.find({ userId: userObjId, isActive: true }).lean().exec(),
        BillPayment.find({ userId: userObjId, month: currentMonth, year: currentYear }).lean().exec(),
        Income.find({ userId: userObjId }).lean().exec(),
      ]);

      const paidBillIds = new Set(paidRecords.map((p) => p.billId.toString()));

      // Tìm các hóa đơn chưa trả sắp đến hạn trong vòng remindDays ngày hoặc đã quá hạn
      const urgentBillsList: Array<{
        name: string;
        amountStr: string;
        dueDateStr: string;
        daysRemaining: number;
      }> = [];

      for (const b of activeBills) {
        if (paidBillIds.has(b._id.toString())) continue; // Đã trả

        const actualDueDate = calculateActualDueDate(b.dueDay, currentMonth, currentYear);
        const daysRemaining = differenceInCalendarDays(actualDueDate, today);

        // Chỉ gửi nếu đến hạn trong vòng remindDays hoặc quá hạn
        if (daysRemaining <= remindDays) {
          urgentBillsList.push({
            name: b.name,
            amountStr: formatCurrencyVND(b.amount),
            dueDateStr: format(actualDueDate, "dd/MM/yyyy"),
            daysRemaining,
          });
        }
      }

      if (!user.email || urgentBillsList.length === 0) {
        continue; // Không có email hoặc không có nghĩa vụ nào cần gửi
      }

      // Tìm kỳ nhận lương / thu nhập sắp tới
      let nextPaydayInfo: {
        name: string;
        amountStr: string;
        dateStr: string;
        daysRemaining: number;
      } | null = null;

      let minPaydayDays = 999;
      for (const inc of activeIncomes) {
        let paydayDate: Date | null = null;
        if (inc.type === "monthly" && inc.dayOfMonth) {
          paydayDate = calculateActualDueDate(inc.dayOfMonth, currentMonth, currentYear);
          if (paydayDate < today) {
            // Đã qua trong tháng này, tính tháng sau
            const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
            const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
            paydayDate = calculateActualDueDate(inc.dayOfMonth, nextMonth, nextYear);
          }
        } else if (inc.type === "oneTime" && inc.date) {
          const dt = new Date(inc.date);
          if (dt >= today) paydayDate = dt;
        }

        if (paydayDate) {
          const diff = differenceInCalendarDays(paydayDate, today);
          if (diff >= 0 && diff < minPaydayDays) {
            minPaydayDays = diff;
            nextPaydayInfo = {
              name: inc.name,
              amountStr: formatCurrencyVND(inc.amount),
              dateStr: format(paydayDate, "dd/MM/yyyy"),
              daysRemaining: diff,
            };
          }
        }
      }

      // Xây dựng template email
      const htmlContent = buildReminderEmailHtml({
        userName: user.name || "Quý khách",
        upcomingBills: urgentBillsList,
        nextPayday: nextPaydayInfo,
      });

      const emailSubject = `[Tài Chính Doanh Nghiệp] Cảnh Báo: ${urgentBillsList.length} khoản nghĩa vụ tài chính cần thanh toán`;

      const result = await sendEmail({
        to: user.email,
        subject: emailSubject,
        html: htmlContent,
      });

      if (result.success) {
        emailsSentCount++;
        logs.push(`Đã gửi email nhắc hạn thành công tới ${user.email} (${urgentBillsList.length} khoản)`);
      } else {
        logs.push(`Thất bại khi gửi tới ${user.email}: ${result.error}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processedUsersCount: usersWithReminder.length,
      emailsSentCount,
      logs,
    });
  } catch (error) {
    console.error("[Cron Reminders Error]:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi nội bộ khi thực hiện cron job" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
