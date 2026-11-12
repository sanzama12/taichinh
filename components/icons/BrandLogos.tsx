"use client";

import * as React from "react";

interface BrandIconProps {
  size?: number;
  className?: string;
  variant?: "square" | "circle" | "badge" | "raw";
}

/**
 * 1. LOGO CHÍNH THỨC CỦA TẬP ĐOÀN XĂNG DẦU VIỆT NAM (PETROLIMEX)
 * - Màu xanh dương Petrolimex (#004B87)
 * - Chữ 'P' trắng in hoa cách điệu
 * - Giọt xăng màu cam rực rỡ (#F58220) bên trong lòng chữ P
 */
export function PetrolimexLogo({ size = 28, className = "", variant = "square" }: BrandIconProps) {
  const rx = variant === "circle" ? 20 : variant === "square" ? 6 : 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Petrolimex - Tập đoàn Xăng dầu Việt Nam"
    >
      {/* Nền xanh dương nhận diện Petrolimex */}
      <rect width="40" height="40" rx={rx} fill="#004B87" />

      {/* Chữ P đậm Petrolimex */}
      <path
        d="M11 8H23C27.4 8 30.5 10.8 30.5 15.2C30.5 19.6 27.4 22.4 23 22.4H17.2V32H11V8Z"
        fill="#FFFFFF"
      />

      {/* Lòng trong chữ P */}
      <path
        d="M17.2 13.2H22.4C24.2 13.2 25.4 14.1 25.4 15.2C25.4 16.3 24.2 17.2 22.4 17.2H17.2V13.2Z"
        fill="#004B87"
      />

      {/* Giọt xăng / Giọt dầu màu cam đặc trưng của Petrolimex */}
      <path
        d="M21.5 13.6C21.5 13.6 24 16.2 24 17.4C24 18.7 22.9 19.8 21.5 19.8C20.1 19.8 19 18.7 19 17.4C19 16.2 21.5 13.6 21.5 13.6Z"
        fill="#F58220"
      />
    </svg>
  );
}

/**
 * 2. LOGO TỔNG CÔNG TY DẦU VIỆT NAM (PVOIL)
 * - Nền vàng PVOIL (#FFD100)
 * - Giọt dầu đỏ (#ED1C24) và vòng cung xanh (#009245)
 */
export function PvoilLogo({ size = 28, className = "", variant = "square" }: BrandIconProps) {
  const rx = variant === "circle" ? 20 : variant === "square" ? 6 : 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="PVOIL - Tổng công ty Dầu Việt Nam"
    >
      <rect width="40" height="40" rx={rx} fill="#FFD100" />
      {/* Ngọn lửa / giọt dầu đỏ PVOIL */}
      <path
        d="M20 7C20 7 12 16.5 12 22.5C12 26.9 15.6 30.5 20 30.5C24.4 30.5 28 26.9 28 22.5C28 16.5 20 7 20 7Z"
        fill="#ED1C24"
      />
      {/* Mầm lá xanh năng lượng */}
      <path
        d="M17.5 24C17.5 20.5 20 18 20 18C20 18 22.5 20.5 22.5 24C22.5 25.4 21.4 26.5 20 26.5C18.6 26.5 17.5 25.4 17.5 24Z"
        fill="#FFFFFF"
      />
      <circle cx="20" cy="24" r="2" fill="#009245" />
    </svg>
  );
}

/**
 * 3. LOGO THƯỞNG ĐỐI TÁC BE (BE DRIVER REWARDS / TIỀN THƯỞNG)
 * - Cúp vàng hoàng gia kết hợp dải ruy băng và ngôi sao Be (#FFC700)
 */
