import mongoose, { Schema, Model } from "mongoose";
import { jsonDb } from "@/lib/json-db";
import { createModelAdapter } from "@/lib/model-adapter";

export interface IBillPayment {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  billId: mongoose.Types.ObjectId;
  month: number; // 1-12
  year: number;  // ví dụ 2026
  paidAt: Date;
  amountPaid: number;
  createdAt: Date;
  updatedAt: Date;
}

const BillPaymentSchema = new Schema<IBillPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    billId: {
      type: Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    paidAt: {
      type: Date,
      default: () => new Date(),
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

BillPaymentSchema.index({ userId: 1, billId: 1, month: 1, year: 1 }, { unique: true });
BillPaymentSchema.index({ userId: 1, month: 1, year: 1 });

const MongooseBillPayment: Model<IBillPayment> =
  mongoose.models.BillPayment || mongoose.model<IBillPayment>("BillPayment", BillPaymentSchema);

export const BillPayment: Model<IBillPayment> = createModelAdapter<IBillPayment>(
  "BillPayment",
  () => MongooseBillPayment,
  jsonDb.billPayments
);

