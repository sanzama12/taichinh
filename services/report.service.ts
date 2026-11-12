import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Income } from "@/models/Income";
import { Bill } from "@/models/Bill";
import { BillPayment } from "@/models/BillPayment";
import { Expense } from "@/models/Expense";
import { SavingsTransaction } from "@/models/SavingsTransaction";
import { Result } from "@/lib/utils";

export interface MonthlyReportRowDto {
  month: number;
  monthLabel: string;
  income: number;
  fixedBills: number;
  flexibleExpenses: number;
  savings: number;
  totalSpent: number;
  netRemaining: number;
  savingsRatePercent: number;
}

export interface ReportSummaryDto {
  year: number;
  totalIncome: number;
  totalFixedBills: number;
  totalFlexibleExpenses: number;
  totalSavings: number;
  totalSpent: number;
  totalNetRemaining: number;
  overallSavingsRatePercent: number;
  // Trung bình tháng
  avgIncome: number;
  avgFixedBills: number;
  avgFlexibleExpenses: number;
  avgSavings: number;
  avgNetRemaining: number;
}

export interface FinancialReportDataDto {
  year: number;
  rows: MonthlyReportRowDto[];
  summary: ReportSummaryDto;
}

/**
 * Service Layer: Báo Cáo Tài Chính Tổng Hợp Theo Tháng & Năm
 * Xuất dữ liệu kế toán và file CSV chuẩn UTF-8
 */
export class ReportService {
  static async getFinancialReportData(
    userId: string,
    year: number
  ): Promise<Result<FinancialReportDataDto>> {
    try {
      await connectDB();
      const userObjId = new mongoose.Types.ObjectId(userId);
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

      // Chạy song song truy vấn tất cả các dòng tiền trong năm
      const [allIncomes, allBills, allPayments, allExpenses, allSavingsTx] =
        await Promise.all([
          Income.find({ userId: userObjId }).lean().exec(),
          Bill.find({ userId: userObjId }).lean().exec(),
          BillPayment.find({
            userId: userObjId,
            year: year,
          })
            .lean()
            .exec(),
          Expense.find({
            userId: userObjId,
            date: { $gte: yearStart, $lte: yearEnd },
          })
            .lean()
            .exec(),
          SavingsTransaction.find({
            userId: userObjId,
            date: { $gte: yearStart, $lte: yearEnd },
            type: "deposit",
          })
            .lean()
            .exec(),
        ]);

      // Xây dựng 12 tháng
      const monthlyRows: MonthlyReportRowDto[] = [];
      let totalIncome = 0;
      let totalFixedBills = 0;
      let totalFlexibleExpenses = 0;
      let totalSavings = 0;
      let totalNetRemaining = 0;

      // Tìm các tháng đã trôi qua hoặc có dữ liệu để tính trung bình
      const currentMonth = new Date().getFullYear() === year ? new Date().getMonth() + 1 : 12;
      const monthsForAverage = Math.max(currentMonth, 1);

      for (let m = 1; m <= 12; m++) {
        const monthStart = new Date(year, m - 1, 1);
        const monthEnd = new Date(year, m, 0, 23, 59, 59, 999);

        // 1. Tính Thu Nhập tháng m
        let monthIncome = 0;
        for (const inc of allIncomes) {
          if (inc.type === "monthly") {
            monthIncome += inc.amount;
          } else if (inc.type === "oneTime" && inc.date) {
            const incDate = new Date(inc.date);
            if (incDate.getFullYear() === year && incDate.getMonth() + 1 === m) {
              monthIncome += inc.amount;
            }
          }
        }

        // 2. Tính Chi Phí Cố Định (Khoản phải trả / Hóa đơn)
        // Ưu tiên lấy số tiền đã thanh toán từ BillPayment, nếu chưa trả mà đã qua hạn thì lấy từ Bill
        let monthBills = 0;
        const paymentsThisMonth = allPayments.filter((p) => p.month === m);
        for (const p of paymentsThisMonth) {
          monthBills += p.amountPaid;
        }

        // Nếu tháng chưa có thanh toán nào nhưng có các hóa đơn active
        if (monthBills === 0 && m >= currentMonth) {
          for (const b of allBills) {
            if (b.isActive) monthBills += b.amount;
          }
        }

        // 3. Tính Chi Phí Linh Hoạt (Expenses trong tháng m)
        let monthFlexible = 0;
        for (const exp of allExpenses) {
          const expDate = new Date(exp.date);
          if (expDate.getMonth() + 1 === m) {
            monthFlexible += exp.amount;
          }
        }

        // 4. Tính Tiết Kiệm (Savings deposit trong tháng m)
        let monthSavings = 0;
        for (const tx of allSavingsTx) {
          const txDate = new Date(tx.date);
          if (txDate.getMonth() + 1 === m) {
            monthSavings += tx.amount;
          }
        }

        const totalSpent = monthBills + monthFlexible;
        const netRemaining = monthIncome - totalSpent;
        const savingsRate = monthIncome > 0 ? Math.round((monthSavings / monthIncome) * 100) : 0;

        totalIncome += monthIncome;
        totalFixedBills += monthBills;
        totalFlexibleExpenses += monthFlexible;
        totalSavings += monthSavings;
        totalNetRemaining += netRemaining;

        monthlyRows.push({
          month: m,
          monthLabel: `Tháng ${String(m).padStart(2, "0")}/${year}`,
          income: monthIncome,
          fixedBills: monthBills,
          flexibleExpenses: monthFlexible,
          savings: monthSavings,
          totalSpent,
          netRemaining,
          savingsRatePercent: savingsRate,
        });
      }

      const overallSavingsRate =
        totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0;

      const summary: ReportSummaryDto = {
        year,
        totalIncome,
        totalFixedBills,
        totalFlexibleExpenses,
        totalSavings,
        totalSpent: totalFixedBills + totalFlexibleExpenses,
        totalNetRemaining,
        overallSavingsRatePercent: overallSavingsRate,
        avgIncome: Math.round(totalIncome / monthsForAverage),
        avgFixedBills: Math.round(totalFixedBills / monthsForAverage),
        avgFlexibleExpenses: Math.round(totalFlexibleExpenses / monthsForAverage),
        avgSavings: Math.round(totalSavings / monthsForAverage),
        avgNetRemaining: Math.round(totalNetRemaining / monthsForAverage),
      };

      return Result.ok({
        year,
        rows: monthlyRows,
        summary,
      });
    } catch (error) {
      console.error("[ReportService.getFinancialReportData] Error:", error);
      return Result.fail("Không thể lập báo cáo tài chính");
    }
  }

