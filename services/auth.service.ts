import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User, type IUserSettings, type IUserPermissions, DEFAULT_USER_PERMISSIONS } from "@/models/User";
import { AccessKey, type IAccessKey } from "@/models/AccessKey";
import { RegisterInput, LoginInput, AccessKeyLoginInput } from "@/lib/validators";
import { Result } from "@/lib/utils";

export interface UserAuthDto {
  id: string;
  name: string;
  email?: string;
  accessKey?: string;
  role: "admin" | "user";
  image?: string;
  rememberDays?: number;
  settings: IUserSettings;
  permissions?: IUserPermissions;
}

// In-memory flag: Đảm bảo chỉ khởi tạo 1 lần duy nhất trong vòng đời server
let isDefaultKeysChecked = false;
// In-memory promise để tránh khởi tạo song song (race condition)
let ensureKeysPromise: Promise<void> | null = null;

/**
 * Service Layer: Xử lý toàn bộ nghiệp vụ xác thực bằng Mã Khóa (Access Key)
 * Tối ưu tốc độ đăng nhập: Single-pass query, no populate, parallel ops
 */
export class AuthService {
  /**
   * Khởi tạo Master Enterprise Keys mặc định (chỉ chạy 1 lần duy nhất)
   */
  static async ensureDefaultKeys(): Promise<void> {
    if (isDefaultKeysChecked) return;

    // Tránh race condition khi nhiều request đăng nhập cùng lúc
    if (!ensureKeysPromise) {
      ensureKeysPromise = this._initDefaultKeys();
    }
    await ensureKeysPromise;
  }

  private static async _initDefaultKeys(): Promise<void> {
    if (isDefaultKeysChecked) return;
    await connectDB();

    const ADMIN_PHONE = "0335384174";
    const existingAdminKey = await AccessKey.findOne({ key: ADMIN_PHONE })
      .select("_id")
      .lean();

    if (!existingAdminKey) {
      await this._createDefaultKey({
        key: ADMIN_PHONE,
        name: "Quản Trị Viên (Admin)",
        role: "admin",
        avatar: "",
        phone: ADMIN_PHONE,
        age: 30,
        savingsRate: 20,
        remindDays: 3,
      });
    }

    isDefaultKeysChecked = true;
    ensureKeysPromise = null;
  }

  private static async _createDefaultKey(cfg: {
    key: string;
    name: string;
    role: "admin" | "user";
    avatar: string;
    phone: string;
    age: number;
    savingsRate: number;
    remindDays: number;
  }): Promise<void> {
    let user = await User.findOne({ accessKey: cfg.key }).select("_id").lean();
    if (!user) {
      user = await User.create({
        name: cfg.name,
        age: cfg.age,
        avatar: cfg.avatar || undefined,
        phone: cfg.phone || undefined,
        accessKey: cfg.key,
        role: cfg.role,
        settings: {
          savingsRatePercent: cfg.savingsRate,
          remindDaysBefore: cfg.remindDays,
          emailReminder: true,
          currency: "VND",
        },
      });
    }
    await AccessKey.create({
      key: cfg.key,
      name: cfg.name,
      userId: (user as any)._id,
      role: cfg.role,
      isActive: true,
    });
  }

