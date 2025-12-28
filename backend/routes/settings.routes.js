import express from "express";
import verifyJWT from "../middleware/requireAuth.js";
import settingsController from "../controllers/settingsController.js";

const router = express.Router();

router.use(verifyJWT);

// GET current user's settings
router.get("/", settingsController.getSettings);

// PUT update theme (or extend to other top-level fields)
router.get("/", settingsController.getTheme);
router.put("/", settingsController.updateTheme);
router.put("/tolerance", settingsController.updateTolerance);
router.get("/tolerance", settingsController.getTolerance);

// Debt templates CRUD (embedded in Settings)
router.post("/debt-templates", settingsController.createDebtTemplate);
router.put(
  "/debt-templates/:templateId",
  settingsController.updateDebtTemplate
);
router.delete(
  "/debt-templates/:templateId",
  settingsController.deleteDebtTemplate
);

export default router;
