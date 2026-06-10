import { Router } from "express";
import { ReportController } from "../controllers/reportController";
import { authMiddleware } from "../middlewares/authMiddleware";

const reportRoutes = Router();
const reportController = new ReportController();

reportRoutes.get(
  "/reports/cleaning-records",
  authMiddleware,
  reportController.cleaningRecords
);

export { reportRoutes };
