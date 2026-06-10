import { Router } from "express";
import { DashboardController } from "../controllers/dashboardController";

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

dashboardRoutes.get("/dashboard", dashboardController.index);

export { dashboardRoutes };