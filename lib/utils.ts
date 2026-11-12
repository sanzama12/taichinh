import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Gộp classNames với Tailwind Merge và CLSX
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Định dạng tiền tệ VND chuẩn: 15.000.000 ₫
 * VND không có phần thập phân nên luôn làm tròn số nguyên
 */
export function formatCurrencyVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "0 ₫";
  }
  const roundedAmount = Math.round(amount);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(roundedAmount);
}

/**
 * Định dạng ngày theo chuẩn Việt Nam DD/MM/YYYY
 */
export function formatDateVN(dateInput: Date | string | number): string {
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : new Date(dateInput);
    if (isNaN(date.getTime())) return "--/--/----";
    return format(date, "dd/MM/yyyy", { locale: vi });
  } catch {
    return "--/--/----";
  }
}

/**
 * Định dạng ngày giờ chi tiết: DD/MM/YYYY HH:mm
 */
export function formatDateTimeVN(dateInput: Date | string | number): string {
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : new Date(dateInput);
    if (isNaN(date.getTime())) return "--/--/---- --:--";
    return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
  } catch {
    return "--/--/---- --:--";
  }
}

/**
 * Tính ngày đến hạn thực tế trong tháng (xử lý ngày 29-31 ở các tháng ngắn)
 * Ví dụ dueDay = 31 nhưng tháng 2 năm 2026 chỉ có 28 ngày -> trả về ngày 28
 */
export function calculateActualDueDate(dueDay: number, month: number, year: number): Date {
  const daysInMonth = new Date(year, month, 0).getDate();
  const safeDay = Math.min(Math.max(1, dueDay), daysInMonth);
  return new Date(year, month - 1, safeDay, 23, 59, 59, 999);
}

/**
 * Mẫu Result Pattern chuẩn mực theo ProMax guidelines
 */
export type Result<T, E = string> =
  | { isSuccess: true; data: T; error?: never }
  | { isSuccess: false; error: E; data?: never };

export const Result = {
  ok: <T>(data: T): Result<T, never> => ({ isSuccess: true, data }),
  fail: <E>(error: E): Result<never, E> => ({ isSuccess: false, error }),
};

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * Chuẩn hóa chuỗi thời gian 24h từ người dùng:
 * - Hỗ trợ nhập trực tiếp: "19", "7", "19h", "7h", "19h30", "7h15", "19.30", "19:08", "1930"
 * - Luôn chuyển đổi về định dạng chuẩn 24h: "HH:mm" (từ "00:00" đến "23:59")
 * - 19h = 19:00 (Giờ tối), 7h = 07:00 (Giờ sáng)
 * - Tuyệt đối không cần AM / PM
 */
