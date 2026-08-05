import express from "express";
import cors from "cors";
import taskRoutes from "./routes/tasks.js";
import customFieldDefinitionRoutes from "./routes/customFieldDefinitions.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

/** Comma-separated list of frontend origins, e.g. http://localhost:5173,https://your-app.onrender.com */
const allowedOrigins = String(process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin tools / server-to-server (no Origin header)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, true);
        return;
      }

      // Deny without throwing — a thrown Error becomes a 500 and confuses debugging
      callback(null, false);
    },
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
