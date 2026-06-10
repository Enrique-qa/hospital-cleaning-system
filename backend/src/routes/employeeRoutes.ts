import { Router } from "express";
import { EmployeeController } from "../controllers/employeeController";

const employeeRoutes = Router();
const employeeController = new EmployeeController();

employeeRoutes.post("/employees", employeeController.create);
employeeRoutes.get("/employees", employeeController.list);
employeeRoutes.get("/employees/:id", employeeController.findById);
employeeRoutes.put("/employees/:id", employeeController.update);

export { employeeRoutes };
