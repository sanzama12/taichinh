"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BeeIconSvg } from "@/components/icons/BeeLogo";
import {
  PetrolimexLogo,
  BeBonusLogo,
  FeCreditLogo,
  VietcombankLogo,
  MastercardLogo,
  EvnLogo,
  BidvLogo,
} from "@/components/icons/BrandLogos";
import { type MetricCardData, type UpcomingBillItem } from "@/services/dashboard.service";

interface CartoonFeatureGridProps {
  metrics: MetricCardData;
  beeSummary?: {
    totalEarnings: number;
    totalCustomerFare: number;
    totalPlatformFee: number;
    totalTip: number;
    totalTrips: number;
  };
  fuelSummary?: {
    totalCost: number;
    totalLiters: number;
    totalFills: number;
  };
  bonusSummary?: {
    totalReceived: number;
    totalPending: number;
  };
  debtSummary?: {
    totalRemainingDebt: number;
    totalMonthlyPayment: number;
    activeDebtCount: number;
  };
  upcomingBills?: UpcomingBillItem[];
}

export function CartoonFeatureGrid({
  metrics,
  beeSummary,
  fuelSummary,
  bonusSummary,
  debtSummary,
  upcomingBills = [],
}: CartoonFeatureGridProps) {
  const formatCurrency = (val: number) => {
    return Math.round(val || 0).toLocaleString("vi-VN") + " ₫";
  };

  const cards = [
    // 01: Đơn Be
    {
      num: "01",
      title: "Quản Lý Đơn Be",
      desc: "Cuốc xe beBike, beCar, giao hàng, tiền tip và cước khách thời gian thực.",
      href: "/services/bee",
      accentBorder: "border-t-[#FFC700]",
      badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
      numColor: "text-amber-500/25 dark:text-amber-400/20",
      icon: <BeeIconSvg size={22} variant="square" />,
      stat1Label: "Tổng cuốc",
      stat1Val: `${beeSummary?.totalTrips || 0} cuốc`,
      stat2Label: "Thực nhận",
      stat2Val: formatCurrency(beeSummary?.totalEarnings || 0),
      footerBadge: `🚗 ${beeSummary?.totalTrips || 0} cuốc hoàn thành`,
    },
    // 02: Quản Lý Xăng
    {
      num: "02",
      title: "Chi Phí Xăng Xe",
      desc: "Nhật ký đổ xăng RON 95, E5 RON 92, theo dõi ODO km và cây xăng Petrolimex/PVOIL.",
      href: "/services/fuel",
      accentBorder: "border-t-[#004B87]",
      badgeBg: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
      numColor: "text-blue-500/25 dark:text-blue-400/20",
      icon: <PetrolimexLogo size={22} variant="square" />,
      stat1Label: "Đã đổ",
      stat1Val: `${fuelSummary?.totalLiters || 0} Lít`,
      stat2Label: "Tổng tiền",
      stat2Val: formatCurrency(fuelSummary?.totalCost || 0),
      footerBadge: `⛽ ${fuelSummary?.totalFills || 0} lần đổ xăng`,
    },
    // 03: Tiền Thưởng
    {
      num: "03",
      title: "Tiền Thưởng & Bonus",
      desc: "Theo dõi thưởng mốc chuyến, thưởng tuần, thưởng giờ cao điểm Be giải ngân.",
      href: "/services/bonus",
      accentBorder: "border-t-[#F59E0B]",
      badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
      numColor: "text-amber-500/25 dark:text-amber-400/20",
      icon: <BeBonusLogo size={22} variant="square" />,
      stat1Label: "Đã nhận",
      stat1Val: formatCurrency(bonusSummary?.totalReceived || 0),
      stat2Label: "Đang chờ",
      stat2Val: formatCurrency(bonusSummary?.totalPending || 0),
      footerBadge: "🎁 Giải ngân tự động",
    },
    // 04: Quản Lý Nợ
    {
      num: "04",
      title: "Quản Lý Công Nợ",
      desc: "Kiểm soát dư nợ FE Credit, Home Credit, lịch trả góp hàng tháng an toàn.",
      href: "/debts",
      accentBorder: "border-t-[#E11D48]",
      badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
      numColor: "text-rose-500/25 dark:text-rose-400/20",
      icon: <FeCreditLogo size={22} variant="square" />,
      stat1Label: "Dư nợ còn",
      stat1Val: formatCurrency(debtSummary?.totalRemainingDebt || 0),
      stat2Label: "Trả/tháng",
      stat2Val: formatCurrency(debtSummary?.totalMonthlyPayment || 0),
      footerBadge: `🏛 ${debtSummary?.activeDebtCount || 0} hợp đồng vay`,
    },
    // 05: Doanh Thu
    {
      num: "05",
      title: "Doanh Thu & Thu Nhập",
      desc: "Dòng tiền về tài khoản Vietcombank, tiền lương định kỳ và thu nhập ngoài giờ.",
      href: "/income",
      accentBorder: "border-t-[#6366F1]",
      badgeBg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
      numColor: "text-indigo-500/25 dark:text-indigo-400/20",
      icon: <VietcombankLogo size={22} variant="square" />,
      stat1Label: "Tổng thu",
      stat1Val: formatCurrency(metrics.monthlyIncome),
      stat2Label: "Nguồn thu",
      stat2Val: "Đa luồng",
      footerBadge: "💰 Thu nhập thời gian thực",
    },
    // 06: Chi Phí
    {
      num: "06",
      title: "Chi Phí Vận Hành",
      desc: "Chi phí ăn uống, sinh hoạt, phụ tùng xe, mặt bằng thanh toán thẻ Mastercard.",
      href: "/expenses",
      accentBorder: "border-t-[#EC4899]",
      badgeBg: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20",
      numColor: "text-pink-500/25 dark:text-pink-400/20",
      icon: <MastercardLogo size={22} variant="square" />,
      stat1Label: "Tổng chi",
      stat1Val: formatCurrency(metrics.monthlyExpense),
      stat2Label: "Dư ròng",
      stat2Val: formatCurrency(metrics.netRemaining),
      footerBadge: "💳 Quản trị dòng tiền",
    },
    // 07: Hóa Đơn EVN
    {
      num: "07",
      title: "Lịch & Hóa Đơn Đến Hạn",
      desc: "Hóa đơn điện lực EVN, nước sạch, internet viễn thông và lịch nhắc hạn tự động.",
      href: "/bills",
      accentBorder: "border-t-[#10B981]",
      badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
      numColor: "text-emerald-500/25 dark:text-emerald-400/20",
      icon: <EvnLogo size={22} variant="square" />,
      stat1Label: "Hóa đơn",
      stat1Val: formatCurrency(metrics.monthlyBills),
      stat2Label: "Sắp tới",
      stat2Val: `${upcomingBills.length} khoản`,
      footerBadge: "⚡ Nhắc hẹn chính xác",
    },
    // 08: Sổ Tiết Kiệm
    {
      num: "08",
      title: "Sổ Tiết Kiệm & Tích Lũy",
      desc: "Quỹ dự phòng khẩn cấp, tài khoản tích lũy ngân hàng BIDV và mục tiêu tài chính.",
      href: "/savings",
      accentBorder: "border-t-[#0D9488]",
      badgeBg: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
      numColor: "text-teal-500/25 dark:text-teal-400/20",
      icon: <BidvLogo size={22} variant="square" />,
      stat1Label: "Tích lũy",
      stat1Val: formatCurrency(metrics.totalSavings),
      stat2Label: "Tỷ lệ",
      stat2Val: `${metrics.savingsRatePercent}%`,
      footerBadge: "🛡 Quỹ an toàn dự phòng",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Tiêu đề Phân Vùng Hoạt Họa Hiện Đại */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>DANH MỤC NGHIỆP VỤ & CHỈ HUY TÀI CHÍNH</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hệ sinh thái 8 chức năng cốt lõi đồng bộ trực tiếp với MongoDB Server
          </p>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
          8 Module • 100% Realtime
        </span>
      </div>

      {/* Grid 8 Thẻ Hoạt Họa Neo-Brutalist (Chuẩn mẫu ảnh TriOVO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {cards.map((c) => (
          <Link
            key={c.num}
            href={c.href}
            className={`group relative rounded-3xl p-5 bg-white dark:bg-[#0c121e] border-2 border-slate-900/10 dark:border-white/10 border-t-4 ${c.accentBorder} flex flex-col justify-between transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,0.9)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.25)] hover:border-slate-900 dark:hover:border-white overflow-hidden cursor-pointer`}
          >
            {/* Hàng Đầu: Icon Badge + Số Hoạt Họa To Mờ (01..08) + Mũi Tên ↗ */}
            <div className="flex items-start justify-between">
              {/* Icon Badge nổi bật trong hộp vuông bo góc */}
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                {c.icon}
              </div>

              {/* Số Thứ Tự Hoạt Họa Nghệ Thuật (Watermark 01..08) + Mũi tên ↗ */}
              <div className="flex items-center gap-1.5 select-none">
                <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tighter ${c.numColor} transition-transform group-hover:scale-110`}>
                  {c.num}
                </span>
                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/[0.06] group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 flex items-center justify-center transition-all duration-200 shadow-2xs">
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>

            {/* Thân Thẻ: Tiêu Đề Rõ Ràng & Mô Tả Ngắn Gọn */}
            <div className="space-y-1.5 my-4">
              <h3 className="text-base sm:text-[17px] font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {c.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {c.desc}
              </p>
            </div>

            {/* Đáy Thẻ: 2 Cột Số Liệu + Huy Hiệu Trạng Thái Pill */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
              {/* 2 Cột Chỉ Số Thời Gian Thực */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    {c.stat1Label}
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-[13px] truncate block tabular-nums">
                    {c.stat1Val}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    {c.stat2Label}
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-[13px] truncate block tabular-nums">
                    {c.stat2Val}
                  </span>
                </div>
              </div>

              {/* Pill Huy Hiệu Trạng Thái Bo Tròn (Giống mẫu ảnh) */}
              <div className="pt-0.5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-mono font-bold border ${c.badgeBg}`}>
                  <span>{c.footerBadge}</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

