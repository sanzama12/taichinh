"use client";

import * as React from "react";
import { MessageSquare, Sparkles, X, ChevronRight, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

interface FloatingAssistantPillProps {
  monthlyIncome?: number;
  monthlyExpense?: number;
  netRemaining?: number;
  totalSavings?: number;
}

export function FloatingAssistantPill({
  monthlyIncome = 0,
  monthlyExpense = 0,
  netRemaining = 0,
  totalSavings = 0,
}: FloatingAssistantPillProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Nút Trợ Lý Nổi Ở Góc Phải Dưới Cùng (Chuẩn ảnh [ 🤖 Hỏi trợ lý ]) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0a3a2a] hover:bg-[#06291d] text-white shadow-xl hover:shadow-2xl shadow-emerald-950/30 border border-emerald-500/30 text-xs font-mono font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer select-none"
      >
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
        </div>
        <span>Hỏi trợ lý FinFlow</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Hộp Thoại Trợ Lý Thông Minh Khi Bấm Mở */}
      {isOpen && (
        <div className="fixed bottom-18 right-5 z-50 w-80 sm:w-96 rounded-3xl p-5 bg-white dark:bg-[#0c121e] border-2 border-slate-900 dark:border-white shadow-[6px_6px_0px_0px_rgba(15,23,42,0.9)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-black text-slate-900 dark:text-white uppercase">
                  Trợ Lý FinFlow AI
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">Trực quan hóa tài chính 24/7</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tóm tắt nhanh dòng tiền */}
          <div className="space-y-3 pt-3 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Tình hình dòng tiền hiện tại:
              </span>
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>Dòng tiền ròng:</span>
                <span className={netRemaining >= 0 ? "text-emerald-600 font-extrabold" : "text-rose-600 font-extrabold"}>
                  {Math.round(netRemaining).toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                <span>Quỹ tích lũy an toàn:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {Math.round(totalSavings).toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>

            {/* Lối tắt tư vấn nhanh */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Gợi ý tối ưu tài chính:
              </span>
              <Link
                href="/services/bee"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent hover:border-slate-200 transition-all text-[11px]"
              >
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Xem hiệu suất cuốc xe Be hôm nay
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/debts"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent hover:border-slate-200 transition-all text-[11px]"
              >
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                  Lịch trình tất toán nợ trả góp
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

