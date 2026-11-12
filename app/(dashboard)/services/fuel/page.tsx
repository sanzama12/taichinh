"use client";

import * as React from "react";
import {
  Fuel,
  PlusCircle,
  RefreshCw,
  Trash2,
  Gauge,
  Droplets,
  Coins,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import {
  getFuelPageDataAction,
  createFuelLogAction,
  deleteFuelLogAction,
} from "@/actions/fuel";
import { type FuelLogDto, type FuelSummaryDto } from "@/services/fuel.service";
import { type FuelType } from "@/models/FuelLog";
import { toast } from "sonner";
import { triggerRealtimeSync, useRealtimeSync } from "@/lib/realtime-sync";
import { PetrolimexLogo, PvoilLogo } from "@/components/icons/BrandLogos";

export default function FuelManagementPage() {
  const now = new Date();
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [year, setYear] = React.useState(now.getFullYear());

  const [logs, setLogs] = React.useState<FuelLogDto[]>([]);
  const [summary, setSummary] = React.useState<FuelSummaryDto>({
    totalCost: 0,
    totalLiters: 0,
    avgPricePerLiter: 0,
    totalFillCount: 0,
    avgCostPerFill: 0,
    estimatedKmRun: 0,
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form states
  const [amount, setAmount] = React.useState<string>("");
  const [liters, setLiters] = React.useState<string>("");
  const [pricePerLiter, setPricePerLiter] = React.useState<string>("21500");
  const [odoKm, setOdoKm] = React.useState<string>("");
  const [fuelType, setFuelType] = React.useState<FuelType>("RON 95");
  const [gasStation, setGasStation] = React.useState("Petrolimex");
  const [date, setDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = React.useState("");

  const loadData = React.useCallback(async (m: number, y: number) => {
    try {
      setIsLoading(true);
      const res = await getFuelPageDataAction(m, y);
      if (res.isSuccess) {
        setLogs(res.data.logs);
        setSummary(res.data.summary);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi tải dữ liệu đổ xăng");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData(month, year);
  }, [month, year, loadData]);

  // Lắng nghe cập nhật thời gian thực
  useRealtimeSync(() => loadData(month, year), 20000);

  // Tự động tính số lít khi nhập số tiền và đơn giá
  const handleAmountChange = (val: string) => {
    setAmount(val);
    const amountNum = parseInt(val.replace(/\D/g, ""), 10) || 0;
    const priceNum = parseInt(pricePerLiter.replace(/\D/g, ""), 10) || 21500;
    if (amountNum > 0 && priceNum > 0) {
      const calculatedLiters = (amountNum / priceNum).toFixed(2);
      setLiters(calculatedLiters);
    }
  };

  const handleLitersChange = (val: string) => {
    setLiters(val);
    const litersNum = parseFloat(val) || 0;
    const priceNum = parseInt(pricePerLiter.replace(/\D/g, ""), 10) || 21500;
    if (litersNum > 0 && priceNum > 0) {
      setAmount(String(Math.round(litersNum * priceNum)));
    }
  };

  const handleCreateFuelLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(amount.replace(/\D/g, ""), 10);
    const litersNum = parseFloat(liters);

    if (!amountNum || amountNum <= 0) {
      toast.error("Vui lòng nhập số tiền đổ xăng hợp lệ");
      return;
    }
    if (!litersNum || litersNum <= 0) {
      toast.error("Vui lòng nhập số lít xăng");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createFuelLogAction({
        amount: amountNum,
        liters: litersNum,
        pricePerLiter: parseInt(pricePerLiter.replace(/\D/g, ""), 10) || 0,
        odoKm: parseInt(odoKm, 10) || 0,
        fuelType,
        gasStation: gasStation.trim() || undefined,
        date: new Date(date),
        note: note.trim() || undefined,
      });

      if (res.isSuccess) {
        toast.success("Đã ghi nhận nhật ký đổ xăng!");
        setIsModalOpen(false);
        // Reset form
        setAmount("");
        setLiters("");
        setOdoKm("");
        setNote("");
        loadData(month, year);
        triggerRealtimeSync("fuel_log_created");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi lưu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bản ghi đổ xăng này?")) return;
    try {
      const res = await deleteFuelLogAction(id);
      if (res.isSuccess) {
        toast.success("Đã xóa nhật ký");
        loadData(month, year);
        triggerRealtimeSync("fuel_log_deleted");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi xóa");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3.5">
          <PetrolimexLogo size={42} variant="square" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Quản Lý Xăng (Petrolimex & PVOIL)
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#004B87] text-white">
                PETROLIMEX
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Theo dõi lượng xăng đổ, chỉ số ODO km và tính toán mức tiêu hao nhiên liệu thực tế.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#004B87] hover:bg-[#003866] text-white font-bold text-xs shadow-md transition-all cursor-pointer min-h-[42px]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Ghi Nhật Ký Đổ Xăng</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Tổng Chi Tiền Xăng */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-orange-500 shadow-xs space-y-2 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,0.9)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.25)] hover:border-slate-900 dark:hover:border-white">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>TỔNG TIỀN XĂNG THÁNG NÀY</span>
            <div className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-orange-600 tabular-nums">
            {formatCurrencyVND(summary.totalCost)}
          </div>
          <div className="text-[11px] text-slate-400">
            Đã tự động cộng vào chi phí vận hành
          </div>
        </div>

        {/* Card 2: Tổng Lít Xăng */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-blue-500 shadow-xs space-y-2 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,0.9)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.25)] hover:border-slate-900 dark:hover:border-white">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>TỔNG SỐ LÍT XĂNG</span>
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {summary.totalLiters} Lít
          </div>
          <div className="text-[11px] text-slate-400">
            Giá bình quân: {formatCurrencyVND(summary.avgPricePerLiter)} / L
          </div>
        </div>

        {/* Card 3: Số Lần Đổ Xăng */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-emerald-500 shadow-xs space-y-2 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,0.9)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.25)] hover:border-slate-900 dark:hover:border-white">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>SỐ LẦN ĐỔ XĂNG</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
            {summary.totalFillCount} lần
          </div>
          <div className="text-[11px] text-slate-400">
            Trung bình: {formatCurrencyVND(summary.avgCostPerFill)} / lần
          </div>
        </div>

        {/* Card 4: Quãng Đường ODO */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-900/10 dark:border-white/10 border-t-4 border-t-purple-500 shadow-xs space-y-2 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,0.9)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.25)] hover:border-slate-900 dark:hover:border-white">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>QUÃNG ĐƯỜNG ODO GHI NHẬN</span>
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-purple-600 tabular-nums">
            {summary.estimatedKmRun > 0 ? `${summary.estimatedKmRun} km` : "Chưa đủ mốc ODO"}
          </div>
          <div className="text-[11px] text-slate-400">
            Chênh lệch giữa các lần đổ xăng
          </div>
        </div>
      </div>

      {/* Fuel Logs List / Table */}
      <div className="rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Lịch Sử Đổ Xăng ({logs.length})
          </h2>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mx-auto">
              <Fuel className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Chưa có dữ liệu đổ xăng trong tháng {month}/{year}
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Bấm nút &quot;+ Ghi Nhật Ký Đổ Xăng&quot; để quản lý tiền xăng và số lít tiêu hao.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-all cursor-pointer"
            >
              + Ghi Nhận Ngay
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/[0.03] text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Ngày Đổ</th>
                  <th className="py-3 px-4">Cây Xăng / Trạm</th>
                  <th className="py-3 px-4">Loại Xăng</th>
                  <th className="py-3 px-4 text-right">Số Tiền (₫)</th>
                  <th className="py-3 px-4 text-right">Số Lít</th>
                  <th className="py-3 px-4 text-right">Giá/Lít</th>
                  <th className="py-3 px-4 text-right">Chỉ Số ODO</th>
                  <th className="py-3 px-4 text-center">Tác Vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {new Date(log.date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      {log.gasStation?.toLowerCase().includes("pvoil") ? (
                        <PvoilLogo size={18} variant="square" />
                      ) : (
                        <PetrolimexLogo size={18} variant="square" />
                      )}
                      <span>{log.gasStation || "Petrolimex"}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                        {log.fuelType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-rose-600">
                      -{formatCurrencyVND(log.amount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {log.liters} L
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                      {formatCurrencyVND(log.pricePerLiter)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                      {log.odoKm > 0 ? `${log.odoKm} km` : "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Xóa nhật ký"
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

      {/* Modal Ghi Nhật Ký Đổ Xăng */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Ghi Nhật Ký Đổ Xăng
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFuelLog} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số Tiền Đổ (₫) *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 100000"
                    required
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số Lít Xăng (L) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="VD: 4.65"
                    required
                    value={liters}
                    onChange={(e) => handleLitersChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Loại Nhiên Liệu
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as FuelType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-orange-500 focus:outline-hidden"
                  >
                    <option value="RON 95">Xăng RON 95 (Cao cấp)</option>
                    <option value="E5 RON 92">Xăng E5 RON 92 (Sinh học)</option>
                    <option value="Dầu DO">Dầu DO (Diesel)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Đơn Giá Tham Chiếu (₫/L)
                  </label>
                  <input
                    type="text"
                    value={pricePerLiter}
                    onChange={(e) => setPricePerLiter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chỉ Số ODO (km)
                  </label>
                  <input
                    type="number"
                    placeholder="VD: 14250"
                    value={odoKm}
                    onChange={(e) => setOdoKm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cây Xăng / Trạm Đổ
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Petrolimex Cửa Nam"
                    value={gasStation}
                    onChange={(e) => setGasStation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ngày Đổ
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-orange-500 focus:outline-hidden"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-orange-500 focus:outline-hidden"
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
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu Nhật Ký"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

