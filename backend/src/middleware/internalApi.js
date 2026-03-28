import { timingSafeEqual } from "node:crypto";

import { HttpError } from "../lib/httpError.js";

/**
 * @param {string} left
 * @param {string} right
 */
function safeCompare(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

/**
 * @param {string | undefined} authorizationHeader
 */
function readBearerToken(authorizationHeader) {
  if (!authorizationHeader) {
    return "";
  }

  const match = /^Bearer\s+(.+)$/i.exec(authorizationHeader.trim());
  return match?.[1]?.trim() ?? "";
}

/**
 * @param {{ internalApiToken: string }} dependencies
 */
export function createRequireInternalApiToken({ internalApiToken }) {
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} _res
   * @param {import("express").NextFunction} next
   */
  return function requireInternalApiToken(req, _res, next) {
    try {
      if (!internalApiToken) {
        throw new HttpError(
          503,
          "INTERNAL_CALLBACK_DISABLED",
          "El callback interno no est\u00e1 configurado."
        );
      }

      const headerToken =
        typeof req.headers["x-internal-api-token"] === "string"
          ? req.headers["x-internal-api-token"].trim()
          : "";
      const bearerToken =
        typeof req.headers.authorization === "string"
          ? readBearerToken(req.headers.authorization)
          : "";
      const providedToken = headerToken || bearerToken;

      if (!providedToken || !safeCompare(providedToken, internalApiToken)) {
        throw new HttpError(
          401,
          "INTERNAL_CALLBACK_UNAUTHORIZED",
          "No ten\u00e9s permiso para este callback."
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
