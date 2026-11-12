"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Layers,
  ChevronDown,
  Bike,
  Fuel,
  Award,
  ReceiptText,
  TrendingUp,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  Menu,
  X,
  KeyRound,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { BeeIconSvg } from "@/components/icons/BeeLogo";

export function AppNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Đóng mobile menu khi chuyển trang
  React.useEffect(() => {
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
  }, [pathname]);

  // Click ra ngoài để đóng dropdown Quản lý dịch vụ
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setServicesDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  const isServicesActive =
    pathname.startsWith("/services") ||
    pathname === "/services/bee" ||
    pathname === "/services/fuel" ||
    pathname === "/services/bonus";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#030712]/95 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Desktop Horizontal Navigation Bar (Thanh Ngang) */}
        <div className="flex items-center gap-6 overflow-visible">
          <Link href="/dashboard" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 shadow-xs group-hover:border-blue-500 transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm tracking-wider uppercase text-slate-900 dark:text-white flex items-center gap-1.5 whitespace-nowrap">
                <span>Tài Chính Doanh Nghiệp</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 font-mono font-bold hidden sm:inline-block">
                  CORP
                </span>
              </span>
              <span className="block text-[8px] sm:text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">
                PROMAX ENTERPRISE SUITE
              </span>
            </div>
          </Link>

          {/* Desktop Horizontal Navigation (Thanh Menu Ngang Chuẩn Doanh Nghiệp) */}
          <nav className="hidden lg:flex items-center gap-1 py-1">
            {/* 1. TỔNG QUAN */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                pathname === "/dashboard"
                  ? "bg-blue-50 dark:bg-white/[0.08] text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-bold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Tổng Quan</span>
            </Link>

            {/* 2. QUẢN LÝ DỊCH VỤ (XỔ XUỐNG: Đơn bee, Quản lý xăng, Tiền thưởng) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setServicesDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isServicesActive
                    ? "bg-blue-50 dark:bg-white/[0.08] text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                }`}
                aria-expanded={servicesDropdownOpen}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Quản Lý Dịch Vụ</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    servicesDropdownOpen ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>

              {/* Menu xổ xuống (Dropdown Menu) */}
              <AnimatePresence>
                {servicesDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-xl p-2 z-50 space-y-1"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100 dark:border-white/5">
                      Dịch Vụ Đối Tác Be
                    </div>

                    {/* Sub-item 1: Quản lý Đơn bee */}
                    <Link
                      href="/services/bee"
                      onClick={() => setServicesDropdownOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all group ${
                        pathname === "/services/bee"
                          ? "bg-[#FFC700]/15 text-amber-900 dark:text-amber-300 font-bold border border-[#FFC700]/30"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                        <BeeIconSvg size={28} variant="badge" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Quản lý Đơn bee</span>
                          <span className="text-[9px] px-1 py-0.2 rounded font-mono font-black bg-[#FFC700] text-[#111827]">
                            BE
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Cuốc xe, cước khách & tiền tip
                        </div>
                      </div>
                    </Link>

                    {/* Sub-item 2: Quản lý Xăng */}
                    <Link
                      href="/services/fuel"
                      onClick={() => setServicesDropdownOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all group ${
                        pathname === "/services/fuel"
                          ? "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300 font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Fuel className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          Quản lý Xăng
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Đổ xăng, số lít & chỉ số ODO
                        </div>
                      </div>
                    </Link>

                    {/* Sub-item 3: Tiền Thưởng */}
                    <Link
                      href="/services/bonus"
                      onClick={() => setServicesDropdownOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all group ${
                        pathname === "/services/bonus"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          Tiền Thưởng
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Thưởng mốc, thưởng tuần & nóng
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. NỢ */}
            <Link
              href="/debts"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                pathname === "/debts"
                  ? "bg-blue-50 dark:bg-white/[0.08] text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-bold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              <ReceiptText className="w-4 h-4 shrink-0" />
              <span>Quản Lý Nợ</span>
            </Link>

            {/* 4. DOANH THU & THU NHẬP */}
            <Link
              href="/income"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                pathname === "/income"
                  ? "bg-blue-50 dark:bg-white/[0.08] text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-bold shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>Doanh Thu</span>
            </Link>

            {/* 5. CHI PHÍ VẬN HÀNH */}
            <Link
              href="/expenses"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                pathname === "/expenses"
                  ? "bg-blue-50 dark:bg-white/[0.08] text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-bold shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span>Chi Phí</span>
            </Link>

            {/* 6. BÁO CÁO TÀI CHÍNH */}
            <Link
              href="/reports"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                pathname === "/reports"
                  ? "bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white font-bold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span>Báo Cáo</span>
            </Link>

            {/* 7. CẤU HÌNH */}
            <Link
              href="/settings"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                pathname === "/settings"
                  ? "bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white font-bold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              <Settings className="w-3.5 h-3.5 shrink-0" />
              <span>Cấu Hình</span>
            </Link>
          </nav>
        </div>

        {/* Right Corporate Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* User Key & Role Badge */}
          {session?.user && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#090e17] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-slate-300">
              <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-slate-900 dark:text-white text-[11px] truncate max-w-[130px]">
                {session.user.accessKey || session.user.name}
              </span>
              <span
                className={`ml-1 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold shrink-0 ${
                  session.user.role === "admin"
                    ? "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30"
                    : "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                }`}
              >
                {session.user.role === "admin" ? "Admin" : "User"}
              </span>
            </div>
          )}

          <NotificationBell />

          <ThemeToggle />

          {/* Settings Link */}
          <Link
            href="/settings"
            title="Cài đặt hệ thống"
            className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center ${
              pathname === "/settings"
                ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-[#090e17] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleSignOut}
            title="Đăng xuất khỏi hệ thống"
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-[#090e17] dark:hover:bg-rose-500/10 border border-slate-200 hover:border-rose-200 dark:border-white/10 dark:hover:border-rose-500/30 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-all cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile / Tablet Menu Hamburger (Hiển thị dưới lg) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-[#090e17] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Framer Motion Animated) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="lg:hidden border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#030712] px-4 py-4 space-y-3 overflow-hidden shadow-xl"
          >
            {session?.user && (
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090e17] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    {session.user.accessKey || session.user.name}
                  </span>
                </div>
                <span className="text-[10px] text-blue-700 dark:text-blue-400 uppercase font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                  {session.user.role === "admin" ? "Admin" : "User"}
                </span>
              </div>
            )}

            {/* Tổng Quan */}
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                pathname === "/dashboard"
                  ? "bg-blue-50 dark:bg-white/[0.08] text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
              <span>Tổng Quan</span>
            </Link>

            {/* Quản Lý Dịch Vụ (Nhóm xổ xuống) */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 p-2 space-y-1 bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Quản Lý Dịch Vụ</span>
              </div>

              <Link
                href="/services/bee"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname === "/services/bee"
                    ? "bg-[#FFC700]/20 text-amber-900 dark:text-amber-300 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/5"
                }`}
              >
                <BeeIconSvg size={20} variant="square" />
                <span className="flex items-center gap-1.5">
                  <span>Quản lý Đơn bee</span>
                  <span className="text-[9px] px-1 py-0.2 rounded font-mono font-black bg-[#FFC700] text-[#111827]">
                    BE
                  </span>
                </span>
              </Link>

              <Link
                href="/services/fuel"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname === "/services/fuel"
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300"
                    : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/5"
                }`}
              >
                <Fuel className="w-4 h-4 text-orange-600" />
                <span>Quản lý Xăng</span>
              </Link>

              <Link
                href="/services/bonus"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname === "/services/bonus"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                    : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/5"
                }`}
              >
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Tiền Thưởng</span>
              </Link>
            </div>

            {/* Quản Lý Nợ */}
            <Link
              href="/debts"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                pathname === "/debts"
                  ? "bg-blue-50 dark:bg-white/[0.08] text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              <ReceiptText className="w-4 h-4 text-rose-600" />
              <span>Quản Lý Nợ</span>
            </Link>

            {/* Doanh Thu & Chi Phí */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/income"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Doanh Thu</span>
              </Link>
              <Link
                href="/expenses"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                <CreditCard className="w-4 h-4 text-slate-500" />
                <span>Chi Phí</span>
              </Link>
            </div>

            {/* Báo cáo & Cài đặt */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
              <Link
                href="/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                <BarChart3 className="w-4 h-4 text-slate-500" />
                <span>Báo Cáo</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Cài Đặt</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
