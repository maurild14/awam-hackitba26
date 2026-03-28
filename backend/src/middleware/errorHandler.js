import { createErrorPayload } from "@awam/shared";

/**
 * @param {Error & { statusCode?: number, code?: string }} err
 * @param {import("express").Request} _req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export function errorHandler(err, _req, res, next) {
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
