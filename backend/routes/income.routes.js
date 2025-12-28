import express from "express";
import {
  createIncome,
  getIncomes,
  updateIncome,
  deleteIncome,
} from "../controllers/income.controller.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/", requireAuth, createIncome);
router.get("/", requireAuth, getIncomes);
router.put("/:id", requireAuth, updateIncome); // <-- add
router.delete("/:id", requireAuth, deleteIncome); // <-- add

export default router;
