"use client";

import * as React from "react";
import {
  Wallet,
  ArrowUpRight,
  History,
  Building2,
  CreditCard,
  UserCheck,
  CheckCircle2,
  Clock,
  X,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { toast } from "sonner";
import {
  createWithdrawalAction,
  getUserWithdrawalsAction,
} from "@/actions/withdrawal";
import { type WithdrawalDto } from "@/services/withdrawal.service";
import { triggerRealtimeSync } from "@/lib/realtime-sync";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  walletCode: string;
  onSuccess?: () => void;
}

const POPULAR_BANKS = [
  { code: "MB", name: "MB Bank (Ngân hàng Quân Đội)" },
  { code: "VCB", name: "Vietcombank (Ngoại Thương)" },
  { code: "TCB", name: "Techcombank (Kỹ Thương)" },
  { code: "VPB", name: "VPBank (Việt Nam Thịnh Vượng)" },
  { code: "ACB", name: "ACB (Á Châu)" },
  { code: "BIDV", name: "BIDV (Đầu tư & Phát triển)" },
  { code: "CTG", name: "VietinBank (Công Thương)" },
  { code: "TPB", name: "TPBank (Tiên Phong)" },
  { code: "STB", name: "Sacombank (Sài Gòn Thương Tín)" },
  { code: "VIB", name: "VIB (Quốc Tế)" },
  { code: "AGR", name: "Agribank (Nông Nghiệp)" },
  { code: "MOMO", name: "Ví MoMo" },
  { code: "ZALOPAY", name: "Ví ZaloPay" },
  { code: "OTHER", name: "Ngân hàng khác..." },
];

