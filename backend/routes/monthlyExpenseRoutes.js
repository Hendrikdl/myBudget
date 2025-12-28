import express from "express";
import MonthlyExpense from "../models/monthlyExpense.model.js";
import Settings from "../models/Settings.js";
import auth from "../middleware/requireAuth.js";

const router = express.Router();

// Helper: normalize date to YYYY-MM
function getMonthYYYYMM(value) {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}$/.test(value)) return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value))
    return value.slice(0, 7);

  const d = new Date(value);
  if (isNaN(d)) return null;

  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
}

// Check if template applies for the month
function isTemplateApplicable(t, monthYYYYMM) {
  const firstMonth = getMonthYYYYMM(t.firstPaymentDate);
  if (t.isRecurring) {
    if (t.untilCancelled) return !firstMonth || firstMonth <= monthYYYYMM;
    if (t.expiryDate) {
      const lastMonth = getMonthYYYYMM(t.expiryDate);
      return (
        firstMonth &&
        lastMonth &&
        firstMonth <= monthYYYYMM &&
        monthYYYYMM <= lastMonth
      );
    }
    return !firstMonth || firstMonth <= monthYYYYMM;
  }
  return firstMonth === monthYYYYMM;
}

// GET /api/monthly-expenses/:month
router.get("/:month", auth, async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const month = req.params.month;

  if (!month || !/^\d{4}-\d{2}$/.test(month))
    return res
      .status(400)
      .json({ message: "Invalid month format. Use YYYY-MM" });

  try {
    // 1️⃣ Ensure monthly expense document exists
    let monthlyDoc = await MonthlyExpense.findOne({ user: userId, month });
    if (!monthlyDoc) {
      monthlyDoc = new MonthlyExpense({ user: userId, month, templates: [] });
    }

    // 2️⃣ Load master templates
    const settings = await Settings.findOne({ userId });
    const templates = settings?.debtTemplates || [];

    // 3️⃣ Add missing templates for this month
    for (const t of templates) {
      if (!t._id || !isTemplateApplicable(t, month)) continue;

      const exists = monthlyDoc.templates.some((temp) =>
        temp.templateId.equals(t._id)
      );
      if (!exists) {
        monthlyDoc.templates.push({
          templateId: t._id,
          description: t.description,
          category: t.category,
          amount: t.amount,
          included: true,
          isRecurring: t.isRecurring,
          firstPaymentDate: t.firstPaymentDate,
        });
      }
    }

    await monthlyDoc.save();

    // 4️⃣ Calculate totals
    const items = monthlyDoc.templates.map((t) => ({
      _id: t._id,
      templateId: t.templateId,
      description: t.description,
      category: t.category,
      isRecurring: t.isRecurring,
      firstPaymentDate: t.firstPaymentDate,
      amount: t.amount,
      amountOverride: t.amountOverride,
      included: t.included,
    }));

    const totals = {
      total: items.reduce(
        (sum, i) => sum + Number(i.amountOverride ?? i.amount),
        0
      ),
      recurring: items
        .filter((i) => i.isRecurring)
        .reduce((sum, i) => sum + Number(i.amountOverride ?? i.amount), 0),
      onceOff: items
        .filter((i) => !i.isRecurring)
        .reduce((sum, i) => sum + Number(i.amountOverride ?? i.amount), 0),
    };

    res.json({
      monthlyId: monthlyDoc._id,
      items,
      totals,
    });
  } catch (err) {
    console.error("MonthlyExpense GET error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/monthly-expenses/:id
router.patch("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { templateId, data } = req.body; // data: { included, amountOverride }

    const monthlyDoc = await MonthlyExpense.findById(id);
    if (!monthlyDoc)
      return res.status(404).json({ message: "Monthly expense not found" });

    const template = monthlyDoc.templates.id(templateId);
    if (!template)
      return res.status(404).json({ message: "Template not found" });

    Object.assign(template, data);
    await monthlyDoc.save();

    res.json(template);
  } catch (err) {
    console.error("PATCH error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// COPY previous month
router.post("/copy", auth, async (req, res) => {
  try {
    const { fromMonth, toMonth } = req.body;
    const userId = req.user._id || req.user?.id;

    if (!fromMonth || !toMonth)
      return res
        .status(400)
        .json({ message: "fromMonth and toMonth are required" });

    const prevDoc = await MonthlyExpense.findOne({
      user: userId,
      month: fromMonth,
    });
    if (!prevDoc)
      return res.status(404).json({ message: "Previous month not found" });

    let newDoc = await MonthlyExpense.findOne({ user: userId, month: toMonth });
    if (!newDoc)
      newDoc = new MonthlyExpense({
        user: userId,
        month: toMonth,
        templates: [],
      });

    for (const t of prevDoc.templates) {
      const exists = newDoc.templates.some((temp) =>
        temp.templateId.equals(t.templateId)
      );
      if (!exists) {
        newDoc.templates.push({ ...t.toObject(), _id: undefined }); // create new subdoc
      }
    }

    await newDoc.save();
    res.json({ success: true, toMonth });
  } catch (err) {
    console.error("COPY previous month error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
