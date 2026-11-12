import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import { isJsonDbActive, flushDatabaseToDisk, jsonDb } from "../lib/json-db";

import { User } from "../models/User";
import { AccessKey } from "../models/AccessKey";
import { Income } from "../models/Income";
import { Bill } from "../models/Bill";
import { BillPayment } from "../models/BillPayment";
import { Expense } from "../models/Expense";
import { Budget } from "../models/Budget";
import { SavingsGoal } from "../models/SavingsGoal";
import { SavingsTransaction } from "../models/SavingsTransaction";

async function cleanMockData() {
  console.log("==========================================================");
  console.log("🧹 ĐANG DỌN SẠCH DỮ LIỆU ẢO - ĐỂ NGƯỜI DÙNG TỰ NHẬP LIỆU");
  console.log("==========================================================");

  await connectDB();

  console.log("Xóa sạch toàn bộ giao dịch, hóa đơn, chi phí, ngân sách ảo...");

  await Income.deleteMany({});
  await Bill.deleteMany({});
  await BillPayment.deleteMany({});
  await Expense.deleteMany({});
  await Budget.deleteMany({});
  await SavingsGoal.deleteMany({});
  await SavingsTransaction.deleteMany({});

  if (isJsonDbActive()) {
    await flushDatabaseToDisk();
  }

  console.log("✓ Đã xóa sạch dữ liệu ảo!");
  console.log("✓ Giữ nguyên 3 tài khoản khóa đăng nhập:");
  console.log("  1. PROMAX-CORP-9999 (Admin)");
  console.log("  2. ENTERPRISE-CFO-8888 (CFO)");
  console.log("  3. PROMAX-VIP-8888 (VIP)");
  console.log("==========================================================");
  console.log("🎉 HỆ THỐNG ĐÃ TRỐNG VÀ SẴN SÀNG ĐỂ BẠN NHẬP DỮ LIỆU THẬT!");
  console.log("==========================================================");

  process.exit(0);
}

cleanMockData().catch((err) => {
  console.error("Lỗi khi dọn dữ liệu ảo:", err);
  process.exit(1);
});

