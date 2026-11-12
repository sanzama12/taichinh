import mongoose, { Schema, Model } from "mongoose";
import { jsonDb } from "@/lib/json-db";
import { createModelAdapter } from "@/lib/model-adapter";

export type TicketCategory = "order" | "income" | "debt" | "wallet" | "other";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";

export interface ISupportTicket {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  ticketCode: string;
  title: string;
  category: TicketCategory;
  message: string;
  priority: TicketPriority;
  status: TicketStatus;
  adminReply?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ticketCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Tiêu đề yêu cầu không được để trống"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["order", "income", "debt", "wallet", "other"],
      default: "other",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: [true, "Nội dung yêu cầu không được để trống"],
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },
    adminReply: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

SupportTicketSchema.index({ userId: 1, status: 1 });
SupportTicketSchema.index({ createdAt: -1 });

const MongooseSupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);

export const SupportTicket: Model<ISupportTicket> = createModelAdapter<ISupportTicket>(
  "SupportTicket",
  () => MongooseSupportTicket,
  jsonDb.supportTickets
);

