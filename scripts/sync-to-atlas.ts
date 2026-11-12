import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import { User } from "../models/User";
import { AccessKey } from "../models/AccessKey";
import { BeeOrder } from "../models/BeeOrder";
import { Income } from "../models/Income";
import { Debt } from "../models/Debt";
import { SupportTicket } from "../models/SupportTicket";
import { Expense } from "../models/Expense";
import { Bill } from "../models/Bill";
import { BillPayment } from "../models/BillPayment";
import { Budget } from "../models/Budget";
import { SavingsGoal } from "../models/SavingsGoal";
import { SavingsTransaction } from "../models/SavingsTransaction";
import { FuelLog } from "../models/FuelLog";
import { BonusLog } from "../models/BonusLog";

/**
 * Script sao chép toàn bộ dữ liệu từ MongoDB cục bộ lên MongoDB Atlas
 * Cách dùng: npx tsx scripts/sync-to-atlas.ts "<ATLAS_URI>"
 */
async function main() {
  const atlasUri = process.argv[2] || process.env.ATLAS_URI;
  if (!atlasUri || atlasUri.includes("<db_password>")) {
    console.error("❌ Vui lòng cung cấp chuỗi kết nối MongoDB Atlas hợp lệ kèm mật khẩu thật.");
    console.error("VD: npx tsx scripts/sync-to-atlas.ts \"mongodb+srv://user:pass@cluster0.axfahfx.mongodb.net/quanlytaichinh?retryWrites=true&w=majority\"");
    process.exit(1);
  }

  console.log("1. Đang kết nối MongoDB cục bộ (localhost:27017)...");
  await connectDB();

  console.log("2. Đang đọc dữ liệu cục bộ...");
  const [
    users,
    keys,
    beeOrders,
    incomes,
    debts,
    tickets,
    expenses,
    bills,
    billPayments,
    budgets,
    goals,
    savingsTx,
    fuels,
    bonuses,
  ] = await Promise.all([
    User.find({}).lean(),
    AccessKey.find({}).lean(),
    BeeOrder.find({}).lean(),
    Income.find({}).lean(),
    Debt.find({}).lean(),
    SupportTicket.find({}).lean(),
    Expense.find({}).lean(),
    Bill.find({}).lean(),
    BillPayment.find({}).lean(),
    Budget.find({}).lean(),
    SavingsGoal.find({}).lean(),
    SavingsTransaction.find({}).lean(),
    FuelLog.find({}).lean(),
    BonusLog.find({}).lean(),
  ]);

  console.log(`📊 Dữ liệu tìm thấy: ${users.length} Users, ${keys.length} Keys, ${beeOrders.length} Đơn Be, ${debts.length} Khoản nợ...`);

  console.log("3. Đang ngắt kết nối cục bộ và kết nối MongoDB Atlas...");
  await mongoose.disconnect();

  const atlasConn = await mongoose.connect(atlasUri, {
    serverSelectionTimeoutMS: 15000,
  });
  console.log("✅ Đã kết nối thành công đến MongoDB Atlas!");

  console.log("4. Đang nạp dữ liệu vào MongoDB Atlas...");
  if (users.length > 0) await User.bulkWrite(users.map(doc => ({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } })));
  if (keys.length > 0) await AccessKey.bulkWrite(keys.map(doc => ({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } })));
  if (beeOrders.length > 0) await BeeOrder.bulkWrite(beeOrders.map(doc => ({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } })));
  if (incomes.length > 0) await Income.bulkWrite(incomes.map(doc => ({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } })));
  if (debts.length > 0) await Debt.bulkWrite(debts.map(doc => ({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } })));
  if (tickets.length > 0) await SupportTicket.bulkWrite(tickets.map(doc => ({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } })));
  if (expenses.length > 0) await Expense.bulkWrite(expenses.map(doc => ({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } })));
  if (bills.length > 0) await Bill.bulkWrite(bills.map(doc => ({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } })));
  if (billPayments.length > 0) await BillPayment.bulkWrite(billPayments.map(doc => ({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } })));
  if (budgets.length > 0) await Budget.bulkWrite(budgets.map(doc => ({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } })));
  if (goals.length > 0) await SavingsGoal.bulkWrite(goals.map(doc => ({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } })));
  if (savingsTx.length > 0) await SavingsTransaction.bulkWrite(savingsTx.map(doc => ({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } })));
  if (fuels.length > 0) await FuelLog.bulkWrite(fuels.map(doc => ({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } })));
  if (bonuses.length > 0) await BonusLog.bulkWrite(bonuses.map(doc => ({ replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true } })));

  console.log("🎉 Hoàn tất 100%! Toàn bộ dữ liệu tài chính, admin và phân quyền đã được đồng bộ lên MongoDB Atlas.");
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Lỗi đồng bộ Atlas:", err);
  process.exit(1);
});

