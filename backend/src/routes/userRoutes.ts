import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const userRoutes = Router();
const userController = new UserController();

userRoutes.post(
  "/users",
  authMiddleware,
  adminMiddleware,
  userController.create
);

userRoutes.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  userController.list
);

export { userRoutes };