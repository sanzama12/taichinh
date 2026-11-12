"use client";

import * as React from "react";
import {
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileQuestion,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import {
  createTicketAction,
  getUserTicketsAction,
} from "@/actions/ticket";
import {
  type SupportTicketDto,
  type TicketCategory,
  type TicketPriority,
} from "@/services/ticket.service";
import { toast } from "sonner";

export default function UserTicketsPage() {
  const [tickets, setTickets] = React.useState<SupportTicketDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form states
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<TicketCategory>("order");
  const [priority, setPriority] = React.useState<TicketPriority>("medium");
  const [message, setMessage] = React.useState("");

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getUserTicketsAction();
      if (res.isSuccess) {
        setTickets(res.data);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi tải yêu cầu hỗ trợ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createTicketAction({
        title: title.trim(),
        category,
        priority,
        message: message.trim(),
      });

      if (res.isSuccess) {
        toast.success(`Đã gửi ticket [${res.data.ticketCode}] tới Ban Quản Trị`);
        setIsModalOpen(false);
        setTitle("");
        setMessage("");
        loadData();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi gửi yêu cầu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress");
  const resolvedTickets = tickets.filter((t) => t.status === "resolved" || t.status === "closed");

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <MessageSquare className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Trung Tâm Hỗ Trợ & Yêu Cầu (Tickets)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gửi thắc mắc cuốc xe, đối soát doanh thu hoặc yêu cầu hỗ trợ trực tiếp đến Admin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-500" : ""}`} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Gửi Yêu Cầu Hỗ Trợ</span>
          </button>
        </div>
      </div>

      {/* 2. Bento Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            TỔNG YÊU CẦU
          </span>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {tickets.length}
          </div>
          <span className="text-[11px] text-slate-400">Đã gửi lên Ban Quản Trị</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 shadow-xs space-y-1">
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
            CHỜ ADMIN XỬ LÝ
          </span>
          <div className="text-2xl font-black font-mono text-amber-700 dark:text-amber-400">
            {openTickets.length}
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400/80">Đang được kiểm tra và hỗ trợ</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 shadow-xs space-y-1">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
            ĐÃ GIẢI QUYẾT
          </span>
          <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
            {resolvedTickets.length}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400/80">Có phản hồi chính thức từ Admin</span>
        </div>
      </div>

      {/* 3. Danh Sách Ticket */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">
          DANH SÁCH YÊU CẦU ĐÃ GỬI ({tickets.length})
        </h3>

        {tickets.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
              <FileQuestion className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Bạn chưa có yêu cầu hỗ trợ nào
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Khi cần xét duyệt đơn, hỗ trợ ví hoặc thắc mắc nợ, bấm nút bên dưới để gửi ticket.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              + Gửi Yêu Cầu Đầu Tiên
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                      {t.ticketCode}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {t.category === "order" ? "Cuốc xe" : t.category === "wallet" ? "Ví tiền" : t.category === "income" ? "Doanh thu" : t.category === "debt" ? "Khoản nợ" : "Hỗ trợ chung"}
                    </span>
                    <span className="text-xs text-slate-400">• {new Date(t.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>

                  <div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === "resolved"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : t.status === "in_progress"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 animate-pulse"
                      }`}
                    >
                      {t.status === "resolved" ? "✓ Đã giải quyết" : t.status === "in_progress" ? "⏳ Đang xử lý" : "Chờ Admin xử lý"}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap">{t.message}</p>
                </div>

                {/* Phản hồi từ Admin */}
                {t.adminReply && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Phản Hồi Từ Ban Quản Trị (Admin):</span>
                    </div>
                    <p className="text-xs text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap">
                      {t.adminReply}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Modal Tạo Ticket */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <span>Gửi Yêu Cầu Hỗ Trợ Mới</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tiêu Đề Yêu Cầu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Cần xác duyệt cuốc xe BE-88329 / Thắc mắc số dư ví"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#05080f] border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Phân Loại Vấn Đề
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TicketCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#05080f] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="order">Cuốc xe Be / Khách hàng</option>
                    <option value="wallet">Số dư ví / Rút tiền</option>
                    <option value="income">Doanh thu / Khoản thu</option>
                    <option value="debt">Khoản nợ / Trả nợ</option>
                    <option value="other">Hỗ trợ khác</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mức Độ Ưu Tiên
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#05080f] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="medium">Bình thường</option>
                    <option value="high">Khẩn cấp</option>
                    <option value="low">Thấp</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nội Dung Chi Tiết *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Mô tả cụ thể mã đơn, sự việc hoặc yêu cầu bạn cần Admin hỗ trợ..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#05080f] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Đang gửi..." : "Gửi Yêu Cầu Cho Admin"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

