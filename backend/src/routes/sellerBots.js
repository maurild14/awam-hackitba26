import { Router } from "express";

import { requireRole } from "../middleware/auth.js";
import { asyncHandler } from "./asyncHandler.js";

/**
 * @param {{
 *   botService: ReturnType<typeof import("../services/botService.js").createBotService>,
 *   requireAuth: import("express").RequestHandler,
 *   attachCurrentUserProfile: import("express").RequestHandler
 * }} dependencies
 */
export function createSellerBotsRouter({
  botService,
  requireAuth,
  attachCurrentUserProfile
}) {
  const router = Router();

  router.use(requireAuth, attachCurrentUserProfile, requireRole("seller"));

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const bots = await botService.listSellerBots({
        sellerId: res.locals.auth.profile.id
      });

      res.status(200).json({ bots });
    })
  );

  router.get(
    "/:botId",
    asyncHandler(async (req, res) => {
      const botId = Array.isArray(req.params.botId)
        ? req.params.botId[0]
        : req.params.botId;
      const bot = await botService.getSellerBot({
        sellerId: res.locals.auth.profile.id,
        botId
      });

      res.status(200).json({ bot });
    })
  );

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const bot = await botService.createSellerBot({
        sellerId: res.locals.auth.profile.id,
        payload: req.body
      });

      res.status(201).json({ bot });
    })
  );

  router.patch(
    "/:botId",
    asyncHandler(async (req, res) => {
      const botId = Array.isArray(req.params.botId)
        ? req.params.botId[0]
        : req.params.botId;
      const bot = await botService.updateSellerBot({
        sellerId: res.locals.auth.profile.id,
        botId,
        payload: req.body
      });

      res.status(200).json({ bot });
    })
  );

  return router;
}
