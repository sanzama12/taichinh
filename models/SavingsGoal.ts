import mongoose, { Schema, Model } from "mongoose";
import { jsonDb } from "@/lib/json-db";
import { createModelAdapter } from "@/lib/model-adapter";

export interface ISavingsGoal {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SavingsGoalSchema = new Schema<ISavingsGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Tên mục tiêu không được để trống"],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, "Số tiền mục tiêu không được để trống"],
      min: [0, "Số tiền không được âm"],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, "Số tiền hiện tại không được âm"],
    },
    deadline: {
      type: Date,
      required: [true, "Vui lòng chọn hạn chót"],
    },
  },
  {
    timestamps: true,
  }
);

SavingsGoalSchema.index({ userId: 1, deadline: 1 });

const MongooseSavingsGoal: Model<ISavingsGoal> =
  mongoose.models.SavingsGoal || mongoose.model<ISavingsGoal>("SavingsGoal", SavingsGoalSchema);

export const SavingsGoal: Model<ISavingsGoal> = createModelAdapter<ISavingsGoal>(
  "SavingsGoal",
  () => MongooseSavingsGoal,
  jsonDb.savingsGoals
);