export function BeBonusLogo({ size = 28, className = "", variant = "square" }: BrandIconProps) {
  const rx = variant === "circle" ? 20 : variant === "square" ? 6 : 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Be Driver Rewards - Tiền Thưởng Đối Tác"
    >
      {/* Nền vàng thương hiệu Be Group */}
      <rect width="40" height="40" rx={rx} fill="#FFC700" />

      {/* Đế cúp vàng kim cương */}
      <path d="M14 31H26V28H14V31Z" fill="#111827" />
      <path d="M18 28H22V24H18V28Z" fill="#111827" />

      {/* Thân cúp vàng thể thao */}
      <path
        d="M13 11H27V18C27 21.9 23.9 25 20 25C16.1 25 13 21.9 13 18V11Z"
        fill="#111827"
      />

      {/* Quai cúp hai bên */}
      <path
        d="M13 13H10C8.9 13 8 13.9 8 15V17C8 19.2 9.8 21 12 21H13V19H12C10.9 19 10 18.1 10 17V15H13V13Z"
        fill="#111827"
      />
      <path
        d="M27 13H30C31.1 13 32 13.9 32 15V17C32 19.2 30.2 21 28 21H27V19H28C29.1 19 30 18.1 30 17V15H27V13Z"
        fill="#111827"
      />

      {/* Ngôi sao chiến thắng 5 cánh màu vàng sáng ở tâm cúp */}
      <path
        d="M20 13L21.2 16.2L24.5 16.5L22 18.6L22.8 22L20 20.2L17.2 22L18 18.6L15.5 16.5L18.8 16.2L20 13Z"
        fill="#FFC700"
      />
    </svg>
  );
}

/**
 * 4. LOGO FE CREDIT (QUẢN LÝ NỢ / TÍN DỤNG TIÊU DÙNG)
 * - Thương hiệu tài chính tiêu dùng & trả góp số 1 Việt Nam
 * - Màu xanh lá đặc trưng (#009944) & dải đỏ (#ED1C24)
 */
