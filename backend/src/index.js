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
import { createProfileModel } from "./models/profile.js";
import { createApp } from "./app.js";
import { createAuthRouter } from "./routes/auth.js";
import { createAuthService } from "./services/authService.js";

const logger = createLogger("backend");
const publicAuthClient = createSupabasePublicAuthClient(appConfig);
const adminClient = createSupabaseAdminClient(appConfig);
const profileModel = createProfileModel({ adminClient });
const authService = createAuthService({
  publicAuthClient,
  adminClient,
  profileModel
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
const app = createApp({
  frontendUrl: appConfig.frontendUrl,
  authRouter
});

app.listen(appConfig.port, () => {
  logger.info("Backend listening.", {
    nodeEnv: appConfig.nodeEnv,
    port: appConfig.port
  });
});
