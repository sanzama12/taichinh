"use client";

import Link from "next/link";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Receipt,
  CreditCard,
} from "lucide-react";
import { type SmartAlert } from "@/services/dashboard.service";

interface SmartAlertsCardProps {
  alerts: SmartAlert[];
  hasAnyData?: boolean;
}

export function SmartAlertsCard({ alerts, hasAnyData = true }: SmartAlertsCardProps) {
  // 1. Trường hợp Cơ sở dữ liệu hoàn toàn sạch (Người dùng mới bắt đầu nhập dần)
  if (!hasAnyData) {
    return (
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-50/40 dark:from-blue-950/25 dark:via-[#090e17] dark:to-indigo-950/20 border border-blue-200 dark:border-blue-500/30 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-100 border border-blue-200 text-blue-700 dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-400 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>HỆ THỐNG SẴN SÀNG NHẬP LIỆU THẬT</span>
              </span>
              <span className="text-slate-400 font-mono text-xs">•</span>
              <span className="text-[11px] font-mono text-slate-500 font-medium">
                Sổ cái trống tinh khiết
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Bắt đầu xây dựng bức tranh tài chính chính xác cho bạn & doanh nghiệp
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Bạn có thể bắt đầu nhập lần lượt theo 3 bước: Ghi nhận hợp đồng nguồn thu, lập lịch nghĩa vụ trả, và cập nhật nhật ký chi phí thực tế.
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
            <Link
              href="/income"
              className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>1. Thu Nhập</span>
            </Link>

            <Link
              href="/bills"
              className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 dark:bg-amber-500/15 dark:border-amber-500/30 dark:hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>2. Khoản Phải Trả</span>
            </Link>

            <Link
              href="/expenses"
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-blue-500/20"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>3. Ghi Chi Tiêu</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Trường hợp Đã có dữ liệu và không có cảnh báo rủi ro nào
  if (alerts.length === 0) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#090e17] border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-3.5 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
            SỨC KHỎE TÀI CHÍNH ỔN ĐỊNH
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            Dòng tiền thặng dư, các khoản công nợ trong tầm kiểm soát và tỷ lệ tiết kiệm đạt chuẩn mục tiêu.
          </p>
        </div>
      </div>
    );
  }

  // 3. Trường hợp Có các cảnh báo tài chính cần xử lý
  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const isDanger = alert.type === "danger";
        const isWarning = alert.type === "warning";

        return (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
              isDanger
                ? "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-500/[0.08] dark:border-rose-500/30 dark:text-rose-200"
                : isWarning
                ? "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-500/[0.08] dark:border-amber-500/30 dark:text-amber-200"
                : "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-500/[0.08] dark:border-blue-500/30 dark:text-blue-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {isDanger ? (
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 animate-pulse" />
                ) : isWarning ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div>
                <h4
                  className={`text-xs font-mono font-bold uppercase tracking-wider ${
                    isDanger
                      ? "text-rose-700 dark:text-rose-400"
                      : isWarning
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-blue-700 dark:text-blue-400"
                  }`}
                >
                  {alert.title}
                </h4>
                <p className="text-xs mt-0.5 leading-relaxed text-slate-700 dark:text-slate-300">
                  {alert.message}
                </p>
              </div>
            </div>

            {alert.actionText && alert.actionHref && (
              <Link
                href={alert.actionHref}
                className="self-end sm:self-center px-3.5 py-1.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 border border-slate-200 dark:border-transparent text-xs font-mono font-semibold transition-all shrink-0 flex items-center gap-1 text-slate-800 dark:text-white shadow-2xs"
              >
                <span>{alert.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
