
import Expense from "../models/Expense.js";

function toUtcDate(ymd) {
  return ymd ? new Date(`${ymd}T00:00:00.000Z`) : null;
}

async function createExpense(req, res) {
  try {
    // ✅ requires req.user from middleware
    const ownerId = req.user?._id;
    if (!ownerId) return res.status(401).send("Unauthorized");

    const {
      description,
      category,
      amount,
      firstPaymentDate,
      isRecurring = false,
      untilCanceled = false,
      expiryDate = null,
    } = req.body || {};

    if (!description || !description.trim()) return res.status(400).send("Description is required.");
    if (!category) return res.status(400).send("Category is required.");
    const amt = Number(amount);
    if (Number.isNaN(amt) || amt <= 0) return res.status(400).send("Amount must be greater than 0.");
    if (!firstPaymentDate) return res.status(400).send("First payment date is required.");

    const first = toUtcDate(firstPaymentDate);
    if (!(first instanceof Date) || isNaN(first.getTime())) return res.status(400).send("Invalid first payment date.");

    let expiry = null;
    if (isRecurring && !untilCanceled) {
      if (!expiryDate) return res.status(400).send("Expiry date is required unless set to 'until canceled'.");
      expiry = toUtcDate(expiryDate);
      if (!(expiry instanceof Date) || isNaN(expiry.getTime())) return res.status(400).send("Invalid expiry date.");
      if (expiry < first) return res.status(400).send("Expiry date cannot be before first payment date.");
    }

    const doc = await Expense.create({
      user: ownerId, // ✅ attach owner
      description: description.trim(),
      category,
      amount: amt,
      firstPaymentDate: first,
      isRecurring,
      untilCanceled,
      expiryDate: expiry,
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error.");
  }
}

async function listExpenses(req, res) {
  try {
    const ownerId = req.user?._id;
    if (!ownerId) return res.status(401).send("Unauthorized");

    const items = await Expense.find({ user: ownerId }).sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error.");
  }
}

async function getExpense(req, res) {
  try {
    const ownerId = req.user?._id;
    if (!ownerId) return res.status(401).send("Unauthorized");

    const item = await Expense.findOne({ _id: req.params.id, user: ownerId });
    if (!item) return res.status(404).send("Expense not found.");
    return res.json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error.");
  }
}

async function updateExpense(req, res) {
  try {
    const ownerId = req.user?._id;
    if (!ownerId) return res.status(401).send("Unauthorized");

    const updates = { ...req.body };

    if (typeof updates.firstPaymentDate === "string") {
      const d = toUtcDate(updates.firstPaymentDate);
      if (!(d instanceof Date) || isNaN(d.getTime())) return res.status(400).send("Invalid first payment date.");
      updates.firstPaymentDate = d;
    }
    if (typeof updates.expiryDate === "string") {
      const e = toUtcDate(updates.expiryDate);
      if (!(e instanceof Date) || isNaN(e.getTime())) return res.status(400).send("Invalid expiry date.");
      updates.expiryDate = e;
    }
    if (updates.amount !== undefined) {
      const amt = Number(updates.amount);
      if (Number.isNaN(amt) || amt <= 0) return res.status(400).send("Amount must be greater than 0.");
      updates.amount = amt;
    }
    if (
      updates.isRecurring &&
      !updates.untilCanceled &&
      updates.expiryDate instanceof Date &&
      updates.firstPaymentDate instanceof Date &&
      updates.expiryDate < updates.firstPaymentDate
    ) {
      return res.status(400).send("Expiry date cannot be before first payment date.");
    }

    const item = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: ownerId }, // ✅ restrict to owner
      updates,
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).send("Expense not found.");
    return res.json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error.");
  }
}

async function deleteExpense(req, res) {
  try {
    const ownerId = req.user?._id;
    if (!ownerId) return res.status(401).send("Unauthorized");

    const item = await Expense.findOneAndDelete({ _id: req.params.id, user: ownerId });
    if (!item) return res.status(404).send("Expense not found.");
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error.");
  }
}

export default {
  createExpense,
  listExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
};
