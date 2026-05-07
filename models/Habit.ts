import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  completedDates: string[];
  streak: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const habitSchema = new Schema<IHabit>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    completedDates: [String],
    streak: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Habit = (mongoose.models.Habit as Model<IHabit>) || mongoose.model<IHabit>("Habit", habitSchema);