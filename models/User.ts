import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  trialStart: Date | null;
  trialEndsAt: Date | null;
  subscriptionStatus: "trial" | "active" | "expired" | "none" | "basic";
  subscriptionPlan: "none" | "trial" | "basic" | "monthly" | "yearly";
  subscriptionEndsAt: Date | null;
  isBlocked: boolean;
  isPaid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    trialStart: {
      type: Date,
      default: null,
    },
    trialEndsAt: {
      type: Date,
      default: null,
    },
    subscriptionStatus: {
      type: String,
      enum: ["trial", "active", "expired", "none", "basic"],
      default: "trial",
    },
    subscriptionPlan: {
      type: String,
      enum: ["none", "trial", "basic", "monthly", "yearly"],
      default: "none",
    },
    subscriptionEndsAt: {
      type: Date,
      default: null,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

delete mongoose.models.User;

const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", userSchema);

export default User;