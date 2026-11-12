"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Result } from "@/lib/utils";
import {
  TicketService,
  type SupportTicketDto,
} from "@/services/ticket.service";
import { TicketSchema } from "@/lib/validators";

async function getAuthUserId(): Promise<Result<string>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Result.fail("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");
  }
  return Result.ok(session.user.id);
}

export async function createTicketAction(input: unknown): Promise<Result<SupportTicketDto>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  const validation = TicketSchema.safeParse(input);
  if (!validation.success) {
    return Result.fail(validation.error.errors[0]?.message ?? "Dữ liệu yêu cầu không hợp lệ");
  }

  return await TicketService.createTicket(auth.data, validation.data);
}

export async function getUserTicketsAction(): Promise<Result<SupportTicketDto[]>> {
  const auth = await getAuthUserId();
  if (!auth.isSuccess) return auth;

  return await TicketService.getUserTickets(auth.data);
}

