import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { User, type IUser } from "@/models/User";
import { AccessKey } from "@/models/AccessKey";
import { Income } from "@/models/Income";
import { Bill } from "@/models/Bill";
import { BillPayment } from "@/models/BillPayment";
import { Expense } from "@/models/Expense";
import { Budget } from "@/models/Budget";
import { SavingsGoal } from "@/models/SavingsGoal";
import { SavingsTransaction } from "@/models/SavingsTransaction";
import { Result } from "@/lib/utils";

export interface UserSettingsDto {
  name: string;
  birthYear?: number;
  age?: number;
  avatar?: string;
  address?: string;
  phone?: string;
  email: string;
  savingsRatePercent: number;
  remindDaysBefore: number;
  emailReminder: boolean;
  currency: string;
  role: "admin" | "user";
  accessKey?: string;
}

export interface AccessKeyItemDto {
  id: string;
  key: string;
  label: string;
  role: "admin" | "user";
  isActive: boolean;
  expiresAt?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface UpdateSettingsInput {
  name?: string;
  birthYear?: number;
  age?: number;
  avatar?: string;
  address?: string;
  phone?: string;
  email?: string;
  savingsRatePercent?: number;
  remindDaysBefore?: number;
  emailReminder?: boolean;
}

/**
 * Service Layer: Quản lý Cài Đặt Hệ Thống, Cấp Phát Mã Khóa & Xuất Dữ Liệu
 */
export class SettingsService {
  /**
   * Lấy cấu hình của người dùng hiện tại
   */
  static async getUserSettings(userId: string): Promise<Result<UserSettingsDto>> {
    try {
      await connectDB();
      const user = await User.findById(userId).lean().exec();
      if (!user) {
        return Result.fail("Không tìm thấy thông tin người dùng");
      }

      const currentYear = new Date().getFullYear();
      let birthYear = user.birthYear;
      let age = user.age;
      if (birthYear && !age) {
        age = currentYear - birthYear;
      } else if (age && !birthYear) {
        birthYear = currentYear - age;
      }

      return Result.ok({
        name: user.name,
        birthYear,
        age,
        avatar: user.avatar || user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        address: user.address || "",
        phone: user.phone || "",
        email: user.email || "",
        savingsRatePercent: user.settings?.savingsRatePercent ?? 20,
        remindDaysBefore: user.settings?.remindDaysBefore ?? 3,
        emailReminder: user.settings?.emailReminder ?? true,
        currency: user.settings?.currency ?? "VND",
        role: user.role,
        accessKey: user.accessKey,
      });
    } catch (error) {
      console.error("[SettingsService.getUserSettings] Error:", error);
      return Result.fail("Lỗi khi tải cấu hình người dùng");
    }
  }

