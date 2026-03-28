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
export function createAdminBotsRouter({
  botService,
  requireAuth,
  attachCurrentUserProfile
}) {
  const router = Router();

  router.use(requireAuth, attachCurrentUserProfile, requireRole("admin"));

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const bots = await botService.listAdminBots();
      res.status(200).json({ bots });
    })
  );

  router.patch(
    "/:botId/status",
    asyncHandler(async (req, res) => {
      const botId = Array.isArray(req.params.botId)
        ? req.params.botId[0]
        : req.params.botId;
      const bot = await botService.updateAdminBotStatus({
        botId,
        status: req.body?.status
      });

      res.status(200).json({ bot });
    })
  );

  return router;
}
