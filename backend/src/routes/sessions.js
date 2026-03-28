import { Router } from "express";

import { requireRole } from "../middleware/auth.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "./asyncHandler.js";

/**
 * @param {unknown} value
 * @param {string} fieldName
 */
function readRequiredString(value, fieldName) {
  if (typeof value !== "string") {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      `El campo ${fieldName} es obligatorio.`
    );
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      `El campo ${fieldName} es obligatorio.`
    );
  }

  return normalized;
}

/**
 * @param {unknown} body
 */
function readCreateSessionPayload(body) {
  const payload = /** @type {Record<string, unknown>} */ (body ?? {});

  if (
    !payload.credentials ||
    typeof payload.credentials !== "object" ||
    Array.isArray(payload.credentials)
  ) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      "Las credenciales deben enviarse como un objeto."
    );
  }

  return {
    paymentId: readRequiredString(payload.payment_id, "payment_id"),
    credentials: payload.credentials
  };
}

/**
 * @param {import("express").Response} res
 * @param {string} eventName
 * @param {Record<string, unknown>} payload
 */
function writeSseEvent(res, eventName, payload) {
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

/**
 * @param {{
 *   sessionService: ReturnType<typeof import("../services/sessionService.js").createSessionService>,
 *   streamEmitter: ReturnType<typeof import("../services/mockStreamEmitter.js").createMockStreamEmitter>,
 *   requireAuth: import("express").RequestHandler,
 *   attachCurrentUserProfile: import("express").RequestHandler
 * }} dependencies
 */
export function createSessionsRouter({
  sessionService,
  streamEmitter,
  requireAuth,
  attachCurrentUserProfile
}) {
  const router = Router();

  router.use(requireAuth, attachCurrentUserProfile, requireRole("buyer"));

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const payload = readCreateSessionPayload(req.body);
      const result = await sessionService.createSession({
        buyerId: res.locals.auth.profile.id,
        paymentId: payload.paymentId,
        credentials: payload.credentials
      });

      res.status(result.created ? 201 : 200).json({
        session: result.session
      });
    })
  );

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const sessions = await sessionService.listBuyerSessions({
        buyerId: res.locals.auth.profile.id
      });

      res.status(200).json({
        sessions
      });
    })
  );

  router.get(
    "/:sessionId",
    asyncHandler(async (req, res) => {
      const sessionId = readRequiredString(
        Array.isArray(req.params.sessionId)
          ? req.params.sessionId[0]
          : req.params.sessionId,
        "sessionId"
      );
      const session = await sessionService.getBuyerSession({
        buyerId: res.locals.auth.profile.id,
        sessionId
      });

      res.status(200).json({
        session
      });
    })
  );

  router.get(
    "/:sessionId/stream",
    asyncHandler(async (req, res) => {
      const sessionId = readRequiredString(
        Array.isArray(req.params.sessionId)
          ? req.params.sessionId[0]
          : req.params.sessionId,
        "sessionId"
      );

      await sessionService.getBuyerSession({
        buyerId: res.locals.auth.profile.id,
        sessionId
      });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      if (typeof res.flushHeaders === "function") {
        res.flushHeaders();
      }

      res.write("retry: 3000\n\n");
      writeSseEvent(res, "ready", {
        session_id: sessionId
      });

      const unsubscribe = streamEmitter.subscribe(sessionId, (event) => {
        writeSseEvent(res, event.type, event.payload);
      });

      req.on("close", () => {
        unsubscribe();
      });
    })
  );

  return router;
}
