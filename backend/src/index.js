import "dotenv/config";

import appConfig from "./config/env.js";
import {
  createSupabaseAdminClient,
  createSupabasePublicAuthClient
} from "./config/supabase.js";
import { createLogger } from "./lib/logger.js";
import {
  createAttachCurrentUserProfile,
  createRequireAuth
} from "./middleware/auth.js";
import { createBotModel } from "./models/bot.js";
import { createProfileModel } from "./models/profile.js";
import { createApp } from "./app.js";
import { createAdminBotsRouter } from "./routes/adminBots.js";
import { createAuthRouter } from "./routes/auth.js";
import { createBotsRouter } from "./routes/bots.js";
import { createSellerBotsRouter } from "./routes/sellerBots.js";
import { createAuthService } from "./services/authService.js";
import { createBotService } from "./services/botService.js";

const logger = createLogger("backend");
const publicAuthClient = createSupabasePublicAuthClient(appConfig);
const adminClient = createSupabaseAdminClient(appConfig);
const profileModel = createProfileModel({ adminClient });
const botModel = createBotModel({ adminClient });
const authService = createAuthService({
  publicAuthClient,
  adminClient,
  profileModel
});
const botService = createBotService({
  botModel
});
const requireAuth = createRequireAuth({ authService });
const attachCurrentUserProfile = createAttachCurrentUserProfile({
  authService
});
const authRouter = createAuthRouter({
  authService,
  config: appConfig,
  requireAuth,
  attachCurrentUserProfile
});
const publicBotsRouter = createBotsRouter({
  botService
});
const sellerBotsRouter = createSellerBotsRouter({
  botService,
  requireAuth,
  attachCurrentUserProfile
});
const adminBotsRouter = createAdminBotsRouter({
  botService,
  requireAuth,
  attachCurrentUserProfile
});
const app = createApp({
  frontendUrl: appConfig.frontendUrl,
  authRouter,
  additionalRouters: [
    {
      path: "/api/v1/bots",
      router: publicBotsRouter
    },
    {
      path: "/api/v1/seller/bots",
      router: sellerBotsRouter
    },
    {
      path: "/api/v1/admin/bots",
      router: adminBotsRouter
    }
  ]
});

app.listen(appConfig.port, () => {
  logger.info("Backend listening.", {
    nodeEnv: appConfig.nodeEnv,
    port: appConfig.port
  });
});
