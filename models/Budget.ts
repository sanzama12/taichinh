import mongoose, { Schema, Model } from "mongoose";
import { jsonDb } from "@/lib/json-db";
import { createModelAdapter } from "@/lib/model-adapter";

export interface IBudget {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  category: string;
  monthlyLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBlogBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Danh mục không được để trống"],
      trim: true,
    },
    monthlyLimit: {
      type: Number,
      required: [true, "Hạn mức tháng không được để trống"],
      min: [0, "Hạn mức không được âm"],
    },
  },
  {
    timestamps: true,
  }
);

// Mỗi người dùng chỉ có 1 ngân sách duy nhất cho mỗi danh mục
BudgetSchema.index({ userId: 1, category: 1 }, { unique: true });

type IBlogBudget = IBudget;

const MongooseBudget: Model<IBudget> =
  mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);

export const Budget: Model<IBudget> = createModelAdapter<IBudget>(
  "Budget",
  () => MongooseBudget,
  jsonDb.budgets
);

