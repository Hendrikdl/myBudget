import mongoose from "mongoose";
import Settings from "../models/Settings.js";

// Helper: ensure settings doc exists for the user
async function ensureSettings(userId) {
  let doc = await Settings.findOne({ userId });
  if (!doc) {
    doc = await Settings.create({
      userId,
      theme: "light",
      debtTemplates: [],
      tolerance: 25,
    });
  }
  return doc;
}

export const updateTolerance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tolerance } = req.body;
    console.log(req.body);

    const updated = await Settings.findOneAndUpdate(
      { userId },
      { $set: { tolerance } },
      { new: true, upsert: true }
    );
    res.json(updated);
    res.json({ message: "Tolerance updated", tolerance: updated.tolerance });
  } catch (e) {
    res.status(500).json({ message: "Failed to update tolerance" });
  }
};

// Get theme
export const getTheme = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await Settings.findOne({ userId });
    res.json({ theme: settings?.theme || "light" });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch theme" });
  }
};

// Get tolerance
export const getTolerance = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await Settings.findOne({ userId });
    res.json({ tolerance: settings?.tolerance ?? 25 });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tolerance" });
  }
};

export const updateTheme = async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme } = req.body;
    if (!["light", "dark"].includes(theme)) {
      return res.status(400).json({ message: "Invalid theme" });
    }
    const updated = await Settings.findOneAndUpdate(
      { userId },
      { $set: { theme } },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: "Failed to update theme" });
  }
};

export const createDebtTemplate = async (req, res) => {
  console.log(req.body);
  try {
    const userId = req.user.id;
    console.log(req.body);
    const {
      description,
      category,
      amount,
      firstPaymentDate,
      isRecurring,
      untilCancelled,
      expiryDate,
    } = req.body;
    if (
      !description ||
      !category ||
      typeof amount !== "number" ||
      amount < 0 ||
      !firstPaymentDate
    ) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const doc = await ensureSettings(userId);
    doc.debtTemplates.unshift({
      description,
      category,
      amount,
      firstPaymentDate,
      isRecurring,
      untilCancelled,
      expiryDate,
    });
    await doc.save();

    const created = doc.debtTemplates[0];
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ message: "Failed to create template" });
  }
};

export const updateDebtTemplate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { templateId } = req.params;
    const { name, description, amount } = req.body;

    const doc = await ensureSettings(userId);
    const tpl = doc.debtTemplates.id(templateId);
    if (!tpl) return res.status(404).json({ message: "Template not found" });

    if (name != null) tpl.name = String(name).trim();
    if (description != null) tpl.description = String(description).trim();
    if (amount != null) {
      const num = Number(amount);
      if (Number.isNaN(num) || num < 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      tpl.amount = num;
    }

    await doc.save();
    res.json(tpl);
  } catch (e) {
    res.status(500).json({ message: "Failed to update template" });
  }
};

export const deleteDebtTemplate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { templateId } = req.params;

    const doc = await ensureSettings(userId);
    const tpl = doc.debtTemplates.id(templateId);
    if (!tpl) return res.status(404).json({ message: "Template not found" });

    tpl.deleteOne(); // remove subdoc
    await doc.save();
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ message: "Failed to delete template" });
  }
};

// Get current user's settings (theme + tolerance + debtTemplates)
export const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find settings for the user
    let settings = await Settings.findOne({ userId });

    // If not found, create default
    if (!settings) {
      settings = await Settings.create({ userId });
    }

    // Return only the fields you need
    res.json({
      theme: settings.theme,
      tolerance: settings.tolerance,
      debtTemplates: settings.debtTemplates,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

// Default export (needed if your router imports `settingsController` as default)
export default {
  getSettings,
  updateTheme,
  createDebtTemplate,
  updateDebtTemplate,
  deleteDebtTemplate,
  updateTolerance,
  getTheme,
  getTolerance,
  getSettings,
};
