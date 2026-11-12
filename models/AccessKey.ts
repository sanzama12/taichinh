import mongoose, { Schema, Model } from "mongoose";
import { jsonDb } from "@/lib/json-db";
import { createModelAdapter } from "@/lib/model-adapter";

export interface IAccessKey {
  _id: mongoose.Types.ObjectId;
  key: string;              // Mã khóa duy nhất, ví dụ: PROMAX-VIP-8888
  name: string;             // Tên chủ sở hữu / Tên tài khoản
  userId: mongoose.Types.ObjectId; // Liên kết với User tài chính
  role: "admin" | "user";   // Vai trò
  isActive: boolean;        // Trạng thái kích hoạt
  expiresAt?: Date;         // Hạn sử dụng khóa (nếu có)
  lastLoginAt?: Date;       // Lần đăng nhập gần nhất
  createdAt: Date;
  updatedAt: Date;
}

const AccessKeySchema = new Schema<IAccessKey>(
  {
    key: {
      type: String,
      required: [true, "Mã khóa không được để trống"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Tên người dùng không được để trống"],
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiresAt: {
      type: Date,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseAccessKey: Model<IAccessKey> =
  mongoose.models.AccessKey || mongoose.model<IAccessKey>("AccessKey", AccessKeySchema);

export const AccessKey: Model<IAccessKey> = createModelAdapter<IAccessKey>(
  "AccessKey",
  () => MongooseAccessKey,
  jsonDb.accessKeys
);

