"use client";

import Link from "next/link";
import { Receipt, Calendar, ArrowRight, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { formatCurrencyVND, formatDateVN } from "@/lib/utils";
import { type UpcomingBillItem } from "@/services/dashboard.service";

interface UpcomingBillsCardProps {
  bills: UpcomingBillItem[];
}

export function UpcomingBillsCard({ bills }: UpcomingBillsCardProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              KHOẢN SẮP ĐẾN HẠN (7 NGÀY TỚI)
            </h3>
          </div>
          <Link
            href="/bills"
            className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors"
          >
            <span>Tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {bills.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Không có khoản nợ hoặc nghĩa vụ nào cần trả trong 7 ngày tới.
            </span>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Lập danh sách các chi phí cố định (mặt bằng, điện nước, hạ tầng Cloud) để kích hoạt nhắc nhở.
            </p>
            <div className="mt-4">
              <Link
                href="/bills"
                className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/20 dark:hover:bg-amber-500/20 dark:text-amber-400 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>+ Lập khoản phải trả</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 mt-3">
            {bills.slice(0, 5).map((item) => {
              const isUrgent = item.color === "red";
              const isWarning = item.color === "yellow";
              const isPaid = item.isPaid;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#05080f] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isPaid
                          ? "bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                          : isUrgent
                          ? "bg-rose-100 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400"
                          : isWarning
                          ? "bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400"
                          : "bg-slate-200 border-slate-300 text-slate-700 dark:bg-white/[0.04] dark:border-white/10 dark:text-slate-400"
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isUrgent ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{item.name}</span>
                        {isPaid && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                            ĐÃ THANH TOÁN
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {item.actualDueDate}
                        </span>
                        <span>•</span>
                        <span
                          className={`font-mono font-semibold ${
                            isPaid
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isUrgent
                              ? "text-rose-600 dark:text-rose-400 font-bold"
                              : isWarning
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-slate-500"
                          }`}
                        >
                          {item.statusLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums shrink-0">
                    {formatCurrencyVND(item.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-slate-200 dark:border-white/[0.06] text-right">
        <Link
          href="/bills"
          className="text-[11px] font-mono text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1"
        >
          <span>Xem tất cả công nợ & lịch giải ngân</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
