"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Plus,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  MessageSquare,
  Send,
  RefreshCw,
  AlertTriangle,
  Wallet,
  Check,
  X,
  Lock,
  Unlock,
  Bike,
  TrendingUp,
  ReceiptText,
  UserCheck,
  UserX,
  Shield,
  Layers,
  Phone,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  getAdminUnifiedDataAction,
  toggleUserApprovalAction,
  changeUserRoleAction,
  createUserWithKeyAction,
  updateAdminUserAction,
  deleteAdminUserAction,
  processBeeOrderApprovalAction,
  processIncomeApprovalAction,
  processDebtApprovalAction,
  replyTicketAction,
  updateUserPermissionsAction,
} from "@/actions/admin";
import {
  DEFAULT_USER_PERMISSIONS,
  type IUserPermissions,
} from "@/types/permissions";
import type {
  AdminUnifiedDataDto,
  AdminUserItemDto,
  PendingBeeOrderItemDto,
  PendingIncomeItemDto,
  PendingDebtItemDto,
} from "@/services/admin.service";
import type { SupportTicketDto } from "@/services/ticket.service";
import {
  BeBikeIcon,
  BeExpressIcon,
  BeEconomyIcon,
  BeCorporateIcon,
} from "@/components/icons/BeeLogo";
import { triggerRealtimeSync, EVENT_NAME } from "@/lib/realtime-sync";

type AdminTab = "users" | "orders" | "incomes" | "debts" | "tickets";

interface EditUserFormState {
  name: string;
  email: string;
  phone: string;
  key: string;
  role: "admin" | "user";
  balance: string;
  isActive: boolean;
}

interface PermissionFeatureMeta {
  key: keyof IUserPermissions;
  label: string;
  category: "Dịch Vụ" | "Tài Chính" | "Hệ Thống";
  description: string;
  badge: string;
}

const PERMISSION_FEATURES: PermissionFeatureMeta[] = [
  {
    key: "dashboard",
    label: "Báo Cáo Tổng Quan (Overview)",
    category: "Tài Chính",
    description: "Biểu đồ dòng tiền, tài sản ròng, số dư các ví và dự báo chi tiêu",
    badge: "OVERVIEW",
  },
  {
    key: "services_bee",
    label: "Dịch Vụ Đơn Be (4 Dịch Vụ)",
    category: "Dịch Vụ",
    description: "beBike, be Siêu Tốc, be Tiết Kiệm, be Doanh Nghiệp",
    badge: "BE BIKE",
  },
  {
    key: "services_fuel",
    label: "Quản Lý Xăng Petrolimex",
    category: "Dịch Vụ",
    description: "Lịch sử đổ xăng, số lít, trạm xăng Petrolimex và tiền xăng",
    badge: "PETROLIMEX",
  },
  {
    key: "services_bonus",
    label: "Thưởng Nóng Be Bonus",
    category: "Dịch Vụ",
    description: "Thưởng cuốc giờ cao điểm, thưởng mốc tuần/tháng đối tác Be",
    badge: "BE BONUS",
  },
  {
    key: "income",
    label: "Doanh Thu & Dòng Tiền",
    category: "Tài Chính",
    description: "Thu nhập ngoài, tài khoản ngân hàng Vietcombank & MoMo",
    badge: "INCOME",
  },
  {
    key: "expenses",
    label: "Chi Phí Vận Hành",
    category: "Tài Chính",
    description: "Bảo dưỡng xe, ăn uống sinh hoạt, thẻ tín dụng Mastercard",
    badge: "EXPENSES",
  },
  {
    key: "debts",
    label: "Quản Lý Khoản Nợ & Trả Góp",
    category: "Tài Chính",
    description: "FE Credit, Home Credit, tiến độ trả gốc lãi định kỳ",
    badge: "DEBTS",
  },
  {
    key: "bills",
    label: "Hóa Đơn & Lịch Định Kỳ",
    category: "Tài Chính",
    description: "Điện lực EVN, Internet VNPT, nhắc hạn chót thanh toán",
    badge: "BILLS",
  },
  {
    key: "savings",
    label: "Sổ Tiết Kiệm Tích Lũy",
    category: "Tài Chính",
    description: "Tiết kiệm ngân hàng BIDV, quỹ khẩn cấp sinh lời",
    badge: "SAVINGS",
  },
  {
    key: "reports",
    label: "Báo Cáo Phân Tích Tài Chính",
    category: "Tài Chính",
    description: "Phân tích số liệu, tỷ lệ tiết kiệm, tỷ trọng chi tiêu",
    badge: "REPORTS",
  },
  {
    key: "tickets",
    label: "Trung Tâm Hỗ Trợ Ticket",
    category: "Hệ Thống",
    description: "Gửi ticket yêu cầu hỗ trợ, khiếu nại, xét duyệt bổ sung",
    badge: "TICKETS",
  },
];

function AdminUnifiedHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as AdminTab) || "users";

  const [activeTab, setActiveTab] = React.useState<AdminTab>(initialTab);
  const [data, setData] = React.useState<AdminUnifiedDataDto | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Modal: Bảng Phân Quyền (Tích chọn chức năng cho User)
  const [permissionModalUser, setPermissionModalUser] = React.useState<AdminUserItemDto | null>(null);
  const [activePerms, setActivePerms] = React.useState<IUserPermissions>(DEFAULT_USER_PERMISSIONS);
  const [isSavingPerms, setIsSavingPerms] = React.useState(false);

  // Modal: Tạo User & Key mới
  const [isCreateUserOpen, setIsCreateUserOpen] = React.useState(false);
  const [newUserName, setNewUserName] = React.useState("");
  const [newUserKey, setNewUserKey] = React.useState("");
  const [newUserRole, setNewUserRole] = React.useState<"admin" | "user">("user");
  const [newUserPhone, setNewUserPhone] = React.useState("");
  const [newUserBalance, setNewUserBalance] = React.useState("0");
  const [newUserPerms, setNewUserPerms] = React.useState<IUserPermissions>({ ...DEFAULT_USER_PERMISSIONS });
  const [isSubmittingUser, setIsSubmittingUser] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<AdminUserItemDto | null>(null);
  const [editUserForm, setEditUserForm] = React.useState<EditUserFormState | null>(null);
  const [isUpdatingUser, setIsUpdatingUser] = React.useState(false);

  // Modal: Trả lời Ticket
  const [replyTicketModal, setReplyTicketModal] = React.useState<SupportTicketDto | null>(null);
  const [adminReplyText, setAdminReplyText] = React.useState("");
  const [ticketStatusSelect, setTicketStatusSelect] = React.useState<"in_progress" | "resolved" | "closed">("resolved");
  const [isSubmittingTicketReply, setIsSubmittingTicketReply] = React.useState(false);

  // Modal: Từ chối có ghi chú
  const [rejectModal, setRejectModal] = React.useState<{
    type: "order" | "income" | "debt";
    id: string;
    codeOrTitle: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [isSubmittingReject, setIsSubmittingReject] = React.useState(false);

  // Tải dữ liệu toàn bộ hệ thống
  const loadUnifiedData = React.useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const res = await getAdminUnifiedDataAction();
      if (res.isSuccess) {
        setData(res.data);
        if (showToast) toast.success("Dữ liệu quản trị đã được cập nhật mới nhất");
      } else {
        toast.error(res.error || "Không thể tải dữ liệu ban quản trị");
      }
    } catch {
      toast.error("Lỗi khi kết nối đến máy chủ quản trị");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadUnifiedData();
  }, [loadUnifiedData]);

  // Nghe sự kiện Realtime Sync
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      loadUnifiedData(false);
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, [loadUnifiedData]);

  // Đổi tab và đồng bộ URL query
  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setStatusFilter("all");
    router.replace(`/admin?tab=${tab}`, { scroll: false });
  };

  // 1. Hành động User: Khóa / Mở khóa
  const handleToggleUserActive = async (targetUser: AdminUserItemDto) => {
    const nextState = !targetUser.isActive;
    const actionLabel = nextState ? "Mở khóa & Kích hoạt" : "Khóa tài khoản";
    if (!confirm(`Bạn có chắc muốn ${actionLabel} cho [${targetUser.name}]?`)) return;

    try {
      const res = await toggleUserApprovalAction(targetUser.id, nextState);
      if (res.isSuccess) {
        toast.success(`Đã ${actionLabel.toLowerCase()} thành công`);
        loadUnifiedData();
        triggerRealtimeSync("user_status_changed");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái người dùng");
    }
  };

  // 2. Hành động User: Đổi quyền Admin <-> User
  const handleChangeUserRole = async (targetUser: AdminUserItemDto) => {
    const nextRole = targetUser.role === "admin" ? "user" : "admin";
    const roleLabel = nextRole === "admin" ? "Quản Trị Viên (Admin)" : "Thành Viên Thường (User)";
    if (!confirm(`Bạn có chắc muốn chuyển quyền [${targetUser.name}] sang ${roleLabel}?`)) return;

    try {
      const res = await changeUserRoleAction(targetUser.id, nextRole);
      if (res.isSuccess) {
        toast.success(`Đã nâng/hạ quyền thành công sang: ${roleLabel}`);
        loadUnifiedData();
        triggerRealtimeSync("user_role_changed");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi thay đổi quyền người dùng");
    }
  };

  // 3. Tạo User + Key mới (Key chính là Số Điện Thoại)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = (newUserPhone || newUserKey).trim().replace(/[\s\-\.]/g, "");
    if (!newUserName.trim() || !cleanPhone) {
      toast.error("Vui lòng điền tên và số điện thoại");
      return;
    }

    try {
      setIsSubmittingUser(true);
      const res = await createUserWithKeyAction({
        name: newUserName.trim(),
        key: cleanPhone,
        role: newUserRole,
        phone: cleanPhone,
        balance: parseInt(newUserBalance.replace(/\D/g, ""), 10) || 0,
        permissions: newUserPerms,
      });

      if (res.isSuccess) {
        toast.success(`Đã tạo thành công tài khoản [${newUserName}] với SĐT: ${cleanPhone}`);
        setIsCreateUserOpen(false);
        setNewUserName("");
        setNewUserKey("");
        setNewUserPhone("");
        setNewUserBalance("0");
        setNewUserRole("user");
        loadUnifiedData();
        triggerRealtimeSync("new_user_created");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi tạo người dùng mới");
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const openEditUser = (user: AdminUserItemDto) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email ?? "",
      phone: user.phone ?? "",
      key: user.accessKey ?? "",
      role: user.role,
      balance: user.walletBalance.toLocaleString("vi-VN"),
      isActive: user.isActive,
    });
  };

  const handleUpdateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingUser || !editUserForm) return;

    try {
      setIsUpdatingUser(true);
      const result = await updateAdminUserAction(editingUser.id, {
        ...editUserForm,
        balance: Number(editUserForm.balance.replace(/\D/g, "")) || 0,
      });
      if (!result.isSuccess) {
        toast.error(result.error);
        return;
      }

      toast.success(`Đã cập nhật thành viên [${editUserForm.name}]`);
      setEditingUser(null);
      setEditUserForm(null);
      await loadUnifiedData();
      triggerRealtimeSync("user_updated");
    } catch {
      toast.error("Lỗi khi cập nhật thành viên");
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleDeleteUser = async (user: AdminUserItemDto) => {
    const confirmed = confirm(
      `Xóa vĩnh viễn tài khoản [${user.name}] và toàn bộ dữ liệu tài chính liên quan? Hành động này không thể hoàn tác.`
    );
    if (!confirmed) return;

    try {
      const result = await deleteAdminUserAction(user.id);
      if (!result.isSuccess) {
        toast.error(result.error);
        return;
      }

      toast.success(`Đã xóa tài khoản [${user.name}]`);
      await loadUnifiedData();
      triggerRealtimeSync("user_deleted");
    } catch {
      toast.error("Lỗi khi xóa thành viên");
    }
  };

  // 3.5 Bảng Phân Quyền Chức Năng (11 Tính Năng)
  const openPermissionModal = (user: AdminUserItemDto) => {
    setPermissionModalUser(user);
    setActivePerms(user.permissions ? { ...user.permissions } : { ...DEFAULT_USER_PERMISSIONS });
  };

  const handleTogglePerm = (key: keyof IUserPermissions) => {
    setActivePerms((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePresetPerms = (preset: "all" | "none" | "bee" | "finance") => {
    if (preset === "all") {
      setActivePerms({ ...DEFAULT_USER_PERMISSIONS });
    } else if (preset === "none") {
      setActivePerms({
        dashboard: false,
        services_bee: false,
        services_fuel: false,
        services_bonus: false,
        debts: false,
        income: false,
        expenses: false,
        bills: false,
        savings: false,
        reports: false,
        tickets: false,
      });
    } else if (preset === "bee") {
      setActivePerms({
        dashboard: true,
        services_bee: true,
        services_fuel: true,
        services_bonus: true,
        income: true,
        expenses: true,
        debts: false,
        bills: false,
        savings: false,
        reports: false,
        tickets: true,
      });
    } else if (preset === "finance") {
      setActivePerms({
        dashboard: true,
        services_bee: false,
        services_fuel: false,
        services_bonus: false,
        income: true,
        expenses: true,
        debts: true,
        bills: true,
        savings: true,
        reports: true,
        tickets: true,
      });
    }
  };

  const handleSavePerms = async () => {
    if (!permissionModalUser) return;
    setIsSavingPerms(true);
    try {
      const res = await updateUserPermissionsAction(permissionModalUser.id, activePerms);
      if (res.isSuccess) {
        toast.success(`Đã cập nhật bảng phân quyền cho [${permissionModalUser.name}] thành công!`);
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            users: prev.users.map((u) =>
              u.id === permissionModalUser.id ? { ...u, permissions: res.data } : u
            ),
          };
        });
        triggerRealtimeSync("user_permissions_updated");
        setPermissionModalUser(null);
      } else {
        toast.error(res.error || "Không thể cập nhật phân quyền");
      }
    } catch (e: any) {
      toast.error(e?.message || "Lỗi khi lưu phân quyền");
    } finally {
      setIsSavingPerms(false);
    }
  };

  // 4. Duyệt Đơn Be
  const handleApproveBeeOrder = async (order: PendingBeeOrderItemDto) => {
    const netEarnings = order.driverEarnings + order.tip;
    try {
      const res = await processBeeOrderApprovalAction(order.id, "approve");
      if (res.isSuccess) {
        toast.success(`Đã duyệt đơn [${order.orderCode}]. +${netEarnings.toLocaleString("vi-VN")} ₫ vào ví tài xế`);
        loadUnifiedData();
        triggerRealtimeSync("bee_order_approved");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi duyệt đơn Be");
    }
  };

  // 5. Duyệt Doanh Thu
  const handleApproveIncome = async (income: PendingIncomeItemDto) => {
    try {
      const res = await processIncomeApprovalAction(income.id, "approve");
      if (res.isSuccess) {
        toast.success(`Đã duyệt khoản thu [${income.name}]. +${income.amount.toLocaleString("vi-VN")} ₫ vào ví`);
        loadUnifiedData();
        triggerRealtimeSync("income_approved");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi duyệt khoản thu");
    }
  };

  // 6. Duyệt Khoản Nợ
  const handleApproveDebt = async (debt: PendingDebtItemDto) => {
    try {
      const res = await processDebtApprovalAction(debt.id, "approve");
      if (res.isSuccess) {
        toast.success(`Đã xác nhận khoản nợ [${debt.title}]`);
        loadUnifiedData();
        triggerRealtimeSync("debt_approved");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi duyệt khoản nợ");
    }
  };

  // 7. Xử lý Từ chối (Submit Reject Modal)
  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModal) return;

    try {
      setIsSubmittingReject(true);
      let res;
      if (rejectModal.type === "order") {
        res = await processBeeOrderApprovalAction(rejectModal.id, "reject", rejectReason.trim() || undefined);
      } else if (rejectModal.type === "income") {
        res = await processIncomeApprovalAction(rejectModal.id, "reject", rejectReason.trim() || undefined);
      } else {
        res = await processDebtApprovalAction(rejectModal.id, "reject", rejectReason.trim() || undefined);
      }

      if (res.isSuccess) {
        toast.success(`Đã từ chối mục [${rejectModal.codeOrTitle}]`);
        setRejectModal(null);
        setRejectReason("");
        loadUnifiedData();
        triggerRealtimeSync("item_rejected");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi từ chối yêu cầu");
    } finally {
      setIsSubmittingReject(false);
    }
  };

  // 8. Trả lời Ticket
  const handleSubmitTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTicketModal) return;
    if (!adminReplyText.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi cho thành viên");
      return;
    }

    try {
      setIsSubmittingTicketReply(true);
      const res = await replyTicketAction(
        replyTicketModal.id,
        adminReplyText.trim(),
        ticketStatusSelect
      );

      if (res.isSuccess) {
        toast.success(`Đã gửi phản hồi cho ticket [${replyTicketModal.ticketCode}]`);
        setReplyTicketModal(null);
        setAdminReplyText("");
        loadUnifiedData();
        triggerRealtimeSync("ticket_replied");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi gửi phản hồi ticket");
    } finally {
      setIsSubmittingTicketReply(false);
    }
  };

  // Danh sách đã lọc theo Tab & Search
  const filteredUsers = React.useMemo(() => {
    if (!data?.users) return [];
    return data.users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.accessKey?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.walletCode?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (statusFilter === "active") return u.isActive;
      if (statusFilter === "locked") return !u.isActive;
      if (statusFilter === "admin") return u.role === "admin";
      if (statusFilter === "user") return u.role === "user";
      return true;
    });
  }, [data?.users, searchQuery, statusFilter]);

  const filteredOrders = React.useMemo(() => {
    if (!data?.orders) return [];
    return data.orders.filter((o) => {
      const matchSearch =
        o.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.note?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (statusFilter !== "all" && o.approvalStatus !== statusFilter) return false;
      return true;
    });
  }, [data?.orders, searchQuery, statusFilter]);

  const filteredIncomes = React.useMemo(() => {
    if (!data?.incomes) return [];
    return data.incomes.filter((inc) => {
      const matchSearch =
        inc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.type.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (statusFilter !== "all" && inc.approvalStatus !== statusFilter) return false;
      return true;
    });
  }, [data?.incomes, searchQuery, statusFilter]);

  const filteredDebts = React.useMemo(() => {
    if (!data?.debts) return [];
    return data.debts.filter((d) => {
      const matchSearch =
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.category.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (statusFilter !== "all" && d.approvalStatus !== statusFilter) return false;
      return true;
    });
  }, [data?.debts, searchQuery, statusFilter]);

  const filteredTickets = React.useMemo(() => {
    if (!data?.tickets) return [];
    return data.tickets.filter((t) => {
      const matchSearch =
        t.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.userName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.message.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      return true;
    });
  }, [data?.tickets, searchQuery, statusFilter]);

  const getServiceBadge = (type: string) => {
    switch (type) {
      case "beBike":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FFC700]/20 text-[#854D0E] dark:text-[#FDE047] border border-[#FFC700]/40">
            <BeBikeIcon size={12} />
            <span>beBike</span>
          </span>
        );
      case "beDeliveryExpress":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
            <BeExpressIcon size={12} />
            <span>be Siêu Tốc</span>
          </span>
        );
      case "beDeliveryEconomy":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
            <BeEconomyIcon size={12} />
            <span>be Tiết Kiệm</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
            <BeCorporateIcon size={12} />
            <span>be Doanh Nghiệp</span>
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Đang tải trung tâm điều hành & quản trị tổng thể...</p>
      </div>
    );
  }

  const summary = data?.summary || {
    totalUsers: 0,
    activeUsers: 0,
    pendingOrLockedUsers: 0,
    totalAdminCount: 0,
    totalWalletBalances: 0,
    pendingOrdersCount: 0,
    pendingIncomesCount: 0,
    pendingDebtsCount: 0,
    openTicketsCount: 0,
    totalPendingCount: 0,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Hero Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-amber-950 text-white border border-amber-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" /> BAN QUẢN TRỊ TỐI CAO
            </span>
            {summary.totalPendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                {summary.totalPendingCount} yêu cầu đang chờ duyệt
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            Trung Tâm Quản Trị Hệ Thống Toàn Diện
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Một đầu mối duy nhất: Xét duyệt chuyến đi tài xế, phê chuẩn doanh thu, quản lý nợ, tiếp nhận ticket hỗ trợ và kiểm soát thành viên toàn hệ thống.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => loadUnifiedData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all disabled:opacity-50"
            title="Làm mới dữ liệu toàn hệ thống"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Làm Mới</span>
          </button>

          <button
            onClick={() => {
              setNewUserKey("");
              setNewUserPhone("");
              setNewUserName("");
              setNewUserBalance("0");
              setIsCreateUserOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Cấp Thành Viên & SĐT Mới</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Bento Grid (6 Key KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Thành Viên */}
        <div
          onClick={() => handleTabChange("users")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-500/50 shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/[0.08] hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Thành Viên</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
            {summary.totalUsers}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{summary.activeUsers} hoạt động</span>
          </div>
        </div>

        {/* KPI 2: Đơn Chờ Duyệt */}
        <div
          onClick={() => handleTabChange("orders")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "orders"
              ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-500/50 shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/[0.08] hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Đơn Be Duyệt</span>
            <Bike className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black font-mono tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
            {summary.pendingOrdersCount}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
            <span>Cuốc xe chờ xác nhận</span>
          </div>
        </div>

        {/* KPI 3: Doanh Thu Duyệt */}
        <div
          onClick={() => handleTabChange("incomes")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "incomes"
              ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-500/50 shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Doanh Thu Duyệt</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {summary.pendingIncomesCount}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
            <span>Khoản thu chờ cộng ví</span>
          </div>
        </div>

        {/* KPI 4: Nợ Chờ Duyệt */}
        <div
          onClick={() => handleTabChange("debts")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "debts"
              ? "bg-rose-50/80 dark:bg-rose-950/40 border-rose-400 dark:border-rose-500/50 shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/[0.08] hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Nợ Chờ Duyệt</span>
            <CreditCard className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-black font-mono tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
            {summary.pendingDebtsCount}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
            <span>Khoản nợ khai báo mới</span>
          </div>
        </div>

        {/* KPI 5: Ticket Hỗ Trợ */}
        <div
          onClick={() => handleTabChange("tickets")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "tickets"
              ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-500/50 shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-300"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Ticket Mở</span>
            <MessageSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-black font-mono tracking-tight text-indigo-600 dark:text-indigo-400 tabular-nums">
            {summary.openTicketsCount}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
            <span>Yêu cầu cần phản hồi</span>
          </div>
        </div>

        {/* KPI 6: Tổng Ví Hệ Thống */}
        <div className="p-3.5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold">Tổng Số Dư Ví</span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-sm font-black font-mono tracking-tight text-slate-900 dark:text-white tabular-nums truncate">
            {summary.totalWalletBalances.toLocaleString("vi-VN")} ₫
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 truncate">
            <span>Tất cả thành viên</span>
          </div>
        </div>
      </div>

      {/* 3. Modern Boutique Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.08] pb-3">
        {/* Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => handleTabChange("users")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "users"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Thành Viên & Mã Khóa</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-600 dark:text-blue-400">
              {data?.users?.length || 0}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("orders")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "orders"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Duyệt Đơn Be / Khách Hàng</span>
            {summary.pendingOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black bg-rose-500 text-white">
                {summary.pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange("incomes")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "incomes"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Duyệt Doanh Thu</span>
            {summary.pendingIncomesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black bg-rose-500 text-white">
                {summary.pendingIncomesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange("debts")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "debts"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Duyệt Khoản Nợ</span>
            {summary.pendingDebtsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black bg-rose-500 text-white">
                {summary.pendingDebtsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange("tickets")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "tickets"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Xử Lý Ticket Hỗ Trợ</span>
            {summary.openTicketsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black bg-rose-500 text-white">
                {summary.openTicketsCount}
              </span>
            )}
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nhanh..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 w-40 sm:w-48"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="all">Tất cả trạng thái</option>
            {activeTab === "users" && (
              <>
                <option value="active">Đang hoạt động</option>
                <option value="locked">Bị khóa</option>
                <option value="admin">Quyền Admin</option>
                <option value="user">Quyền User</option>
              </>
            )}
            {(activeTab === "orders" || activeTab === "incomes" || activeTab === "debts") && (
              <>
                <option value="pending">⏳ Đang chờ duyệt</option>
                <option value="approved">✅ Đã phê duyệt</option>
                <option value="rejected">❌ Bị từ chối</option>
              </>
            )}
            {activeTab === "tickets" && (
              <>
                <option value="open">Chờ xử lý (Open)</option>
                <option value="in_progress">Đang giải quyết</option>
                <option value="resolved">Đã xử lý xong</option>
                <option value="closed">Đã đóng</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* 4. Tab Content Area */}
      <AnimatePresence mode="wait">
        {/* ======================================================== */}
        {/* TAB 1: USERS & ACCESS KEYS                              */}
        {/* ======================================================== */}
        {activeTab === "users" && (
          <motion.div
            key="tab-users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 font-semibold border-b border-slate-200 dark:border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">Thành Viên</th>
                      <th className="py-3 px-4">Mã Khóa (Key)</th>
                      <th className="py-3 px-4">Ví Thu Nhập</th>
                      <th className="py-3 px-4">Quyền Hạn</th>
                      <th className="py-3 px-4 text-center">Phân Quyền Chức Năng</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4 text-right">Thao Tác Quản Trị</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Không tìm thấy người dùng nào phù hợp
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                          {/* Thành viên */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-white/10 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {u.role === "admin" && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500 text-slate-950">
                                      ADMIN
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                  {u.phone && <span>📞 {u.phone}</span>}
                                  {u.email && <span>✉️ {u.email}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Mã khóa */}
                          <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <KeyRound className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md border border-slate-200 dark:border-white/10">
                                {u.accessKey || "CHƯA CÓ KEY"}
                              </span>
                            </div>
                          </td>

                          {/* Ví thu nhập */}
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                              {u.walletBalance.toLocaleString("vi-VN")} ₫
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                              {u.walletCode}
                            </div>
                          </td>

                          {/* Quyền Hạn */}
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleChangeUserRole(u)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                u.role === "admin"
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10"
                              }`}
                              title="Nhấp để đổi quyền Admin <-> User"
                            >
                              {u.role === "admin" ? (
                                <>
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Quản Trị Viên</span>
                                </>
                              ) : (
                                <>
                                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Người Dùng</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Phân Quyền Chức Năng (11 Tính Năng) */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => openPermissionModal(u)}
                              className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 active:scale-95 cursor-pointer shadow-2xs"
                              title="Tích chọn chức năng thành viên được phép sử dụng"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>
                                {u.role === "admin"
                                  ? "Toàn Quyền (11/11)"
                                  : `Phân Quyền (${
                                      Object.values(u.permissions || DEFAULT_USER_PERMISSIONS).filter(Boolean).length
                                    }/11)`}
                              </span>
                            </button>
                          </td>

                          {/* Trạng Thái */}
                          <td className="py-3 px-4">
                            {u.isActive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Hoạt Động</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30">
                                <Lock className="w-3 h-3" />
                                <span>Bị Khóa</span>
                              </span>
                            )}
                          </td>

                          {/* Thao tác */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openPermissionModal(u)}
                                className="inline-flex min-h-11 items-center gap-1 px-3 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 cursor-pointer"
                                title="Bảng phân quyền chức năng"
                              >
                                <Shield className="w-3.5 h-3.5" />
                                <span>Phân Quyền</span>
                              </button>
                              <button
                                onClick={() => openEditUser(u)}
                                className="inline-flex min-h-11 items-center gap-1 px-3 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100"
                                title="Chỉnh sửa thành viên"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Sửa</span>
                              </button>
                              <button
                                onClick={() => handleToggleUserActive(u)}
                                className={`flex min-h-11 items-center gap-1 px-3 rounded-xl text-xs font-semibold transition-all ${
                                  u.isActive
                                    ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100"
                                    : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100"
                                }`}
                              >
                                {u.isActive ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Khóa</span>
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" />
                                    <span>Kích Hoạt</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="inline-flex min-h-11 items-center gap-1 px-3 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100"
                                title="Xóa vĩnh viễn thành viên"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Xóa</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: DUYỆT ĐƠN BE / KHÁCH HÀNG                         */}
        {/* ======================================================== */}
        {activeTab === "orders" && (
          <motion.div
            key="tab-orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 font-semibold border-b border-slate-200 dark:border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">Mã Đơn / Dịch Vụ</th>
                      <th className="py-3 px-4">Tài Xế Gửi Lên</th>
                      <th className="py-3 px-4">Cước & Chiết Khấu</th>
                      <th className="py-3 px-4">Thực Nhận (+Tip)</th>
                      <th className="py-3 px-4">Thời Gian & Ghi Chú</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4 text-right">Phê Duyệt Đơn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Không có đơn chuyến đi nào cần xét duyệt
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                          {/* Mã đơn */}
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-slate-900 dark:text-white">
                              {o.orderCode}
                            </div>
                            <div className="mt-1">{getServiceBadge(o.serviceType)}</div>
                          </td>

                          {/* Tài xế */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {o.userName}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {o.walletCode}
                            </div>
                          </td>

                          {/* Cước & Chiết khấu */}
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                              {o.customerFare.toLocaleString("vi-VN")} ₫
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Phí sàn: -{o.platformFee.toLocaleString("vi-VN")} ₫
                              {o.taxTncn > 0 && (
                                <span className="ml-1 text-rose-500">• Thuế: -{o.taxTncn.toLocaleString("vi-VN")} ₫</span>
                              )}
                            </div>
                          </td>

                          {/* Thực nhận */}
                          <td className="py-3 px-4">
                            <div className="font-mono font-black text-emerald-600 dark:text-emerald-400 tabular-nums text-sm">
                              {(o.driverEarnings + o.tip).toLocaleString("vi-VN")} ₫
                            </div>
                            {o.tip > 0 && (
                              <div className="text-[10px] text-amber-500 font-mono">
                                +Tip: {o.tip.toLocaleString("vi-VN")} ₫
                              </div>
                            )}
                          </td>

                          {/* Thời gian & ghi chú */}
                          <td className="py-3 px-4">
                            <div className="text-slate-600 dark:text-slate-300">
                              {new Date(o.orderDate).toLocaleDateString("vi-VN")} {o.tripTime}
                            </div>
                            {o.note && (
                              <div className="text-[10px] text-slate-400 italic line-clamp-1 max-w-[150px]">
                                {o.note}
                              </div>
                            )}
                            {o.adminNote && (
                              <div className="text-[10px] text-rose-500 font-medium">
                                Lý do: {o.adminNote}
                              </div>
                            )}
                          </td>

                          {/* Trạng thái */}
                          <td className="py-3 px-4">
                            {o.approvalStatus === "approved" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Đã Duyệt Vào Ví</span>
                              </span>
                            )}
                            {o.approvalStatus === "pending" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 animate-pulse">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Chờ Admin Duyệt</span>
                              </span>
                            )}
                            {o.approvalStatus === "rejected" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Bị Từ Chối</span>
                              </span>
                            )}
                          </td>

                          {/* Phê duyệt */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {o.approvalStatus !== "approved" && (
                                <button
                                  onClick={() => handleApproveBeeOrder(o)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all"
                                  title="Duyệt đơn và lập tức cộng tiền vào Ví tài xế"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Duyệt</span>
                                </button>
                              )}

                              {o.approvalStatus !== "rejected" && (
                                <button
                                  onClick={() =>
                                    setRejectModal({
                                      type: "order",
                                      id: o.id,
                                      codeOrTitle: o.orderCode,
                                    })
                                  }
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 transition-all"
                                  title="Từ chối đơn"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Từ Chối</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: DUYỆT DOANH THU                                  */}
        {/* ======================================================== */}
        {activeTab === "incomes" && (
          <motion.div
            key="tab-incomes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 font-semibold border-b border-slate-200 dark:border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">Tên Khoản Thu</th>
                      <th className="py-3 px-4">Người Gửi Lên</th>
                      <th className="py-3 px-4">Số Tiền (VND)</th>
                      <th className="py-3 px-4">Phân Loại / Ngày Nhận</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4 text-right">Phê Duyệt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                    {filteredIncomes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          Không có khoản doanh thu nào cần xét duyệt
                        </td>
                      </tr>
                    ) : (
                      filteredIncomes.map((inc) => (
                        <tr key={inc.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {inc.name}
                            {inc.note && <div className="text-[10px] text-slate-400 font-normal italic">{inc.note}</div>}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">{inc.userName}</div>
                            <div className="text-[10px] font-mono text-slate-400">{inc.walletCode}</div>
                          </td>
                          <td className="py-3 px-4 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm tabular-nums">
                            +{inc.amount.toLocaleString("vi-VN")} ₫
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-600 dark:text-slate-300 capitalize">{inc.type}</div>
                            {inc.date && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                {new Date(inc.date).toLocaleDateString("vi-VN")}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {inc.approvalStatus === "approved" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Đã Cộng Ví
                              </span>
                            )}
                            {inc.approvalStatus === "pending" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 animate-pulse">
                                <Clock className="w-3.5 h-3.5" /> Chờ Duyệt
                              </span>
                            )}
                            {inc.approvalStatus === "rejected" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300">
                                <XCircle className="w-3.5 h-3.5" /> Bị Từ Chối
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {inc.approvalStatus !== "approved" && (
                                <button
                                  onClick={() => handleApproveIncome(inc)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" /> Duyệt
                                </button>
                              )}
                              {inc.approvalStatus !== "rejected" && (
                                <button
                                  onClick={() =>
                                    setRejectModal({
                                      type: "income",
                                      id: inc.id,
                                      codeOrTitle: inc.name,
                                    })
                                  }
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200"
                                >
                                  <X className="w-3.5 h-3.5" /> Từ Chối
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: DUYỆT KHOẢN NỢ                                    */}
        {/* ======================================================== */}
        {activeTab === "debts" && (
          <motion.div
            key="tab-debts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 font-semibold border-b border-slate-200 dark:border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">Tên Khoản Nợ</th>
                      <th className="py-3 px-4">Người Khai Báo</th>
                      <th className="py-3 px-4">Tổng Nợ & Còn Lại</th>
                      <th className="py-3 px-4">Trả Hàng Tháng / Kỳ Hạn</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4 text-right">Phê Duyệt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                    {filteredDebts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          Không có khoản nợ nào cần xét duyệt
                        </td>
                      </tr>
                    ) : (
                      filteredDebts.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {d.title}
                            <div className="text-[10px] text-slate-400 uppercase font-mono">{d.category}</div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                            {d.userName}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                              {d.remainingAmount.toLocaleString("vi-VN")} ₫
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Tổng: {d.totalAmount.toLocaleString("vi-VN")} ₫
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                              {d.monthlyPayment.toLocaleString("vi-VN")} ₫/tháng
                            </div>
                            <div className="text-[10px] text-slate-400">Đến hạn ngày {d.dueDay} hàng tháng</div>
                          </td>
                          <td className="py-3 px-4">
                            {d.approvalStatus === "approved" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Đã Xác Nhận
                              </span>
                            )}
                            {d.approvalStatus === "pending" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 animate-pulse">
                                <Clock className="w-3.5 h-3.5" /> Chờ Duyệt
                              </span>
                            )}
                            {d.approvalStatus === "rejected" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300">
                                <XCircle className="w-3.5 h-3.5" /> Từ Chối
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {d.approvalStatus !== "approved" && (
                                <button
                                  onClick={() => handleApproveDebt(d)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all"
                                >
                                  <Check className="w-3.5 h-3.5" /> Xác Nhận
                                </button>
                              )}
                              {d.approvalStatus !== "rejected" && (
                                <button
                                  onClick={() =>
                                    setRejectModal({
                                      type: "debt",
                                      id: d.id,
                                      codeOrTitle: d.title,
                                    })
                                  }
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200"
                                >
                                  <X className="w-3.5 h-3.5" /> Từ Chối
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: TIẾP NHẬN & PHẢN HỒI TICKET                      */}
        {/* ======================================================== */}
        {activeTab === "tickets" && (
          <motion.div
            key="tab-tickets"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTickets.length === 0 ? (
                <div className="col-span-2 py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/[0.08]">
                  Không có yêu cầu hỗ trợ nào trong danh mục này
                </div>
              ) : (
                filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                            {t.ticketCode}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            bởi <strong className="text-slate-700 dark:text-slate-200">{t.userName}</strong>
                          </span>
                        </div>

                        {/* Priority Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            t.priority === "high"
                              ? "bg-rose-500 text-white"
                              : t.priority === "medium"
                              ? "bg-amber-500 text-slate-950"
                              : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {t.priority === "high"
                            ? "Khẩn Cấp"
                            : t.priority === "medium"
                            ? "Bình Thường"
                            : "Thấp"}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {t.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-200/50 dark:border-white/[0.05] whitespace-pre-wrap">
                        {t.message}
                      </p>

                      {/* Phản hồi hiện tại của Admin nếu có */}
                      {t.adminReply && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                          <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Phản Hồi Từ Ban Quản Trị:</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                            {t.adminReply}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.05] text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">
                        {new Date(t.createdAt).toLocaleString("vi-VN")}
                      </span>

                      <button
                        onClick={() => {
                          setReplyTicketModal(t);
                          setAdminReplyText(t.adminReply || "");
                          setTicketStatusSelect(t.status === "open" ? "resolved" : t.status);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Phản Hồi & Đóng</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingUser && editUserForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="w-full max-w-xl rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Chỉnh Sửa Thành Viên</h3>
                  <p className="mt-1 text-xs text-slate-500">Đồng bộ tài khoản, mã khóa và ví thu nhập.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setEditUserForm(null);
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                  aria-label="Đóng hộp thoại chỉnh sửa"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="mt-5 space-y-4 text-xs">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5 font-semibold text-slate-600 dark:text-slate-300">
                    <span>Tên thành viên *</span>
                    <input
                      required
                      value={editUserForm.name}
                      onChange={(event) => setEditUserForm({ ...editUserForm, name: event.target.value })}
                      className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </label>
                  <label className="space-y-1.5 font-semibold text-slate-600 dark:text-slate-300">
                    <span>Mã khóa *</span>
                    <input
                      required
                      value={editUserForm.key}
                      onChange={(event) => setEditUserForm({ ...editUserForm, key: event.target.value.toUpperCase() })}
                      className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono uppercase text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </label>
                  <label className="space-y-1.5 font-semibold text-slate-600 dark:text-slate-300">
                    <span>Email</span>
                    <input
                      type="email"
                      value={editUserForm.email}
                      onChange={(event) => setEditUserForm({ ...editUserForm, email: event.target.value })}
                      className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </label>
                  <label className="space-y-1.5 font-semibold text-slate-600 dark:text-slate-300">
                    <span>Số điện thoại</span>
                    <input
                      inputMode="numeric"
                      value={editUserForm.phone}
                      onChange={(event) => setEditUserForm({ ...editUserForm, phone: event.target.value })}
                      className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </label>
                  <label className="space-y-1.5 font-semibold text-slate-600 dark:text-slate-300">
                    <span>Quyền hạn</span>
                    <select
                      value={editUserForm.role}
                      onChange={(event) => setEditUserForm({ ...editUserForm, role: event.target.value as "admin" | "user" })}
                      className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-900 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="user">Người dùng</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </label>
                  <label className="space-y-1.5 font-semibold text-slate-600 dark:text-slate-300">
                    <span>Số dư ví</span>
                    <input
                      inputMode="numeric"
                      value={editUserForm.balance}
                      onChange={(event) => {
                        const value = Number(event.target.value.replace(/\D/g, "")) || 0;
                        setEditUserForm({ ...editUserForm, balance: value.toLocaleString("vi-VN") });
                      }}
                      className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono tabular-nums text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </label>
                </div>

                <label className="flex min-h-11 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-white/10 dark:bg-white/5">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Cho phép đăng nhập</span>
                  <input
                    type="checkbox"
                    checked={editUserForm.isActive}
                    onChange={(event) => setEditUserForm({ ...editUserForm, isActive: event.target.checked })}
                    className="h-5 w-5 accent-blue-600"
                  />
                </label>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUser(null);
                      setEditUserForm(null);
                    }}
                    className="min-h-11 rounded-xl px-4 font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingUser}
                    className="min-h-11 rounded-xl bg-blue-600 px-5 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 disabled:opacity-50"
                  >
                    {isUpdatingUser ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 1: CẤP THÀNH VIÊN & MÃ KHÓA MỚI                    */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isCreateUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Cấp Thành Viên & Mã Khóa Mới
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreateUserOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Tên Thành Viên *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="VD: Nguyễn Văn Tài Xế"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Số Điện Thoại (Mã Khóa Đăng Nhập) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[\s\-\.]/g, "");
                      setNewUserPhone(val);
                      setNewUserKey(val);
                    }}
                    placeholder="VD: 0987654321"
                    className="w-full px-3.5 py-2.5 rounded-xl font-mono text-sm tracking-wider bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Thành viên sẽ dùng chính số điện thoại này để đăng nhập vào hệ thống.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      Quyền Hạn
                    </label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as "admin" | "user")}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="user">Người Dùng (User)</option>
                      <option value="admin">Quản Trị Viên (Admin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      Số Dư Ban Đầu (đ)
                    </label>
                    <input
                      type="text"
                      value={newUserBalance}
                      onChange={(e) => {
                        const num = parseInt(e.target.value.replace(/\D/g, ""), 10) || 0;
                        setNewUserBalance(num.toLocaleString("vi-VN"));
                      }}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl font-mono bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setIsCreateUserOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingUser}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 disabled:opacity-50"
                  >
                    {isSubmittingUser ? "Đang Cấp..." : "Xác Nhận Cấp Key"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 2: PHẢN HỒI TICKET HỖ TRỢ                          */}
      {/* ======================================================== */}
      <AnimatePresence>
        {replyTicketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Phản Hồi Yêu Cầu [{replyTicketModal.ticketCode}]
                  </h3>
                </div>
                <button
                  onClick={() => setReplyTicketModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  {replyTicketModal.title}
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  {replyTicketModal.message}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Người gửi: {replyTicketModal.userName} (📞 {replyTicketModal.userPhone || "Chưa có SĐT"})
                </div>
              </div>

              <form onSubmit={handleSubmitTicketReply} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Cập Nhật Trạng Thái
                  </label>
                  <select
                    value={ticketStatusSelect}
                    onChange={(e) => setTicketStatusSelect(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="in_progress">Đang xử lý (In Progress)</option>
                    <option value="resolved">Đã giải quyết (Resolved)</option>
                    <option value="closed">Đóng ticket (Closed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Nội Dung Phản Hồi Cho Thành Viên *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    placeholder="Nhập giải pháp, câu trả lời hoặc hướng dẫn xử lý gửi đến thành viên..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setReplyTicketModal(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTicketReply}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingTicketReply ? "Đang Gửi..." : "Gửi Phản Hồi"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 3: TỪ CHỐI DUYỆT (KÈM LÝ DO)                       */}
      {/* ======================================================== */}
      <AnimatePresence>
        {rejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Từ Chối Xét Duyệt [{rejectModal.codeOrTitle}]
                  </h3>
                </div>
                <button
                  onClick={() => setRejectModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Lý Do Từ Chối (Sẽ thông báo cho thành viên)
                  </label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="VD: Sai sót số liệu cước xe, hóa đơn không hợp lệ, thông tin không trùng khớp..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setRejectModal(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReject}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/20 disabled:opacity-50"
                  >
                    {isSubmittingReject ? "Đang Xử Lý..." : "Xác Nhận Từ Chối"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ======================================================== */}
      {/* MODAL 4: BẢNG PHÂN QUYỀN CHỨC NĂNG (11 TÍNH NĂNG)          */}
      {/* ======================================================== */}
      <AnimatePresence>
        {permissionModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                      Bảng Phân Quyền Chức Năng
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Thành viên: <strong className="text-slate-800 dark:text-slate-200">{permissionModalUser.name}</strong> • SĐT: <span className="font-mono">{permissionModalUser.phone || permissionModalUser.accessKey}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPermissionModalUser(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Thông báo nếu là Admin */}
              {permissionModalUser.role === "admin" && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 font-medium shrink-0 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Tài khoản có vai trò <strong>Quản Trị Viên (Admin)</strong> mặc định luôn có toàn quyền 100% hệ thống (11/11).
                  </span>
                </div>
              )}

              {/* Hàng nút Preset chọn nhanh */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 shrink-0 bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-2xl border border-slate-100 dark:border-white/5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>⚡ Gói Phân Quyền Nhanh:</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePresetPerms("all")}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all cursor-pointer"
                  >
                    ⚡ Tất Cả (11/11)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetPerms("bee")}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FFC700]/20 text-amber-950 dark:text-amber-300 border border-[#FFC700]/50 hover:bg-[#FFC700]/30 transition-all cursor-pointer"
                  >
                    🛵 Gói Tài Xế Be (7/11)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetPerms("finance")}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all cursor-pointer"
                  >
                    💳 Gói Nợ & Chi Phí (7/11)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetPerms("none")}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-white/15 transition-all cursor-pointer"
                  >
                    ❌ Bỏ Chọn Hết (0/11)
                  </button>
                </div>
              </div>

              {/* Danh Sách 11 Chức Năng (Tự Cuộn) */}
              <div className="overflow-y-auto flex-1 pr-1 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PERMISSION_FEATURES.map((feat) => {
                    const isChecked = !!activePerms[feat.key];
                    return (
                      <div
                        key={feat.key}
                        onClick={() => handleTogglePerm(feat.key)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isChecked
                            ? "bg-emerald-500/10 border-emerald-500/40 shadow-xs"
                            : "bg-slate-50/80 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.06] opacity-75 hover:opacity-100 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by parent div
                          className="w-4.5 h-4.5 rounded-md accent-emerald-600 mt-0.5 shrink-0 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                              {feat.label}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ${
                                isChecked
                                  ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                                  : "bg-slate-200 dark:bg-white/10 text-slate-500"
                              }`}
                            >
                              {feat.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {feat.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer Modal: Thống Kê & Lưu */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.08] shrink-0 text-xs">
                <div className="font-semibold text-slate-600 dark:text-slate-400">
                  Đã kích hoạt:{" "}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                    {Object.values(activePerms).filter(Boolean).length} / 11
                  </strong>{" "}
                  chức năng
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPermissionModalUser(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePerms}
                    disabled={isSavingPerms}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSavingPerms ? "Đang Lưu..." : "Lưu Bảng Phân Quyền"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminUnifiedHubPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <div className="w-10 h-10 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Đang tải Trung Tâm Quản Trị...</p>
        </div>
      }
    >
      <AdminUnifiedHubContent />
    </React.Suspense>
  );
}
