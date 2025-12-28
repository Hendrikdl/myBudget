import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/user.routes.js";
import incomeRoutes from "./routes/income.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import monthlyExpenseRoutes from "./routes/monthlyExpenseRoutes.js";

dotenv.config();
const app = express();

/* =========================
   MIDDLEWARE
   ========================= */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

/* =========================
   ROUTES
   ========================= */
app.use("/api/users", userRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/settings", settingsRoutes); // ✅ THIS WAS MISSING
app.use("/api/monthly-expenses", monthlyExpenseRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

/* =========================
   START SERVER
   ========================= */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));
