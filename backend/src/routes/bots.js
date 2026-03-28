import { Router } from "express";

import { asyncHandler } from "./asyncHandler.js";

/**
 * @param {{ botService: ReturnType<typeof import("../services/botService.js").createBotService> }} dependencies
 */
export function createBotsRouter({ botService }) {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const bots = await botService.listPublicBots();
      res.status(200).json({ bots });
    })
  );

  router.get(
    "/:botRef",
    asyncHandler(async (req, res) => {
      const botRef = Array.isArray(req.params.botRef)
        ? req.params.botRef[0]
        : req.params.botRef;
      const bot = await botService.getPublicBot({
        botRef
      });

      res.status(200).json({ bot });
    })
  );

  return router;
}
