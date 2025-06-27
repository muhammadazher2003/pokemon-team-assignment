import mongoose from "mongoose";

const contractSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    description: String,
    amount: Number,
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Contract = mongoose.models.Contract || mongoose.model("Contract", contractSchema);
