import mongoose, { Schema, Model } from "mongoose";
import { jsonDb } from "@/lib/json-db";
import { createModelAdapter } from "@/lib/model-adapter";

export interface IIncome {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  amount: number;
  dayOfMonth: number;
  type: "monthly" | "oneTime";
  date?: Date;
  note?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IncomeSchema = new Schema<IIncome>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Tên nguồn thu không được để trống"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Số tiền không được để trống"],
      min: [0, "Số tiền không được âm"],
    },
    dayOfMonth: {
      type: Number,
      default: 1,
      min: 1,
      max: 31,
    },
    type: {
      type: String,
      enum: ["monthly", "oneTime"],
      default: "monthly",
    },
    date: {
      type: Date,
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

IncomeSchema.index({ userId: 1, type: 1 });
IncomeSchema.index({ userId: 1, dayOfMonth: 1 });

const MongooseIncome: Model<IIncome> =
  mongoose.models.Income || mongoose.model<IIncome>("Income", IncomeSchema);

export const Income: Model<IIncome> = createModelAdapter<IIncome>(
  "Income",
  () => MongooseIncome,
  jsonDb.incomes
);

