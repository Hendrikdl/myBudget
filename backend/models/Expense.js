import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },

  firstPaymentDate: { type: Date },
  isRecurring: { type: Boolean, default: false },
  untilCanceled: { type: Boolean, default: false },
  expiryDate: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
