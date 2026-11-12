"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ExpenseService, type ExpensePageDataDto, type ExpenseDto } from "@/services/expense.service";
import { ExpenseSchema, BudgetSchema, type ExpenseInput, type BudgetInput } from "@/lib/validators";
import { Result } from "@/lib/utils";

/**
 * Controller Layer: Quản lý Chi tiêu và Ngân sách
 * Skinny Controllers (<25 dòng) tuân thủ quy chuẩn MVC
 */

export async function getExpensePageDataAction(
  month: number,
  year: number,
  categoryFilter?: string
): Promise<Result<ExpensePageDataDto>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");

  return await ExpenseService.getExpensePageData(session.user.id, month, year, categoryFilter);
}

export async function createExpenseAction(input: ExpenseInput): Promise<Result<ExpenseDto>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Phiên đăng nhập đã kết thúc");

  const parsed = ExpenseSchema.safeParse(input);
  if (!parsed.success) return Result.fail(parsed.error.errors[0]?.message || "Dữ liệu chi tiêu không hợp lệ");

  return await ExpenseService.createExpense(session.user.id, parsed.data);
}

export async function updateExpenseAction(id: string, input: ExpenseInput): Promise<Result<boolean>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Phiên đăng nhập đã kết thúc");

  const parsed = ExpenseSchema.safeParse(input);
  if (!parsed.success) return Result.fail(parsed.error.errors[0]?.message || "Dữ liệu chi tiêu không hợp lệ");

  return await ExpenseService.updateExpense(session.user.id, id, parsed.data);
}

export async function deleteExpenseAction(id: string): Promise<Result<boolean>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Phiên đăng nhập đã kết thúc");

  return await ExpenseService.deleteExpense(session.user.id, id);
}

export async function upsertBudgetAction(input: BudgetInput): Promise<Result<boolean>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Phiên đăng nhập đã kết thúc");

  const parsed = BudgetSchema.safeParse(input);
  if (!parsed.success) return Result.fail(parsed.error.errors[0]?.message || "Dữ liệu ngân sách không hợp lệ");

  return await ExpenseService.upsertBudget(session.user.id, parsed.data);
}

export async function deleteBudgetAction(budgetId: string): Promise<Result<boolean>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Phiên đăng nhập đã kết thúc");

  return await ExpenseService.deleteBudget(session.user.id, budgetId);
}

