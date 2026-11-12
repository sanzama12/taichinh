"use client";

import { FileSpreadsheet } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { type MonthlyReportRowDto, type ReportSummaryDto } from "@/services/report.service";

interface MonthlyReportTableProps {
  rows: MonthlyReportRowDto[];
  summary: ReportSummaryDto;
}

export function MonthlyReportTable({ rows, summary }: MonthlyReportTableProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-white/[0.06]">
        <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider font-mono">
          BẢNG TỔNG HỢP DÒNG TIỀN THEO 12 THÁNG (NĂM {summary.year})
        </h3>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 uppercase text-[11px] bg-slate-50 dark:bg-white/[0.02]">
              <th className="py-3 px-3 font-bold">Kỳ Báo Cáo</th>
              <th className="py-3 px-3 font-bold text-right text-emerald-700 dark:text-emerald-400">Thu Nhập</th>
              <th className="py-3 px-3 font-bold text-right text-amber-700 dark:text-amber-400">Chi Cố Định</th>
              <th className="py-3 px-3 font-bold text-right text-rose-700 dark:text-rose-400">Chi Linh Hoạt</th>
              <th className="py-3 px-3 font-bold text-right text-rose-800 dark:text-rose-300">Tổng Chi Phí</th>
              <th className="py-3 px-3 font-bold text-right text-blue-700 dark:text-blue-400">Tích Lũy</th>
              <th className="py-3 px-3 font-bold text-right text-slate-900 dark:text-white">Dòng Tiền Còn Lại</th>
              <th className="py-3 px-3 font-bold text-center">Tỷ Lệ Tích Lũy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {rows.map((row) => {
              const isNetPositive = row.netRemaining >= 0;

              return (
                <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                    {row.monthLabel}
                  </td>

                  <td className="py-3 px-3 text-right whitespace-nowrap text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                    {formatCurrencyVND(row.income)}
                  </td>

                  <td className="py-3 px-3 text-right whitespace-nowrap text-slate-700 dark:text-slate-300 tabular-nums">
                    {formatCurrencyVND(row.fixedBills)}
                  </td>

                  <td className="py-3 px-3 text-right whitespace-nowrap text-slate-700 dark:text-slate-300 tabular-nums">
                    {formatCurrencyVND(row.flexibleExpenses)}
                  </td>

                  <td className="py-3 px-3 text-right whitespace-nowrap font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                    {formatCurrencyVND(row.totalSpent)}
                  </td>

                  <td className="py-3 px-3 text-right whitespace-nowrap text-blue-600 dark:text-blue-400 tabular-nums font-semibold">
                    {formatCurrencyVND(row.savings)}
                  </td>

                  <td
                    className={`py-3 px-3 text-right whitespace-nowrap font-bold tabular-nums ${
                      isNetPositive
                        ? "text-slate-900 dark:text-white"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {formatCurrencyVND(row.netRemaining)}
                  </td>

                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.savingsRatePercent >= 20
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400"
                          : row.savingsRatePercent > 0
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400"
                          : "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-400"
                      }`}
                    >
                      {row.savingsRatePercent}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 dark:border-white/20 bg-slate-100/70 dark:bg-white/[0.03] font-bold text-slate-900 dark:text-white">
              <td className="py-3.5 px-3 uppercase text-[11px]">TỔNG CẢ NĂM</td>
              <td className="py-3.5 px-3 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{formatCurrencyVND(summary.totalIncome)}
              </td>
              <td className="py-3.5 px-3 text-right tabular-nums text-slate-800 dark:text-slate-200">
                {formatCurrencyVND(summary.totalFixedBills)}
              </td>
              <td className="py-3.5 px-3 text-right tabular-nums text-slate-800 dark:text-slate-200">
                {formatCurrencyVND(summary.totalFlexibleExpenses)}
              </td>
              <td className="py-3.5 px-3 text-right text-rose-600 dark:text-rose-400 tabular-nums">
                {formatCurrencyVND(summary.totalSpent)}
              </td>
              <td className="py-3.5 px-3 text-right text-blue-600 dark:text-blue-400 tabular-nums">
                {formatCurrencyVND(summary.totalSavings)}
              </td>
              <td className="py-3.5 px-3 text-right tabular-nums">
                {formatCurrencyVND(summary.totalNetRemaining)}
              </td>
              <td className="py-3.5 px-3 text-center">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 font-bold text-[11px]">
                  {summary.overallSavingsRatePercent}%
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
