import { connectDB } from "../lib/db";
import { User } from "../models/User";
import { AccessKey } from "../models/AccessKey";
import { BeeOrder } from "../models/BeeOrder";
import { Income } from "../models/Income";
import { Expense } from "../models/Expense";
import { Debt } from "../models/Debt";
import { SupportTicket } from "../models/SupportTicket";

async function setupAdminPhone() {
  console.log("==========================================================");
  console.log("🚀 THIẾT LẬP KEY ĐĂNG NHẬP SỐ ĐIỆN THOẠI & XÓA KEY MẪU...");
  console.log("==========================================================");

  await connectDB();

  const ADMIN_PHONE = "0335384174";

  // 1. Tạo hoặc lấy Admin user chính với số điện thoại 0335384174
  let adminUser = await User.findOne({
    $or: [{ phone: ADMIN_PHONE }, { accessKey: ADMIN_PHONE }],
  });

  if (!adminUser) {
    adminUser = await User.create({
      name: "Quản Trị Viên (Admin)",
      phone: ADMIN_PHONE,
      accessKey: ADMIN_PHONE,
      role: "admin",
      walletCode: `VTHU-${ADMIN_PHONE}`,
      walletBalance: 0,
      settings: {
        savingsRatePercent: 20,
        remindDaysBefore: 3,
        emailReminder: true,
        currency: "VND",
      },
    });
    console.log(`✓ Đã tạo Admin User mới với SĐT: ${ADMIN_PHONE}`);
  } else {
    adminUser.name = "Quản Trị Viên (Admin)";
    adminUser.phone = ADMIN_PHONE;
    adminUser.accessKey = ADMIN_PHONE;
    adminUser.role = "admin";
    await adminUser.save();
    console.log(`✓ Đã cập nhật Admin User hiện tại thành SĐT: ${ADMIN_PHONE}`);
  }

  // 2. Chuyển dữ liệu lịch sử (Đơn Be, Doanh thu, Khoản nợ, Ticket) sang Admin mới nếu cần
  await Promise.all([
    BeeOrder.updateMany({ userId: { $ne: adminUser._id } }, { $set: { userId: adminUser._id } }),
    Income.updateMany({ userId: { $ne: adminUser._id } }, { $set: { userId: adminUser._id } }),
    Expense.updateMany({ userId: { $ne: adminUser._id } }, { $set: { userId: adminUser._id } }),
    Debt.updateMany({ userId: { $ne: adminUser._id } }, { $set: { userId: adminUser._id } }),
    SupportTicket.updateMany({ userId: { $ne: adminUser._id } }, { $set: { userId: adminUser._id } }),
  ]);
  console.log("✓ Đã đồng bộ toàn bộ dữ liệu lịch sử vào Admin User");

  // 3. Xóa tất cả Users cũ (khác Admin chính)
  const deleteUsersResult = await User.deleteMany({ _id: { $ne: adminUser._id } });
  console.log(`✓ Đã xóa ${deleteUsersResult.deletedCount} người dùng mẫu cũ`);

  // 4. Xóa tất cả AccessKeys cũ
  const deleteKeysResult = await AccessKey.deleteMany({ key: { $ne: ADMIN_PHONE } });
  console.log(`✓ Đã xóa ${deleteKeysResult.deletedCount} mã khóa mẫu cũ`);

  // 5. Đảm bảo duy nhất AccessKey 0335384174 tồn tại cho Admin
  let adminKey = await AccessKey.findOne({ key: ADMIN_PHONE });
  if (!adminKey) {
    adminKey = await AccessKey.create({
      key: ADMIN_PHONE,
      name: "Quản Trị Viên (Admin)",
      userId: adminUser._id,
      role: "admin",
      isActive: true,
    });
    console.log(`✓ Đã tạo AccessKey Admin mới: [${ADMIN_PHONE}]`);
  } else {
    adminKey.userId = adminUser._id;
    adminKey.role = "admin";
    adminKey.isActive = true;
    await adminKey.save();
    console.log(`✓ Đã cập nhật AccessKey Admin: [${ADMIN_PHONE}]`);
  }

  console.log("==========================================================");
  console.log(`✅ HOÀN TẤT: HỆ THỐNG HIỆN CHỈ CÓ 1 KEY ADMIN DUY NHẤT: ${ADMIN_PHONE}`);
  console.log("==========================================================");
  process.exit(0);
}

setupAdminPhone().catch((err) => {
  console.error("Lỗi:", err);
  process.exit(1);
});

