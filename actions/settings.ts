"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  SettingsService,
  type UserSettingsDto,
  type AccessKeyItemDto,
  type UpdateSettingsInput,
} from "@/services/settings.service";
import { Result } from "@/lib/utils";

/**
 * Controller Layer: Cấu Hình Tài Khoản & Quản Trị Hệ Thống
 * Skinny Controllers (<25 dòng)
 */

export async function getUserSettingsAction(): Promise<Result<UserSettingsDto>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");

  return await SettingsService.getUserSettings(session.user.id);
}

export async function updateUserSettingsAction(input: UpdateSettingsInput): Promise<Result<boolean>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Phiên đăng nhập đã kết thúc");

  return await SettingsService.updateUserSettings(session.user.id, input);
}

export async function listAccessKeysAction(): Promise<Result<AccessKeyItemDto[]>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Phiên đăng nhập đã kết thúc");

  return await SettingsService.listAccessKeys(session.user.id);
}

export async function createAccessKeyAction(
  key: string,
  label: string,
  role: "admin" | "user" = "user"
): Promise<Result<boolean>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Phiên đăng nhập đã kết thúc");

  return await SettingsService.createAccessKey(session.user.id, key, label, role);
}

export async function toggleAccessKeyAction(keyId: string): Promise<Result<boolean>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Phiên đăng nhập đã kết thúc");

  return await SettingsService.toggleAccessKey(session.user.id, keyId);
}

export async function exportAllUserDataAction(): Promise<Result<{ jsonString: string; filename: string }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Phiên đăng nhập đã kết thúc");

  const res = await SettingsService.exportAllUserData(session.user.id);
  if (!res.isSuccess) return Result.fail(res.error);

  const jsonString = JSON.stringify(res.data, null, 2);
  const filename = `Sao_Luu_Tai_Chinh_${session.user.accessKey || "User"}_${new Date().toISOString().split("T")[0]}.json`;

  return Result.ok({ jsonString, filename });
}

export async function resetUserDataAction(): Promise<Result<boolean>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Result.fail("Phiên đăng nhập đã kết thúc");

  return await SettingsService.resetUserData(session.user.id);
}

