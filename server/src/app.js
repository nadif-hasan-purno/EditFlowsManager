import express from "express";
import cors from "cors";
import taskRoutes from "./routes/tasks.js";
import customFieldDefinitionRoutes from "./routes/customFieldDefinitions.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "task-tracker-server" });
});

app.use("/api/tasks", taskRoutes);
app.use("/api/custom-field-definitions", customFieldDefinitionRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
