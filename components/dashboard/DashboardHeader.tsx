"use client";

import { useSession } from "next-auth/react";
import { AlertCircle, Building2, Calendar, ShieldCheck } from "lucide-react";

interface DashboardHeaderProps {
  bannerAlerts: string[];
  month: number;
  year: number;
}

export function DashboardHeader({ bannerAlerts, month, year }: DashboardHeaderProps) {
  const { data: session } = useSession();

  return (
    <div className="space-y-4">
      {/* Banner cảnh báo khẩn cấp nếu có hóa đơn đến hạn hôm nay hoặc quá hạn */}
      {bannerAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <h4 className="text-xs font-mono font-bold uppercase text-rose-700 dark:text-rose-400 tracking-wider">
              CẢNH BÁO NGHĨA VỤ TÀI CHÍNH ĐẾN HẠN
            </h4>
            <ul className="text-xs text-rose-800 dark:text-rose-200 mt-1 space-y-1 list-disc list-inside">
              {bannerAlerts.slice(0, 3).map((alert, idx) => (
                <li key={idx} className="font-medium">
                  {alert}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Corporate Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-400 uppercase font-bold">
              BẢN QUYỀN: {session?.user?.accessKey || "PROMAX-ENTERPRISE"}
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
              {session?.user?.role === "admin" ? "Ban Quản Trị Cấp Cao" : "Giám Đốc Tài Chính"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Trung Tâm Chỉ Huy Tài Chính</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Báo cáo tổng hợp dòng tiền, ngân sách, công nợ và kế hoạch tài chính cá nhân & doanh nghiệp.
          </p>
        </div>

        {/* Date / Fiscal Month Indicator */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-slate-300 shadow-xs shrink-0 self-start md:self-auto">
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-slate-900 dark:text-white">
            KỲ THÁNG {month.toString().padStart(2, "0")} / {year}
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>LIVE</span>
          </span>
        </div>
      </div>
    </div>
  );
}
