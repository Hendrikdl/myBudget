
import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  company: { type: String, required: true },
  frequency: {type: String, required: true},
}, { timestamps: true });

export default mongoose.model('Income', incomeSchema);
