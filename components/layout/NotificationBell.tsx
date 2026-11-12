"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, AlertTriangle, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { getNotificationItemsAction } from "@/actions/bills";
import { formatCurrencyVND } from "@/lib/utils";

export function NotificationBell() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [data, setData] = React.useState<{
    attentionCount: number;
    items: Array<{
      id: string;
      name: string;
      amount: number;
      daysRemaining: number;
      color: "red" | "yellow" | "green";
      statusLabel: string;
    }>;
  }>({ attentionCount: 0, items: [] });

  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await getNotificationItemsAction();
      if (res.isSuccess) {
        setData(res.data);
      }
    } catch {
      // Bỏ qua lỗi kết nối nền
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Tự động làm mới mỗi 1 phút
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Click outside listener
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Thông báo tài chính đến hạn"
        className="relative p-2.5 rounded-xl bg-[#090e17] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {data.attentionCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-mono font-bold text-white shadow-sm ring-2 ring-[#030712] animate-pulse">
            {data.attentionCount}
          </span>
        )}
      </button>

      {/* Floating Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 p-4 rounded-2xl bg-[#090e17] border border-white/[0.1] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-xs font-mono uppercase tracking-wider text-white">
                THÔNG BÁO NGHĨA VỤ TÀI CHÍNH
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-400 border border-white/[0.08]">
              {data.attentionCount} khoản cần chú ý
            </span>
          </div>

          <div className="py-2 max-h-72 overflow-y-auto space-y-2">
            {data.items.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                <span>Không có khoản thanh toán nào cần chú ý trong 7 ngày tới.</span>
              </div>
            ) : (
              data.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    item.color === "red"
                      ? "bg-rose-500/10 border-rose-500/25 text-rose-300"
                      : "bg-amber-500/10 border-amber-500/25 text-amber-300"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.color === "red" ? (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <div className="truncate">
                      <p className="font-bold text-white truncate">{item.name}</p>
                      <p className="text-[10px] opacity-80">{item.statusLabel}</p>
                    </div>
                  </div>

                  <span className="font-bold font-mono whitespace-nowrap tabular-nums text-white">
                    {formatCurrencyVND(item.amount)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-white/[0.06] text-center">
            <Link
              href="/bills"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>Xem toàn bộ hóa đơn & giải ngân</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

