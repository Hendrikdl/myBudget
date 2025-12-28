import express from "express";
import MonthlyBudget from "../models/MonthlyBudget.js";
import DebtTemplate from "../models/DebtTemplate.js";
import { monthIndex, parseISO } from "../utils/dateUtils.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/budgets/:year/:month
 */
router.get("/:year/:month", protect, async (req, res) => {
  const { year, month } = req.params;

  let budget = await MonthlyBudget.findOne({
    userId: req.user._id,
    year: Number(year),
    month: Number(month),
  });

  if (!budget) {
    budget = await generateBudget(req.user._id, year, month);
  }

  res.json(budget);
});

/**
 * PUT /api/budgets/:id
 */
router.put("/:id", protect, async (req, res) => {
  const budget = await MonthlyBudget.findById(req.params.id);

  if (!budget) return res.status(404).json({ message: "Budget not found" });

  budget.items = req.body.items;
  budget.totalPlanned = budget.items.reduce(
    (sum, i) => sum + Number(i.plannedAmount || 0),
    0
  );

  await budget.save();
  res.json(budget);
});

/**
 * Budget generator
 */
async function generateBudget(userId, year, month) {
  const selectedIndex = monthIndex(Number(year), Number(month));
  const templates = await DebtTemplate.find({ userId });

  const validTemplates = templates.filter((t) => {
    const start = parseISO(t.firstPaymentDate);
    const startIndex = monthIndex(start.year, start.month);

    if (startIndex > selectedIndex) return false;

    if (!t.isRecurring) {
      return startIndex === selectedIndex;
    }

    if (t.untilCancelled) return true;

    if (t.expiryDate) {
      const end = parseISO(t.expiryDate);
      const endIndex = monthIndex(end.year, end.month);
      return selectedIndex <= endIndex;
    }

    return false;
  });

  const items = validTemplates.map((t) => ({
    templateId: t._id,
    description: t.description,
    category: t.category,
    originalAmount: t.amount,
    plannedAmount: t.amount,
  }));

  const budget = await MonthlyBudget.create({
    userId,
    year: Number(year),
    month: Number(month),
    items,
    totalPlanned: items.reduce((s, i) => s + i.plannedAmount, 0),
  });

  return budget;
}

export default router;
