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

