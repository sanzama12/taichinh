"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  Settings,
  User as UserIcon,
  Phone,
  MapPin,
  Calendar,
  Image as ImageIcon,
  KeyRound,
  ShieldCheck,
  Bell,
  Mail,
  PiggyBank,
  Plus,
  Check,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Upload,
  Camera,
  ImagePlus,
} from "lucide-react";
import {
  getUserSettingsAction,
  updateUserSettingsAction,
  listAccessKeysAction,
  createAccessKeyAction,
  toggleAccessKeyAction,
} from "@/actions/settings";
import {
  type UserSettingsDto,
  type AccessKeyItemDto,
} from "@/services/settings.service";
import { STRICT_PHONE_10_DIGITS_REGEX } from "@/lib/validators";
import { SystemSettingsLogo } from "@/components/icons/BrandLogos";
import { VietnamAddressSelector } from "@/components/settings/VietnamAddressSelector";

// 8 Avatar chuẩn nghệ thuật / boutique chuyên nghiệp để người dùng chọn nhanh 1-click
const PRESET_AVATARS = [
  {
    id: "av-1",
    label: "Doanh Nhân Nam",
    url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "av-2",
    label: "Quản Lý Nữ",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "av-3",
    label: "Chuyên Gia Kỹ Thuật",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "av-4",
    label: "Sáng Tạo Nữ",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "av-5",
    label: "Kinh Doanh Trẻ",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "av-6",
    label: "Tài Chính Nữ",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "av-7",
    label: "Lãnh Đạo Cao Cấp",
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "av-8",
    label: "Điều Hành Doanh Nghiệp",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
];

export default function SettingsPage() {
  const currentYear = new Date().getFullYear();
  const { update: updateSession } = useSession();
  const [settings, setSettings] = React.useState<UserSettingsDto | null>(null);
  const [accessKeys, setAccessKeys] = React.useState<AccessKeyItemDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");

  // Hồ Sơ Người Dùng (User Profile Form State)
  const [name, setName] = React.useState("");
  const [birthYear, setBirthYear] = React.useState<string>("");
  const [age, setAge] = React.useState<string>("");
  const [ageError, setAgeError] = React.useState<string>("");
  const [avatar, setAvatar] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [phoneError, setPhoneError] = React.useState("");
  const [email, setEmail] = React.useState("");

  // Cấu hình tài chính
  const [savingsRatePercent, setSavingsRatePercent] = React.useState(20);
  const [remindDaysBefore, setRemindDaysBefore] = React.useState(3);
  const [emailReminder, setEmailReminder] = React.useState(true);

  // New Key Form State (Admin only)
  const [newKey, setNewKey] = React.useState("");
  const [newKeyLabel, setNewKeyLabel] = React.useState("");
  const [newKeyRole, setNewKeyRole] = React.useState<"user" | "admin">("user");
  const [isCreatingKey, setIsCreatingKey] = React.useState(false);

  // Tham chiếu input tệp tải ảnh từ máy tính lên
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Xử lý đọc & nén tối ưu ảnh tải từ máy tính lên
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP, GIF).");
      return;
    }

    // Đọc file và tự động nén tối ưu vuông qua Canvas
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Chuẩn hóa avatar vuông 320x320 px
        const targetSize = 320;
        const width = img.width;
        const height = img.height;
        const squareSize = Math.min(width, height);
        const startX = (width - squareSize) / 2;
        const startY = (height - squareSize) / 2;

        canvas.width = targetSize;
        canvas.height = targetSize;

        if (ctx) {
          ctx.drawImage(
            img,
            startX,
            startY,
            squareSize,
            squareSize,
            0,
            0,
            targetSize,
            targetSize
          );
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
          setAvatar(compressedDataUrl);
          setSuccessMsg("Đã tải ảnh đại diện từ máy lên thành công! Bấm 'Lưu Thông Tin Hồ Sơ' để áp dụng.");
          setTimeout(() => setSuccessMsg(""), 4500);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 1. Tự động tính tuổi khi nhập năm sinh
  const handleBirthYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // Chỉ nhận chữ số
    setBirthYear(val);

    if (!val) {
      setAge("");
      setAgeError("");
      return;
    }

    const yearNum = parseInt(val, 10);
    if (yearNum >= 1900 && yearNum <= currentYear) {
      const computedAge = currentYear - yearNum;
      setAge(String(computedAge));
      setAgeError("");
    } else if (yearNum > currentYear) {
      setAgeError(`Năm sinh không thể lớn hơn năm hiện tại (${currentYear})`);
    } else if (val.length === 4 && yearNum < 1900) {
      setAgeError("Năm sinh phải từ năm 1900 trở lại đây");
    }
  };

  // 2. Tự động tính năm sinh khi nhập tuổi
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setAge(val);

    if (!val) {
      setBirthYear("");
      setAgeError("");
      return;
    }

    const ageNum = parseInt(val, 10);
    if (ageNum >= 1 && ageNum <= 120) {
      const computedYear = currentYear - ageNum;
      setBirthYear(String(computedYear));
      setAgeError("");
    } else if (ageNum > 120) {
      setAgeError("Tuổi không hợp lệ (tối đa 120)");
    }
  };

  // 3. Kiểm tra số điện thoại: BẮT BUỘC ĐÚNG 10 CHỮ SỐ BẮT ĐẦU SỐ 0
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // Chỉ nhận chữ số
    setPhone(val);

    if (!val) {
      setPhoneError("Vui lòng nhập số điện thoại (bắt buộc đúng 10 chữ số bắt đầu bằng số 0).");
      return;
    }

    if (!val.startsWith("0")) {
      setPhoneError("Số điện thoại bắt buộc phải bắt đầu bằng số 0.");
      return;
    }

    if (val.length < 10) {
      setPhoneError(`Số điện thoại chưa đủ 10 số (hiện tại: ${val.length}/10 số).`);
      return;
    }

    if (val.length > 10) {
      setPhoneError(`Số điện thoại vượt quá 10 số (hiện tại: ${val.length} số).`);
      return;
    }

    if (!STRICT_PHONE_10_DIGITS_REGEX.test(val)) {
      setPhoneError("Số điện thoại không hợp lệ (phải bắt đầu bằng số 0 và đúng 10 số).");
      return;
    }

    // Hoàn toàn hợp lệ!
    setPhoneError("");
  };

  const isPhoneValid = phone.trim().length === 10 && STRICT_PHONE_10_DIGITS_REGEX.test(phone.trim());

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getUserSettingsAction();
      if (res.isSuccess) {
        setSettings(res.data);
        setName(res.data.name || "");

        if (res.data.birthYear) {
          setBirthYear(String(res.data.birthYear));
          setAge(String(res.data.age || (currentYear - res.data.birthYear)));
        } else if (res.data.age) {
          setAge(String(res.data.age));
          setBirthYear(String(currentYear - res.data.age));
        }

        setAvatar(
          res.data.avatar ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
        );
        setAddress(res.data.address || "");
        setPhone(res.data.phone || "");
        setEmail(res.data.email || "");
        setSavingsRatePercent(res.data.savingsRatePercent ?? 20);
        setRemindDaysBefore(res.data.remindDaysBefore ?? 3);
        setEmailReminder(res.data.emailReminder ?? true);

        if (res.data.role === "admin") {
          const keysRes = await listAccessKeysAction();
          if (keysRes.isSuccess) {
            setAccessKeys(keysRes.data);
          }
        }
      }
    } catch (err) {
      console.error("Lỗi tải cài đặt:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentYear]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const cleanPhone = phone.trim();

    // KIỂM TRA CHẶT CHẼ SĐT: BẮT BUỘC ĐÚNG 10 CHỮ SỐ BẮT ĐẦU SỐ 0, SAI THÌ KHÔNG CẬP NHẬT ĐƯỢC VÀ BÁO LỖI
    if (!cleanPhone) {
      const err = "CẬP NHẬT THẤT BẠI: Số điện thoại không được để trống! Bắt buộc gồm đúng 10 chữ số bắt đầu bằng số 0.";
      setErrorMsg(err);
      setPhoneError("Vui lòng nhập số điện thoại hợp lệ.");
      return;
    }

    if (!cleanPhone.startsWith("0")) {
      const err = "CẬP NHẬT THẤT BẠI: Số điện thoại không hợp lệ! Bắt buộc phải bắt đầu bằng số 0 (Ví dụ: 0912345678).";
      setErrorMsg(err);
      setPhoneError("Số điện thoại bắt buộc phải bắt đầu bằng số 0.");
      return;
    }

    if (cleanPhone.length !== 10) {
      const err = `CẬP NHẬT THẤT BẠI: Số điện thoại phải gồm đúng 10 chữ số (hiện tại bạn đang nhập ${cleanPhone.length} số).`;
      setErrorMsg(err);
      setPhoneError(`Bắt buộc đúng 10 số. Hiện tại: ${cleanPhone.length} số.`);
      return;
    }

    if (!STRICT_PHONE_10_DIGITS_REGEX.test(cleanPhone)) {
      const err = "CẬP NHẬT THẤT BẠI: Số điện thoại chỉ được chứa 10 chữ số (0-9) và bắt đầu bằng số 0.";
      setErrorMsg(err);
      setPhoneError("Chỉ chấp nhận 10 chữ số bắt đầu bằng số 0.");
      return;
    }

    // KIỂM TRA NĂM SINH / TUỔI
    let finalAge = age.trim() ? Number(age) : undefined;
    let finalBirthYear = birthYear.trim() ? Number(birthYear) : undefined;

    if (finalBirthYear) {
      if (finalBirthYear < 1900 || finalBirthYear > currentYear) {
        setErrorMsg(`CẬP NHẬT THẤT BẠI: Năm sinh không hợp lệ (phải từ 1900 đến ${currentYear}).`);
        return;
      }
      finalAge = currentYear - finalBirthYear;
    }

    setIsSaving(true);

    try {
      const res = await updateUserSettingsAction({
        name: name.trim(),
        birthYear: finalBirthYear,
        age: finalAge,
        avatar: avatar.trim(),
        address: address.trim(),
        phone: cleanPhone,
        email: email.trim(),
        savingsRatePercent: Number(savingsRatePercent),
        remindDaysBefore: Number(remindDaysBefore),
        emailReminder,
      });

      if (res.isSuccess) {
        setSuccessMsg("Cập nhật thông tin hồ sơ và cấu hình thành công!");
        setPhoneError("");
        // Cập nhật session ngầm để thanh dọc và top header hiển thị avatar/tên mới ngay lập tức
        if (updateSession) {
          await updateSession({ name: name.trim(), image: avatar.trim() });
        }
        setTimeout(() => setSuccessMsg(""), 4500);
      } else {
        setErrorMsg("CẬP NHẬT THẤT BẠI: " + res.error);
      }
    } catch {
      setErrorMsg("Không thể lưu cấu hình, vui lòng thử lại");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    setIsCreatingKey(true);
    try {
      const res = await createAccessKeyAction(newKey, newKeyLabel, newKeyRole);
      if (res.isSuccess) {
        setNewKey("");
        setNewKeyLabel("");
        const keysRes = await listAccessKeysAction();
        if (keysRes.isSuccess) setAccessKeys(keysRes.data);
      } else {
        alert(res.error);
      }
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleToggleKey = async (keyId: string) => {
    const res = await toggleAccessKeyAction(keyId);
    if (res.isSuccess) {
      const keysRes = await listAccessKeysAction();
      if (keysRes.isSuccess) setAccessKeys(keysRes.data);
    } else {
      alert(res.error);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-24 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08]" />
        <div className="h-96 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.08]" />
      </div>
    );
  }

  const isAdmin = settings.role === "admin";

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Trang Cài Đặt */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="flex items-center gap-3.5">
          <SystemSettingsLogo size={42} variant="square" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Cài Đặt Hệ Thống & Bảo Mật AES-256
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                PROMAX SECURITY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Cập nhật hồ sơ cá nhân (Tên, Năm sinh/Tuổi tự động tính, Avatar, Nơi ở, Số điện thoại 10 số bắt đầu bằng 0)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.1] text-xs font-mono text-slate-700 dark:text-slate-200 transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Đồng bộ dữ liệu</span>
        </button>
      </div>

      {/* Thông Báo Thành Công */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Thông Báo Lỗi Rõ Ràng Khi Cập Nhật Thất Bại */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-3 shadow-md animate-shake">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <div className="flex-1">
            <span className="block font-black">{errorMsg}</span>
            <span className="block text-[11px] font-mono text-rose-500 dark:text-rose-400 mt-0.5">
              Yêu cầu: Số điện thoại phải gồm đúng 10 chữ số bắt đầu bằng số 0 (Ví dụ: 0912345678).
            </span>
          </div>
        </div>
      )}

      {/* 2. Thẻ Tổng Quan Hồ Sơ Hiện Tại */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              title="Bấm để tải ảnh đại diện từ máy tính lên"
              className="relative group cursor-pointer"
            >
              <img
                src={avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                alt={name || "User Avatar"}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/60 shadow-md transition-all group-hover:brightness-75 group-hover:ring-2 group-hover:ring-emerald-500"
              />
              <div className="absolute inset-0 rounded-2xl bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white drop-shadow" />
                <span className="text-[9px] font-mono font-bold text-white mt-0.5">Tải ảnh</span>
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#090e17]" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {name || "Người Dùng"}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${
                    isAdmin
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border-blue-300 dark:border-blue-500/30"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30"
                  }`}
                >
                  {isAdmin ? "Quản Trị Viên (Admin)" : "Người Dùng (User)"}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono flex-wrap">
                {birthYear && <span>Năm sinh: <strong className="text-slate-800 dark:text-slate-200">{birthYear}</strong></span>}
                {age && <span>Tuổi: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{age} tuổi</strong></span>}
                {phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-500" />
                    <strong className="text-slate-800 dark:text-slate-200">{phone}</strong>
                  </span>
                )}
                {address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-500" />
                    <span>{address}</span>
                  </span>
                )}
              </div>

              <p className="text-[11px] font-mono text-slate-400">
                Mã khóa đăng nhập:{" "}
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {settings.accessKey || "PROMAX-USER"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-mono self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4" />
            <span>Mã hóa AES-256 bảo mật</span>
          </div>
        </div>
      </div>

      {/* 3. Form Cập Nhật Hồ Sơ Người Dùng (Tên, Năm sinh/Tuổi tự động tính, Avatar, Nơi ở, SĐT 10 số bắt đầu bằng 0) */}
      <form
        onSubmit={handleSaveSettings}
        className="p-6 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-6"
      >
        <div className="pb-3 border-b border-slate-200/80 dark:border-white/[0.06]">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>THÔNG TIN HỒ SƠ NGƯỜI DÙNG</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Nhập năm sinh để tuổi tự động tính toán. Số điện thoại bắt buộc gồm đúng 10 số bắt đầu bằng số 0.
          </p>
        </div>

        {/* Khu vực Chọn Avatar Nhanh hoặc Tải Ảnh Từ Máy Lên */}
        <div className="space-y-4 p-5 rounded-xl bg-slate-50 dark:bg-[#030712] border border-slate-200/80 dark:border-white/[0.06]">
          {/* Input file ẩn để người dùng chọn ảnh từ máy */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-500" />
              <span>Ảnh Đại Diện (Avatar)</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              Hỗ trợ: Tải trực tiếp từ máy tính (PNG, JPG, WEBP) hoặc chọn mẫu chân dung
            </span>
          </div>

          {/* Hàng nút nổi bật: Tải ảnh từ máy lên */}
          <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Upload className="w-4 h-4" />
              <span>TẢI ẢNH TỪ MÁY LÊN (PNG, JPG, WEBP)</span>
            </button>

            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-mono">
              Hệ thống tự động cắt vuông chuẩn 320x320 & nén tối ưu bảo vệ dữ liệu.
            </span>

            {avatar.startsWith("data:image") && (
              <span className="ml-auto px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Đang dùng ảnh tải từ máy tính của bạn
              </span>
            )}
          </div>

          {/* Thư viện Preset Avatars Grid */}
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Hoặc chọn nhanh từ thư viện chân dung doanh nhân chuẩn:
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {PRESET_AVATARS.map((av) => {
                const isSelected = avatar === av.url;
                return (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => setAvatar(av.url)}
                    title={av.label}
                    className={`group relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-500 ring-2 ring-emerald-500/30 scale-105"
                        : "border-transparent hover:border-slate-300 dark:hover:border-white/20 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ô Nhập URL Ảnh Tùy Chỉnh */}
          <div className="pt-1">
            <input
              type="text"
              placeholder="Hoặc dán đường dẫn ảnh tùy chỉnh (VD: https://images.unsplash.com/...)"
              value={avatar.startsWith("data:image") ? "(Đang dùng ảnh tải từ máy tính của bạn)" : avatar}
              onChange={(e) => {
                if (!e.target.value.includes("(Đang dùng ảnh")) {
                  setAvatar(e.target.value);
                }
              }}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.1] text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Các Trường Thông Tin Chi Tiết */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Họ và tên */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Họ và Tên</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Nguyễn Văn Người Dùng"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/[0.1] text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* 2. Năm Sinh & Tuổi (Tự Động Tính Toán Liên Kết 2 Chiều) */}
          <div className="grid grid-cols-2 gap-3">
            {/* 2A: Năm sinh */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Năm Sinh</span>
                </label>
                <span className="text-[10px] text-blue-500 font-mono font-bold">
                  Nhập năm
                </span>
              </div>
              <input
                type="text"
                maxLength={4}
                placeholder="VD: 2000"
                value={birthYear}
                onChange={handleBirthYearChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/[0.1] text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>

            {/* 2B: Tuổi (Tự động tính từ Năm sinh) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tuổi</span>
                </label>
                {age && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1 py-0.2 rounded">
                    Tự động
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder={birthYear ? `${currentYear - Number(birthYear)} tuổi` : "Tự động tính"}
                value={age}
                onChange={handleAgeChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#060a12] border border-slate-200 dark:border-white/[0.1] text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          {ageError && (
            <div className="md:col-span-2 -mt-3">
              <p className="text-[11px] text-rose-500 font-mono">{ageError}</p>
            </div>
          )}

          {/* 3. Số điện thoại (Bắt buộc đúng 10 số, bắt đầu số 0 - SAI THÌ KHÔNG CẬP NHẬT ĐƯỢC VÀ BÁO) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Số Điện Thoại (10 Chữ Số)</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              {isPhoneValid ? (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 10 số hợp lệ
                </span>
              ) : phone.length > 0 ? (
                <span className="text-[11px] text-rose-600 dark:text-rose-400 font-mono font-bold bg-rose-500/10 px-2 py-0.5 rounded-md">
                  {phone.length}/10 số (Bắt đầu 0)
                </span>
              ) : null}
            </div>

            <div className="relative">
              <input
                type="tel"
                maxLength={10}
                required
                placeholder="Bắt buộc đúng 10 số, bắt đầu bằng 0 (VD: 0912345678)"
                value={phone}
                onChange={handlePhoneChange}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#030712] border text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden transition-all ${
                  phoneError
                    ? "border-rose-500 focus:border-rose-500 ring-2 ring-rose-500/20"
                    : isPhoneValid
                    ? "border-emerald-500 focus:border-emerald-500 ring-2 ring-emerald-500/20"
                    : "border-slate-200 dark:border-white/[0.1] focus:border-emerald-500"
                }`}
              />
              {isPhoneValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-3" />
              ) : phoneError ? (
                <XCircle className="w-4 h-4 text-rose-500 absolute right-3 top-3" />
              ) : null}
            </div>

            {phoneError ? (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-mono font-bold flex items-center gap-1 pt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{phoneError}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 font-mono">
                Bắt buộc: Đúng 10 chữ số và bắt đầu bằng số 0 (Ví dụ: 0912345678, 0388889999).
              </p>
            )}
          </div>

          {/* 4. Nơi ở / Địa chỉ Hành chính chuẩn Việt Nam (Tích hợp API 63 Tỉnh Thành & Phường Xã, chỉ nhập số nhà) */}
          <div className="md:col-span-2">
            <VietnamAddressSelector
              value={address}
              onChange={(newAddr) => setAddress(newAddr)}
            />
          </div>

          {/* 5. Email */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-500" />
              <span>Email Nhận Thông Báo</span>
            </label>
            <input
              type="email"
              placeholder="VD: user@promax-finance.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/[0.1] text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Nút Submit Lưu */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-mono font-bold text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? "Đang lưu thông tin..." : "Lưu Thông Tin Hồ Sơ"}</span>
          </button>
        </div>
      </form>

      {/* 4. Quản Trị Cấp Phát Mã Khóa (Chỉ hiển thị cho Admin, chỉ có 2 vai trò: user & admin) */}
      {isAdmin && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#090e17] border border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-200/80 dark:border-white/[0.06]">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-500" />
              <span>QUẢN TRỊ MÃ KHÓA TRUY CẬP (2 VAI TRÒ: ADMIN & USER)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Cấp phát mã khóa bản quyền cho thành viên mới với vai trò Người Dùng (User) hoặc Quản Trị Viên (Admin)
            </p>
          </div>

          {/* Form cấp mã khóa mới */}
          <form
            onSubmit={handleCreateKey}
            className="p-4 rounded-xl bg-slate-50 dark:bg-[#030712] border border-slate-200/80 dark:border-white/[0.06] flex flex-col md:flex-row items-end gap-3"
          >
            <div className="flex-1 space-y-1 w-full">
              <label className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                Mã Khóa (Viết hoa)
              </label>
              <input
                type="text"
                required
                placeholder="VD: PROMAX-USER-9999"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.1] text-xs font-mono text-slate-900 dark:text-white uppercase focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="flex-1 space-y-1 w-full">
              <label className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                Tên Người Dùng / Đối Tượng
              </label>
              <input
                type="text"
                required
                placeholder="VD: Trần Thị Khách Hàng"
                value={newKeyLabel}
                onChange={(e) => setNewKeyLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.1] text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="w-full md:w-44 space-y-1">
              <label className="text-[11px] font-mono text-slate-600 dark:text-slate-400">Vai trò</label>
              <select
                value={newKeyRole}
                onChange={(e) => setNewKeyRole(e.target.value as "user" | "admin")}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#090e17] border border-slate-200 dark:border-white/[0.1] text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              >
                <option value="user">Người Dùng (User)</option>
                <option value="admin">Quản Trị Viên (Admin)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isCreatingKey}
              className="w-full md:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-mono font-bold text-white flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cấp khóa</span>
            </button>
          </form>

          {/* Danh sách mã khóa hiện hữu */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/[0.06] text-slate-500 dark:text-slate-400 uppercase text-[11px]">
                  <th className="py-2.5 px-3">Mã Khóa</th>
                  <th className="py-2.5 px-3">Người Dùng</th>
                  <th className="py-2.5 px-3">Vai Trò</th>
                  <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                  <th className="py-2.5 px-3 text-center">Đăng nhập gần nhất</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {accessKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{k.key}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{k.label}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          k.role === "admin"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-200 dark:border-blue-500/25"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/25"
                        }`}
                      >
                        {k.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          k.isActive
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400"
                        }`}
                      >
                        {k.isActive ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400">
                      {k.lastLoginAt ? new Date(k.lastLoginAt).toLocaleDateString("vi-VN") : "Chưa đăng nhập"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleKey(k.id)}
                        className={`text-[11px] underline underline-offset-2 cursor-pointer ${
                          k.isActive
                            ? "text-rose-600 dark:text-rose-400 hover:text-rose-500"
                            : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-500"
                        }`}
                      >
                        {k.isActive ? "Vô hiệu hóa" : "Kích hoạt lại"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
