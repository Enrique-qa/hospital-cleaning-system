import express from "express";
import cors from "cors";

import { employeeRoutes } from "./routes/employeeRoutes";
import { cleaningEntityRoutes } from "./routes/cleaningEntityRoutes";
import { cleaningRecordRoutes } from "./routes/cleaningRecordRoutes";
import { dashboardRoutes } from "./routes/dashboardRoutes";
import { uploadRoutes } from "./routes/uploadRoutes";
import path from "path";
import { reportRoutes } from "./routes/reportRoutes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.use(cleaningEntityRoutes);
app.use(cleaningRecordRoutes);
app.use(dashboardRoutes);
app.use(uploadRoutes);
app.use(reportRoutes);

app.get("/", (req, res) => {
  return res.json({
    message: "API de Limpeza Hospitalar funcionando",
  });
});

app.use(employeeRoutes);

export { app };
