"use client";

import * as React from "react";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { PowerBiReportsLogo } from "@/components/icons/BrandLogos";
import { getFinancialReportAction, exportFinancialReportCsvAction } from "@/actions/reports";
import { type FinancialReportDataDto } from "@/services/report.service";
import { ReportSummaryCards } from "@/components/reports/ReportSummaryCards";
import { MonthlyReportTable } from "@/components/reports/MonthlyReportTable";

export default function ReportsPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = React.useState(now.getFullYear());
  const [reportData, setReportData] = React.useState<FinancialReportDataDto | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);

  const loadData = React.useCallback(async (year: number) => {
    try {
      setIsLoading(true);
      const res = await getFinancialReportAction(year);
      if (res.isSuccess) {
        setReportData(res.data);
      } else {
        console.error(res.error);
      }
    } catch (err) {
      console.error("Lỗi khi tải báo cáo tài chính:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData(selectedYear);
  }, [selectedYear, loadData]);

  const handlePrevYear = () => {
    setSelectedYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setSelectedYear((prev) => prev + 1);
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const res = await exportFinancialReportCsvAction(selectedYear);
      if (!res.isSuccess) {
        alert(res.error);
        return;
      }

      // Tạo Blob và tải file về máy client
      const blob = new Blob([res.data.csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", res.data.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Lỗi khi xuất CSV:", err);
      alert("Đã xảy ra lỗi khi tạo tệp CSV");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-3.5">
          <PowerBiReportsLogo size={42} variant="square" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Báo Cáo Tài Chính Tổng Hợp (PowerBI Analytics)
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#F59E0B]/20 text-amber-400 border border-[#F59E0B]/40">
                POWER BI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-mono">
              Bảng cân đối thu chi, phân tích dòng tiền niên độ theo 12 tháng & xuất tệp CSV kế toán.
            </p>
          </div>
        </div>

        {/* Nút xuất CSV & Tải lại */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(selectedYear)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs font-mono text-slate-200 hover:bg-white/[0.1] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Đồng bộ</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={isExporting || isLoading || !reportData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-mono font-bold text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? "Đang xuất CSV..." : "Xuất file CSV"}</span>
          </button>
        </div>
      </div>

      {/* 2. Thanh Điều Khiển Năm (Year Control Bar) */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#090e17]/80 border border-white/[0.08] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevYear}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-50"
            title="Năm trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#030712] border border-white/[0.1]">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-sm font-bold text-white tracking-wide">
              NIÊN ĐỘ TÀI CHÍNH: {selectedYear}
            </span>
          </div>

          <button
            onClick={handleNextYear}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-50"
            title="Năm sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {selectedYear !== now.getFullYear() && (
          <button
            onClick={() => setSelectedYear(now.getFullYear())}
            className="text-xs font-mono text-blue-400 hover:text-blue-300 underline underline-offset-4"
          >
            Về năm hiện tại ({now.getFullYear()})
          </button>
        )}
      </div>

      {/* 3. Skeleton Loading hoặc Báo Cáo */}
      {isLoading && !reportData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#090e17] border border-white/[0.08] h-32 animate-pulse"
              />
            ))}
          </div>
          <div className="p-6 rounded-2xl bg-[#090e17] border border-white/[0.08] h-96 animate-pulse" />
        </div>
      ) : reportData ? (
        <>
          {/* Thẻ Số Liệu Tổng Hợp Năm */}
          <ReportSummaryCards summary={reportData.summary} />

          {/* Bảng Kế Toán 12 Tháng */}
          <MonthlyReportTable rows={reportData.rows} summary={reportData.summary} />
        </>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[#090e17] border border-white/[0.08]">
          <p className="text-slate-400 font-mono text-sm">
            Không thể tải dữ liệu báo cáo tài chính cho năm {selectedYear}.
          </p>
        </div>
      )}
    </div>
  );
}

