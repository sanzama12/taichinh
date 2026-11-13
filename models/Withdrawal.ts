import mongoose, { Schema, Model } from "mongoose";
import { jsonDb } from "@/lib/json-db";
import { createModelAdapter } from "@/lib/model-adapter";

export type WithdrawalStatus = "pending" | "completed" | "cancelled";

export interface IWithdrawal {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  withdrawalCode: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  status: WithdrawalStatus;
  note?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    withdrawalCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Vui lòng nhập số tiền rút"],
      min: [10000, "Số tiền rút tối thiểu là 10.000 ₫"],
    },
    bankName: {
      type: String,
      required: [true, "Vui lòng chọn ngân hàng thụ hưởng"],
      trim: true,
    },
    bankAccount: {
      type: String,
      required: [true, "Vui lòng nhập số tài khoản ngân hàng"],
      trim: true,
    },
    accountHolder: {
      type: String,
      required: [true, "Vui lòng nhập tên chủ tài khoản"],
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "completed",
    },
    note: {
      type: String,
      trim: true,
    },
    balanceBefore: {
      type: Number,
      default: 0,
    },
    balanceAfter: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

WithdrawalSchema.index({ userId: 1, createdAt: -1 });

const MongooseWithdrawal: Model<IWithdrawal> =
  mongoose.models.Withdrawal ||
  mongoose.model<IWithdrawal>("Withdrawal", WithdrawalSchema);

export const Withdrawal: Model<IWithdrawal> = createModelAdapter<IWithdrawal>(
  "Withdrawal",
  () => MongooseWithdrawal,
  (jsonDb as any).withdrawals
);

