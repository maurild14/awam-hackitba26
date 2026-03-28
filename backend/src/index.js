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
import { createRequireInternalApiToken } from "./middleware/internalApi.js";
import { createBotModel } from "./models/bot.js";
import { createExecutionLogModel } from "./models/executionLog.js";
import { createPaymentModel } from "./models/payment.js";
import { createProfileModel } from "./models/profile.js";
import { createSessionModel } from "./models/session.js";
import { createApp } from "./app.js";
import { createAdminBotsRouter } from "./routes/adminBots.js";
import { createAuthRouter } from "./routes/auth.js";
import { createBotsRouter } from "./routes/bots.js";
import { createPaymentsRouter } from "./routes/payments.js";
import { createSellerBotsRouter } from "./routes/sellerBots.js";
import { createSessionsRouter } from "./routes/sessions.js";
import { createAuthService } from "./services/authService.js";
import { createBotService } from "./services/botService.js";
import { createDummyPaymentProvider } from "./services/dummyPaymentProvider.js";
import { createMockSandboxRunner } from "./services/mockSandboxRunner.js";
import { createMockSecretStore } from "./services/mockSecretStore.js";
import { createMockStreamEmitter } from "./services/mockStreamEmitter.js";
import { createPaymentService } from "./services/paymentService.js";
import { createSessionService } from "./services/sessionService.js";

const logger = createLogger("backend");
const publicAuthClient = createSupabasePublicAuthClient(appConfig);
const adminClient = createSupabaseAdminClient(appConfig);
const profileModel = createProfileModel({ adminClient });
const botModel = createBotModel({ adminClient });
const paymentModel = createPaymentModel({ adminClient });
const sessionModel = createSessionModel({ adminClient });
const executionLogModel = createExecutionLogModel({ adminClient });
const authService = createAuthService({
  publicAuthClient,
  adminClient,
  profileModel
});
const botService = createBotService({
  botModel
});
const paymentProvider = createDummyPaymentProvider();
const secretStore = createMockSecretStore();
const streamEmitter = createMockStreamEmitter();
const sandboxRunner = createMockSandboxRunner();
const paymentService = createPaymentService({
  paymentModel,
  botModel,
  paymentProvider
});
const sessionService = createSessionService({
  sessionModel,
  executionLogModel,
  paymentModel,
  secretStore,
  sandboxRunner,
  streamEmitter
});
const requireAuth = createRequireAuth({ authService });
const attachCurrentUserProfile = createAttachCurrentUserProfile({
  authService
});
const requireInternalApiToken = createRequireInternalApiToken({
  internalApiToken: appConfig.internalApiToken
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
const paymentsRouter = createPaymentsRouter({
  paymentService,
  requireAuth,
  attachCurrentUserProfile,
  requireInternalApiToken,
  config: appConfig
});
const sessionsRouter = createSessionsRouter({
  sessionService,
  streamEmitter,
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
    },
    {
      path: "/api/v1/payments",
      router: paymentsRouter
    },
    {
      path: "/api/v1/sessions",
      router: sessionsRouter
    }
  ]
});

app.listen(appConfig.port, () => {
  logger.info("Backend listening.", {
    nodeEnv: appConfig.nodeEnv,
    port: appConfig.port
  });
});
