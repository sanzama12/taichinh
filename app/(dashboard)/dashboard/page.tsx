"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bike,
  Fuel,
  Award,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Database,
  Plus,
  TrendingUp,
} from "lucide-react";
import { getDashboardDataAction } from "@/actions/dashboard";
import { type DashboardDataDto, type MetricCardData } from "@/services/dashboard.service";
import { FinFlowMetricCards } from "@/components/dashboard/FinFlowMetricCards";
import { CartoonFeatureGrid } from "@/components/dashboard/CartoonFeatureGrid";
import { FloatingAssistantPill } from "@/components/dashboard/FloatingAssistantPill";
import { FinFlowCategoryFilter } from "@/components/dashboard/FinFlowCategoryFilter";
import { FinFlowCashFlowTrend } from "@/components/dashboard/FinFlowCashFlowTrend";
import { FinFlowExpenseCategories } from "@/components/dashboard/FinFlowExpenseCategories";
import { UpcomingBillsCard } from "@/components/dashboard/UpcomingBillsCard";
import { NextPaydayCard } from "@/components/dashboard/NextPaydayCard";
import { useRealtimeSync } from "@/lib/realtime-sync";
import { BeeIconSvg } from "@/components/icons/BeeLogo";
import { PetrolimexLogo, BeBonusLogo, FeCreditLogo } from "@/components/icons/BrandLogos";

const zeroMetrics: MetricCardData = {
  monthlyIncome: 0,
  monthlyExpense: 0,
  monthlyBills: 0,
  netRemaining: 0,
  totalSavings: 0,
  savingsRatePercent: 0,
  targetSavingsRatePercent: 20,
};

