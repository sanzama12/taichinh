import { connectDB } from "@/lib/db";
import { User, Withdrawal, type IWithdrawal, type IUser } from "@/models";
import { Result, formatCurrencyVND } from "@/lib/utils";
import { type WithdrawalInput } from "@/lib/validators";

export interface WithdrawalDto {
  _id: string;
  withdrawalCode: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  status: "pending" | "completed" | "cancelled";
  note?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

export interface WithdrawalPageDataDto {
  withdrawals: WithdrawalDto[];
  walletBalance: number;
  walletCode: string;
  totalWithdrawn: number;
  bankInfo?: {
    bankName?: string;
    bankAccount?: string;
    accountHolder?: string;
  };
}

function mapWithdrawalToDto(doc: IWithdrawal): WithdrawalDto {
  return {
    _id: String(doc._id),
    withdrawalCode: doc.withdrawalCode,
    amount: doc.amount,
    bankName: doc.bankName,
    bankAccount: doc.bankAccount,
    accountHolder: doc.accountHolder,
    status: doc.status,
    note: doc.note,
    balanceBefore: doc.balanceBefore || 0,
    balanceAfter: doc.balanceAfter || 0,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  };
}

export class WithdrawalService {
  /**
   * Lấy danh sách lịch sử rút tiền và thông tin ví người dùng
   */
  static async getUserWithdrawals(
    userId: string,
    limit = 50
  ): Promise<Result<WithdrawalPageDataDto>> {
    try {
      await connectDB();

      const user = await User.findById(userId).select(
        "walletBalance walletCode bankInfo name"
      );
      if (!user) {
        return Result.fail("Không tìm thấy người dùng");
      }

      const walletBalance = Number(user.walletBalance) || 0;
      const walletCode = user.walletCode || `VTHU-${userId.slice(-6).toUpperCase()}`;

      const docs = await Withdrawal.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      const withdrawals = (docs as unknown as IWithdrawal[]).map(mapWithdrawalToDto);
      const totalWithdrawn = withdrawals.reduce(
        (sum, w) => sum + (w.status === "completed" ? w.amount : 0),
        0
      );

      return Result.ok({
        withdrawals,
        walletBalance,
        walletCode,
        totalWithdrawn,
        bankInfo: user.bankInfo
          ? {
              bankName: user.bankInfo.bankName,
              bankAccount: user.bankInfo.bankAccount,
              accountHolder: user.bankInfo.accountHolder,
            }
          : undefined,
      });
    } catch (error) {
      console.error("[WithdrawalService.getUserWithdrawals] Lỗi:", error);
      return Result.fail("Không thể tải lịch sử rút tiền");
    }
  }

  /**
   * Thực hiện rút tiền từ ví thu nhập về ngân hàng
   */
  static async createWithdrawal(
    userId: string,
    input: WithdrawalInput
  ): Promise<Result<WithdrawalDto>> {
    try {
      await connectDB();

      const user = await User.findById(userId);
      if (!user) {
        return Result.fail("Không tìm thấy người dùng");
      }

      const currentBalance = Number(user.walletBalance) || 0;

      // Kiểm tra số dư khả dụng
      if (input.amount > currentBalance) {
        return Result.fail(
          `Số dư ví hiện tại (${formatCurrencyVND(currentBalance)}) không đủ để rút ${formatCurrencyVND(input.amount)}`
        );
      }

      if (input.amount < 10000) {
        return Result.fail("Số tiền rút tối thiểu là 10.000 ₫");
      }

      // Tạo mã giao dịch rút tiền độc nhất
      const timestampSuffix = Date.now().toString().slice(-6);
      const randomSuffix = Math.floor(10 + Math.random() * 90);
      const withdrawalCode = `RUT-${timestampSuffix}${randomSuffix}`;

      const balanceAfter = Math.max(0, currentBalance - input.amount);

      // Lưu phiếu rút tiền
      const withdrawalDoc = await Withdrawal.create({
        userId,
        withdrawalCode,
        amount: input.amount,
        bankName: input.bankName.trim(),
        bankAccount: input.bankAccount.trim(),
        accountHolder: input.accountHolder.trim().toUpperCase(),
        status: "completed",
        note: input.note?.trim() || undefined,
        balanceBefore: currentBalance,
        balanceAfter,
      });

      // Trừ số dư ví của User
      await User.findByIdAndUpdate(userId, {
        $inc: { walletBalance: -input.amount },
        ...(input.saveBankInfo
          ? {
              bankInfo: {
                bankName: input.bankName.trim(),
                bankAccount: input.bankAccount.trim(),
                accountHolder: input.accountHolder.trim().toUpperCase(),
              },
            }
          : {}),
      });

      return Result.ok(mapWithdrawalToDto(withdrawalDoc as unknown as IWithdrawal));
    } catch (error) {
      console.error("[WithdrawalService.createWithdrawal] Lỗi:", error);
      return Result.fail("Đã xảy ra lỗi khi tạo lệnh rút tiền");
    }
  }
}

