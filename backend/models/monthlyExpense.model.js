import mongoose from "mongoose";

const MonthlyExpenseTemplateSchema = new mongoose.Schema(
  {
    templateId: { type: mongoose.Schema.Types.ObjectId, required: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    amountOverride: { type: Number, default: null },
    included: { type: Boolean, default: true },
    isRecurring: { type: Boolean, default: false },
    firstPaymentDate: { type: String, required: true },
  },
  { _id: true }
);

const MonthlyExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    month: { type: String, required: true }, // YYYY-MM
    templates: { type: [MonthlyExpenseTemplateSchema], default: [] },
  },
  { timestamps: true }
);

// Ensure one document per user per month
MonthlyExpenseSchema.index({ user: 1, month: 1 }, { unique: true });

export default mongoose.model("MonthlyExpense", MonthlyExpenseSchema);
