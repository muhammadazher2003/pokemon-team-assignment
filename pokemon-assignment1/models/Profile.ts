import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fullName: String,
    profileType: { type: String, enum: ["client", "contractor"] },
    email: String,
    balance: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export const Profile = mongoose.models.Profile || mongoose.model("Profile", profileSchema);
