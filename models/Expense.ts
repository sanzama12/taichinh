import mongoose, { Schema, Model } from "mongoose";
import { jsonDb } from "@/lib/json-db";
import { createModelAdapter } from "@/lib/model-adapter";

export interface IExpense {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  amount: number;
  category: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Vui lòng chọn ngày chi tiêu"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Số tiền không được để trống"],
      min: [0, "Số tiền không được âm"],
    },
    category: {
      type: String,
      required: [true, "Vui lòng chọn danh mục"],
      trim: true,
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

ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, category: 1 });

const MongooseExpense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);

export const Expense: Model<IExpense> = createModelAdapter<IExpense>(
  "Expense",
  () => MongooseExpense,
  jsonDb.expenses
);