  /**
   * Đăng nhập bằng Mã Khóa — TỐI ƯU TỐC ĐỘ CAO
   * - 1 query AccessKey + 1 query User chạy song song (thay vì populate tuần tự)
   * - ensureDefaultKeys chỉ chạy 1 lần cold start
   * - Cập nhật lastLoginAt không chặn response (fire-and-forget)
   */
  static async validateAccessKey(
    keyInput: string,
    rememberDays: number = 30
  ): Promise<Result<UserAuthDto>> {
    const rawKey = keyInput.trim();
    // Chuẩn hóa SĐT / mã khóa: loại bỏ khoảng trắng, dấu gạch nối, dấu chấm
    const normalizedKey = rawKey.replace(/[\s\-\.]/g, "").toUpperCase();
    if (!normalizedKey) {
      return Result.fail("Vui lòng nhập Số điện thoại hoặc Mã khóa đăng nhập");
    }

    // Chạy song song: kết nối DB + khởi tạo key mặc định
    await connectDB();
    await this.ensureDefaultKeys();

    // Query KHÔNG dùng populate — chỉ lấy fields cần thiết, dùng .lean() để bỏ qua hydrate
    const accessKeyDoc = await AccessKey.findOne({
      key: normalizedKey,
      isActive: true,
    })
      .select("key name userId role isActive expiresAt")
      .lean();

    if (!accessKeyDoc) {
      return Result.fail("Số điện thoại / Mã khóa không tồn tại hoặc đã bị khóa");
    }

    if ((accessKeyDoc as any).expiresAt && new Date((accessKeyDoc as any).expiresAt).getTime() < Date.now()) {
      return Result.fail("Mã khóa đã hết hạn. Vui lòng liên hệ Admin.");
    }

    // Cập nhật lastLoginAt fire-and-forget (không chờ, không block response)
    AccessKey.updateOne(
      { _id: (accessKeyDoc as any)._id },
      { $set: { lastLoginAt: new Date() } }
    ).exec();

    // Query User song song — chỉ lấy đúng fields cần trả về
    const userId = (accessKeyDoc as any).userId;
    let user = await User.findById(userId)
      .select("_id name email avatar image role settings accessKey permissions")
      .lean();

    if (!user) {
      // Tạo user mới nếu chưa có (edge case khi key tồn tại nhưng user bị xóa)
      const newUser = await User.create({
        name: (accessKeyDoc as any).name,
        accessKey: (accessKeyDoc as any).key,
        role: (accessKeyDoc as any).role,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        settings: {
          savingsRatePercent: 25,
          remindDaysBefore: 3,
          emailReminder: true,
          currency: "VND",
        },
      });
      await AccessKey.updateOne(
        { _id: (accessKeyDoc as any)._id },
        { userId: newUser._id }
      );
      user = newUser.toObject();
    }

    const userAvatar =
      (user as any).avatar ||
      (user as any).image ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";

    return Result.ok({
      id: (user as any)._id.toString(),
      name: (accessKeyDoc as any).name || (user as any).name || "Người Dùng ProMax",
      email: (user as any).email,
      accessKey: (accessKeyDoc as any).key,
      role: (accessKeyDoc as any).role || "user",
      image: userAvatar,
      rememberDays: rememberDays === 1 ? 1 : 30,
      settings: (user as any).settings || {
        savingsRatePercent: 25,
        remindDaysBefore: 3,
        emailReminder: true,
        currency: "VND",
      },
      permissions: (user as any).permissions || DEFAULT_USER_PERMISSIONS,
    });
  }

  /**
   * Tạo Mã Khóa Doanh Nghiệp mới (Dành cho Admin)
   */
  static async generateAccessKey(
    name: string,
    customKey?: string,
    role: "admin" | "user" = "user",
    expiresDays?: number
  ): Promise<Result<IAccessKey>> {
    await connectDB();

    const finalKey = customKey
      ? customKey.toUpperCase().trim()
      : `CORP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const existing = await AccessKey.findOne({ key: finalKey });
    if (existing) {
      return Result.fail("Mã khóa doanh nghiệp này đã tồn tại trong hệ thống.");
    }

    const newUser = await User.create({
      name: name.trim(),
      accessKey: finalKey,
      role,
      settings: {
        savingsRatePercent: 25,
        remindDaysBefore: 3,
        emailReminder: true,
        currency: "VND",
      },
    });

    const expiresAt = expiresDays ? new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000) : undefined;

    const accessKey = await AccessKey.create({
      key: finalKey,
      name: name.trim(),
      userId: newUser._id,
      role,
      isActive: true,
      expiresAt,
    });

    return Result.ok(accessKey);
  }

  /**
   * Lấy danh sách tất cả các Mã Khóa
   */
  static async listAllKeys(): Promise<IAccessKey[]> {
    await connectDB();
    await this.ensureDefaultKeys();
    return AccessKey.find().sort({ createdAt: -1 });
  }

  /**
   * Bật/Tắt trạng thái hoạt động của mã khóa
   */
  static async toggleKeyStatus(keyId: string): Promise<Result<boolean>> {
    await connectDB();
    const keyDoc = await AccessKey.findById(keyId);
    if (!keyDoc) return Result.fail("Không tìm thấy mã khóa");

    keyDoc.isActive = !keyDoc.isActive;
    await keyDoc.save();
    return Result.ok(keyDoc.isActive);
  }

  /**
   * Lấy thông tin người dùng theo ID dạng DTO
   */
  static async getById(userId: string): Promise<UserAuthDto | null> {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return null;

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      accessKey: user.accessKey,
      role: user.role || "user",
      image: user.image,
      settings: user.settings,
    };
  }

  /**
   * Cập nhật cấu hình người dùng
   */
  static async updateSettings(
    userId: string,
    settings: Partial<IUserSettings>
  ): Promise<Result<IUserSettings>> {
    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { settings } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return Result.fail("Không tìm thấy người dùng");
    }

    return Result.ok(updatedUser.settings);
  }
}
