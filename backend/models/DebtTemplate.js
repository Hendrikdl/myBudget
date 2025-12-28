import mongoose from "mongoose";

const debtTemplateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    description: String,
    category: String,
    amount: Number,

    firstPaymentDate: { type: Date, required: true },

    isRecurring: { type: Boolean, default: false },
    untilCancelled: { type: Boolean, default: false },

    expiryDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("DebtTemplate", debtTemplateSchema);
