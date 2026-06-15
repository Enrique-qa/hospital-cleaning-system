import { Router } from "express";
import { CleaningEntityController } from "../controllers/cleaningEntityController";
import { authMiddleware } from "../middlewares/authMiddleware";

const cleaningEntityRoutes = Router();
const cleaningEntityController = new CleaningEntityController();

cleaningEntityRoutes.get(
  "/cleaning-entities/slug/:slug",
  cleaningEntityController.findBySlug
);

cleaningEntityRoutes.use("/cleaning-entities", authMiddleware);

cleaningEntityRoutes.post("/cleaning-entities", cleaningEntityController.create);
cleaningEntityRoutes.get("/cleaning-entities", cleaningEntityController.list);
cleaningEntityRoutes.get(
  "/cleaning-entities/:id",
  cleaningEntityController.findById
);
cleaningEntityRoutes.put(
  "/cleaning-entities/:id",
  cleaningEntityController.update
);

export { cleaningEntityRoutes };