  /**
   * Tạo nội dung CSV định dạng UTF-8 có BOM (tương thích Microsoft Excel tiếng Việt)
   */
  static generateCsvContent(report: FinancialReportDataDto): string {
    const headers = [
      "Kỳ Báo Cáo",
      "Thu Nhập (VND)",
      "Chi Cố Định (VND)",
      "Chi Linh Hoạt (VND)",
      "Tổng Chi Phí (VND)",
      "Tích Lũy (VND)",
      "Dòng Tiền Còn Lại (VND)",
      "Tỷ Lệ Tiết Kiệm (%)",
    ];

    const lines: string[] = [];
    // Thêm UTF-8 BOM để Excel hiển thị đúng dấu tiếng Việt
    lines.push(headers.join(","));

    for (const row of report.rows) {
      lines.push(
        [
          `"${row.monthLabel}"`,
          row.income,
          row.fixedBills,
          row.flexibleExpenses,
          row.totalSpent,
          row.savings,
          row.netRemaining,
          `"${row.savingsRatePercent}%"`,
        ].join(",")
      );
    }

    // Dòng Tổng Cộng Cả Năm
    lines.push(
      [
        `"TỔNG CỘNG NĂM ${report.year}"`,
        report.summary.totalIncome,
        report.summary.totalFixedBills,
        report.summary.totalFlexibleExpenses,
        report.summary.totalSpent,
        report.summary.totalSavings,
        report.summary.totalNetRemaining,
        `"${report.summary.overallSavingsRatePercent}%"`,
      ].join(",")
    );

    // Dòng Trung Bình Tháng
    lines.push(
      [
        `"TRUNG BÌNH THÁNG"`,
        report.summary.avgIncome,
        report.summary.avgFixedBills,
        report.summary.avgFlexibleExpenses,
        report.summary.avgFixedBills + report.summary.avgFlexibleExpenses,
        report.summary.avgSavings,
        report.summary.avgNetRemaining,
        `"${report.summary.overallSavingsRatePercent}%"`,
      ].join(",")
    );

    return "\uFEFF" + lines.join("\r\n");
  }
}

