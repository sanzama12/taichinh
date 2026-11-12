"use client";

import * as React from "react";
import {
  ReceiptText,
  PlusCircle,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Building,
  UserCheck,
  Bike,
  Coins,
  ArrowRight,
} from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import {
  getDebtPageDataAction,
  createDebtAction,
  recordDebtPaymentAction,
  deleteDebtAction,
} from "@/actions/debt";
import { type DebtDto, type DebtSummaryDto } from "@/services/debt.service";
import { type DebtCategory } from "@/models/Debt";
import { toast } from "sonner";
import { triggerRealtimeSync, useRealtimeSync } from "@/lib/realtime-sync";
import {
  FeCreditLogo,
  HomeCreditLogo,
  VietcombankLogo,
  MastercardLogo,
} from "@/components/icons/BrandLogos";
import { BeeIconSvg } from "@/components/icons/BeeLogo";

export default function DebtsPage() {
  const [debts, setDebts] = React.useState<DebtDto[]>([]);
  const [summary, setSummary] = React.useState<DebtSummaryDto>({
    totalInitialDebt: 0,
    totalPaidDebt: 0,
    totalRemainingDebt: 0,
    totalMonthlyPayment: 0,
    overallPayoffPercent: 100,
    activeDebtCount: 0,
    paidOffDebtCount: 0,
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form states tạo nợ
  const [title, setTitle] = React.useState("");
  const [totalAmount, setTotalAmount] = React.useState("");
  const [paidAmount, setPaidAmount] = React.useState("0");
  const [monthlyPayment, setMonthlyPayment] = React.useState("");
  const [dueDay, setDueDay] = React.useState("5");
  const [interestRate, setInterestRate] = React.useState("0");
  const [category, setCategory] = React.useState<DebtCategory>("vehicle_installment");
  const [note, setNote] = React.useState("");

  // Form states trả nợ
  const [selectedDebtId, setSelectedDebtId] = React.useState("");
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentDate, setPaymentDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentNote, setPaymentNote] = React.useState("");

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getDebtPageDataAction();
      if (res.isSuccess) {
        setDebts(res.data.debts);
        setSummary(res.data.summary);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi tải danh sách khoản nợ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Lắng nghe cập nhật thời gian thực
  useRealtimeSync(loadData, 20000);

  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalNum = parseInt(totalAmount.replace(/\D/g, ""), 10);
    if (!totalNum || totalNum <= 0) {
      toast.error("Vui lòng nhập tổng số tiền nợ hợp lệ");
      return;
    }
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên khoản nợ hoặc chủ nợ");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createDebtAction({
        title: title.trim(),
        totalAmount: totalNum,
        paidAmount: parseInt(paidAmount.replace(/\D/g, ""), 10) || 0,
        monthlyPayment: parseInt(monthlyPayment.replace(/\D/g, ""), 10) || 0,
        dueDay: parseInt(dueDay, 10) || 1,
        interestRate: parseFloat(interestRate) || 0,
        category,
        note: note.trim() || undefined,
      });

      if (res.isSuccess) {
        toast.success("Đã thêm khoản nợ thành công!");
        setIsCreateModalOpen(false);
        // Reset form
        setTitle("");
        setTotalAmount("");
        setPaidAmount("0");
        setMonthlyPayment("");
        setNote("");
        loadData();
        triggerRealtimeSync("debt_created");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tạo khoản nợ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtId) {
      toast.error("Vui lòng chọn khoản nợ cần thanh toán");
      return;
    }
    const payNum = parseInt(paymentAmount.replace(/\D/g, ""), 10);
    if (!payNum || payNum <= 0) {
      toast.error("Vui lòng nhập số tiền thanh toán");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await recordDebtPaymentAction({
        debtId: selectedDebtId,
        amount: payNum,
        date: new Date(paymentDate),
        note: paymentNote.trim() || undefined,
      });

      if (res.isSuccess) {
        toast.success(`Đã ghi nhận thanh toán ${formatCurrencyVND(payNum)}!`);
        setIsPaymentModalOpen(false);
        setPaymentAmount("");
        setPaymentNote("");
        loadData();
        triggerRealtimeSync("debt_payment_recorded");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi ghi nhận trả nợ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPaymentForDebt = (debt: DebtDto) => {
    setSelectedDebtId(debt.id);
    setPaymentAmount(String(debt.monthlyPayment || debt.remainingAmount));
    setIsPaymentModalOpen(true);
  };

  const handleDelete = async (id: string, debtTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khoản nợ [${debtTitle}]?`)) return;
    try {
      const res = await deleteDebtAction(id);
      if (res.isSuccess) {
        toast.success("Đã xóa khoản nợ");
        loadData();
        triggerRealtimeSync("debt_deleted");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi xóa khoản nợ");
    }
  };

  const getCategoryBadge = (cat: DebtCategory) => {
    switch (cat) {
      case "vehicle_installment":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <HomeCreditLogo size={16} variant="square" /> Trả Góp Xe (Home Credit)
          </span>
        );
      case "app_advance":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <BeeIconSvg size={16} variant="square" /> Ứng Tiền Sàn Be
          </span>
        );
      case "bank_loan":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <VietcombankLogo size={16} variant="square" /> Vay Ngân Hàng (VCB)
          </span>
        );
      case "personal_loan":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FeCreditLogo size={16} variant="square" /> Vay Tiêu Dùng FE Credit
          </span>
        );
      case "credit_card":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <MastercardLogo size={16} variant="square" /> Thẻ Tín Dụng Mastercard
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            <ReceiptText className="w-3.5 h-3.5 text-slate-500" /> Khoản Vay Khác
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center -space-x-2">
            <FeCreditLogo size={40} variant="square" />
            <HomeCreditLogo size={40} variant="square" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Quản Lý Nợ & Trả Góp (FE Credit & Home Credit)
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300">
                DEBT TRACKER
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Theo dõi các khoản trả góp xe máy Home Credit, vay tiêu dùng FE Credit, ứng tiền ví tài xế và lịch trả nợ.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {debts.some((d) => d.status !== "paid_off") && (
            <button
              onClick={() => {
                const firstActive = debts.find((d) => d.status !== "paid_off");
                if (firstActive) openPaymentForDebt(firstActive);
              }}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all cursor-pointer min-h-[42px]"
            >
              <Coins className="w-4 h-4" />
              <span>Trả Nợ Nhanh</span>
            </button>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer min-h-[42px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Thêm Khoản Nợ Mới</span>
          </button>
        </div>
      </div>

      {/* Summary Bento Cards Phong Cách Hoạt Họa Hiện Đại */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Tổng Nợ Còn Lại */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-rose-500 shadow-xs space-y-2 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,0.9)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.25)] hover:border-slate-900 dark:hover:border-white">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>TỔNG NỢ CÒN LẠI</span>
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 tabular-nums">
            {formatCurrencyVND(summary.totalRemainingDebt)}
          </div>
          <div className="text-[11px] text-slate-400">
            {summary.activeDebtCount} khoản nợ đang hoạt động
          </div>
        </div>

        {/* Card 2: Tiền Trả Hàng Tháng */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-amber-500 shadow-xs space-y-2 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,0.9)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.25)] hover:border-slate-900 dark:hover:border-white">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>NGHĨA VỤ TRẢ HÀNG THÁNG</span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
            {formatCurrencyVND(summary.totalMonthlyPayment)}
          </div>
          <div className="text-[11px] text-slate-400">
            Cần chuẩn bị mỗi kỳ thanh toán
          </div>
        </div>

        {/* Card 3: Đã Thanh Toán */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-emerald-500 shadow-xs space-y-2 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,0.9)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.25)] hover:border-slate-900 dark:hover:border-white">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ĐÃ TRẢ ĐƯỢC</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {formatCurrencyVND(summary.totalPaidDebt)}
          </div>
          <div className="text-[11px] text-slate-400">
            Tổng nợ ban đầu: {formatCurrencyVND(summary.totalInitialDebt)}
          </div>
        </div>

        {/* Card 4: Tiến Độ Tất Toán */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-blue-500 shadow-xs space-y-2 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,0.9)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.25)] hover:border-slate-900 dark:hover:border-white">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>TIẾN ĐỘ TẤT TOÁN</span>
            <span className="font-mono font-bold text-xs text-blue-600">
              {summary.overallPayoffPercent}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${summary.overallPayoffPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {summary.paidOffDebtCount} khoản đã tất toán xong
          </div>
        </div>
      </div>

      {/* Debts Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Danh Sách Khoản Nợ ({debts.length})
          </h2>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Làm Mới</span>
          </button>
        </div>

        {debts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mx-auto">
              <ReceiptText className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Hiện tại bạn chưa ghi nhận khoản nợ nào
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Nếu bạn đang có khoản trả góp xe máy, ứng tiền sàn hoặc vay cá nhân, hãy bấm nút dưới đây để theo dõi hạn trả.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition-all cursor-pointer"
            >
              + Thêm Khoản Nợ
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {debts.map((debt) => (
              <div
                key={debt.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-xs space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {debt.title}
                    </h3>
                    <div className="mt-1">{getCategoryBadge(debt.category)}</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {debt.status === "paid_off" ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã Tất Toán
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        Hạn ngày {debt.dueDay}
                      </span>
                    )}

                    <button
                      onClick={() => handleDelete(debt.id, debt.title)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                      title="Xóa khoản nợ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">
                      Đã trả: {formatCurrencyVND(debt.paidAmount)}
                    </span>
                    <span className="font-bold text-emerald-600">
                      {debt.progressPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        debt.status === "paid_off" ? "bg-emerald-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${debt.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Details */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-white/5 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CÒN LẠI</span>
                    <span className="font-bold text-rose-600 text-sm">
                      {formatCurrencyVND(debt.remainingAmount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">TRẢ MỖI KỲ</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {formatCurrencyVND(debt.monthlyPayment)}
                    </span>
                  </div>
                </div>

                {debt.note && (
                  <p className="text-xs text-slate-500 italic bg-slate-50 dark:bg-white/[0.02] p-2 rounded-lg">
                    &ldquo;{debt.note}&rdquo;
                  </p>
                )}

                {/* Action button: Trả Nợ */}
                {debt.status !== "paid_off" && (
                  <button
                    onClick={() => openPaymentForDebt(debt)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Ghi Nhận Trả Nợ Kỳ Này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Thêm Khoản Nợ Mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Thêm Khoản Nợ / Trả Góp Mới
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDebt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Khoản Nợ / Chủ Nợ *
                </label>
                <input
                  type="text"
                  placeholder="VD: Trả góp xe máy Honda Wave Alpha"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Danh Mục Nợ
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DebtCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-rose-500 focus:outline-hidden"
                >
                  <option value="vehicle_installment">Trả góp xe máy / ô tô</option>
                  <option value="app_advance">Ứng tiền ví sàn Be</option>
                  <option value="bank_loan">Vay ngân hàng</option>
                  <option value="personal_loan">Vay người thân / bạn bè</option>
                  <option value="credit_card">Thẻ tín dụng</option>
                  <option value="other">Khoản vay khác</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tổng Số Nợ Ban Đầu (₫) *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 25000000"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-rose-600 focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Đã Trả Trước Đó (₫)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 5000000"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số Tiền Trả Mỗi Tháng (₫)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 1850000"
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:border-rose-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ngày Đến Hạn Hàng Tháng
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lãi Suất (%/năm nếu có)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="VD: 12.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi Chú
                </label>
                <input
                  type="text"
                  placeholder="Ghi chú thêm về hợp đồng vay..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu Khoản Nợ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ghi Nhận Trả Nợ */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Ghi Nhận Trả Nợ
                </h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chọn Khoản Nợ
                </label>
                <select
                  value={selectedDebtId}
                  onChange={(e) => setSelectedDebtId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 focus:outline-hidden"
                >
                  {debts
                    .filter((d) => d.status !== "paid_off")
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} (Còn nợ: {formatCurrencyVND(d.remainingAmount)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Số Tiền Trả Đợt Này (₫) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: 1850000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-emerald-600 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ngày Thanh Toán
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi Chú
                </label>
                <input
                  type="text"
                  placeholder="VD: Trả góp xe kỳ tháng 11..."
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác Nhận Trả Nợ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

