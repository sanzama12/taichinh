"use client";

import * as React from "react";
import {
  MapPin,
  Building2,
  Navigation,
  Home,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";
import {
  getVietnamProvinces,
  getDistrictsByProvince,
  getWardsByDistrict,
  type ProvinceItem,
  type DistrictItem,
  type WardItem,
} from "@/lib/vietnam-locations";

interface VietnamAddressSelectorProps {
  value: string;
  onChange: (fullAddress: string) => void;
}

export function VietnamAddressSelector({
  value,
  onChange,
}: VietnamAddressSelectorProps) {
  const [provinces, setProvinces] = React.useState<ProvinceItem[]>([]);
  const [districts, setDistricts] = React.useState<DistrictItem[]>([]);
  const [wards, setWards] = React.useState<WardItem[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = React.useState<string>("");
  const [selectedDistrictId, setSelectedDistrictId] = React.useState<string>("");
  const [selectedWardId, setSelectedWardId] = React.useState<string>("");
  const [houseNumber, setHouseNumber] = React.useState<string>("");

  const [isLoadingProvinces, setIsLoadingProvinces] = React.useState<boolean>(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = React.useState<boolean>(false);
  const [isLoadingWards, setIsLoadingWards] = React.useState<boolean>(false);

  // 1. Tải danh mục 63 Tỉnh/Thành phố toàn quốc
  React.useEffect(() => {
    let isMounted = true;
    async function loadProvinces() {
      setIsLoadingProvinces(true);
      try {
        const data = await getVietnamProvinces();
        if (isMounted) {
          setProvinces(data);
        }
      } catch (err) {
        console.error("Lỗi tải Tỉnh/Thành:", err);
      } finally {
        if (isMounted) setIsLoadingProvinces(false);
      }
    }
    loadProvinces();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Tải toàn bộ Quận / Huyện / Thị xã / TP thuộc tỉnh
  React.useEffect(() => {
    if (!selectedProvinceId) {
      setDistricts([]);
      setWards([]);
      setSelectedDistrictId("");
      setSelectedWardId("");
      return;
    }

    let isMounted = true;
    async function loadDistricts() {
      setIsLoadingDistricts(true);
      try {
        const data = await getDistrictsByProvince(selectedProvinceId);
        if (isMounted) {
          setDistricts(data);
          setWards([]);
          setSelectedDistrictId("");
          setSelectedWardId("");
        }
      } catch (err) {
        console.error("Lỗi tải Quận/Huyện:", err);
      } finally {
        if (isMounted) setIsLoadingDistricts(false);
      }
    }
    loadDistricts();
    return () => {
      isMounted = false;
    };
  }, [selectedProvinceId]);

  // 3. Tải toàn bộ Phường / Xã / Thị trấn thuộc Quận/Huyện
  React.useEffect(() => {
    if (!selectedProvinceId || !selectedDistrictId) {
      setWards([]);
      setSelectedWardId("");
      return;
    }

    let isMounted = true;
    async function loadWards() {
      setIsLoadingWards(true);
      try {
        const data = await getWardsByDistrict(selectedProvinceId, selectedDistrictId);
        if (isMounted) {
          setWards(data);
          setSelectedWardId("");
        }
      } catch (err) {
        console.error("Lỗi tải Phường/Xã:", err);
      } finally {
        if (isMounted) setIsLoadingWards(false);
      }
    }
    loadWards();
    return () => {
      isMounted = false;
    };
  }, [selectedProvinceId, selectedDistrictId]);

  // 4. Tự động hợp nhất thành Địa chỉ hoàn chỉnh
  const updateFullAddress = React.useCallback(
    (
      provId: string,
      distId: string,
      wardId: string,
      house: string
    ) => {
      const province = provinces.find((p) => p.id === provId);
      const district = districts.find((d) => d.id === distId);
      const ward = wards.find((w) => w.id === wardId);

      const parts: string[] = [];
      const cleanHouse = house.trim();
      if (cleanHouse) parts.push(cleanHouse);
      if (ward) parts.push(ward.name);
      if (district) parts.push(district.name);
      if (province) parts.push(province.name);

      if (parts.length > 0) {
        onChange(parts.join(", "));
      }
    },
    [provinces, districts, wards, onChange]
  );

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedProvinceId(pId);
    setSelectedDistrictId("");
    setSelectedWardId("");
    updateFullAddress(pId, "", "", houseNumber);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dId = e.target.value;
    setSelectedDistrictId(dId);
    setSelectedWardId("");
    updateFullAddress(selectedProvinceId, dId, "", houseNumber);
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wId = e.target.value;
    setSelectedWardId(wId);
    updateFullAddress(selectedProvinceId, selectedDistrictId, wId, houseNumber);
  };

  const handleHouseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHouseNumber(val);
    updateFullAddress(selectedProvinceId, selectedDistrictId, selectedWardId, val);
  };

  const selectedProvinceName = provinces.find((p) => p.id === selectedProvinceId)?.name;
  const selectedDistrictName = districts.find((d) => d.id === selectedDistrictId)?.name;
  const selectedWardName = wards.find((w) => w.id === selectedWardId)?.name;

  return (
    <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-[#030712] border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
      {/* Header hướng dẫn */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
          <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            NƠI Ở / ĐỊA CHỈ HÀNH CHÍNH (ĐẦY ĐỦ 63 TỈNH THÀNH & 10.040 PHƯỜNG XÃ)
          </h4>
        </div>
        <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          Toàn Bộ 63 Tỉnh Thành • 696 Quận Huyện • 10.040 Phường Xã
        </span>
      </div>

      {/* 3 Dropdown Tự Động (Chọn đúng là tự hiện, không cần nhập tay) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* 1. Tỉnh / Thành phố (Đầy đủ 63 tỉnh thành) */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              <span>1. Tỉnh / Thành Phố</span>
            </span>
            {isLoadingProvinces && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
          </label>
          <div className="relative">
            <select
              value={selectedProvinceId}
              onChange={handleProvinceChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.1] text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 transition-colors appearance-none pr-8 cursor-pointer shadow-2xs"
            >
              <option value="">-- Chọn Tỉnh / Thành Phố (63 Tỉnh) --</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* 2. Quận / Huyện / Thị xã */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-amber-500" />
              <span>2. Quận / Huyện / Thị Xã</span>
            </span>
            {isLoadingDistricts && <Loader2 className="w-3 h-3 animate-spin text-amber-500" />}
          </label>
          <div className="relative">
            <select
              disabled={!selectedProvinceId || districts.length === 0}
              value={selectedDistrictId}
              onChange={handleDistrictChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.1] text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 transition-colors appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
            >
              <option value="">
                {!selectedProvinceId
                  ? "-- Vui lòng chọn Tỉnh trước --"
                  : districts.length === 0
                  ? "-- Đang tải danh sách Quận/Huyện... --"
                  : `-- Chọn Quận/Huyện (${districts.length} đơn vị) --`}
              </option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* 3. Phường / Xã / Thị trấn */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-emerald-500" />
              <span>3. Phường / Xã / Thị Trấn</span>
            </span>
            {isLoadingWards && <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />}
          </label>
          <div className="relative">
            <select
              disabled={!selectedDistrictId || wards.length === 0}
              value={selectedWardId}
              onChange={handleWardChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.1] text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 transition-colors appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
            >
              <option value="">
                {!selectedDistrictId
                  ? "-- Vui lòng chọn Quận/Huyện trước --"
                  : wards.length === 0
                  ? "-- Đang tải danh sách Phường/Xã... --"
                  : `-- Chọn Phường/Xã (${wards.length} đơn vị) --`}
              </option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Ô Nhập Duy Nhất: Chỉ nhập địa chỉ chính xác nhà ở mới được nhập */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Home className="w-4 h-4 text-emerald-600" />
            <span>4. Địa Chỉ Chính Xác Nhà Ở (Số nhà, tên ngõ/ngách, tên đường phố)</span>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
              Chỉ nhập ô này
            </span>
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            Tỉnh, Quận, Phường chọn ở 3 menu trên
          </span>
        </div>
        <input
          type="text"
          placeholder="VD: Số 123 ngõ 45 đường Hoàng Quốc Việt, Tòa nhà Keangnam Tower..."
          value={houseNumber}
          onChange={handleHouseChange}
          className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.1] text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 ring-1 ring-transparent focus:ring-emerald-500/20 transition-all shadow-2xs"
        />
      </div>

      {/* Thẻ Xem Trước Địa Chỉ Hoàn Chỉnh */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#090e17] border border-emerald-500/30 dark:border-emerald-500/20 space-y-1.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ĐỊA CHỈ HOÀN CHỈNH SẼ LƯU VÀO HỒ SƠ:
          </span>
          {value && (
            <span className="text-[10px] font-mono text-slate-400">
              Đồng bộ tự động
            </span>
          )}
        </div>

        <p className="text-sm font-mono font-black text-slate-900 dark:text-white break-words">
          {value || "Chưa thiết lập địa chỉ. Vui lòng chọn Tỉnh, Quận, Phường và nhập số nhà bên trên."}
        </p>

        {(selectedProvinceName || selectedDistrictName || selectedWardName || houseNumber) && (
          <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex-wrap">
            {selectedProvinceName && (
              <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20 font-bold">
                Tỉnh: {selectedProvinceName}
              </span>
            )}
            {selectedDistrictName && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 font-bold">
                Quận: {selectedDistrictName}
              </span>
            )}
            {selectedWardName && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 font-bold">
                Phường: {selectedWardName}
              </span>
            )}
            {houseNumber && (
              <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 font-bold">
                Số nhà: {houseNumber}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
