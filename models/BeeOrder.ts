import mongoose, { Schema, Model } from "mongoose";
import { jsonDb } from "@/lib/json-db";
import { createModelAdapter } from "@/lib/model-adapter";

export type BeeServiceType =
  | "beBike"
  | "beDeliveryExpress"
  | "beDeliveryEconomy"
  | "beDeliveryCorporate"
  | "beDelivery"
  | "beCar"
  | "beFood";

export interface IBeeOrder {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderCode: string;
  serviceType: BeeServiceType;
  customerFare: number;
  platformFee: number;
  taxTncn?: number;
  driverEarnings: number;
  tip: number;
  tripCount: number;
  distanceKm?: number;
  orderDate: Date;
  tripTime?: string;
  imageUrl?: string;
  note?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BeeOrderSchema = new Schema<IBeeOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderCode: {
      type: String,
      required: [true, "Mã đơn không được để trống"],
      trim: true,
    },
    serviceType: {
      type: String,
      enum: [
        "beBike",
        "beDeliveryExpress",
        "beDeliveryEconomy",
        "beDeliveryCorporate",
        "beDelivery",
        "beCar",
        "beFood",
      ],
      default: "beBike",
      required: true,
    },
    customerFare: {
      type: Number,
      required: [true, "Cước phí khách trả không được để trống"],
      min: [0, "Cước phí không được âm"],
    },
    platformFee: {
      type: Number,
      default: 0,
      min: [0, "Phí sàn không được âm"],
    },
    taxTncn: {
      type: Number,
      default: 0,
      min: [0, "Thuế TNCN không được âm"],
    },
    driverEarnings: {
      type: Number,
      required: [true, "Thu nhập tài xế không được để trống"],
      min: [0, "Thu nhập không được âm"],
    },
    tip: {
      type: Number,
      default: 0,
      min: [0, "Tiền boa không được âm"],
    },
    tripCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    distanceKm: {
      type: Number,
      default: 0,
      min: 0,
    },
    orderDate: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    tripTime: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
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

BeeOrderSchema.index({ userId: 1, orderDate: -1 });
BeeOrderSchema.index({ userId: 1, serviceType: 1 });

const MongooseBeeOrder: Model<IBeeOrder> =
  mongoose.models.BeeOrder || mongoose.model<IBeeOrder>("BeeOrder", BeeOrderSchema);

export const BeeOrder: Model<IBeeOrder> = createModelAdapter<IBeeOrder>(
  "BeeOrder",
  () => MongooseBeeOrder,
  jsonDb.beeOrders
);