export function FeCreditLogo({ size = 28, className = "", variant = "square" }: BrandIconProps) {
  const rx = variant === "circle" ? 20 : variant === "square" ? 6 : 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="FE Credit - Tài chính tiêu dùng & Quản lý nợ"
    >
      <rect width="40" height="40" rx={rx} fill="#009944" />
      {/* Vát đỏ thương hiệu FE */}
      <path d="M26 6L34 6L20 34L12 34L26 6Z" fill="#ED1C24" />
      {/* Chữ 'FE' trắng */}
      <path
        d="M9 13H17V15.5H12V18.5H16V21H12V27H9V13Z"
        fill="#FFFFFF"
      />
      <path
        d="M23 13H31V15.5H26V18.5H30V21H26V24.5H31V27H23V13Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * 5. LOGO HOME CREDIT (TRẢ GÓP XE & VAY TIÊU DÙNG)
 * - Màu đỏ tươi (#EE2737) với vòng cung nụ cười Home Credit
 */
export function HomeCreditLogo({ size = 28, className = "", variant = "square" }: BrandIconProps) {
  const rx = variant === "circle" ? 20 : variant === "square" ? 6 : 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Home Credit - Trả góp xe & Tài chính"
    >
      <rect width="40" height="40" rx={rx} fill="#EE2737" />
      {/* Vòng cung cười Home Credit */}
      <path
        d="M10 23C13 28 27 28 30 23"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Chữ 'h' Home Credit */}
      <path
        d="M14 11V22M14 16C15.5 14.5 17.5 14.5 19 16V22"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 6. LOGO VIETCOMBANK (DOANH THU & DÒNG TIỀN TÀI KHOẢN)
 * - Ngân hàng TMCP Ngoại thương Việt Nam
 * - Dải ruy-băng tam giác 3D xanh lục (#005C2B / #7BBF34)
 */
export function VietcombankLogo({ size = 28, className = "", variant = "square" }: BrandIconProps) {
  const rx = variant === "circle" ? 20 : variant === "square" ? 6 : 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Vietcombank - Doanh thu & Ngân hàng"
    >
      {/* Nền xanh đen ngân hàng cao cấp */}
      <rect width="40" height="40" rx={rx} fill="#062817" />

      {/* Dải ruy băng 3D Vietcombank */}
      <path
        d="M20 9L29 27H11L20 9Z"
        stroke="#7BBF34"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M20 15L24.5 24H15.5L20 15Z"
        fill="#005C2B"
      />
      <circle cx="20" cy="20" r="2.5" fill="#7BBF34" />
    </svg>
  );
}

/**
 * 7. LOGO VÍ ĐIỆN TỬ MOMO (DOANH THU & THANH TOÁN)
 * - Màu hồng sen đặc trưng (#A50064)
 */
export function MomoLogo({ size = 28, className = "", variant = "square" }: BrandIconProps) {
  const rx = variant === "circle" ? 20 : variant === "square" ? 6 : 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="MoMo - Ví điện tử thanh toán"
    >
      <rect width="40" height="40" rx={rx} fill="#A50064" />
      {/* Hai vòng tròn mắt MoMo */}
      <circle cx="15" cy="18" r="5" stroke="#FFFFFF" strokeWidth="2.5" />
      <circle cx="25" cy="18" r="5" stroke="#FFFFFF" strokeWidth="2.5" />
      <path d="M13 26H17M23 26H27" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 8. LOGO MASTERCARD (CHI PHÍ VẬN HÀNH / THẺ THANH TOÁN)
 * - Hai vòng tròn giao nhau: Đỏ (#EB001B) & Vàng cam (#FF5F00)
 */
export function MastercardLogo({ size = 28, className = "", variant = "square" }: BrandIconProps) {
  const rx = variant === "circle" ? 20 : variant === "square" ? 6 : 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Mastercard - Chi phí thẻ & Vận hành"
    >
      <rect width="40" height="40" rx={rx} fill="#141414" />
      {/* Vòng tròn đỏ bên trái */}
      <circle cx="16" cy="20" r="9" fill="#EB001B" />
      {/* Vòng tròn vàng bên phải */}
      <circle cx="24" cy="20" r="9" fill="#FF5F00" fillOpacity="0.9" />
      {/* Phần giao nhau */}
      <path
        d="M20 13.8C21.7 15.5 22.8 17.6 22.8 20C22.8 22.4 21.7 24.5 20 26.2C18.3 24.5 17.2 22.4 17.2 20C17.2 17.6 18.3 15.5 20 13.8Z"
        fill="#FF7A00"
      />
    </svg>
  );
}

/**
 * 9. LOGO TẬP ĐOÀN ĐIỆN LỰC VIỆT NAM (EVN - HÓA ĐƠN & LỊCH / SCHEDULE)
 * - Vòng turbine 3 cánh: Đỏ, Trắng, Vàng trên nền xanh navy (#003399)
 * - Biểu tượng số 1 của dịch vụ hóa đơn sinh hoạt tại Việt Nam
 */
export function EvnLogo({ size = 28, className = "", variant = "square" }: BrandIconProps) {
  const rx = variant === "circle" ? 20 : variant === "square" ? 6 : 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="EVN - Tập đoàn Điện lực Việt Nam"
    >
      <rect width="40" height="40" rx={rx} fill="#003399" />
      {/* 3 cánh turbine xoay 3 pha */}
      <path
        d="M20 20L28 14C29 17 28 20 25 22L20 20Z"
        fill="#EE1C25"
      />
      <path
        d="M20 20L15 28C12 26 12 22 14 19L20 20Z"
        fill="#FFCC00"
      />
      <path
        d="M20 20L17 12C20 10 24 11 25 14L20 20Z"
        fill="#FFFFFF"
      />
      {/* Vòng tâm và chữ EVN */}
      <circle cx="20" cy="20" r="3" fill="#003399" />
      <text
        x="20"
        y="34"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="7"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="0.5"
      >
        EVN
      </text>
    </svg>
  );
}

/**
 * 10. LOGO BIDV (NGÂN HÀNG TIẾT KIỆM - SỔ TIẾT KIỆM / SAVINGS)
 * - Hoa mai / Kim cương cánh xanh lục (#006838) và đỏ ruby (#DA251D)
 */
export function BidvLogo({ size = 28, className = "", variant = "square" }: BrandIconProps) {
  const rx = variant === "circle" ? 20 : variant === "square" ? 6 : 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="BIDV - Sổ tiết kiệm & Ngân hàng đầu tư"
    >
      <rect width="40" height="40" rx={rx} fill="#005B38" />
      {/* Hoa sao 4 cánh BIDV */}
      <path d="M20 8L24 16L20 20L16 16L20 8Z" fill="#DA251D" />
      <path d="M32 20L24 24L20 20L24 16L32 20Z" fill="#FDB913" />
      <path d="M20 32L16 24L20 20L24 24L20 32Z" fill="#DA251D" />
      <path d="M8 20L16 16L20 20L16 24L8 20Z" fill="#FDB913" />
      <circle cx="20" cy="20" r="2.5" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * 11. LOGO FINFLOW COCKPIT (TỔNG QUAN / OVERVIEW)
 * - Khối hình học FinFlow tinh thể ngọc lục bảo (Emerald Core #10B981)
 */
export function FinFlowLogo({ size = 28, className = "", variant = "square" }: BrandIconProps) {
  const rx = variant === "circle" ? 20 : variant === "square" ? 6 : 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="FinFlow - Tổng quan tài chính"
    >
      <rect width="40" height="40" rx={rx} fill="#047857" />
      {/* Monogram chữ F giác cắt kim cương */}
      <path
        d="M12 10H28V15H17.5V18H25V22.5H17.5V30H12V10Z"
        fill="#FFFFFF"
      />
      <circle cx="28" cy="12" r="3" fill="#34D399" />
    </svg>
  );
}

/**
 * 12. LOGO BÁO CÁO TÀI CHÍNH (POWER BI / ANALYTICS REPORTS)
 * - 3 cột dữ liệu phân tích vàng kim (#F2C811) và ngọc lục bảo
 */
export function PowerBiReportsLogo({ size = 28, className = "", variant = "square" }: BrandIconProps) {
  const rx = variant === "circle" ? 20 : variant === "square" ? 6 : 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="PowerBI / FinFlow Analytics - Báo cáo tài chính"
    >
      <rect width="40" height="40" rx={rx} fill="#1F2937" />
      {/* 3 cột dữ liệu xếp tầng */}
      <rect x="11" y="21" width="4.5" height="11" rx="1.5" fill="#F59E0B" />
      <rect x="18" y="15" width="4.5" height="17" rx="1.5" fill="#10B981" />
      <rect x="25" y="9" width="4.5" height="23" rx="1.5" fill="#06B6D4" />
      <path d="M13 18L20 12L27 7" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 13. LOGO CÀI ĐẶT BẢO MẬT HỆ THỐNG (SYSTEM & SECURITY SETTINGS)
 * - Bánh răng titan đa lớp & khiên bảo mật AES-256
 */
export function SystemSettingsLogo({ size = 28, className = "", variant = "square" }: BrandIconProps) {
  const rx = variant === "circle" ? 20 : variant === "square" ? 6 : 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="System Settings - Cài đặt hệ thống"
    >
      <rect width="40" height="40" rx={rx} fill="#1E293B" />
      {/* Bánh răng công nghệ */}
      <circle cx="20" cy="20" r="7" stroke="#94A3B8" strokeWidth="3" />
      <path
        d="M20 7V10M20 30V33M7 20H10M30 20H33M11 11L13 13M27 27L29 29M11 29L13 27M27 13L29 11"
        stroke="#10B981"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="20" cy="20" r="3" fill="#10B981" />
    </svg>
  );
}

