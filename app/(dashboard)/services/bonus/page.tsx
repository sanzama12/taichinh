"use client";

import * as React from "react";
import {
  Award,
  PlusCircle,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  CloudRain,
  Calendar,
} from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import {
  getBonusPageDataAction,
  createBonusLogAction,
  updateBonusStatusAction,
  deleteBonusLogAction,
} from "@/actions/bonus";
import { type BonusLogDto, type BonusSummaryDto } from "@/services/bonus.service";
import { type BonusType, type BonusStatus } from "@/models/BonusLog";
import { toast } from "sonner";
import { triggerRealtimeSync, useRealtimeSync } from "@/lib/realtime-sync";
import { BeBonusLogo } from "@/components/icons/BrandLogos";
import { BeeIconSvg } from "@/components/icons/BeeLogo";

export default function BonusManagementPage() {
  const now = new Date();
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [year, setYear] = React.useState(now.getFullYear());

  const [bonuses, setBonuses] = React.useState<BonusLogDto[]>([]);
  const [summary, setSummary] = React.useState<BonusSummaryDto>({
    totalReceived: 0,
    totalPending: 0,
    totalBonuses: 0,
    receivedCount: 0,
    pendingCount: 0,
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form states
  const [title, setTitle] = React.useState("");
  const [amount, setAmount] = React.useState<string>("");
  const [bonusType, setBonusType] = React.useState<BonusType>("milestone");
  const [status, setStatus] = React.useState<BonusStatus>("received");
  const [targetTrips, setTargetTrips] = React.useState<string>("");
  const [date, setDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = React.useState("");

  const loadData = React.useCallback(async (m: number, y: number) => {
    try {
      setIsLoading(true);
      const res = await getBonusPageDataAction(m, y);
      if (res.isSuccess) {
        setBonuses(res.data.bonuses);
        setSummary(res.data.summary);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi tải dữ liệu tiền thưởng");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData(month, year);
  }, [month, year, loadData]);

  // Lắng nghe cập nhật thời gian thực
  useRealtimeSync(() => loadData(month, year), 20000);

  const handleCreateBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(amount.replace(/\D/g, ""), 10);
    if (!amountNum || amountNum <= 0) {
      toast.error("Vui lòng nhập số tiền thưởng hợp lệ");
      return;
    }
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên chương trình thưởng");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createBonusLogAction({
        title: title.trim(),
        amount: amountNum,
        bonusType,
        status,
        targetTrips: parseInt(targetTrips, 10) || 0,
        date: new Date(date),
        note: note.trim() || undefined,
      });

      if (res.isSuccess) {
        toast.success("Đã ghi nhận tiền thưởng thành công!");
        setIsModalOpen(false);
        // Reset form
        setTitle("");
        setAmount("");
        setTargetTrips("");
        setNote("");
        loadData(month, year);
        triggerRealtimeSync("bonus_created");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi lưu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: BonusStatus) => {
    const nextStatus: BonusStatus = currentStatus === "received" ? "pending" : "received";
    try {
      const res = await updateBonusStatusAction(id, nextStatus);
      if (res.isSuccess) {
        toast.success(
          nextStatus === "received"
            ? "Đã đánh dấu Đã Nhận & cộng vào thu nhập!"
            : "Đã chuyển về Chờ duyệt"
        );
        loadData(month, year);
        triggerRealtimeSync("bonus_status_updated");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bản ghi tiền thưởng này?")) return;
    try {
      const res = await deleteBonusLogAction(id);
      if (res.isSuccess) {
        toast.success("Đã xóa tiền thưởng");
        loadData(month, year);
        triggerRealtimeSync("bonus_deleted");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi xóa");
    }
  };

  const getBonusTypeBadge = (type: BonusType) => {
    switch (type) {
      case "milestone":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" /> Mốc Cuốc Ngày
          </span>
        );
      case "weekly":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Calendar className="w-3.5 h-3.5" /> Thưởng Tuần Be Super
          </span>
        );
      case "peakHour":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Flame className="w-3.5 h-3.5" /> Giờ Cao Điểm
          </span>
        );
      case "weather":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <CloudRain className="w-3.5 h-3.5" /> Thưởng Thời Tiết
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            <Award className="w-3.5 h-3.5" /> Thưởng Khác
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3.5">
          <BeBonusLogo size={42} variant="square" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Tiền Thưởng & Đãi Ngộ (Be Incentives)
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#FFC700] text-[#111827]">
                BE REWARDS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Theo dõi thưởng mốc cuốc Be, thưởng tuần Be Super, thưởng nóng giờ cao điểm và tiền về ví.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xs shadow-md transition-all cursor-pointer min-h-[42px]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Ghi Nhận Tiền Thưởng</span>
        </button>
      </div>

      {/* Control Bar: Bộ chọn tháng & Nút làm mới */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (month === 1) {
                setMonth(12);
                setYear((y) => y - 1);
              } else setMonth((m) => m - 1);
            }}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 font-mono font-bold text-xs text-slate-800">
            Tháng {month} / {year}
          </span>
          <button
            onClick={() => {
              if (month === 12) {
                setMonth(1);
                setYear((y) => y + 1);
              } else setMonth((m) => m + 1);
            }}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => loadData(month, year)}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Làm Mới</span>
        </button>
      </div>

      {/* Summary Bento Cards Phong Cách Hoạt Họa Hiện Đại */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Tổng Tiền Thưởng Đã Nhận */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-emerald-500 shadow-xs space-y-2 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,0.9)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.25)] hover:border-slate-900 dark:hover:border-white">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ĐÃ NHẬN VỀ VÍ</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            +{formatCurrencyVND(summary.totalReceived)}
          </div>
          <div className="text-[11px] text-slate-400">
            {summary.receivedCount} khoản thưởng đã cộng vào thu nhập
          </div>
        </div>

        {/* Card 2: Tiền Thưởng Đang Chờ Duyệt */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-amber-500 shadow-xs space-y-2 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,0.9)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.25)] hover:border-slate-900 dark:hover:border-white">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>CHỜ DUYỆT & ĐỐI SOÁT</span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
            {formatCurrencyVND(summary.totalPending)}
          </div>
          <div className="text-[11px] text-slate-400">
            {summary.pendingCount} khoản thưởng dự kiến giải ngân
          </div>
        </div>

        {/* Card 3: Tổng Giá Trị Thưởng */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-purple-500 shadow-xs space-y-2 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,0.9)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.25)] hover:border-slate-900 dark:hover:border-white">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>TỔNG THƯỞNG ĐẠT ĐƯỢC</span>
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatCurrencyVND(summary.totalBonuses)}
          </div>
          <div className="text-[11px] text-slate-400">
            Tổng cộng {summary.receivedCount + summary.pendingCount} chương trình thưởng
          </div>
        </div>
      </div>

      {/* Bonus Logs List / Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Danh Sách Tiền Thưởng ({bonuses.length})
          </h2>
        </div>

        {bonuses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Chưa có khoản tiền thưởng nào trong tháng {month}/{year}
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Bấm nút &quot;+ Ghi Nhận Tiền Thưởng&quot; để theo dõi các mốc thưởng và chương trình đãi ngộ của sàn.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-all cursor-pointer"
            >
              + Ghi Nhận Ngay
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/[0.03] text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Tên Chương Trình</th>
                  <th className="py-3 px-4">Loại Thưởng</th>
                  <th className="py-3 px-4 text-right">Số Tiền (₫)</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4">Ngày Đạt</th>
                  <th className="py-3 px-4 text-center">Tác Vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {bonuses.map((bonus) => (
                  <tr key={bonus.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{bonus.title}</div>
                      {bonus.targetTrips > 0 && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          Mốc: {bonus.targetTrips} chuyến
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">{getBonusTypeBadge(bonus.bonusType)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-emerald-600">
                      +{formatCurrencyVND(bonus.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(bonus.id, bonus.status)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                          bonus.status === "received"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200"
                            : "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200"
                        }`}
                        title="Bấm để chuyển trạng thái"
                      >
                        {bonus.status === "received" ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã Nhận
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" /> Chờ Duyệt
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {new Date(bonus.date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(bonus.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Xóa tiền thưởng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Ghi Nhận Tiền Thưởng */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Ghi Nhận Tiền Thưởng Mới
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBonus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Chương Trình Thưởng *
                </label>
                <input
                  type="text"
                  placeholder="VD: Thưởng mốc 20 chuyến ngày Chủ Nhật"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số Tiền Thưởng (₫) *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 150000"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-emerald-600 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Loại Thưởng
                  </label>
                  <select
                    value={bonusType}
                    onChange={(e) => setBonusType(e.target.value as BonusType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="milestone">Mốc cuốc ngày (Milestone)</option>
                    <option value="weekly">Thưởng tuần Be Super</option>
                    <option value="peakHour">Thưởng giờ cao điểm</option>
                    <option value="weather">Thưởng thời tiết mưa gió</option>
                    <option value="other">Thưởng khác / Tri ân</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Trạng Thái Giải Ngân
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BonusStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="received">Đã nhận về ví (Cộng vào thu nhập)</option>
                    <option value="pending">Chờ đối soát / Dự kiến</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mốc Số Cuốc Yêu Cầu
                  </label>
                  <input
                    type="number"
                    placeholder="VD: 20"
                    value={targetTrips}
                    onChange={(e) => setTargetTrips(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ngày Đạt Thưởng
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi Chú
                </label>
                <input
                  type="text"
                  placeholder="Ghi chú thêm..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu Tiền Thưởng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