export function normalize24hTime(rawInput?: string): string {
  if (!rawInput) {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  const raw = rawInput.trim().toLowerCase().replace(/\s+/g, "");
  if (!raw) {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  // 1. Dạng "19h30", "7h15", "19h", "7h"
  const hMatch = raw.match(/^(\d{1,2})h(?:(\d{1,2}))?$/);
  if (hMatch) {
    let hour = parseInt(hMatch[1], 10);
    const minute = hMatch[2] ? parseInt(hMatch[2], 10) : 0;
    hour = Math.min(Math.max(hour, 0), 23);
    const validMin = Math.min(Math.max(minute, 0), 59);
    return `${String(hour).padStart(2, "0")}:${String(validMin).padStart(2, "0")}`;
  }

  // 2. Dạng "19:30", "7:08", "19.30", "7.8"
  const colonMatch = raw.match(/^(\d{1,2})[:.](\d{1,2})$/);
  if (colonMatch) {
    let hour = parseInt(colonMatch[1], 10);
    let minute = parseInt(colonMatch[2], 10);
    hour = Math.min(Math.max(hour, 0), 23);
    minute = Math.min(Math.max(minute, 0), 59);
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  // 3. Dạng chỉ toàn số: "7", "19", "708", "1930"
  if (/^\d{1,4}$/.test(raw)) {
    if (raw.length <= 2) {
      let hour = parseInt(raw, 10);
      hour = Math.min(Math.max(hour, 0), 23);
      return `${String(hour).padStart(2, "0")}:00`;
    }
    if (raw.length === 3) {
      let hour: number;
      let minute: number;
      if (parseInt(raw[0], 10) > 2) {
        hour = parseInt(raw[0], 10);
        minute = parseInt(raw.slice(1), 10);
      } else {
        hour = parseInt(raw.slice(0, 2), 10);
        minute = parseInt(raw.slice(2), 10) * 10;
        if (hour > 23) {
          hour = parseInt(raw[0], 10);
          minute = parseInt(raw.slice(1), 10);
        }
      }
      hour = Math.min(Math.max(hour, 0), 23);
      minute = Math.min(Math.max(minute, 0), 59);
      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
    if (raw.length === 4) {
      let hour = parseInt(raw.slice(0, 2), 10);
      let minute = parseInt(raw.slice(2), 10);
      hour = Math.min(Math.max(hour, 0), 23);
      minute = Math.min(Math.max(minute, 0), 59);
      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
  }

  return raw;
}

/**
 * Tự động chèn dấu hai chấm ":" khi gõ giờ (giờ tự :):
 * - Khi gõ 2 chữ số (VD: 19) -> tự thành "19:"
 * - Khi gõ tiếp 15 -> tự thành "19:15"
 * - Hỗ trợ xóa lùi (Backspace) mượt mà không bị kẹt dấu :
 * - Giữ nguyên nếu người dùng gõ chữ h (VD: 19h)
 */
export function formatTimeWithAutoColon(val: string, prevVal = ""): string {
  // Nếu người dùng bấm Backspace
  if (prevVal && val.length < prevVal.length) {
    if (prevVal.endsWith(":") && !val.endsWith(":")) {
      return val.slice(0, -1);
    }
    return val;
  }

  // Giữ lại ký tự h/H nếu người dùng gõ dạng 19h
  if (/[hH]/.test(val)) {
    return val;
  }

  // Lọc chỉ lấy chữ số
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (!digits) return "";

  if (digits.length === 1) {
    return digits;
  }

  if (digits.length === 2) {
    let hour = parseInt(digits, 10);
    if (hour > 23) hour = 23;
    return `${String(hour).padStart(2, "0")}:`;
  }

  if (digits.length === 3) {
    if (parseInt(digits[0], 10) > 2) {
      // 715 -> 07:15
      const h = parseInt(digits[0], 10);
      const m = digits.slice(1);
      return `0${h}:${m}`;
    }
    const h = parseInt(digits.slice(0, 2), 10);
    const validH = Math.min(h, 23);
    const m = digits.slice(2);
    return `${String(validH).padStart(2, "0")}:${m}`;
  }

  if (digits.length === 4) {
    const h = parseInt(digits.slice(0, 2), 10);
    const m = parseInt(digits.slice(2, 4), 10);
    const validH = Math.min(h, 23);
    const validM = Math.min(m, 59);
    return `${String(validH).padStart(2, "0")}:${String(validM).padStart(2, "0")}`;
  }

  return val;
}

/**
 * Công thức tính cước Be chuẩn xác (theo thực tế biên lai Be & Thuế TNCN):
 * - Cước phí đơn hàng trước thuế: C (VD: 35.477 ₫)
 * - Phí sử dụng dịch vụ (phí sàn): 24.4243% cước trước thuế (VD: 35.477 * 24.4243% = 8.665 ₫)
 * - Doanh thu sau phí sàn: Cước - Phí sàn (VD: 35.477 - 8.665 = 26.812 ₫)
 * - Thuế TNCN: 1.5% trên Doanh thu sau phí sàn (VD: 26.812 * 1.5% = 402 ₫)
 * - Thực nhận tài xế: Cước - Phí sàn - Thuế TNCN (VD: 35.477 - 8.665 - 402 = 26.410 ₫)
 */
export function calculateBeFareBreakdown(
  fareBeforeTax: number,
  customFee?: number,
  customTax?: number
) {
  const safeFare = Math.max(0, Math.round(fareBeforeTax));

  // Phí sàn: Nếu người dùng truyền customFee thì dùng, ngược lại tự tính 24.4243%
  const platformFee =
    customFee !== undefined && customFee >= 0
      ? Math.round(customFee)
      : Math.round(safeFare * 0.244243);

  // Doanh thu sau sàn chịu thuế TNCN
  const taxableIncome = Math.max(0, safeFare - platformFee);

  // Thuế TNCN: 1.5% trên doanh thu sau sàn (hoặc số người dùng tự nhập)
  const taxTncn =
    customTax !== undefined && customTax >= 0
      ? Math.round(customTax)
      : Math.round(taxableIncome * 0.015);

  // Thực nhận tài xế
  const driverEarnings = Math.max(0, safeFare - platformFee - taxTncn);

  return {
    customerFare: safeFare,
    platformFee,
    taxTncn,
    driverEarnings,
  };
}

export interface TimeSessionInfo {
  session: "morning" | "afternoon" | "evening" | "night";
  label: string;
  shortLabel: string;
  icon: string;
  badgeClass: string;
}

/**
 * Phân loại thời điểm trong ngày theo thói quen chạy xe tại Việt Nam:
 * - 05:00 - 11:59: ☀️ Giờ sáng
 * - 12:00 - 17:59: 🌤️ Giờ chiều
 * - 18:00 - 22:59: 🌙 Giờ tối (19h là Giờ tối)
 * - 23:00 - 04:59: 🌃 Giờ khuya
 */
export function getTimeSession(timeStr?: string): TimeSessionInfo {
  if (!timeStr) {
    return {
      session: "morning",
      label: "Giờ sáng",
      shortLabel: "Sáng",
      icon: "☀️",
      badgeClass:
        "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20",
    };
  }

  const match = timeStr.match(/^(\d{1,2})/);
  const hour = match ? parseInt(match[1], 10) : 0;

  if (hour >= 5 && hour < 12) {
    return {
      session: "morning",
      label: "Giờ sáng",
      shortLabel: "Sáng",
      icon: "☀️",
      badgeClass:
        "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/30",
    };
  }

  if (hour >= 12 && hour < 18) {
    return {
      session: "afternoon",
      label: "Giờ chiều",
      shortLabel: "Chiều",
      icon: "🌤️",
      badgeClass:
        "text-sky-700 dark:text-sky-300 bg-sky-500/10 border-sky-500/30",
    };
  }

  if (hour >= 18 && hour < 23) {
    return {
      session: "evening",
      label: "Giờ tối",
      shortLabel: "Tối",
      icon: "🌙",
      badgeClass:
        "text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 border-indigo-500/30",
    };
  }

  return {
    session: "night",
    label: "Giờ khuya",
    shortLabel: "Khuya",
    icon: "🌃",
    badgeClass:
      "text-purple-700 dark:text-purple-300 bg-purple-500/10 border-purple-500/30",
  };
}

