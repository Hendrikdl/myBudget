
import express from 'express';
import ctrl from '../controllers/expenseController.js';
import requireAuth from '../middleware/requireAuth.js'


const router = express.Router();


// 🔒 All routes below require a valid JWT
router.use(requireAuth);


// CRUD
router.post("/", ctrl.createExpense);
router.get("/", ctrl.listExpenses);
router.get("/:id", ctrl.getExpense);
router.patch("/:id", ctrl.updateExpense);
router.delete("/:id", ctrl.deleteExpense);

export default router;

