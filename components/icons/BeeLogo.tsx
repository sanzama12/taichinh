"use client";

import * as React from "react";

interface BeeIconProps {
  size?: number;
  className?: string;
  variant?: "badge" | "square" | "circle";
}

/**
 * Logo chính thức của Be Group (beBike, beCar, beDelivery, beFood)
 * Màu sắc chủ đạo: Vàng Be (#FFC700 / #FFCE00) kết hợp chữ đen (#111827)
 */
export function BeeIconSvg({ size = 32, className = "", variant = "badge" }: BeeIconProps) {
  const rx = variant === "circle" ? 20 : variant === "square" ? 6 : 10;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      {/* Nền vàng thương hiệu đặc trưng Be Group */}
      <rect width="40" height="40" rx={rx} fill="#FFC700" />

      {/* Vector chuẩn chữ 'b' lowercase thương hiệu Be */}
      <path
        d="M9.5 8H14.2V17.2C15.2 16.2 16.6 15.6 18.2 15.6C21.8 15.6 24.4 18.4 24.4 22.8C24.4 27.2 21.8 30 18.2 30C16.6 30 15.2 29.3 14.2 28.3V29.6H9.5V8ZM17 19.6C15.2 19.6 14 21 14 22.8C14 24.6 15.2 26 17 26C18.8 26 20 24.6 20 22.8C20 21 18.8 19.6 17 19.6Z"
        fill="#111827"
      />

      {/* Vector chuẩn chữ 'e' lowercase thương hiệu Be */}
      <path
        d="M31.2 22.8H25.4C25.7 24.8 27.1 26 29 26C30.2 26 31 25.4 31.6 24.5L34.8 25.9C33.6 28.4 31.4 30 29 30C24.8 30 21.8 26.8 21.8 22.8C21.8 18.8 24.8 15.6 29 15.6C33 15.6 35.4 18.8 35 23.6H31.2ZM31.1 19.8C30.8 18.4 29.8 17.6 28.6 17.6C27.2 17.6 26 18.6 25.5 19.8H31.1Z"
        fill="#111827"
      />
    </svg>
  );
}

/**
 * Huy hiệu Chữ Be (Be Badge) phong cách hiện đại với viền đổ bóng
 */
export function BeeBadge({
  text = "be",
  subText = "Partner",
  className = "",
}: {
  text?: string;
  subText?: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FFC700] text-[#111827] font-bold shadow-xs select-none ${className}`}
    >
      <BeeIconSvg size={18} variant="square" />
      <span className="font-sans font-black text-xs tracking-tight text-[#111827]">
        {text}
      </span>
      {subText && (
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#111827]/80 bg-[#111827]/10 px-1.5 py-0.2 rounded-md">
          {subText}
        </span>
      )}
    </div>
  );
}

/**
 * 1. LOGO DỊCH VỤ beBike (Xe ôm công nghệ chở khách 2 bánh)
 */
export function BeBikeIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      <rect width="24" height="24" rx="5" fill="#FFC700" />
      <path
        d="M5.5 16a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm13 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
        stroke="#111827"
        strokeWidth="1.6"
      />
      <path
        d="M8 13.5h4l2.5-4h3M12 9.5l-2.5 4M14 6.5h3"
        stroke="#111827"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 2. LOGO DỊCH VỤ be GIAO HÀNG SIÊU TỐC (Hỏa tốc liên quận & nội thành)
 */
export function BeExpressIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      <rect width="24" height="24" rx="5" fill="#EF4444" />
      <path
        d="M13 3L6 13h5l-2 8 8-11h-5l2-7z"
        fill="#FFFFFF"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 3. LOGO DỊCH VỤ be GIAO HÀNG TIẾT KIỆM (Giao nhiều điểm, hẹn giờ & tối ưu cước)
 */
export function BeEconomyIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      <rect width="24" height="24" rx="5" fill="#10B981" />
      <path
        d="M12 4L4.5 8.2v7.6L12 20l7.5-4.2V8.2L12 4z"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M4.8 8.3L12 12.3l7.2-4M12 12.3V20"
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/**
 * 4. LOGO DỊCH VỤ be GIAO HÀNG DOANH NGHIỆP (Đối tác B2B, Hóa đơn VAT, hợp đồng)
 */
export function BeCorporateIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      <rect width="24" height="24" rx="5" fill="#6366F1" />
      <path
        d="M4 19.5h16M6 19.5V7a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v12.5M14 19.5V11a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v8.5"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="9" cy="9.5" r="0.8" fill="#FFFFFF" />
      <circle cx="11.5" cy="9.5" r="0.8" fill="#FFFFFF" />
      <circle cx="9" cy="13" r="0.8" fill="#FFFFFF" />
      <circle cx="11.5" cy="13" r="0.8" fill="#FFFFFF" />
      <circle cx="9" cy="16.5" r="0.8" fill="#FFFFFF" />
      <circle cx="11.5" cy="16.5" r="0.8" fill="#FFFFFF" />
      <circle cx="16.5" cy="13.5" r="0.8" fill="#FFFFFF" />
      <circle cx="16.5" cy="16.5" r="0.8" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * 5. LOGO DỊCH VỤ beFood (Giao đồ ăn & Thức uống)
 */
export function BeFoodIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      <rect width="24" height="24" rx="5" fill="#F97316" />
      <path
        d="M6 14h12M7.5 14v1.5a4.5 4.5 0 0 0 9 0V14M6.5 11c0-3 2.5-5 5.5-5s5.5 2 5.5 5H6.5z"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 4v2"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}


