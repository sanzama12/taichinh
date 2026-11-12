import mongoose, { Schema, Model } from "mongoose";
import { jsonDb } from "@/lib/json-db";
import { createModelAdapter } from "@/lib/model-adapter";

export interface ISavingsTransaction {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  goalId: mongoose.Types.ObjectId;
  type: "deposit" | "withdraw";
  amount: number;
  date: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SavingsTransactionSchema = new Schema<ISavingsTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    goalId: {
      type: Schema.Types.ObjectId,
      ref: "SavingsGoal",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdraw"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Số tiền không được âm"],
    },
    date: {
      type: Date,
      default: () => new Date(),
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

SavingsTransactionSchema.index({ userId: 1, goalId: 1, date: -1 });

const MongooseSavingsTransaction: Model<ISavingsTransaction> =
  mongoose.models.SavingsTransaction ||
  mongoose.model<ISavingsTransaction>("SavingsTransaction", SavingsTransactionSchema);

export const SavingsTransaction: Model<ISavingsTransaction> = createModelAdapter<ISavingsTransaction>(
  "SavingsTransaction",
  () => MongooseSavingsTransaction,
  jsonDb.savingsTransactions
);

