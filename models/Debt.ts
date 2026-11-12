import mongoose, { Schema, Model } from "mongoose";
import { jsonDb } from "@/lib/json-db";
import { createModelAdapter } from "@/lib/model-adapter";

export type DebtCategory =
  | "vehicle_installment"
  | "app_advance"
  | "bank_loan"
  | "personal_loan"
  | "credit_card"
  | "other";

export type DebtStatus = "active" | "paid_off" | "overdue";

export interface IDebt {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  dueDay: number;
  nextDueDate?: Date;
  interestRate?: number;
  category: DebtCategory;
  status: DebtStatus;
  note?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DebtSchema = new Schema<IDebt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Tên khoản nợ / chủ nợ không được để trống"],
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: [true, "Tổng số nợ không được để trống"],
      min: [0, "Số nợ không được âm"],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, "Số tiền đã trả không được âm"],
    },
    remainingAmount: {
      type: Number,
      required: true,
      min: [0, "Số nợ còn lại không được âm"],
    },
    monthlyPayment: {
      type: Number,
      default: 0,
      min: [0, "Số tiền trả mỗi kỳ không được âm"],
    },
    dueDay: {
      type: Number,
      default: 1,
      min: 1,
      max: 31,
    },
    nextDueDate: {
      type: Date,
    },
    interestRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      enum: [
        "vehicle_installment",
        "app_advance",
        "bank_loan",
        "personal_loan",
        "credit_card",
        "other",
      ],
      default: "vehicle_installment",
    },
    status: {
      type: String,
      enum: ["active", "paid_off", "overdue"],
      default: "active",
      index: true,
    },
    note: {
      type: String,
      trim: true,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },
    adminNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

DebtSchema.index({ userId: 1, status: 1 });
DebtSchema.index({ userId: 1, nextDueDate: 1 });

const MongooseDebt: Model<IDebt> =
  mongoose.models.Debt || mongoose.model<IDebt>("Debt", DebtSchema);

export const Debt: Model<IDebt> = createModelAdapter<IDebt>(
  "Debt",
  () => MongooseDebt,
  jsonDb.debts
);

