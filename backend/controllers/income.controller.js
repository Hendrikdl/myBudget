import Income from "../models/Income.js";
import mongoose from "mongoose";

export async function createIncome(req, res) {
  try {
    const { date, category, amount, company, frequency } = req.body;
    if (!date || !category || amount == null || !company || !frequency) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const doc = await Income.create({
      userId: req.user._id,
      date: new Date(date),
      category,
      amount: Number(amount),
      company,
      frequency,
    });

    return res.status(201).json(doc);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getIncomes(req, res) {
  try {
    const items = await Income.find({ userId: req.user._id }).sort({
      date: -1,
      createdAt: -1,
    });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateIncome(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    // Only allow fields in model
    const { date, category, amount, notes } = req.body;
    const patch = {};
    if (date != null) patch.date = new Date(date);
    if (category != null) patch.category = category;
    if (amount != null) patch.amount = Number(amount);
    if (notes != null) patch.notes = notes;

    const updated = await Income.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: patch },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Income not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function deleteIncome(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const deleted = await Income.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!deleted) return res.status(404).json({ error: "Income not found" });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
