"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldAlert, ShieldCheck, Lock, ArrowLeft, MessageSquare, PhoneCall } from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { type IUserPermissions, DEFAULT_USER_PERMISSIONS } from "@/types/permissions";

interface DashboardShellProps {
  children: React.ReactNode;
}

const STORAGE_KEY = "finflow_sidebar_collapsed";

// Ánh xạ URL sang khóa phân quyền
function getRequiredPermission(pathname: string): keyof IUserPermissions | "admin_only" | null {
  if (pathname.startsWith("/admin")) return "admin_only";
  if (pathname === "/dashboard") return "dashboard";
  if (pathname.startsWith("/services/bee")) return "services_bee";
  if (pathname.startsWith("/services/fuel")) return "services_fuel";
  if (pathname.startsWith("/services/bonus")) return "services_bonus";
  if (pathname.startsWith("/debts")) return "debts";
  if (pathname.startsWith("/income")) return "income";
  if (pathname.startsWith("/expenses")) return "expenses";
  if (pathname.startsWith("/bills")) return "bills";
  if (pathname.startsWith("/savings")) return "savings";
  if (pathname.startsWith("/reports")) return "reports";
  if (pathname.startsWith("/tickets")) return "tickets";
  return null;
}

const FEATURE_NAMES: Record<string, string> = {
  dashboard: "Báo Cáo Tổng Quan (Overview)",
  services_bee: "Quản Lý Đơn Be (beBike, Siêu Tốc, Tiết Kiệm, Doanh Nghiệp)",
  services_fuel: "Quản Lý Xăng Xe Petrolimex",
  services_bonus: "Quản Lý Thưởng Nóng Be Bonus",
  debts: "Quản Lý Nợ (FE Credit / Home Credit)",
  income: "Doanh Thu & Dòng Tiền (Vietcombank & MoMo)",
  expenses: "Chi Phí Vận Hành (Mastercard)",
  bills: "Hóa Đơn & Lịch Định Kỳ (EVN / VNPT)",
  savings: "Sổ Tiết Kiệm Tích Lũy (BIDV)",
  reports: "Báo Cáo Phân Tích Tài Chính (PowerBI)",
  tickets: "Trung Tâm Hỗ Trợ & Yêu Cầu (Tickets)",
  admin_only: "Trung Tâm Quản Trị Hệ Thống (Admin Hub)",
};

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Đọc trạng thái thu gọn/mở rộng từ localStorage khi mount
  React.useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch (e) {
      console.debug("Cannot read localStorage:", e);
    }
  }, []);

  // Lắng nghe phím tắt Ctrl+B / Cmd+B để mở ra mở vô thanh dọc
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        handleToggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCollapsed]);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch (e) {
        console.debug("Cannot write localStorage:", e);
      }
      return next;
    });
  };

  // KIỂM TRA PHÂN QUYỀN TRUY CẬP (ACCESS CONTROL GUARD)
  const isAdmin = session?.user?.role === "admin";
  const requiredPerm = getRequiredPermission(pathname);
  
  let isAccessDenied = false;
  if (!isAdmin && requiredPerm) {
    if (requiredPerm === "admin_only") {
      isAccessDenied = true;
    } else {
      const userPerms: IUserPermissions = session?.user?.permissions || DEFAULT_USER_PERMISSIONS;
      if (userPerms[requiredPerm] === false) {
        isAccessDenied = true;
      }
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 antialiased font-sans overflow-x-hidden">
      {/* 1. THANH DỌC MỞ RA MỞ VÔ (Collapsible Left Sidebar) */}
      <AppSidebar
        isCollapsed={isMounted ? isCollapsed : false}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* 2. KHU VỰC NỘI DUNG CHÍNH (Main Content Canvas) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header thanh mảnh */}
        <TopHeader
          isSidebarCollapsed={isMounted ? isCollapsed : false}
          onToggleSidebar={handleToggleCollapse}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
        />

        {/* Nội Dung Trang Hoặc Màn Hình Chặn Quyền */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
          {isAccessDenied ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center mb-6 shadow-xl relative">
                <Lock className="w-9 h-9 sm:w-10 sm:h-10 text-amber-600 dark:text-amber-400" />
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-[#030712]">
                  !
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-3">
                <ShieldAlert className="w-3.5 h-3.5" />
                Chức Năng Chưa Được Kích Hoạt
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight max-w-lg mb-3">
                {FEATURE_NAMES[requiredPerm || ""] || "Tính Năng Này"} Đang Bị Khóa
              </h1>

              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
                Tài khoản của bạn chưa được Quản trị viên phân quyền sử dụng tính năng này. Hãy liên hệ Admin để được cấp quyền nhanh chóng.
              </p>

              {/* Hộp Thông Tin Hỗ Trợ Admin */}
              <div className="w-full max-w-md p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm text-left mb-6 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Thông Tin Hỗ Trợ Kích Hoạt
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Đầu Mối Quản Trị:
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Ban Quản Trị Hệ Thống
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm pt-1 border-t border-slate-100 dark:border-white/5">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    Kênh Yêu Cầu Trực Tuyến:
                  </span>
                  <Link
                    href="/tickets"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Gửi Ticket Hỗ Trợ
                  </Link>
                </div>
              </div>

              {/* Nút Hành Động */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-white/15 text-xs font-bold transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay Lại Trang Trước
                </button>

                <Link
                  href="/tickets"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  Gửi Yêu Cầu Cấp Quyền
                </Link>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Về Trang Tổng Quan
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 dark:border-white/[0.06] bg-white/60 dark:bg-[#030712]/60 backdrop-blur-sm py-4 text-center text-xs font-mono text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              HỆ THỐNG QUẢN TRỊ TÀI CHÍNH FINFLOW • MONGODB NATIVE REALTIME
            </span>
            <span className="text-[11px] text-slate-400">
              PHÍM TẮT: CTRL+B ĐỂ MỞ/ĐÓNG THANH DỌC
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}


