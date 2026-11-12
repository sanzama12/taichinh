import { connectDB } from "../lib/db";
import { User } from "../models/User";
import { AccessKey } from "../models/AccessKey";
import { DEFAULT_USER_PERMISSIONS } from "../types/permissions";

async function main() {
  await connectDB();
  const phone = "0901234567";
  const existing = await User.findOne({ accessKey: phone });
  if (!existing) {
    const user = await User.create({
      name: "Tài Xế Đối Tác Be",
      accessKey: phone,
      phone: phone,
      role: "user",
      walletBalance: 15500000,
      walletCode: `VTHU-${phone}`,
      permissions: {
        ...DEFAULT_USER_PERMISSIONS,
        debts: false, // Thử tắt chức năng Nợ để test phân quyền!
        bills: false, // Thử tắt chức năng Hóa Đơn để test phân quyền!
      },
      settings: {
        savingsRatePercent: 20,
        remindDaysBefore: 3,
        emailReminder: true,
        currency: "VND",
      },
    });

    await AccessKey.create({
      key: phone,
      name: "Tài Xế Đối Tác Be",
      userId: user._id,
      role: "user",
      isActive: true,
    });
    console.log("✅ Created test driver user with SĐT: 0901234567");
  } else {
    console.log("ℹ️ User 0901234567 already exists");
  }
  process.exit(0);
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});

