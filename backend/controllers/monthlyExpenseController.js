import MonthlyExpense from "../models/monthlyExpense.model.js";
import Settings from "../models/Settings.js";

// Helper to normalize date
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

// Check if template applies to month
function isTemplateApplicable(t, month) {
  const firstMonth = getMonthYYYYMM(t.firstPaymentDate);
  if (!firstMonth) return false;

  if (t.isRecurring) {
    if (t.untilCancelled) return firstMonth <= month;
    if (t.expiryDate) {
      const lastMonth = getMonthYYYYMM(t.expiryDate);
      return firstMonth <= month && month <= lastMonth;
    }
    return firstMonth <= month;
  }
  return firstMonth === month;
}

// GET /monthly-expenses/:month/existing
export const getExistingMonthlyExpenses = async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const month = req.params.month;

  const monthly = await MonthlyExpense.findOne({ user: userId, month });

  if (!monthly) return res.status(404).json({ message: "Month not found" });

  const totals = {
    total: monthly.templates.reduce(
      (sum, t) => sum + Number(t.amountOverride ?? t.amount),
      0
    ),
    recurring: monthly.templates
      .filter((t) => t.isRecurring)
      .reduce((sum, t) => sum + Number(t.amountOverride ?? t.amount), 0),
    onceOff: monthly.templates
      .filter((t) => !t.isRecurring)
      .reduce((sum, t) => sum + Number(t.amountOverride ?? t.amount), 0),
  };

  res.json({ items: monthly.templates, totals });
};

// GET monthly expenses
export const getMonthlyExpenses = async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const month = req.params.month;

  if (!month || !/^\d{4}-\d{2}$/.test(month))
    return res.status(400).json({ message: "Invalid month format" });

  try {
    // Fetch or create MonthlyExpense document
    let monthly = await MonthlyExpense.findOne({ user: userId, month });

    if (!monthly) {
      // Get user templates
      const settings = await Settings.findOne({ userId });
      const templates = (settings?.debtTemplates || []).filter((t) =>
        isTemplateApplicable(t, month)
      );

      monthly = await MonthlyExpense.create({
        user: userId,
        month,
        templates: templates.map((t) => ({
          templateId: t._id,
          description: t.description,
          category: t.category,
          amount: t.amount,
          isRecurring: t.isRecurring,
          firstPaymentDate: t.firstPaymentDate,
          expiryDate: t.expiryDate,
          included: true,
        })),
      });
    }

    // Totals
    const totals = {
      total: monthly.templates.reduce(
        (sum, t) => sum + Number(t.amountOverride ?? t.amount),
        0
      ),
      recurring: monthly.templates
        .filter((t) => t.isRecurring)
        .reduce((sum, t) => sum + Number(t.amountOverride ?? t.amount), 0),
      onceOff: monthly.templates
        .filter((t) => !t.isRecurring)
        .reduce((sum, t) => sum + Number(t.amountOverride ?? t.amount), 0),
    };

    res.json({ items: monthly.templates, totals });
  } catch (err) {
    console.error("MonthlyExpense GET error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH monthly expense template
export const updateMonthlyExpense = async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const templateId = req.params.id;
  const updateData = req.body;

  try {
    const monthly = await MonthlyExpense.findOne({
      "templates._id": templateId,
      user: userId,
    });
    if (!monthly)
      return res.status(404).json({ message: "Template not found" });

    const template = monthly.templates.id(templateId);
    Object.assign(template, updateData);
    await monthly.save();
    res.json(template);
  } catch (err) {
    console.error("PATCH error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// COPY previous month
export const copyPreviousMonth = async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const { fromMonth, toMonth } = req.body;

  if (!fromMonth || !toMonth)
    return res.status(400).json({ message: "fromMonth and toMonth required" });

  try {
    const prev = await MonthlyExpense.findOne({
      user: userId,
      month: fromMonth,
    });
    if (!prev)
      return res.status(404).json({ message: "Previous month not found" });

    const exists = await MonthlyExpense.findOne({
      user: userId,
      month: toMonth,
    });
    if (exists)
      return res.status(400).json({ message: "Target month already exists" });

    const templates = prev.templates.map((t) => ({
      templateId: t.templateId,
      description: t.description,
      category: t.category,
      amount: t.amount,
      amountOverride: t.amountOverride,
      included: t.included,
      isRecurring: t.isRecurring,
      firstPaymentDate: t.firstPaymentDate,
      expiryDate: t.expiryDate,
    }));

    const monthly = await MonthlyExpense.create({
      user: userId,
      month: toMonth,
      templates,
    });
    res.json({ success: true, toMonth, items: monthly.templates });
  } catch (err) {
    console.error("COPY previous month error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
