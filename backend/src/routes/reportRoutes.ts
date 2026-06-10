import { Router } from "express";
import { ReportController } from "../controllers/reportController";

const reportRoutes = Router();
const reportController = new ReportController();

reportRoutes.get("/reports/cleaning-records", reportController.cleaningRecords);

export { reportRoutes };