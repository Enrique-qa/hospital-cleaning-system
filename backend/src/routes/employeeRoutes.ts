import { Router } from "express";
import { EmployeeController } from "../controllers/employeeController";
import { authMiddleware } from "../middlewares/authMiddleware";

const employeeRoutes = Router();
const employeeController = new EmployeeController();

employeeRoutes.use(authMiddleware);

employeeRoutes.post("/employees", employeeController.create);
employeeRoutes.get("/employees", employeeController.list);
employeeRoutes.get("/employees/:id", employeeController.findById);
employeeRoutes.put("/employees/:id", employeeController.update);

export { employeeRoutes };
