import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import mongoose, { type Model } from "mongoose";
import { User } from "../models/User";
import { AccessKey } from "../models/AccessKey";
import { BeeOrder } from "../models/BeeOrder";
import { FuelLog } from "../models/FuelLog";
import { BonusLog } from "../models/BonusLog";
import { Debt } from "../models/Debt";
import { Income } from "../models/Income";
import { Expense } from "../models/Expense";
import { Bill } from "../models/Bill";
import { BillPayment } from "../models/BillPayment";
import { Budget } from "../models/Budget";
import { SavingsGoal } from "../models/SavingsGoal";
import { SavingsTransaction } from "../models/SavingsTransaction";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quanlytaichinh";

async function initializeModel<T>(name: string, model: Model<T>): Promise<void> {
  await model.init();
  const count = await model.countDocuments({});
  console.log(`  ✓ Collection [${name}]: Đã sẵn sàng (${count} bản ghi)`);
}

async function pushToMongo() {
  console.log("==========================================================");
  console.log("🚀 ĐANG ĐẨY TOÀN BỘ CƠ SỞ DỮ LIỆU LÊN MONGODB TRỰC TIẾP");
  console.log(`📡 MongoDB URI: ${MONGODB_URI}`);
  console.log("==========================================================");

  // Kết nối trực tiếp qua Mongoose
  await mongoose.connect(MONGODB_URI, { family: 4 });
  console.log("✓ Kết nối thành công tới MongoDB localhost:27017!");

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Không thể lấy đối tượng database từ MongoDB");
  }

  // Khởi tạo 2 vai trò chuẩn: Admin và User
  const accounts = [
    {
      key: "PROMAX-CORP-9999",
      name: "Quản Trị Viên (Admin)",
      role: "admin",
      email: "admin@promax.vn",
      age: 32,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      address: "Hà Nội, Việt Nam",
      phone: "0988889999",
    },
    {
      key: "PROMAX-USER-8888",
      name: "Người Dùng (User ProMax)",
      role: "user",
      email: "user@promax.vn",
      age: 26,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      address: "TP. Hồ Chí Minh, Việt Nam",
      phone: "0912345678",
    },
  ];

  for (const acc of accounts) {
    let user = await User.findOne({ accessKey: acc.key });
    if (!user) {
      user = await User.create({
        name: acc.name,
        email: acc.email,
        age: acc.age,
        avatar: acc.avatar,
        address: acc.address,
        phone: acc.phone,
        passwordHash: "ACCESS_KEY_ENTERPRISE",
        role: acc.role,
        accessKey: acc.key,
        settings: {
          savingsRatePercent: 25,
          remindDaysBefore: 3,
          emailReminder: true,
          currency: "VND",
        },
      });
      console.log(`+ Đã tạo User trong MongoDB: ${acc.name} (${acc.key})`);
    } else {
      user.name = acc.name;
      user.role = acc.role as "admin" | "user";
      if (!user.age) user.age = acc.age;
      if (!user.avatar) user.avatar = acc.avatar;
      if (!user.address) user.address = acc.address;
      if (!user.phone) user.phone = acc.phone;
      await user.save();
      console.log(`✓ Đã cập nhật User trong MongoDB: ${acc.name} (${acc.key})`);
    }

    await AccessKey.findOneAndUpdate(
      { key: acc.key },
      {
        key: acc.key,
        name: acc.name,
        userId: user._id,
        role: acc.role,
        isActive: true,
        lastLoginAt: new Date(),
      },
      { upsert: true, new: true }
    );
    console.log(`✓ Đã kích hoạt Khóa truy cập trong MongoDB: ${acc.key}`);
  }

  // Đảm bảo toàn bộ Collections và Indexes đã được tạo trong MongoDB
  console.log("\n📦 Khởi tạo và đồng bộ các Collections trong MongoDB:");
  await initializeModel("Users", User);
  await initializeModel("AccessKeys", AccessKey);
  await initializeModel("BeeOrders (Đơn Be)", BeeOrder);
  await initializeModel("FuelLogs (Xăng)", FuelLog);
  await initializeModel("BonusLogs (Thưởng)", BonusLog);
  await initializeModel("Debts (Nợ)", Debt);
  await initializeModel("Incomes (Thu nhập)", Income);
  await initializeModel("Expenses (Chi phí)", Expense);
  await initializeModel("Bills (Khoản phải trả)", Bill);
  await initializeModel("BillPayments (Thanh toán)", BillPayment);
  await initializeModel("Budgets (Hạn mức)", Budget);
  await initializeModel("SavingsGoals (Tiết kiệm)", SavingsGoal);
  await initializeModel("SavingsTransactions", SavingsTransaction);

  // Liệt kê các Collections thực tế trong MongoDB
  const collections = await db.listCollections().toArray();
  console.log("\n==========================================================");
  console.log("🎉 TOÀN BỘ CƠ SỞ DỮ LIỆU ĐÃ NẰM TRÊN MONGODB!");
  console.log(`✓ Tổng cộng ${collections.length} Collections trên MongoDB Database 'quanlytaichinh':`);
  for (const c of collections) {
    console.log(`   - ${c.name}`);
  }
  console.log("==========================================================");
  console.log("🚀 Từ bây giờ ứng dụng chạy 100% bằng MongoDB trực tiếp.");
  console.log("   Bạn có thể mở MongoDB Compass và truy cập: mongodb://localhost:27017");
  console.log("==========================================================");

  await mongoose.disconnect();
  process.exit(0);
}

pushToMongo().catch((err) => {
  console.error("❌ Lỗi khi đẩy lên MongoDB:", err);
  process.exit(1);
});

