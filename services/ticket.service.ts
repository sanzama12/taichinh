import { connectDB } from "@/lib/db";
import {
  SupportTicket,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "@/models/SupportTicket";
import { User } from "@/models/User";
import { Result, getErrorMessage } from "@/lib/utils";
import type { TicketInput } from "@/lib/validators";

export type { TicketCategory, TicketPriority } from "@/models/SupportTicket";

export interface SupportTicketDto {
  id: string;
  ticketCode: string;
  title: string;
  category: TicketCategory;
  message: string;
  priority: TicketPriority;
  status: TicketStatus;
  adminReply?: string;
  resolvedAt?: string;
  userName?: string;
  userPhone?: string;
  userRole?: string;
  createdAt: string;
}

export class TicketService {
  /**
   * Tạo yêu cầu hỗ trợ (Ticket) mới từ phía User
   */
  static async createTicket(
    userId: string,
    input: TicketInput
  ): Promise<Result<SupportTicketDto>> {
    try {
      await connectDB();

      const cleanTitle = input.title.trim();
      if (!cleanTitle) return Result.fail("Vui lòng nhập tiêu đề yêu cầu hỗ trợ");

      const cleanMessage = input.message.trim();
      if (!cleanMessage) return Result.fail("Vui lòng nhập nội dung chi tiết cần hỗ trợ");

      const ticketCode = `TK-${Date.now().toString().slice(-6)}`;

      const newTicket = await SupportTicket.create({
        userId,
        ticketCode,
        title: cleanTitle,
        category: input.category || "other",
        message: cleanMessage,
        priority: input.priority || "medium",
        status: "open",
      });

      return Result.ok({
        id: String(newTicket._id),
        ticketCode: newTicket.ticketCode,
        title: newTicket.title,
        category: newTicket.category,
        message: newTicket.message,
        priority: newTicket.priority,
        status: newTicket.status,
        createdAt: newTicket.createdAt.toISOString(),
      });
    } catch (err: unknown) {
      console.error("[TicketService.createTicket] Error:", err);
      return Result.fail(getErrorMessage(err, "Lỗi khi gửi yêu cầu hỗ trợ"));
    }
  }

  /**
   * Lấy danh sách Ticket của User hiện tại
   */
  static async getUserTickets(userId: string): Promise<Result<SupportTicketDto[]>> {
    try {
      await connectDB();

      const rawTickets = await SupportTicket.find({ userId })
        .sort({ createdAt: -1 })
        .lean();

      const tickets: SupportTicketDto[] = rawTickets.map((t) => ({
        id: String(t._id),
        ticketCode: t.ticketCode,
        title: t.title,
        category: t.category,
        message: t.message,
        priority: t.priority,
        status: t.status,
        adminReply: t.adminReply || "",
        resolvedAt: t.resolvedAt ? new Date(t.resolvedAt).toISOString() : undefined,
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
      }));

      return Result.ok(tickets);
    } catch (err: unknown) {
      console.error("[TicketService.getUserTickets] Error:", err);
      return Result.fail(getErrorMessage(err, "Lỗi tải danh sách yêu cầu hỗ trợ"));
    }
  }
}

