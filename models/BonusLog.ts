import mongoose, { Schema, Model } from "mongoose";
import { jsonDb } from "@/lib/json-db";
import { createModelAdapter } from "@/lib/model-adapter";

export type BonusType = "milestone" | "weekly" | "peakHour" | "weather" | "other";
export type BonusStatus = "received" | "pending";

export interface IBonusLog {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  bonusType: BonusType;
  date: Date;
  status: BonusStatus;
  targetTrips?: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BonusLogSchema = new Schema<IBonusLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Tên chương trình thưởng không được để trống"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Số tiền thưởng không được để trống"],
      min: [0, "Số tiền thưởng không được âm"],
    },
    bonusType: {
      type: String,
      enum: ["milestone", "weekly", "peakHour", "weather", "other"],
      default: "milestone",
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["received", "pending"],
      default: "received",
    },
    targetTrips: {
      type: Number,
      default: 0,
      min: 0,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

BonusLogSchema.index({ userId: 1, date: -1 });

const MongooseBonusLog: Model<IBonusLog> =
  mongoose.models.BonusLog || mongoose.model<IBonusLog>("BonusLog", BonusLogSchema);

export const BonusLog: Model<IBonusLog> = createModelAdapter<IBonusLog>(
  "BonusLog",
  () => MongooseBonusLog,
  jsonDb.bonusLogs
);