  /**
   * Cập nhật thông số cấu hình tài chính
   */
  static async updateUserSettings(
    userId: string,
    input: UpdateSettingsInput
  ): Promise<Result<boolean>> {
    try {
      await connectDB();
      const user = await User.findById(userId).exec();
      if (!user) {
        return Result.fail("Không tìm thấy người dùng");
      }

      if (input.name !== undefined && input.name.trim().length > 0) {
        user.name = input.name.trim();
      }

      const currentYear = new Date().getFullYear();
      if (input.birthYear !== undefined && input.birthYear !== null) {
        const by = Number(input.birthYear);
        if (by >= 1900 && by <= currentYear) {
          user.birthYear = by;
          user.age = currentYear - by;
        }
      } else if (input.age !== undefined && input.age !== null) {
        const ag = Number(input.age);
        if (ag >= 1 && ag <= 120) {
          user.age = ag;
          if (!user.birthYear) {
            user.birthYear = currentYear - ag;
          }
        }
      }

      if (input.avatar !== undefined) {
        user.avatar = input.avatar.trim();
        user.image = input.avatar.trim();
      }
      if (input.address !== undefined) {
        user.address = input.address.trim();
      }

      // Validate chặt chẽ số điện thoại: bắt buộc 10 chữ số và bắt đầu bằng số 0
      if (input.phone !== undefined) {
        const cleanPhone = input.phone.trim();
        if (cleanPhone.length > 0) {
          if (!/^0[0-9]{9}$/.test(cleanPhone)) {
            return Result.fail("Số điện thoại không hợp lệ: Bắt buộc phải có đúng 10 chữ số và bắt đầu bằng số 0 (Ví dụ: 0912345678)");
          }
          user.phone = cleanPhone;
        } else {
          return Result.fail("Số điện thoại không được để trống. Bắt buộc 10 chữ số bắt đầu bằng số 0.");
        }
      }

      if (input.email !== undefined) {
        user.email = input.email.trim();
      }

      if (!user.settings) {
        user.settings = {
          savingsRatePercent: 20,
          remindDaysBefore: 3,
          emailReminder: true,
          currency: "VND",
        };
      }

      if (typeof input.savingsRatePercent === "number") {
        user.settings.savingsRatePercent = Math.min(Math.max(input.savingsRatePercent, 1), 90);
      }
      if (typeof input.remindDaysBefore === "number") {
        user.settings.remindDaysBefore = Math.min(Math.max(input.remindDaysBefore, 1), 30);
      }
      if (typeof input.emailReminder === "boolean") {
        user.settings.emailReminder = input.emailReminder;
      }

      await user.save();
      return Result.ok(true);
    } catch (error) {
      console.error("[SettingsService.updateUserSettings] Error:", error);
      return Result.fail("Lỗi khi lưu cấu hình người dùng");
    }
  }

  /**
   * Lấy danh sách Mã Khóa Doanh Nghiệp (dành cho Admin)
   */
  static async listAccessKeys(userId: string): Promise<Result<AccessKeyItemDto[]>> {
    try {
      await connectDB();
      const user = await User.findById(userId).lean().exec();
      if (user?.role !== "admin") {
        return Result.fail("Chỉ Ban Quản Trị mới có quyền xem danh sách mã khóa");
      }

      const keys = await AccessKey.find().sort({ createdAt: -1 }).lean().exec();

      const dtoList: AccessKeyItemDto[] = keys.map((k) => ({
        id: k._id.toString(),
        key: k.key,
        label: k.name,
        role: k.role,
        isActive: k.isActive,
        expiresAt: k.expiresAt?.toISOString(),
        lastLoginAt: k.lastLoginAt?.toISOString(),
        createdAt: k.createdAt.toISOString(),
      }));

      return Result.ok(dtoList);
    } catch (error) {
      console.error("[SettingsService.listAccessKeys] Error:", error);
      return Result.fail("Lỗi khi lấy danh sách mã khóa");
    }
  }

  /**
   * Tạo Mã Khóa Truy Cập Doanh Nghiệp mới (dành cho Admin)
   */
  static async createAccessKey(
    adminUserId: string,
    key: string,
    label: string,
    role: "admin" | "user" = "user"
  ): Promise<Result<boolean>> {
    try {
      await connectDB();
      const user = await User.findById(adminUserId).lean().exec();
      if (user?.role !== "admin") {
        return Result.fail("Bạn không có quyền cấp phát mã khóa");
      }

      const cleanKey = key.trim().toUpperCase();
      if (!cleanKey) return Result.fail("Mã khóa không được để trống");

      const existing = await AccessKey.findOne({ key: cleanKey }).exec();
      if (existing) {
        return Result.fail("Mã khóa này đã tồn tại trong hệ thống");
      }

      const cleanName = label.trim() || "Doanh Nghiệp / Nhân Viên Mới";

      // Tạo User tương ứng
      let linkedUser = await User.findOne({ accessKey: cleanKey }).exec();
      if (!linkedUser) {
        linkedUser = await User.create({
          name: cleanName,
          email: `${cleanKey.toLowerCase().replace(/[^a-z0-9]/g, "")}@promax-finance.vn`,
          passwordHash: "ACCESS_KEY_USER",
          role,
          accessKey: cleanKey,
          settings: {
            savingsRatePercent: 20,
            remindDaysBefore: 3,
            emailReminder: true,
            currency: "VND",
          },
        });
      }


      await AccessKey.create({
        key: cleanKey,
        name: cleanName,
        userId: linkedUser._id,
        role,
        isActive: true,
      });

      return Result.ok(true);
    } catch (error) {
      console.error("[SettingsService.createAccessKey] Error:", error);
      return Result.fail("Lỗi khi tạo mã khóa");
    }
  }

