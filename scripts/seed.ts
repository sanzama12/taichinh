import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import mongoose from "mongoose";
import { User } from "../models/User";
import { AccessKey } from "../models/AccessKey";
import { Income } from "../models/Income";
import { Bill } from "../models/Bill";
import { BillPayment } from "../models/BillPayment";
import { Expense } from "../models/Expense";
import { Budget } from "../models/Budget";
import { SavingsGoal } from "../models/SavingsGoal";
import { SavingsTransaction } from "../models/SavingsTransaction";

import { connectDB } from "../lib/db";
import { isJsonDbActive, flushDatabaseToDisk } from "../lib/json-db";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quanlytaichinh";

async function runSeed() {
  console.log("==========================================================");
  console.log("🚀 BẮT ĐẦU KHỞI TẠO DỮ LIỆU MẪU DOANH NGHIỆP (SEEDING)");
  console.log("==========================================================");

  if (isJsonDbActive()) {
    console.log("✓ Đang sử dụng Cơ Sở Dữ Liệu JSON Cục Bộ: data/db.json");
    await connectDB();
  } else {
    console.log(`Kết nối cơ sở dữ liệu MongoDB: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, { family: 4 });
    console.log("✓ Kết nối MongoDB Atlas thành công!");
  }

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // 1. Tạo hoặc Cập nhật 3 Tài khoản Khóa Doanh Nghiệp Cốt Lõi
  const demoUsers = [
    {
      key: "PROMAX-CORP-9999",
      name: "Tập Đoàn Tài Chính Quốc Tế ProMax",
      role: "admin" as const,
      email: "ceo@promax-corp.vn",
    },
    {
      key: "ENTERPRISE-CFO-8888",
      name: "Giám Đốc Tài Chính (CFO Office)",
      role: "user" as const,
      email: "cfo@promax-corp.vn",
    },
    {
      key: "PROMAX-VIP-8888",
      name: "Khách Hàng Doanh Nghiệp VIP",
      role: "user" as const,
      email: "vip@promax-corp.vn",
    },
  ];

  for (const item of demoUsers) {
    let user = await User.findOne({ accessKey: item.key }).exec();
    if (!user) {
      user = await User.create({
        name: item.name,
        email: item.email,
        passwordHash: "ACCESS_KEY_ENTERPRISE",
        role: item.role,
        accessKey: item.key,
        settings: {
          savingsRatePercent: 25,
          remindDaysBefore: 3,
          emailReminder: true,
          currency: "VND",
        },
      });
      console.log(`+ Đã tạo tài khoản User: ${item.name} (${item.key})`);
    } else {
      user.name = item.name;
      user.role = item.role;
      user.settings = {
        savingsRatePercent: 25,
        remindDaysBefore: 3,
        emailReminder: true,
        currency: "VND",
      };
      await user.save();
    }

    // Đảm bảo AccessKey record tồn tại
    await AccessKey.findOneAndUpdate(
      { key: item.key },
      {
        key: item.key,
        name: item.name,
        userId: user._id,
        role: item.role,
        isActive: true,
        lastLoginAt: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  // 2. Nạp dữ liệu tài chính toàn diện cho User Admin (PROMAX-CORP-9999)
  const adminUser = await User.findOne({ accessKey: "PROMAX-CORP-9999" }).exec();
  if (!adminUser) throw new Error("Admin user not found");
  const adminId = adminUser._id;

  console.log("\nLàm sạch dữ liệu cũ của Admin để nạp dữ liệu mẫu mới...");
  await Promise.all([
    Income.deleteMany({ userId: adminId }).exec(),
    Bill.deleteMany({ userId: adminId }).exec(),
    BillPayment.deleteMany({ userId: adminId }).exec(),
    Expense.deleteMany({ userId: adminId }).exec(),
    Budget.deleteMany({ userId: adminId }).exec(),
    SavingsGoal.deleteMany({ userId: adminId }).exec(),
    SavingsTransaction.deleteMany({ userId: adminId }).exec(),
  ]);

  // A. Thu Nhập (Doanh thu cố định hàng tháng & một lần)
  console.log("Nạp Doanh Thu & Thu Nhập...");
  await Income.create([
    {
      userId: adminId,
      name: "Doanh thu Dịch vụ Tư vấn Cấp cao",
      amount: 120_000_000,
      dayOfMonth: 5,
      type: "monthly",
      note: "Hợp đồng dịch vụ tư vấn quản trị tài chính hàng tháng",
    },
    {
      userId: adminId,
      name: "Cổ tức Đầu tư Tài chính & Trái phiếu",
      amount: 25_000_000,
      dayOfMonth: 15,
      type: "monthly",
      note: "Lãi trái phiếu chính phủ & cổ tức quỹ tương hỗ",
    },
    {
      userId: adminId,
      name: "Doanh thu Bản quyền Phần mềm ERP",
      amount: 45_000_000,
      dayOfMonth: 25,
      type: "monthly",
      note: "Thu phí thuê bao SaaS bản quyền hàng tháng",
    },
    {
      userId: adminId,
      name: "Thưởng Hiệu Quả Dự Án Q4",
      amount: 60_000_000,
      type: "oneTime",
      date: new Date(currentYear, currentMonth - 1, 10),
      note: "Thưởng tất toán hợp đồng chuyển đổi số doanh nghiệp",
    },
  ]);

  // B. Khoản Phải Trả & Công Nợ Vận Hành (Bills)
  console.log("Nạp Khoản Phải Trả & Công Nợ...");
  const createdBills = await Bill.create([
    {
      userId: adminId,
      name: "Thuê Mặt Bằng Văn Phòng Hạng A",
      amount: 35_000_000,
      dueDay: 5,
      category: "Nhà ở & Mặt bằng",
      note: "Tòa nhà Bitexco / Keangnam Landmark",
      isActive: true,
    },
    {
      userId: adminId,
      name: "Hạ Tầng Điện Toán Đám Mây AWS & Vercel",
      amount: 8_500_000,
      dueDay: 12,
      category: "Công nghệ & IT",
      note: "Chi phí máy chủ, database clusters và CDN",
      isActive: true,
    },
    {
      userId: adminId,
      name: "Đường Truyền Internet Cáp Quang Leased Line",
      amount: 3_200_000,
      dueDay: 16,
      category: "Tiện ích & Viễn thông",
      note: "Gói cáp quang tốc độ cao đối xứng",
      isActive: true,
    },
    {
      userId: adminId,
      name: "Phí Dịch Vụ Kế Toán & Kiểm Toán Độc Lập",
      amount: 15_000_000,
      dueDay: 22,
      category: "Dịch vụ Doanh nghiệp",
      note: "Báo cáo thuế và soát xét tài chính hàng tháng",
      isActive: true,
    },
    {
      userId: adminId,
      name: "Bảo Hiểm Sức Khỏe Cao Cấp Nhân Sự",
      amount: 12_000_000,
      dueDay: 28,
      category: "Bảo hiểm & Y tế",
      note: "Bảo hiểm PVI Care toàn diện",
      isActive: true,
    },
  ]);

  // Đánh dấu đã trả cho mặt bằng tháng này
  const officeBill = createdBills.find((b) => b.dueDay === 5);
  if (officeBill) {
    await BillPayment.create({
      userId: adminId,
      billId: officeBill._id,
      month: currentMonth,
      year: currentYear,
      paidAt: new Date(currentYear, currentMonth - 1, 4),
      amountPaid: officeBill.amount,
    });
  }

  // C. Ngân Sách Danh Mục (Budgets)
  console.log("Nạp Hạn Mức Ngân Sách Danh Mục...");
  await Budget.create([
    { userId: adminId, category: "Ăn uống & Tiếp khách", monthlyLimit: 20_000_000 },
    { userId: adminId, category: "Di chuyển & Công tác", monthlyLimit: 12_000_000 },
    { userId: adminId, category: "Vật tư & Thiết bị", monthlyLimit: 15_000_000 },
    { userId: adminId, category: "Đào tạo & Phát triển", monthlyLimit: 10_000_000 },
    { userId: adminId, category: "Chi phí khác", monthlyLimit: 8_000_000 },
  ]);

  // D. Chi Tiêu Thực Tế (Expenses)
  console.log("Nạp Nhật Ký Chi Tiêu Thực Tế...");
  const sampleExpenses = [
    {
      category: "Ăn uống & Tiếp khách",
      amount: 4_500_000,
      daysAgo: 2,
      note: "Tiệc trưa tiếp đón đối tác quỹ đầu tư mạo hiểm",
    },
    {
      category: "Ăn uống & Tiếp khách",
      amount: 2_800_000,
      daysAgo: 5,
      note: "Cơm trưa văn phòng & coffee brainstorming",
    },
    {
      category: "Ăn uống & Tiếp khách",
      amount: 8_900_000,
      daysAgo: 8,
      note: "Gala dinner tri ân khách hàng thân thiết",
    },
    {
      category: "Di chuyển & Công tác",
      amount: 3_200_000,
      daysAgo: 3,
      note: "Vé máy bay khứ hồi công tác TP.HCM",
    },
    {
      category: "Di chuyển & Công tác",
      amount: 1_400_000,
      daysAgo: 7,
      note: "Taxi Grab di chuyển các điểm hẹn đối tác",
    },
    {
      category: "Vật tư & Thiết bị",
      amount: 14_500_000,
      daysAgo: 4,
      note: "Nâng cấp 2 màn hình 4K cho phòng tài chính kế toán",
    },
    {
      category: "Đào tạo & Phát triển",
      amount: 6_000_000,
      daysAgo: 9,
      note: "Khóa đào tạo chuẩn IFRS và chuyển đổi số tài chính",
    },
    {
      category: "Chi phí khác",
      amount: 1_200_000,
      daysAgo: 6,
      note: "Văn phòng phẩm, bút ký cao cấp và giấy in",
    },
  ];

  for (const exp of sampleExpenses) {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() - exp.daysAgo);
    await Expense.create({
      userId: adminId,
      date: expDate,
      amount: exp.amount,
      category: exp.category,
      note: exp.note,
    });
  }

  // E. Mục Tiêu Tích Lũy & Quỹ Khẩn Cấp (Savings Goals)
  console.log("Nạp Mục Tiêu Tiết Kiệm & Quỹ Dự Phòng...");
  const sixMonthsLater = new Date();
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  const emergencyGoal = await SavingsGoal.create({
    userId: adminId,
    name: "Quỹ Dự Phòng Khẩn Cấp (6 Tháng Chi Phí)",
    targetAmount: 300_000_000,
    currentAmount: 180_000_000,
    deadline: sixMonthsLater,
  });

  const expansionGoal = await SavingsGoal.create({
    userId: adminId,
    name: "Quỹ Mở Rộng Chi Nhánh Singapore & Tokyo",
    targetAmount: 500_000_000,
    currentAmount: 150_000_000,
    deadline: oneYearLater,
  });

  const techGoal = await SavingsGoal.create({
    userId: adminId,
    name: "Nâng Cấp Hệ Thống AI Server Cục Bộ",
    targetAmount: 120_000_000,
    currentAmount: 80_000_000,
    deadline: sixMonthsLater,
  });

  // F. Lịch Sử Giao Dịch Tích Lũy (Savings Transactions)
  console.log("Nạp Lịch Sử Biến Động Quỹ...");
  await SavingsTransaction.create([
    {
      userId: adminId,
      goalId: emergencyGoal._id,
      type: "deposit",
      amount: 50_000_000,
      date: new Date(currentYear, currentMonth - 1, 6),
      note: "Trích từ doanh thu hợp đồng tư vấn quản trị",
    },
    {
      userId: adminId,
      goalId: expansionGoal._id,
      type: "deposit",
      amount: 40_000_000,
      date: new Date(currentYear, currentMonth - 1, 10),
      note: "Trích từ tiền thưởng dự án",
    },
    {
      userId: adminId,
      goalId: techGoal._id,
      type: "deposit",
      amount: 30_000_000,
      date: new Date(currentYear, currentMonth - 1, 15),
      note: "Tích lũy định kỳ nâng cấp máy chủ",
    },
  ]);

  console.log("==========================================================");
  console.log("🎉 KHỞI TẠO DỮ LIỆU SEED HOÀN TẤT THÀNH CÔNG RỰC RỠ!");
  console.log("==========================================================");
  console.log("MÃ KHÓA TRUY CẬP ĐÃ SẴN SÀNG ĐỂ SỬ DỤNG:");
  console.log("1. Ban Quản Trị / CEO:  PROMAX-CORP-9999");
  console.log("2. Giám Đốc Tài Chính:  ENTERPRISE-CFO-8888");
  console.log("3. Khách Hàng VIP:       PROMAX-VIP-8888");
  console.log("==========================================================");

  if (isJsonDbActive()) {
    flushDatabaseToDisk();
    console.log("✓ Đã lưu toàn bộ dữ liệu mẫu vào file data/db.json");
  } else {
    await mongoose.disconnect();
  }
}

runSeed().catch((err) => {
  console.error("Lỗi khi chạy seed:", err);
  process.exit(1);
});

