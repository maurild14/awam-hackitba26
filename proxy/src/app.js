import express from "express";

import { createErrorPayload, createRequestId } from "@awam/shared";

import healthRoutes from "./routes/health.js";

const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use((req, res, next) => {
  const requestId = req.header("x-request-id") ?? createRequestId();

  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
});
app.use(healthRoutes);

app.use((req, res) => {
  res
    .status(404)
    .json(
      createErrorPayload(
        "NOT_FOUND",
        `Route ${req.method} ${req.originalUrl} was not found.`,
        res.locals.requestId
      )
    );
});

/**
 * @param {Error & { statusCode?: number, code?: string }} err
 * @param {import("express").Request} _req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function proxyErrorHandler(err, _req, res, next) {
  void _req;
  void next;

  const statusCode =
    typeof err.statusCode === "number" ? err.statusCode : 500;
  const code =
    typeof err.code === "string" ? err.code : "INTERNAL_SERVER_ERROR";
  const message =
    statusCode >= 500
      ? "Internal server error."
      : err.message || "Unexpected request error.";

  res
    .status(statusCode)
    .json(createErrorPayload(code, message, res.locals.requestId));
}

app.use(proxyErrorHandler);

export default app;
