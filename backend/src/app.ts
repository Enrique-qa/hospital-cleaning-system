import express from "express";
import cors from "cors";
import path from "path";

import { authRoutes } from "./routes/authRoutes";
import { cleaningEntityRoutes } from "./routes/cleaningEntityRoutes";
import { cleaningRecordRoutes } from "./routes/cleaningRecordRoutes";
import { dashboardRoutes } from "./routes/dashboardRoutes";
import { employeeRoutes } from "./routes/employeeRoutes";
import { reportRoutes } from "./routes/reportRoutes";
import { uploadRoutes } from "./routes/uploadRoutes";
import { userRoutes } from "./routes/userRoutes";
import { authMiddleware } from "./middlewares/authMiddleware";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/", authMiddleware, (req, res) => {
  return res.json({
    message: "API de Limpeza Hospitalar funcionando",
  });
});

// públicas
app.use(authRoutes);
app.use(cleaningEntityRoutes);
app.use(cleaningRecordRoutes);

// protegidas/admin conforme definido dentro de cada arquivo de rota
app.use(dashboardRoutes);
app.use(employeeRoutes);
app.use(reportRoutes);
app.use(uploadRoutes);
app.use(userRoutes);

export { app };