  /**
   * Vô hiệu hóa hoặc kích hoạt lại Mã Khóa
   */
  static async toggleAccessKey(adminUserId: string, keyId: string): Promise<Result<boolean>> {
    try {
      await connectDB();
      const user = await User.findById(adminUserId).lean().exec();
      if (user?.role !== "admin") return Result.fail("Không có quyền thao tác");

      const targetKey = await AccessKey.findById(keyId).exec();
      if (!targetKey) return Result.fail("Không tìm thấy mã khóa");

      targetKey.isActive = !targetKey.isActive;
      await targetKey.save();

      return Result.ok(true);
    } catch (error) {
      console.error("[SettingsService.toggleAccessKey] Error:", error);
      return Result.fail("Lỗi khi thay đổi trạng thái mã khóa");
    }
  }

  /**
   * Xuất toàn bộ dữ liệu tài chính của người dùng dạng JSON sao lưu (Backup)
   */
  static async exportAllUserData(userId: string): Promise<Result<Record<string, unknown>>> {
    try {
      await connectDB();
      const userObjId = new mongoose.Types.ObjectId(userId);

      const [user, incomes, bills, payments, expenses, budgets, savingsGoals, savingsTransactions] =
        await Promise.all([
          User.findById(userObjId).select("-passwordHash").lean().exec(),
          Income.find({ userId: userObjId }).lean().exec(),
          Bill.find({ userId: userObjId }).lean().exec(),
          BillPayment.find({ userId: userObjId }).lean().exec(),
          Expense.find({ userId: userObjId }).lean().exec(),
          Budget.find({ userId: userObjId }).lean().exec(),
          SavingsGoal.find({ userId: userObjId }).lean().exec(),
          SavingsTransaction.find({ userId: userObjId }).lean().exec(),
        ]);

      return Result.ok({
        exportDate: new Date().toISOString(),
        user,
        incomes,
        bills,
        payments,
        expenses,
        budgets,
        savingsGoals,
        savingsTransactions,
      });
    } catch (error) {
      console.error("[SettingsService.exportAllUserData] Error:", error);
      return Result.fail("Không thể xuất dữ liệu người dùng");
    }
  }

  /**
   * Xóa toàn bộ dữ liệu tài chính (Reset dữ liệu sạch)
   */
  static async resetUserData(userId: string): Promise<Result<boolean>> {
    try {
      await connectDB();
      const userObjId = new mongoose.Types.ObjectId(userId);

      await Promise.all([
        Income.deleteMany({ userId: userObjId }).exec(),
        Bill.deleteMany({ userId: userObjId }).exec(),
        BillPayment.deleteMany({ userId: userObjId }).exec(),
        Expense.deleteMany({ userId: userObjId }).exec(),
        Budget.deleteMany({ userId: userObjId }).exec(),
        SavingsGoal.deleteMany({ userId: userObjId }).exec(),
        SavingsTransaction.deleteMany({ userId: userObjId }).exec(),
      ]);

      return Result.ok(true);
    } catch (error) {
      console.error("[SettingsService.resetUserData] Error:", error);
      return Result.fail("Lỗi khi xóa dữ liệu tài chính");
    }
  }
}
