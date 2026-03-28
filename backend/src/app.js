import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { createErrorPayload } from "@awam/shared";

import { errorHandler } from "./middleware/errorHandler.js";
import { requestContext } from "./middleware/requestContext.js";
import healthRoutes from "./routes/health.js";

/**
 * @param {{
 *   frontendUrl?: string,
 *   authRouter?: import("express").Router | null,
 *   additionalRouters?: Array<{ path: string, router: import("express").Router }>
 * }} [options]
 */
export function createApp(options = {}) {
  const app = express();
  const frontendUrl = options.frontendUrl ?? "http://localhost:3000";
  const authRouter = options.authRouter ?? null;
  const additionalRouters = options.additionalRouters ?? [];

  app.disable("x-powered-by");
  app.use(
    cors({
      origin: frontendUrl,
      credentials: true
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(requestContext);
  app.use(healthRoutes);

  if (authRouter) {
    app.use("/api/v1/auth", authRouter);
  }

  for (const mountedRoute of additionalRouters) {
    app.use(mountedRoute.path, mountedRoute.router);
  }

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

  app.use(errorHandler);

  return app;
}
