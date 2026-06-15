import { Router } from "express";
import { CleaningRecordController } from "../controllers/cleaningRecordController";
import { authMiddleware } from "../middlewares/authMiddleware";

const cleaningRecordRoutes = Router();
const cleaningRecordController = new CleaningRecordController();

cleaningRecordRoutes.post(
  "/cleaning-records/public/:slug",
  cleaningRecordController.createPublicRecord
);

cleaningRecordRoutes.use("/cleaning-records", authMiddleware);

cleaningRecordRoutes.get(
  "/cleaning-records/entity/:slug",
  cleaningRecordController.listByEntitySlug
);

cleaningRecordRoutes.get(
  "/cleaning-records",
  cleaningRecordController.list
);

export { cleaningRecordRoutes };
