
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Bike,
  Fuel,
  Award,
  ReceiptText,
  TrendingUp,
  CreditCard,
  Calendar,
  PiggyBank,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Building2,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  KeyRound,
  ShieldCheck,
  ClipboardCheck,
  MessageSquare,
} from "lucide-react";
import type { IUserPermissions } from "@/types/permissions";
import {
  BeeIconSvg,
  BeBikeIcon,
  BeExpressIcon,
  BeEconomyIcon,
  BeCorporateIcon,
  BeFoodIcon,
} from "@/components/icons/BeeLogo";
import {
  PetrolimexLogo,
  BeBonusLogo,
  FeCreditLogo,
  VietcombankLogo,
  MastercardLogo,
  EvnLogo,
  BidvLogo,
  FinFlowLogo,
  PowerBiReportsLogo,
  SystemSettingsLogo,
} from "@/components/icons/BrandLogos";

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

function SearchParamsWatcher({ onChange }: { onChange: (type: string) => void }) {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "";
  React.useEffect(() => {
    onChange(type);
  }, [type, onChange]);
  return null;
}

export function AppSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [activeBeeType, setActiveBeeType] = React.useState<string>("");
  const { data: session } = useSession();
  const [servicesExpanded, setServicesExpanded] = React.useState(true);

  // Tự động mở rộng nhóm dịch vụ nếu đang ở một trong các trang dịch vụ
  const isServicesActive =
    pathname.startsWith("/services") ||
    pathname === "/services/bee" ||
    pathname === "/services/fuel" ||
    pathname === "/services/bonus";

  React.useEffect(() => {
    if (isServicesActive) {
      setServicesExpanded(true);
    }
  }, [isServicesActive]);

  // Đóng mobile menu khi chuyển trang
  React.useEffect(() => {
    onCloseMobile();
  }, [pathname, onCloseMobile]);

  const isAdmin = session?.user?.role === "admin";
  const permissions = session?.user?.permissions;

  const canAccess = React.useCallback(
    (feature: keyof IUserPermissions): boolean => {
      if (isAdmin) return true;
      if (!permissions) return true;
      return permissions[feature] !== false;
    },
    [isAdmin, permissions]
  );

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  const navItems = [
    {
      title: "Overview",
      label: "Tổng Quan",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Debts",
      label: "Quản Lý Nợ",
      href: "/debts",
      icon: ReceiptText,
      isActive: pathname === "/debts",
    },
    {
      title: "Accounts",
      label: "Doanh Thu",
      href: "/income",
      icon: TrendingUp,
      isActive: pathname === "/income",
    },
    {
      title: "Expenses",
      label: "Chi Phí",
      href: "/expenses",
      icon: CreditCard,
      isActive: pathname === "/expenses",
    },
    {
      title: "Schedule",
      label: "Hóa Đơn & Lịch",
      href: "/bills",
      icon: Calendar,
      isActive: pathname === "/bills",
    },
    {
      title: "Savings",
      label: "Sổ Tiết Kiệm",
      href: "/savings",
      icon: PiggyBank,
      isActive: pathname === "/savings",
    },
    {
      title: "Reports",
      label: "Báo Cáo",
      href: "/reports",
      icon: BarChart3,
      isActive: pathname === "/reports",
    },
  ];

  return (
    <>
      {/* 1. Backdrop mờ cho màn hình điện thoại / máy tính bảng */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* 2. THANH DỌC (Sidebar Dọc Mở Ra Mở Vào) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-[#030712] border-r border-slate-200/90 dark:border-white/[0.08] transition-all duration-300 ease-in-out lg:static ${
          // Mobile state
          isMobileOpen ? "translate-x-0 w-72 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        } ${
          // Desktop collapsed state
          isCollapsed ? "lg:w-18" : "lg:w-64"
        }`}
      >
        <React.Suspense fallback={null}>
          <SearchParamsWatcher onChange={setActiveBeeType} />
        </React.Suspense>
        {/* Header Thanh Dọc (Brand & Nút Mở Ra Mở Vào) */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 shadow-xs text-sm">
                F
              </div>
              <div className="truncate">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>FinFlow</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-mono font-bold">
                    PRO
                  </span>
                </span>
                <span className="block text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                  ROBOTO SUITE
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center shadow-xs text-sm">
                F
              </div>
            </div>
          )}

          {/* Nút Thu Gọn / Mở Ra Mở Vào (Desktop Collapse Toggle) */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Mở rộng thanh dọc (Ctrl+B)" : "Thu gọn thanh dọc (Ctrl+B)"}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Nút Đóng Trên Điện Thoại */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ô Tìm Kiếm Nhanh (Search ⌘K) */}
        {!isCollapsed && (
          <div className="p-3 border-b border-slate-100 dark:border-white/[0.04]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-xs text-slate-400">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-transparent border-none text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden"
              />
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-200/60 dark:bg-white/10 font-bold shrink-0">
                ⌘K
              </span>
            </div>
          </div>
        )}

        {/* Danh Sách Mục Điều Hướng Thanh Dọc */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 no-scrollbar">
          {/* 1. Tổng Quan (Overview - FinFlow Cockpit) */}
          {canAccess("dashboard") && (
            <Link
              href="/dashboard"
              title="Tổng Quan FinFlow"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                isCollapsed ? "justify-center" : ""
              } ${
                pathname === "/dashboard"
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-500/30 font-bold shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.04] font-medium"
              }`}
            >
              <FinFlowLogo size={18} variant="square" />
              {!isCollapsed && <span>Overview</span>}
            </Link>
          )}

          {/* 2. NHÓM QUẢN LÝ DỊCH VỤ (Xổ ra các dịch vụ Be, Xăng xe, Tiền thưởng) */}
          {(canAccess("services_bee") || canAccess("services_fuel") || canAccess("services_bonus")) && (
            <div className="space-y-1">
              {!isCollapsed ? (
                <button
                  type="button"
                  onClick={() => setServicesExpanded(!servicesExpanded)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isServicesActive
                      ? "text-amber-800 dark:text-amber-300 bg-amber-500/10 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BeeIconSvg size={18} variant="square" />
                    <span>Dịch Vụ & Đối Tác</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      servicesExpanded ? "rotate-180 text-amber-600" : ""
                    }`}
                  />
                </button>
              ) : (
                <Link
                  href={canAccess("services_bee") ? "/services/bee" : canAccess("services_fuel") ? "/services/fuel" : "/services/bonus"}
                  title="Quản Lý Dịch Vụ"
                  className={`flex items-center justify-center p-2.5 rounded-xl transition-all ${
                    isServicesActive
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <BeeIconSvg size={18} variant="square" />
                </Link>
              )}

              {/* Các mục con của Dịch vụ: 4 Dịch vụ Be + Đổ Xăng + Tiền Thưởng */}
              <AnimatePresence>
                {(servicesExpanded || isCollapsed) && (
                  <div className={`${isCollapsed ? "space-y-1" : "pl-3 space-y-1"}`}>
                    {/* Các dịch vụ Be (beBike, be Siêu Tốc, be Tiết Kiệm, be Doanh Nghiệp) */}
                    {canAccess("services_bee") && (
                      <>
                        {/* Mục 1: beBike */}
                        <Link
                          href="/services/bee?type=beBike"
                          title="Dịch vụ beBike (Chở khách)"
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                            isCollapsed ? "justify-center" : ""
                          } ${
                            pathname === "/services/bee" && (activeBeeType === "beBike" || !activeBeeType)
                              ? "bg-[#FFC700]/20 text-amber-950 dark:text-amber-300 border border-[#FFC700]/50 font-bold shadow-2xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5"
                          }`}
                        >
                          <BeBikeIcon size={18} />
                          {!isCollapsed && (
                            <span className="flex items-center justify-between flex-1 min-w-0">
                              <span className="truncate">beBike</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-black bg-[#FFC700] text-[#111827] shrink-0">
                                BIKE
                              </span>
                            </span>
                          )}
                        </Link>

                        {/* Mục 2: be Giao Hàng Siêu Tốc */}
                        <Link
                          href="/services/bee?type=beDeliveryExpress"
                          title="Dịch vụ be Giao Hàng Siêu Tốc"
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                            isCollapsed ? "justify-center" : ""
                          } ${
                            pathname === "/services/bee" && activeBeeType === "beDeliveryExpress"
                              ? "bg-rose-500/15 text-rose-900 dark:text-rose-300 border border-rose-500/40 font-bold shadow-2xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5"
                          }`}
                        >
                          <BeExpressIcon size={18} />
                          {!isCollapsed && (
                            <span className="flex items-center justify-between flex-1 min-w-0">
                              <span className="truncate">be Siêu Tốc</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-rose-500 text-white shrink-0">
                                SIÊU TỐC
                              </span>
                            </span>
                          )}
                        </Link>

                        {/* Mục 3: be Giao Hàng Tiết Kiệm */}
                        <Link
                          href="/services/bee?type=beDeliveryEconomy"
                          title="Dịch vụ be Giao Hàng Tiết Kiệm"
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                            isCollapsed ? "justify-center" : ""
                          } ${
                            pathname === "/services/bee" && activeBeeType === "beDeliveryEconomy"
                              ? "bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border border-emerald-500/40 font-bold shadow-2xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5"
                          }`}
                        >
                          <BeEconomyIcon size={18} />
                          {!isCollapsed && (
                            <span className="flex items-center justify-between flex-1 min-w-0">
                              <span className="truncate">be Tiết Kiệm</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-600 text-white shrink-0">
                                TIẾT KIỆM
                              </span>
                            </span>
                          )}
                        </Link>

                        {/* Mục 4: be Giao Hàng Doanh Nghiệp */}
                        <Link
                          href="/services/bee?type=beDeliveryCorporate"
                          title="Dịch vụ be Giao Hàng Doanh Nghiệp"
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                            isCollapsed ? "justify-center" : ""
                          } ${
                            pathname === "/services/bee" && activeBeeType === "beDeliveryCorporate"
                              ? "bg-indigo-500/15 text-indigo-900 dark:text-indigo-300 border border-indigo-500/40 font-bold shadow-2xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5"
                          }`}
                        >
                          <BeCorporateIcon size={18} />
                          {!isCollapsed && (
                            <span className="flex items-center justify-between flex-1 min-w-0">
                              <span className="truncate">be Doanh Nghiệp</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-indigo-600 text-white shrink-0">
                                DOANH NGHIỆP
                              </span>
                            </span>
                          )}
                        </Link>

                        {/* Mục 5: beFood (Giao Đồ Ăn) */}
                        <Link
                          href="/services/bee?type=beFood"
                          title="Dịch vụ beFood (Giao Đồ Ăn & Thức Uống)"
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                            isCollapsed ? "justify-center" : ""
                          } ${
                            pathname === "/services/bee" && activeBeeType === "beFood"
                              ? "bg-orange-500/15 text-orange-900 dark:text-orange-300 border border-orange-500/40 font-bold shadow-2xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5"
                          }`}
                        >
                          <BeFoodIcon size={18} />
                          {!isCollapsed && (
                            <span className="flex items-center justify-between flex-1 min-w-0">
                              <span className="truncate">beFood</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-orange-500 text-white shrink-0">
                                ĐỒ ĂN
                              </span>
                            </span>
                          )}
                        </Link>
                      </>
                    )}

                    {/* Vạch ngăn phân tách các đối tác khác */}
                    {canAccess("services_bee") && (canAccess("services_fuel") || canAccess("services_bonus")) && (
                      <div className="py-1">
                        <div className="border-t border-slate-200/70 dark:border-white/10" />
                      </div>
                    )}

                    {/* Mục con 5: Quản lý Xăng Petrolimex */}
                    {canAccess("services_fuel") && (
                      <Link
                        href="/services/fuel"
                        title="Quản lý Xăng Petrolimex"
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                          isCollapsed ? "justify-center" : ""
                        } ${
                          pathname === "/services/fuel"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 font-bold border border-orange-200 shadow-2xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5"
                        }`}
                      >
                        <PetrolimexLogo size={18} variant="square" />
                        {!isCollapsed && (
                          <span className="flex items-center justify-between flex-1 min-w-0">
                            <span className="truncate">Đổ Xăng</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#004B87] text-white shrink-0">
                              P
                            </span>
                          </span>
                        )}
                      </Link>
                    )}

                    {/* Mục con 6: Tiền Thưởng Be Bonus */}
                    {canAccess("services_bonus") && (
                      <Link
                        href="/services/bonus"
                        title="Tiền Thưởng Đối Tác Be"
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                          isCollapsed ? "justify-center" : ""
                        } ${
                          pathname === "/services/bonus"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold border border-emerald-200 shadow-2xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5"
                        }`}
                      >
                        <BeBonusLogo size={18} variant="square" />
                        {!isCollapsed && (
                          <span className="flex items-center justify-between flex-1 min-w-0">
                            <span className="truncate">Tiền Thưởng</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-400 text-slate-900 shrink-0">
                              ★
                            </span>
                          </span>
                        )}
                      </Link>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* 3. Nợ (Debts - FE Credit & Home Credit) */}
          {canAccess("debts") && (
            <Link
              href="/debts"
              title="Quản Lý Nợ (FE Credit / Home Credit)"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                isCollapsed ? "justify-center" : ""
              } ${
                pathname === "/debts"
                  ? "bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200 font-bold shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 font-medium"
              }`}
            >
              <FeCreditLogo size={18} variant="square" />
              {!isCollapsed && <span>Quản Lý Nợ</span>}
            </Link>
          )}

          {/* 4. Doanh Thu (Accounts - Vietcombank & Ngân Hàng) */}
          {canAccess("income") && (
            <Link
              href="/income"
              title="Doanh Thu (Vietcombank & MoMo)"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                isCollapsed ? "justify-center" : ""
              } ${
                pathname === "/income"
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 font-medium"
              }`}
            >
              <VietcombankLogo size={18} variant="square" />
              {!isCollapsed && <span>Doanh Thu</span>}
            </Link>
          )}

          {/* 5. Chi Phí (Expenses - Mastercard & Visa) */}
          {canAccess("expenses") && (
            <Link
              href="/expenses"
              title="Chi Phí Vận Hành (Mastercard)"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                isCollapsed ? "justify-center" : ""
              } ${
                pathname === "/expenses"
                  ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 font-medium"
              }`}
            >
              <MastercardLogo size={18} variant="square" />
              {!isCollapsed && <span>Chi Phí Vận Hành</span>}
            </Link>
          )}

          {/* 6. Lịch Hóa Đơn (Schedule - EVN Điện Lực & Viễn Thông) */}
          {canAccess("bills") && (
            <Link
              href="/bills"
              title="Hóa Đơn & Lịch (EVN / VNPT)"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                isCollapsed ? "justify-center" : ""
              } ${
                pathname === "/bills"
                  ? "bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300 font-bold border border-blue-200"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 font-medium"
              }`}
            >
              <EvnLogo size={18} variant="square" />
              {!isCollapsed && <span>Hóa Đơn (EVN)</span>}
            </Link>
          )}

          {/* 7. Sổ Tiết Kiệm (Savings - BIDV) */}
          {canAccess("savings") && (
            <Link
              href="/savings"
              title="Sổ Tiết Kiệm (BIDV)"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                isCollapsed ? "justify-center" : ""
              } ${
                pathname === "/savings"
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-300/80 font-bold shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 font-medium"
              }`}
            >
              <BidvLogo size={18} variant="square" />
              {!isCollapsed && <span>Sổ Tiết Kiệm</span>}
            </Link>
          )}

          {/* 8. Báo Cáo (Reports - PowerBI Analytics) */}
          {canAccess("reports") && (
            <Link
              href="/reports"
              title="Báo Cáo Tài Chính (PowerBI)"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                isCollapsed ? "justify-center" : ""
              } ${
                pathname === "/reports"
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-300/80 font-bold shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 font-medium"
              }`}
            >
              <PowerBiReportsLogo size={18} variant="square" />
              {!isCollapsed && <span>Báo Cáo</span>}
            </Link>
          )}

          {/* 8.5 Hỗ Trợ / Gửi Ticket */}
          {canAccess("tickets") && (
            <Link
              href="/tickets"
              title="Trung Tâm Hỗ Trợ & Yêu Cầu (Tickets)"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                isCollapsed ? "justify-center" : ""
              } ${
                pathname === "/tickets"
                  ? "bg-blue-50 text-blue-900 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-400 font-bold shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 font-medium"
              }`}
            >
              <MessageSquare className="w-4.5 h-4.5 text-blue-500 shrink-0" />
              {!isCollapsed && <span>Hỗ Trợ (Ticket)</span>}
            </Link>
          )}

          {/* 9. Cài Đặt (Settings - System Security) */}
          <Link
            href="/settings"
            title="Cài Đặt Hệ Thống"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
              isCollapsed ? "justify-center" : ""
            } ${
              pathname === "/settings"
                ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 font-medium"
            }`}
          >
            <SystemSettingsLogo size={18} variant="square" />
            {!isCollapsed && <span>Cài Đặt</span>}
          </Link>

          {/* 10. Quản Trị Hệ Thống Tối Cao (Gộp chung 1 mục Admin duy nhất: Users, Đơn Be, Doanh Thu, Nợ, Tickets) */}
          {session?.user?.role === "admin" && (
            <Link
              href="/admin"
              title="Trung Tâm Quản Trị Toàn Diện (Users, Đơn Be, Doanh Thu, Nợ, Ticket)"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                isCollapsed ? "justify-center" : ""
              } ${
                pathname === "/admin" || pathname.startsWith("/admin")
                  ? "bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 font-bold shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 font-medium"
              }`}
            >
              <div className="w-5 h-5 rounded-lg bg-linear-to-tr from-amber-600 to-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              {!isCollapsed && (
                <span className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate font-semibold">Quản Trị Admin</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500 text-slate-950 shrink-0">
                    HUB
                  </span>
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Footer Thanh Dọc: Thông Tin Tài Khoản & Đăng Xuất */}
        <div className="p-3 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
          {!isCollapsed ? (
            <div className="space-y-2">
              {session?.user && (
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full object-cover border border-emerald-500/40 shrink-0"
                      />
                    ) : (
                      <KeyRound className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[110px]">
                      {session.user.name || session.user.accessKey}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      session.user.role === "admin"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-500/30"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {session.user.role === "admin" ? "Admin" : "User"}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng Xuất</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSignOut}
              title={`Đăng xuất (${session?.user?.name || session?.user?.accessKey})`}
              className="w-full flex justify-center p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
                />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