export function WithdrawalModal({
  isOpen,
  onClose,
  walletBalance,
  walletCode,
  onSuccess,
}: WithdrawalModalProps) {
  const [activeTab, setActiveTab] = React.useState<"form" | "history">("form");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);

  // Form states
  const [amountInput, setAmountInput] = React.useState<string>("");
  const [bankName, setBankName] = React.useState<string>("MB Bank (Ngân hàng Quân Đội)");
  const [customBankName, setCustomBankName] = React.useState<string>("");
  const [bankAccount, setBankAccount] = React.useState<string>("");
  const [accountHolder, setAccountHolder] = React.useState<string>("");
  const [note, setNote] = React.useState<string>("");
  const [saveBankInfo, setSaveBankInfo] = React.useState<boolean>(true);

  // History state
  const [historyList, setHistoryList] = React.useState<WithdrawalDto[]>([]);
  const [totalWithdrawn, setTotalWithdrawn] = React.useState<number>(0);

  // Tải dữ liệu ban đầu và thông tin ngân hàng đã lưu (nếu có)
  const fetchWithdrawalData = React.useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const res = await getUserWithdrawalsAction();
      if (res.isSuccess) {
        setHistoryList(res.data.withdrawals);
        setTotalWithdrawn(res.data.totalWithdrawn);
        if (res.data.bankInfo) {
          if (res.data.bankInfo.bankName) setBankName(res.data.bankInfo.bankName);
          if (res.data.bankInfo.bankAccount) setBankAccount(res.data.bankInfo.bankAccount);
          if (res.data.bankInfo.accountHolder) setAccountHolder(res.data.bankInfo.accountHolder);
        }
      }
    } catch {
      // Ignored
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      fetchWithdrawalData();
    }
  }, [isOpen, fetchWithdrawalData]);

  if (!isOpen) return null;

  const numericAmount = parseInt(amountInput.replace(/\D/g, ""), 10) || 0;
  const isExceedingBalance = numericAmount > walletBalance;

  // Xử lý gõ số tiền có phân cách hàng nghìn
  const handleAmountChange = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (!digits) {
      setAmountInput("");
      return;
    }
    const num = parseInt(digits, 10);
    setAmountInput(new Intl.NumberFormat("vi-VN").format(num));
  };

  // Chọn số tiền nhanh
  const setQuickAmount = (val: number) => {
    const finalVal = Math.min(val, walletBalance);
    setAmountInput(new Intl.NumberFormat("vi-VN").format(finalVal));
  };

  // Chọn rút tất cả
  const handleWithdrawAll = () => {
    if (walletBalance <= 0) {
      toast.error("Số dư ví hiện tại bằng 0 ₫");
      return;
    }
    setAmountInput(new Intl.NumberFormat("vi-VN").format(walletBalance));
  };

  const handleBankSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setBankName(val);
    if (val !== "OTHER") {
      setCustomBankName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (numericAmount < 10000) {
      toast.error("Số tiền rút tối thiểu là 10.000 ₫");
      return;
    }

    if (numericAmount > walletBalance) {
      toast.error(`Số dư ví không đủ (${formatCurrencyVND(walletBalance)})`);
      return;
    }

    const effectiveBankName = bankName === "OTHER" ? customBankName.trim() : bankName.trim();
    if (!effectiveBankName) {
      toast.error("Vui lòng nhập tên ngân hàng thụ hưởng");
      return;
    }

    if (!bankAccount.trim()) {
      toast.error("Vui lòng nhập số tài khoản ngân hàng");
      return;
    }

    if (!accountHolder.trim()) {
      toast.error("Vui lòng nhập tên chủ tài khoản");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createWithdrawalAction({
        amount: numericAmount,
        bankName: effectiveBankName,
        bankAccount: bankAccount.trim(),
        accountHolder: accountHolder.trim().toUpperCase(),
        note: note.trim() || undefined,
        saveBankInfo,
      });

      if (res.isSuccess) {
        toast.success(`Đã rút thành công ${formatCurrencyVND(numericAmount)} về tài khoản!`);
        triggerRealtimeSync("wallet_withdrawn");
        setAmountInput("");
        setNote("");
        onSuccess?.();
        // Cập nhật lại lịch sử rút tiền
        fetchWithdrawalData();
        // Chuyển sang xem lịch sử
        setActiveTab("history");
      } else {
        toast.error(res.error || "Rút tiền thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi thực hiện rút tiền");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-900/10 dark:border-white/10 p-5 sm:p-6 shadow-2xl space-y-4 my-6 relative overflow-hidden">
        {/* Glow hiệu ứng nền */}
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-amber-500/10 dark:bg-amber-400/5 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Rút Tiền Ví Thu Nhập</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-mono">
                  {walletCode}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Chuyển thu nhập tích lũy về tài khoản ngân hàng hoặc ví cá nhân
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Rút Tiền vs Lịch Sử */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-xs font-bold relative z-10">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "form"
                ? "bg-white dark:bg-amber-500 text-slate-900 dark:text-white shadow-xs font-black"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-500 dark:text-white" />
            <span>Tạo Lệnh Rút Tiền</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-white dark:bg-amber-500 text-slate-900 dark:text-white shadow-xs font-black"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch Sử Rút ({historyList.length})</span>
          </button>
        </div>

        {/* Tab 1: Form Rút Tiền */}
        {activeTab === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {/* Banner hiển thị số dư khả dụng */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-400/40 dark:border-amber-400/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900/80 dark:text-amber-300 block">
                  Số Dư Khả Dụng Trong Ví
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-amber-950 dark:text-[#FFC700] tabular-nums">
                  {formatCurrencyVND(walletBalance)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleWithdrawAll}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Rút Tất Cả
              </button>
            </div>

            {/* Nhập số tiền rút */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Số tiền muốn rút (₫) *
                </label>
                {numericAmount > 0 && (
                  <span
                    className={`text-[10px] font-bold ${
                      isExceedingBalance ? "text-rose-600" : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {isExceedingBalance
                      ? "⚠️ Vượt quá số dư ví"
                      : `Còn lại: ${formatCurrencyVND(Math.max(0, walletBalance - numericAmount))}`}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="VD: 200.000"
                  value={amountInput}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border-2 bg-slate-50 dark:bg-white/5 text-lg font-mono font-black text-slate-900 dark:text-white focus:outline-hidden transition-all ${
                    isExceedingBalance
                      ? "border-rose-500 bg-rose-50/20"
                      : "border-amber-400/80 dark:border-amber-400/50 focus:border-amber-500"
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  VND
                </span>
              </div>

              {/* Nút chọn nhanh số tiền */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {[50_000, 100_000, 200_000, 500_000, 1_000_000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    disabled={amt > walletBalance}
                    onClick={() => setQuickAmount(amt)}
                    className="px-2 py-1 rounded-md text-[11px] font-mono font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/5 disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all cursor-pointer"
                  >
                    {amt >= 1_000_000 ? `${amt / 1_000_000}tr` : `${amt / 1_000}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* Thông tin thụ hưởng: Ngân hàng & STK */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>Tài Khoản Ngân Hàng Thụ Hưởng</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Ngân hàng thụ hưởng *
                </label>
                <select
                  value={bankName}
                  onChange={handleBankSelectChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] text-xs font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-hidden"
                >
                  {POPULAR_BANKS.map((b) => (
                    <option key={b.code} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>

                {bankName === "OTHER" && (
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên ngân hàng khác..."
                    value={customBankName}
                    onChange={(e) => setCustomBankName(e.target.value)}
                    className="mt-2 w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] text-xs font-semibold focus:border-amber-500 focus:outline-hidden"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Số tài khoản / Số thẻ *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="VD: 0335384174"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Tên chủ tài khoản (In hoa) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: NGUYEN VAN A"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] text-xs font-bold uppercase text-slate-900 dark:text-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nội dung / Ghi chú (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="VD: Rút thu nhập tuần 2..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c121e] text-xs text-slate-800 dark:text-slate-200 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="saveBankInfoCheck"
                  checked={saveBankInfo}
                  onChange={(e) => setSaveBankInfo(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
                <label
                  htmlFor="saveBankInfoCheck"
                  className="text-[11px] font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none"
                >
                  Ghi nhớ ngân hàng này cho các lần rút tiếp theo
                </label>
              </div>
            </div>

            {/* Nút bấm xác nhận */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || numericAmount <= 0 || isExceedingBalance}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] text-white font-black text-sm shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang xử lý rút tiền...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>
                      Xác Nhận Rút {numericAmount > 0 ? formatCurrencyVND(numericAmount) : "Tiền"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Lịch Sử Rút Tiền */}
        {activeTab === "history" && (
          <div className="space-y-3 relative z-10">
            {/* Thống kê rút tiền */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">
                Tổng đã rút thành công:
              </span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {formatCurrencyVND(totalWithdrawn)}
              </span>
            </div>

            {/* Danh sách các lần rút */}
            <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
              {isLoadingHistory ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Đang tải lịch sử rút tiền...
                </div>
              ) : historyList.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-1">
                  <p>Chưa có giao dịch rút tiền nào.</p>
                  <p className="text-[11px] text-slate-500">
                    Thu nhập sau khi chạy xe hoặc ghi nhận sẽ được hiển thị và rút tại đây.
                  </p>
                </div>
              ) : (
                historyList.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] border border-slate-200/70 dark:border-white/5 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                          {item.withdrawalCode}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Thành công</span>
                        </span>
                      </div>

                      <span className="font-mono font-black text-sm text-rose-600 dark:text-rose-400 tabular-nums">
                        -{formatCurrencyVND(item.amount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <div className="truncate max-w-[220px]">
                        <span>{item.bankName}</span> • <span className="font-mono">{item.bankAccount}</span>
                      </div>
                      <span className="font-mono text-[10px]">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {item.note && (
                      <div className="text-[10px] text-slate-400 italic">
                        &ldquo;{item.note}&rdquo;
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("form")}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold text-xs transition-all cursor-pointer"
              >
                + Thực Hiện Rút Tiền Mới
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