export default function DashboardPage() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = React.useState(now.getFullYear());
  const [dashboardData, setDashboardData] = React.useState<DashboardDataDto | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<string>("all");

  const loadData = React.useCallback(async (month: number, year: number, isBackground = false) => {
    try {
      if (!isBackground) {
        setIsLoading(true);
      }
      // Ưu tiên tải qua REST API siêu tốc <15ms
      const res = await fetch(`/api/dashboard?month=${month}&year=${year}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      } else {
        // Dự phòng Server Action
        const actionRes = await getDashboardDataAction(month, year);
        if (actionRes.isSuccess) {
          setDashboardData(actionRes.data);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu dashboard:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadData(currentMonth, currentYear, false);
  }, [currentMonth, currentYear, loadData]);

  // Tự động lắng nghe cập nhật thời gian thực ngầm (không chớp giật skeleton UI)
  useRealtimeSync(() => {
    loadData(currentMonth, currentYear, true);
  }, 20000);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(currentMonth, currentYear, false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-6 pb-14 font-sans text-slate-800 dark:text-slate-100">
      {/* 1. Header & Title matching reference design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Trung Tâm Chỉ Huy Tài Chính
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE REALTIME (MongoDB)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Báo cáo tổng hợp doanh thu, chi phí vận hành, công nợ và dự báo dòng tiền thời gian thực.
          </p>
        </div>
      </div>

      {/* 2. THANH DASHBOARD NGANG (Horizontal Cockpit Control Bar) */}
      <div className="bg-white dark:bg-[#0c121e] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2.5">
        {/* Bộ chuyển tháng dạng thanh ngang */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10">
          <button
            onClick={handlePrevMonth}
            disabled={isLoading}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 cursor-pointer transition-all"
            title="Tháng trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 text-xs font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
            Tháng {currentMonth} / {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            disabled={isLoading}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 cursor-pointer transition-all"
            title="Tháng sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Các nút hành động nhanh ngang (Quick Actions in Horizontal Bar) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Nút 1: Đơn Be Mới với Logo Be & Màu Vàng Chủ Đạo */}
          <Link
            href="/services/bee"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-[#FFC700] hover:bg-[#FBBF24] active:scale-98 text-[#111827] border border-amber-400/80 shadow-2xs transition-all"
          >
            <BeeIconSvg size={16} variant="square" />
            <span>+ Đơn Be</span>
          </Link>

          {/* Nút 2: Đổ Xăng (Petrolimex) */}
          <Link
            href="/services/fuel"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-900 hover:bg-blue-100 dark:bg-[#004B87]/20 dark:text-blue-300 dark:hover:bg-[#004B87]/30 border border-blue-200 dark:border-[#004B87]/40 shadow-2xs transition-all"
          >
            <PetrolimexLogo size={16} variant="square" />
            <span>+ Đổ Xăng</span>
          </Link>

          {/* Nút 3: Tiền Thưởng (Be Bonus) */}
          <Link
            href="/services/bonus"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 hover:bg-amber-100 dark:bg-amber-500/20 dark:text-amber-300 dark:hover:bg-amber-500/30 border border-amber-300 dark:border-amber-500/40 shadow-2xs transition-all"
          >
            <BeBonusLogo size={16} variant="square" />
            <span>+ Tiền Thưởng</span>
          </Link>

          {/* Nút 4: Quản Lý Nợ (FE Credit) */}
          <Link
            href="/debts"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25 border border-rose-300/80 dark:border-rose-500/30 shadow-2xs transition-all"
          >
            <FeCreditLogo size={16} variant="square" />
            <span>Quản Lý Nợ</span>
          </Link>

          {/* Nút 5: Đồng Bộ Thời Gian Thực */}
          <button
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 shadow-2xs cursor-pointer transition-all"
            title="Làm mới và đồng bộ số liệu MongoDB"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
            <span>Đồng Bộ</span>
          </button>
        </div>
      </div>

      {/* 3. Category Filter Pills (✓ All Categories | Housing & Dining | Transport | Entertainment) */}
      <FinFlowCategoryFilter
        activeId={activeCategory}
        onSelect={(id) => setActiveCategory(id)}
      />

      {/* 4. Top 4 Metric Cards with edge-to-edge sparkline curves - 100% Real data, No fake mock */}
      <FinFlowMetricCards
        metrics={dashboardData?.metrics || zeroMetrics}
        activeCategory={activeCategory}
        beeSummary={dashboardData?.beeSummary}
        fuelSummary={dashboardData?.fuelSummary}
        bonusSummary={dashboardData?.bonusSummary}
        debtSummary={dashboardData?.debtSummary}
      />

      {/* 5. Hệ Sinh Thái 8 Thẻ Hoạt Họa Hiện Đại (Cartoon Neo-Brutalist Cards) */}
      <CartoonFeatureGrid
        metrics={dashboardData?.metrics || zeroMetrics}
        beeSummary={dashboardData?.beeSummary}
        fuelSummary={dashboardData?.fuelSummary}
        bonusSummary={dashboardData?.bonusSummary}
        debtSummary={dashboardData?.debtSummary}
        upcomingBills={dashboardData?.upcomingBills}
      />

      {/* 6. Chart 1: Cash Flow Trend ⓘ - Realtime Week & Month Trends */}
      <FinFlowCashFlowTrend
        month={currentMonth}
        year={currentYear}
        weekTrend={dashboardData?.weekTrend}
        monthlyTrend={dashboardData?.monthlyTrend}
      />

      {/* 6. Chart 2: Expense Categories ⓘ - Realtime Categorized Trends */}
      <FinFlowExpenseCategories
        month={currentMonth}
        year={currentYear}
        weekTrend={dashboardData?.weekTrend}
        activeCategory={activeCategory}
      />

      {/* 7. Operational Cockpit (Upcoming Bills & Next Payday) */}
      {dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <UpcomingBillsCard bills={dashboardData.upcomingBills} />
          <NextPaydayCard payday={dashboardData.nextPayday} />
        </div>
      )}

      {/* 8. Footer Standards Indicator */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-white/10 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>FinFlow Architecture • Chuẩn mực tài chính & quản trị dòng tiền MongoDB Realtime</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold">
            <Database className="w-3.5 h-3.5" />
            MongoDB 100% Native
          </span>
          <span>•</span>
          <Link href="/reports" className="hover:text-emerald-600 font-semibold transition-colors">
            Xuất Báo Cáo CSV
          </Link>
          <span>•</span>
          <Link href="/settings" className="hover:text-slate-900 dark:hover:text-white font-semibold transition-colors">
            Cài Đặt Hệ Thống
          </Link>
        </div>
      </div>

      {/* 9. Nút Trợ Lý Nổi Hoạt Họa [ 🤖 FinFlow Trợ Lý ] */}
      <FloatingAssistantPill
        monthlyIncome={dashboardData?.metrics.monthlyIncome}
        monthlyExpense={dashboardData?.metrics.monthlyExpense}
        netRemaining={dashboardData?.metrics.netRemaining}
        totalSavings={dashboardData?.metrics.totalSavings}
      />
    </div>
  );
}
