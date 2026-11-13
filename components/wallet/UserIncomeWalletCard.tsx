"use client";

import * as React from "react";
import { Wallet, Copy, Check, Sparkles, ShieldCheck, ArrowUpRight, History } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { type UserIncomeWalletDto } from "@/services/bee.service";
import { toast } from "sonner";
import { BeeIconSvg } from "@/components/icons/BeeLogo";
import { WithdrawalModal } from "@/components/wallet/WithdrawalModal";

interface UserIncomeWalletCardProps {
  wallet: UserIncomeWalletDto;
  className?: string;
  onWalletUpdated?: () => void;
}

export function UserIncomeWalletCard({
  wallet,
  className = "",
  onWalletUpdated,
}: UserIncomeWalletCardProps) {
  const [copied, setCopied] = React.useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = React.useState(false);

  const handleCopyCode = () => {
    if (!wallet.walletCode) return;
    navigator.clipboard.writeText(wallet.walletCode);
    setCopied(true);
    toast.success(`Đã sao chép mã ví: ${wallet.walletCode}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-3xl border-2 border-amber-400/40 dark:border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-amber-500/[0.03] to-slate-50 dark:from-[#1c1607] dark:via-[#0c121e] dark:to-[#090d16] p-5 shadow-xs transition-all hover:border-amber-400/60 ${className}`}
      >
        {/* Background Micro Glow */}
        <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

        {/* Header Hàng 1: Chip thẻ + Badge Ví Cá Nhân + Mã Ví */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            {/* Chip Thẻ Kim Loại Hoạt Họa */}
            <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-0.5 shadow-xs flex items-center justify-center">
              <div className="w-full h-full rounded-[3px] border border-amber-700/30 grid grid-cols-2 gap-0.5 p-0.5 opacity-80">
                <div className="bg-amber-100/40 rounded-xs" />
                <div className="bg-amber-100/40 rounded-xs" />
                <div className="bg-amber-100/40 rounded-xs" />
                <div className="bg-amber-100/40 rounded-xs" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-950 dark:text-amber-300">
                  {wallet.walletName || "Ví Thu Nhập"}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-400/20 text-amber-900 dark:text-amber-200 border border-amber-400/40">
                  Cá Nhân
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Chủ ví: <span className="font-bold text-slate-800 dark:text-slate-200">{wallet.ownerName}</span>
              </p>
            </div>
          </div>

          {/* Nhóm nút Action: Sao chép mã ví & Rút tiền */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              title="Sao chép mã ví"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-amber-400/50 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <span>{wallet.walletCode}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Nút Rút Tiền Nhanh */}
            <button
              type="button"
              onClick={() => setIsWithdrawOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Rút Tiền</span>
            </button>
          </div>
        </div>

        {/* Số Dư Chính Của Ví */}
        <div className="mt-4 pt-3 border-t border-amber-400/20 dark:border-white/5 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Số Dư Khả Dụng
              </span>
              <div className="flex items-baseline gap-3">
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-900 dark:text-[#FFC700] tabular-nums">
                  {formatCurrencyVND(wallet.balance)}
                </div>

                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(true)}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer pb-1"
                >
                  <span>Chuyển về ngân hàng</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 2 Chỉ Số Phụ Thu Nhập Gọn Gàng */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="p-2 rounded-xl bg-white/60 dark:bg-black/20 border border-slate-200/60 dark:border-white/5">
                <span className="text-[10px] text-slate-400 block font-sans">Thu Tháng Này</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  +{formatCurrencyVND(wallet.totalIncomeThisMonth)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/60 dark:bg-black/20 border border-slate-200/60 dark:border-white/5">
                <span className="text-[10px] text-slate-400 block font-sans">Tổng Tích Lũy</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {formatCurrencyVND(wallet.totalAllTimeEarnings)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Rút Tiền Đỉnh Cao */}
      <WithdrawalModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        walletBalance={wallet.balance}
        walletCode={wallet.walletCode}
        onSuccess={() => {
          onWalletUpdated?.();
        }}
      />
    </>
  );
}

