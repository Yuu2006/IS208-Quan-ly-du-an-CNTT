import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { apiRouter } from "./routes/api.ts";

export const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()) ?? true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    name: "BlueFood Backend API",
    status: "running",
    docs: "/api/health",
  });
});

app.use("/api", apiRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = typeof error.status === "number" ? error.status : 500;

  res.status(status).json({
    message: status === 500 ? "Internal server error" : error.message,
    ...(process.env.NODE_ENV === "development" ? { detail: String(error) } : {}),
  });
};

app.use(errorHandler);
