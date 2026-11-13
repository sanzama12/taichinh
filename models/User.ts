import mongoose, { Schema, Model } from "mongoose";
import { jsonDb } from "@/lib/json-db";
import { createModelAdapter } from "@/lib/model-adapter";
import { type IUserPermissions, DEFAULT_USER_PERMISSIONS } from "@/types/permissions";

export * from "@/types/permissions";

export interface IUserSettings {
  savingsRatePercent: number;
  remindDaysBefore: number;
  emailReminder: boolean;
  currency: "VND";
}

export interface IUserBankInfo {
  bankName?: string;
  bankAccount?: string;
  accountHolder?: string;
}

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  birthYear?: number;
  age?: number;
  avatar?: string;
  address?: string;
  phone?: string;
  email?: string;
  accessKey?: string;
  role: "admin" | "user";
  passwordHash?: string;
  image?: string;
  walletCode?: string;
  walletName?: string;
  walletBalance?: number;
  bankInfo?: IUserBankInfo;
  settings: IUserSettings;
  permissions?: IUserPermissions;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập họ tên"],
      trim: true,
      default: "Người Dùng ProMax",
    },
    birthYear: {
      type: Number,
      min: 1900,
      max: 2026,
    },
    age: {
      type: Number,
      min: 1,
      max: 120,
    },
    avatar: {
      type: String,
      trim: true,
      default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    },
    address: {
      type: String,
      trim: true,
      default: "Hà Nội, Việt Nam",
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    accessKey: {
      type: String,
      sparse: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    passwordHash: {
      type: String,
      required: false,
    },
    image: {
      type: String,
    },
    walletCode: {
      type: String,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    walletName: {
      type: String,
      trim: true,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    bankInfo: {
      bankName: { type: String, trim: true },
      bankAccount: { type: String, trim: true },
      accountHolder: { type: String, trim: true },
    },
    settings: {
      savingsRatePercent: {
        type: Number,
        default: 20,
        min: 0,
        max: 100,
      },
      remindDaysBefore: {
        type: Number,
        default: 3,
        min: 1,
        max: 30,
      },
      emailReminder: {
        type: Boolean,
        default: true,
      },
      currency: {
        type: String,
        default: "VND",
      },
    },
    permissions: {
      dashboard: { type: Boolean, default: true },
      services_bee: { type: Boolean, default: true },
      services_fuel: { type: Boolean, default: true },
      services_bonus: { type: Boolean, default: true },
      debts: { type: Boolean, default: true },
      income: { type: Boolean, default: true },
      expenses: { type: Boolean, default: true },
      bills: { type: Boolean, default: true },
      savings: { type: Boolean, default: true },
      reports: { type: Boolean, default: true },
      tickets: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

const MongooseUser: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export const User: Model<IUser> = createModelAdapter<IUser>(
  "User",
  () => MongooseUser,
  jsonDb.users
);
