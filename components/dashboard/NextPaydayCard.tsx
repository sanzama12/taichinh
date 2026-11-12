"use client";

import Link from "next/link";
import { CalendarCheck, TrendingUp, ArrowRight } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { type NextPaydayInfo } from "@/services/dashboard.service";

interface NextPaydayCardProps {
  payday: NextPaydayInfo | null;
}

export function NextPaydayCard({ payday }: NextPaydayCardProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              THU NHẬP SẮP TỚI (KỲ LƯƠNG TIẾP THEO)
            </h3>
          </div>
          <Link
            href="/income"
            className="text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 transition-colors"
          >
            <span>Chi tiết</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!payday ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            <TrendingUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Chưa thiết lập ngày nhận lương hoặc hợp đồng định kỳ hàng tháng.
            </span>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Khai báo ngày thanh toán lương để hệ thống đếm ngược ngày dòng tiền vào tài khoản.
            </p>
            <div className="mt-4">
              <Link
                href="/income"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
              >
                <span>+ Cấu hình nguồn thu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#05080f] border border-emerald-200 dark:border-emerald-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {payday.name}
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  +{formatCurrencyVND(payday.amount)}
                </span>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Ngày giải ngân dự kiến:</span>
                <span className="text-slate-900 dark:text-white font-bold">{payday.dateStr}</span>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Thời gian chờ:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    payday.isToday
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 animate-pulse"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400"
                  }`}
                >
                  {payday.isToday ? "HÔM NAY ĐƯỢC NHẬN" : `Còn ${payday.daysRemaining} ngày nữa`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-slate-200 dark:border-white/[0.06] text-right">
        <Link
          href="/income"
          className="text-[11px] font-mono text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1"
        >
          <span>Quản lý nguồn thu định kỳ</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
