"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  PanelLeftOpen,
  ChevronDown,
  LogOut,
  Shield,
  Settings,
  MessageSquare,
  User as UserIcon,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { formatCurrencyVND } from "@/lib/utils";
import { getHeaderRevenueAction } from "@/actions/bee";
import { type HeaderRevenueDto } from "@/services/bee.service";
import { BeeIconSvg } from "@/components/icons/BeeLogo";
import { DEFAULT_USER_PERMISSIONS, type IUserPermissions } from "@/types/permissions";

const EVENT_NAME = "finflow:realtime_updated";

interface TopHeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
}

export function TopHeader({
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
}: TopHeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [revenueData, setRevenueData] = React.useState<HeaderRevenueDto | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const isLoadingRef = React.useRef(false);

  const loadRevenue = React.useCallback(async () => {
    if (!session?.user || isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      const res = await getHeaderRevenueAction();
      if (res.isSuccess) {
        setRevenueData(res.data);
      }
    } catch (e) {
      console.debug("Cannot load header revenue:", e);
    } finally {
      isLoadingRef.current = false;
    }
  }, [session?.user]);

  // Chỉ load 1 lần khi mount + khi chuyển trang + khi có sự kiện sync (KHÔNG polling liên tục)
  React.useEffect(() => {
    loadRevenue();
  }, [loadRevenue, pathname]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => loadRevenue();
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, [loadRevenue]);

  // Đóng dropdown khi click ra ngoài
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  const getPageTitle = (path: string) => {
    if (path === "/dashboard") return "Reports";
    if (path === "/services/bee") return "Quản Lý Đơn Be";
    if (path === "/services/fuel") return "Quản Lý Xăng";
    if (path === "/services/bonus") return "Quản Lý Tiền Thưởng";
    if (path === "/debts") return "Quản Lý Nợ";
    if (path === "/income") return "Doanh Thu & Thu Nhập";
    if (path === "/expenses") return "Chi Phí Vận Hành";
    if (path === "/bills") return "Lịch & Hóa Đơn";
    if (path === "/savings") return "Sổ Tiết Kiệm";
    if (path === "/reports") return "Báo Cáo Tài Chính";
    if (path === "/settings") return "Cài Đặt Hệ Thống";
    if (path === "/tickets") return "Hỗ Trợ & Yêu Cầu (Tickets)";
    if (path === "/admin" || path.startsWith("/admin")) return "Trung Tâm Quản Trị Hệ Thống (Admin Hub)";
    return "FinFlow Architecture";
  };

  const isAdmin = session?.user?.role === "admin";
  const userPerms: IUserPermissions = session?.user?.permissions || DEFAULT_USER_PERMISSIONS;
  const enabledCount = isAdmin
    ? 11
    : Object.values(userPerms).filter(Boolean).length;

  // Quyền xem doanh thu trên header
  const canSeeRevenue = isAdmin || userPerms.services_bee || userPerms.income;

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-[#030712]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.08] px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Bên Trái: Nút Mở Thanh Dọc & Tiêu Đề Trang */}
      <div className="flex items-center gap-3">
        {/* Nút mở sidebar trên điện thoại */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Nút mở sidebar trên Desktop khi đang thu gọn */}
        {isSidebarCollapsed && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title="Mở rộng thanh dọc (Ctrl+B)"
            className="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <PanelLeftOpen className="w-4 h-4 text-emerald-600" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
            {getPageTitle(pathname)}
          </span>
        </div>
      </div>

      {/* Bên Phải: Doanh Thu + Profile + Chuông + DarkMode */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* THẺ DOANH THU & SỐ DƯ VÍ NẰM TRỰC TIẾP TRÊN HEADER */}
        {canSeeRevenue && revenueData && (
          <Link
            href="/services/bee"
            title={`Doanh thu tháng này: ${formatCurrencyVND(revenueData.revenueThisMonth)} • Số dư ví: ${formatCurrencyVND(revenueData.walletBalance)}`}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 dark:bg-[#FFC700]/15 dark:hover:bg-[#FFC700]/25 border-2 border-[#FFC700] text-xs transition-all shadow-xs group cursor-pointer active:scale-95"
          >
            <BeeIconSvg size={18} variant="square" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-bold text-amber-900 dark:text-amber-300 hidden md:inline">
                Doanh Thu:
              </span>
              <span className="font-black font-mono text-[#B45309] dark:text-[#FBBF24] tabular-nums text-xs sm:text-sm">
                {formatCurrencyVND(revenueData.revenueThisMonth)}
              </span>
            </div>
            {revenueData.walletCode && (
              <span className="hidden lg:inline text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/30 text-amber-950 dark:text-amber-200 border border-amber-400/50">
                {revenueData.walletCode}
              </span>
            )}
          </Link>
        )}

        {/* Dropdown Profile Pill tương tác chuẩn ProMax */}
        {session?.user && (
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
            >
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-5 h-5 rounded-full object-cover border border-emerald-500/50 shrink-0"
                />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <span className="font-semibold text-xs truncate max-w-[140px] sm:max-w-[180px]">
                {session.user.name || session.user.accessKey}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase shrink-0 ${
                  isAdmin
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-500/30"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/30"
                }`}
              >
                {isAdmin ? "ADMIN" : "USER"}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isUserMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Menu Thả Xuống (Dropdown Popover) */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Header User Thông Tin */}
                <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 mb-2">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {session.user.name || "Thành Viên FinFlow"}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        SĐT: {session.user.accessKey || "—"}
                      </div>
                    </div>
                  </div>

                  {/* Trạng Thái Phân Quyền */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 dark:border-white/5">
                    <span className="text-slate-500">Phân quyền:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {isAdmin ? "Toàn Quyền (11/11)" : `${enabledCount}/11 Tính Năng`}
                    </span>
                  </div>
                </div>

                {/* Các Mục Hành Động */}
                <div className="space-y-0.5 text-xs">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Trung Tâm Quản Trị (Admin Hub)</span>
                    </Link>
                  )}

                  <Link
                    href="/services/bee"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                  >
                    <Wallet className="w-4 h-4 text-amber-500" />
                    <span>Ví Thu Nhập & Rút Tiền</span>
                  </Link>

                  <Link
                    href="/tickets"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span>Hỗ Trợ & Yêu Cầu (Tickets)</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Cài Đặt Hệ Thống</span>
                  </Link>

                  <div className="my-1 border-t border-slate-100 dark:border-white/5" />

                  {/* Nút Đăng Xuất */}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng Xuất Phiên Làm Việc</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chuông Thông Báo */}
        <NotificationBell />

        {/* Nút Chuyển Đổi Sáng/Tối (ThemeToggle) */}
        <ThemeToggle />
      </div>
    </header>
  );
}


