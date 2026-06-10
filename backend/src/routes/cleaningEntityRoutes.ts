import { Router } from "express";
import { CleaningEntityController } from "../controllers/cleaningEntityController";

const cleaningEntityRoutes = Router();
const cleaningEntityController = new CleaningEntityController();

cleaningEntityRoutes.post("/cleaning-entities", cleaningEntityController.create);
cleaningEntityRoutes.get("/cleaning-entities", cleaningEntityController.list);
cleaningEntityRoutes.get("/cleaning-entities/slug/:slug", cleaningEntityController.findBySlug);
cleaningEntityRoutes.get("/cleaning-entities/:id", cleaningEntityController.findById);
cleaningEntityRoutes.put("/cleaning-entities/:id", cleaningEntityController.update);

export { cleaningEntityRoutes };