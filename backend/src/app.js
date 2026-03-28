import express from "express";

import { createErrorPayload } from "@awam/shared";

import { errorHandler } from "./middleware/errorHandler.js";
import { requestContext } from "./middleware/requestContext.js";
import healthRoutes from "./routes/health.js";

const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(requestContext);
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

app.use(errorHandler);

export default app;
