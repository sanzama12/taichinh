import mongoose, { Schema, Model } from "mongoose";
import { jsonDb } from "@/lib/json-db";
import { createModelAdapter } from "@/lib/model-adapter";

export interface IBill {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  note?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema = new Schema<IBill>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Tên khoản phải trả không được để trống"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Số tiền không được để trống"],
      min: [0, "Số tiền không được âm"],
    },
    dueDay: {
      type: Number,
      required: [true, "Vui lòng chọn ngày đến hạn (1-31)"],
      min: 1,
      max: 31,
    },
    category: {
      type: String,
      default: "Hóa đơn & Dịch vụ",
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

BillSchema.index({ userId: 1, dueDay: 1 });
BillSchema.index({ userId: 1, isActive: 1 });

const MongooseBill: Model<IBill> =
  mongoose.models.Bill || mongoose.model<IBill>("Bill", BillSchema);

export const Bill: Model<IBill> = createModelAdapter<IBill>(
  "Bill",
  () => MongooseBill,
  jsonDb.bills
);

