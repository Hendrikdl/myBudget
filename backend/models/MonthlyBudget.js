import mongoose from "mongoose";

const monthlyItemSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, required: true },
  description: String,
  category: String,

  originalAmount: Number,
  plannedAmount: Number,
});

const monthlyBudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    year: Number,
    month: Number, // 0–11

    items: [monthlyItemSchema],
    totalPlanned: Number,
  },
  { timestamps: true }
);

monthlyBudgetSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

export default mongoose.model("MonthlyBudget", monthlyBudgetSchema);
