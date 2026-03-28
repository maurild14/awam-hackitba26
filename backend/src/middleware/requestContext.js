import { createRequestId } from "@awam/shared";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export function requestContext(req, res, next) {
  const requestId = req.header("x-request-id") ?? createRequestId();

  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  next();
}
