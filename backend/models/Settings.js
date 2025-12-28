import mongoose from "mongoose";

const DebtTemplateSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    firstPaymentDate: { type: String, required: true },
    isRecurring: { type: Boolean, default: false },
    untilCancelled: { type: Boolean, default: false },
    expiryDate: { type: String, default: null },
  },
  { _id: true } // keep ObjectId for each template
);

const SettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      unique: true,
      required: true,
    },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
    debtTemplates: { type: [DebtTemplateSchema], default: [] },
    tolerance: { type: Number, default: 25, min: 0, max: 100 },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", SettingsSchema);
