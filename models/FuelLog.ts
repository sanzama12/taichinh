import mongoose, { Schema, Model } from "mongoose";
import { jsonDb } from "@/lib/json-db";
import { createModelAdapter } from "@/lib/model-adapter";

export type FuelType = "RON 95" | "E5 RON 92" | "Dầu DO";

export interface IFuelLog {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  liters: number;
  pricePerLiter?: number;
  odoKm?: number;
  fuelType: FuelType;
  gasStation?: string;
  date: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FuelLogSchema = new Schema<IFuelLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Số tiền đổ xăng không được để trống"],
      min: [0, "Số tiền không được âm"],
    },
    liters: {
      type: Number,
      required: [true, "Số lít xăng không được để trống"],
      min: [0.1, "Số lít xăng phải lớn hơn 0"],
    },
    pricePerLiter: {
      type: Number,
      default: 0,
      min: 0,
    },
    odoKm: {
      type: Number,
      default: 0,
      min: 0,
    },
    fuelType: {
      type: String,
      enum: ["RON 95", "E5 RON 92", "Dầu DO"],
      default: "RON 95",
    },
    gasStation: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
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

FuelLogSchema.index({ userId: 1, date: -1 });

const MongooseFuelLog: Model<IFuelLog> =
  mongoose.models.FuelLog || mongoose.model<IFuelLog>("FuelLog", FuelLogSchema);

export const FuelLog: Model<IFuelLog> = createModelAdapter<IFuelLog>(
  "FuelLog",
  () => MongooseFuelLog,
  jsonDb.fuelLogs
);

