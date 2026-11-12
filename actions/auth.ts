"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AccessKeyLoginSchema, type AccessKeyLoginInput } from "@/lib/validators";
import { AuthService, type UserAuthDto } from "@/services/auth.service";
import { Result } from "@/lib/utils";

/**
 * Controller Layer: Nhận request xác thực Mã Khóa từ Client
 * Tuân thủ mô hình Skinny Controller
 */
export async function verifyAccessKeyAction(
  input: AccessKeyLoginInput
): Promise<Result<UserAuthDto>> {
  try {
    const validation = AccessKeyLoginSchema.safeParse(input);
    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Mã khóa không hợp lệ";
      return Result.fail(firstError);
    }

    return await AuthService.validateAccessKey(
      validation.data.key,
      validation.data.rememberDays
    );
  } catch (error) {
    console.error("❌ AuthController.verifyAccessKey Error:", error);
    return Result.fail("Đã xảy ra lỗi máy chủ trong quá trình kiểm tra mã khóa.");
  }
}

/**
 * Controller Layer: Admin tạo mã khóa mới cho người dùng
 */
export async function createAccessKeyAction(
  name: string,
  customKey?: string,
  role: "admin" | "user" = "user",
  expiresDays?: number
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return Result.fail("Bạn không có quyền quản trị để thực hiện thao tác này");
    }

    if (!name || name.trim().length < 2) {
      return Result.fail("Tên người dùng phải có ít nhất 2 ký tự");
    }

    return await AuthService.generateAccessKey(name, customKey, role, expiresDays);
  } catch (error) {
    console.error("❌ AuthController.createAccessKey Error:", error);
    return Result.fail("Lỗi tạo mã khóa mới");
  }
}

/**
 * Controller Layer: Lấy danh sách mã khóa (Chỉ Admin)
 */
export async function listAccessKeysAction() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return Result.fail("Bạn không có quyền quản trị");
    }

    const keys = await AuthService.listAllKeys();
    return Result.ok(keys);
  } catch (error) {
    console.error("❌ AuthController.listAccessKeys Error:", error);
    return Result.fail("Lỗi tải danh sách mã khóa");
  }
}

/**
 * Controller Layer: Bật/Tắt trạng thái hoạt động của mã khóa (Chỉ Admin)
 */
export async function toggleAccessKeyAction(keyId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return Result.fail("Bạn không có quyền quản trị");
    }

    return await AuthService.toggleKeyStatus(keyId);
  } catch (error) {
    console.error("❌ AuthController.toggleAccessKey Error:", error);
    return Result.fail("Lỗi cập nhật trạng thái mã khóa");
  }
}
