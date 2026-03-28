import assert from "node:assert/strict";
import test from "node:test";

import { SESSION_STATUSES } from "@awam/shared";
import request from "supertest";

import { createApp } from "../src/app.js";
import { ACCESS_COOKIE_NAME } from "../src/config/cookies.js";
import {
  createAttachCurrentUserProfile,
  createRequireAuth
} from "../src/middleware/auth.js";
import { createSessionsRouter } from "../src/routes/sessions.js";
import { createMockSandboxRunner } from "../src/services/mockSandboxRunner.js";
import { createMockSecretStore } from "../src/services/mockSecretStore.js";
import { createMockStreamEmitter } from "../src/services/mockStreamEmitter.js";
import { createSessionService } from "../src/services/sessionService.js";

const frontendUrl = "http://localhost:3000";
const buyerOneId = "buyer-1111-1111-4111-8111-111111111111";
const buyerTwoId = "buyer-2222-2222-4222-8222-222222222222";
const sellerId = "seller-3333-3333-4333-8333-333333333333";
const publishedBotId = "10000000-0000-4000-8000-000000000001";
const approvedPaymentId = "payment-approved-1";
const pendingPaymentId = "payment-pending-1";
const rejectedPaymentId = "payment-rejected-1";
const foreignApprovedPaymentId = "payment-approved-foreign";
const failedPaymentId = "payment-approved-failed";
const timedOutPaymentId = "payment-approved-timed-out";
const stoppedPaymentId = "payment-approved-stopped";

/** @type {Record<string, { id: string, username: string, role: string, mpCustomerId: null, createdAt: string }>} */
const profilesById = {
  [buyerOneId]: {
    id: buyerOneId,
    username: "buyer-uno",
    role: "buyer",
    mpCustomerId: null,
    createdAt: "2026-03-28T00:00:00.000Z"
  },
  [buyerTwoId]: {
    id: buyerTwoId,
    username: "buyer-dos",
    role: "buyer",
    mpCustomerId: null,
    createdAt: "2026-03-28T00:00:00.000Z"
  },
  [sellerId]: {
    id: sellerId,
    username: "seller-uno",
    role: "seller",
    mpCustomerId: null,
    createdAt: "2026-03-28T00:00:00.000Z"
  }
};

/** @type {Record<string, { id: string, email: string }>} */
const accessTokens = {
  "buyer-access-token": {
    id: buyerOneId,
    email: "buyer1@example.com"
  },
  "buyer-two-access-token": {
    id: buyerTwoId,
    email: "buyer2@example.com"
  },
  "seller-access-token": {
    id: sellerId,
    email: "seller@example.com"
  }
};

function createFakeAuthService() {
  return {
    /**
     * @param {{ accessToken: string }} input
     */
    async getUserFromAccessToken(input) {
      const user = accessTokens[input.accessToken];

      if (!user) {
        throw /** @type {Error & { statusCode: number, code: string }} */ (
          Object.assign(new Error("Auth required"), {
            statusCode: 401,
            code: "AUTH_REQUIRED"
          })
        );
      }

      return user;
    },

    /**
     * @param {{ userId: string }} input
     */
    async getProfileByUserId(input) {
      const profile = profilesById[input.userId];

      if (!profile) {
        throw /** @type {Error & { statusCode: number, code: string }} */ (
          Object.assign(new Error("Profile missing"), {
            statusCode: 401,
            code: "PROFILE_NOT_FOUND"
          })
        );
      }

      return profile;
    }
  };
}

function createBaseBotRecords() {
  return [
    {
      id: publishedBotId,
      slug: "agente-publicado",
      seller_id: sellerId,
      seller_username: "seller-uno",
      title: "Agente publicado",
      description: "Bot buyer-facing listo para sesiones mock.",
      price_ars: 18000,
      category: "operations",
      image_uri: null,
      status: "published",
      allowed_domains: ["api.openai.com"],
      credential_schema: [
        {
          env_var: "OPENAI_API_KEY",
          label: "OpenAI API key",
          type: "password",
          required: true,
          placeholder: null,
          description: "Clave privada para ejecutar el agente."
        },
        {
          env_var: "GOOGLE_SHEETS_TOKEN",
          label: "Token de Google Sheets",
          type: "password",
          required: false,
          placeholder: null,
          description: "Opcional si querés conectar una planilla."
        }
      ],
      resources: {
        cpu: 1,
        memory_mb: 512,
        max_minutes: 10
      },
      total_executions: 0,
      average_rating: 0,
      created_at: "2026-03-28T00:00:00.000Z"
    }
  ];
}

function createBasePaymentRecords() {
  return [
    {
      id: approvedPaymentId,
      session_id: null,
      buyer_id: buyerOneId,
      bot_id: publishedBotId,
      provider_payment_id: "dummy-pay-approved",
      provider_preference_id: "dummy-pref-approved",
      amount_ars: 18000,
      commission_ars: 3600,
      status: "approved",
      paid_at: "2026-03-29T00:00:00.000Z",
      created_at: "2026-03-29T00:00:00.000Z"
    },
    {
      id: pendingPaymentId,
      session_id: null,
      buyer_id: buyerOneId,
      bot_id: publishedBotId,
      provider_payment_id: null,
      provider_preference_id: "dummy-pref-pending",
      amount_ars: 18000,
      commission_ars: 3600,
      status: "pending",
      paid_at: null,
      created_at: "2026-03-29T00:00:00.000Z"
    },
    {
      id: rejectedPaymentId,
      session_id: null,
      buyer_id: buyerOneId,
      bot_id: publishedBotId,
      provider_payment_id: "dummy-pay-rejected",
      provider_preference_id: "dummy-pref-rejected",
      amount_ars: 18000,
      commission_ars: 3600,
      status: "rejected",
      paid_at: null,
      created_at: "2026-03-29T00:00:00.000Z"
    },
    {
      id: foreignApprovedPaymentId,
      session_id: null,
      buyer_id: buyerTwoId,
      bot_id: publishedBotId,
      provider_payment_id: "dummy-pay-foreign",
      provider_preference_id: "dummy-pref-foreign",
      amount_ars: 18000,
      commission_ars: 3600,
      status: "approved",
      paid_at: "2026-03-29T00:00:00.000Z",
      created_at: "2026-03-29T00:00:00.000Z"
    },
    {
      id: failedPaymentId,
      session_id: null,
      buyer_id: buyerOneId,
      bot_id: publishedBotId,
      provider_payment_id: "dummy-pay-failed",
      provider_preference_id: "dummy-pref-failed",
      amount_ars: 18000,
      commission_ars: 3600,
      status: "approved",
      paid_at: "2026-03-29T00:00:00.000Z",
      created_at: "2026-03-29T00:00:00.000Z"
    },
    {
      id: timedOutPaymentId,
      session_id: null,
      buyer_id: buyerOneId,
      bot_id: publishedBotId,
      provider_payment_id: "dummy-pay-timeout",
      provider_preference_id: "dummy-pref-timeout",
      amount_ars: 18000,
      commission_ars: 3600,
      status: "approved",
      paid_at: "2026-03-29T00:00:00.000Z",
      created_at: "2026-03-29T00:00:00.000Z"
    },
    {
      id: stoppedPaymentId,
      session_id: null,
      buyer_id: buyerOneId,
      bot_id: publishedBotId,
      provider_payment_id: "dummy-pay-stopped",
      provider_preference_id: "dummy-pref-stopped",
      amount_ars: 18000,
      commission_ars: 3600,
      status: "approved",
      paid_at: "2026-03-29T00:00:00.000Z",
      created_at: "2026-03-29T00:00:00.000Z"
    }
  ];
}

function createMemoryPaymentModel() {
  /** @type {Array<any>} */
  const payments = createBasePaymentRecords().map((payment) => ({ ...payment }));
  const botsById = Object.fromEntries(
    createBaseBotRecords().map((bot) => [bot.id, { ...bot }])
  );

  /**
   * @param {any} payment
   */
  function mapPayment(payment) {
    return {
      ...payment,
      bot: botsById[payment.bot_id]
        ? {
            id: botsById[payment.bot_id].id,
            slug: botsById[payment.bot_id].slug,
            title: botsById[payment.bot_id].title,
            description: botsById[payment.bot_id].description,
            price_ars: botsById[payment.bot_id].price_ars,
            category: botsById[payment.bot_id].category,
            image_uri: botsById[payment.bot_id].image_uri,
            credential_schema: botsById[payment.bot_id].credential_schema
          }
        : null
    };
  }

  return {
    /**
     * @param {string} paymentId
     */
    async findById(paymentId) {
      const payment = payments.find((entry) => entry.id === paymentId);
      return payment ? mapPayment(payment) : null;
    },

    /**
     * @param {string} paymentId
     * @param {string} sessionId
     */
    async attachSession(paymentId, sessionId) {
      const index = payments.findIndex((entry) => entry.id === paymentId);
      const currentPayment = payments[index];
      const updatedPayment = {
        ...currentPayment,
        session_id: sessionId
      };

      payments[index] = updatedPayment;
      return mapPayment(updatedPayment);
    },

    getRecords() {
      return payments.map((payment) => ({ ...payment }));
    }
  };
}

function createMemorySessionModel() {
  /** @type {Array<any>} */
  const sessions = [];
  const botsById = Object.fromEntries(
    createBaseBotRecords().map((bot) => [bot.id, { ...bot }])
  );

  /**
   * @param {any} session
   */
  function mapSession(session) {
    return {
      ...session,
      bot: botsById[session.bot_id]
        ? {
            id: botsById[session.bot_id].id,
            slug: botsById[session.bot_id].slug,
            title: botsById[session.bot_id].title,
            description: botsById[session.bot_id].description,
            category: botsById[session.bot_id].category,
            price_ars: botsById[session.bot_id].price_ars,
            image_uri: botsById[session.bot_id].image_uri
          }
        : null
    };
  }

  return {
    /**
     * @param {any} input
     */
    async insert(input) {
      const session = {
        id: input.id,
        bot_id: input.bot_id,
        buyer_id: input.buyer_id,
        payment_id: input.payment_id,
        status: input.status,
        container_id: null,
        proxy_container_id: null,
        vault_path: input.vault_path,
        phantom_token_hash: input.phantom_token_hash,
        started_at: input.started_at ?? null,
        completed_at: input.completed_at ?? null,
        error_message: input.error_message ?? null,
        summary: input.summary ?? null,
        created_at: "2026-03-29T00:00:00.000Z"
      };

      sessions.push(session);
      return mapSession(session);
    },

    /**
     * @param {string} sessionId
     */
    async findById(sessionId) {
      const session = sessions.find((entry) => entry.id === sessionId);
      return session ? mapSession(session) : null;
    },

    /**
     * @param {string} buyerId
     */
    async listByBuyerId(buyerId) {
      return sessions
        .filter((session) => session.buyer_id === buyerId)
        .map(mapSession)
        .reverse();
    },

    /**
     * @param {string} sessionId
     * @param {Record<string, unknown>} patch
     */
    async update(sessionId, patch) {
      const index = sessions.findIndex((entry) => entry.id === sessionId);
      const currentSession = sessions[index];
      const updatedSession = {
        ...currentSession,
        ...patch
      };

      sessions[index] = updatedSession;
      return mapSession(updatedSession);
    },

    getRecords() {
      return sessions.map((session) => ({ ...session }));
    }
  };
}

function createMemoryExecutionLogModel() {
  /** @type {Array<any>} */
  const logs = [];

  return {
    /**
     * @param {any} input
     */
    async insert(input) {
      const log = {
        id: `log-${String(logs.length + 1).padStart(4, "0")}`,
        session_id: input.session_id,
        level: input.level,
        message: input.message,
        is_buyer_facing: input.is_buyer_facing,
        created_at: `2026-03-29T00:00:${String(logs.length + 1).padStart(2, "0")}.000Z`
      };

      logs.push(log);
      return { ...log };
    },

    /**
     * @param {string} sessionId
     */
    async listBuyerFacingBySessionId(sessionId) {
      return logs
        .filter(
          (log) => log.session_id === sessionId && log.is_buyer_facing === true
        )
        .map((log) => ({ ...log }));
    },

    /**
     * @param {string[]} sessionIds
     */
    async listLatestBuyerFacingBySessionIds(sessionIds) {
      /** @type {Record<string, any>} */
      const latestBySessionId = {};

      for (const log of [...logs].reverse()) {
        if (
          sessionIds.includes(log.session_id) &&
          log.is_buyer_facing === true &&
          !latestBySessionId[log.session_id]
        ) {
          latestBySessionId[log.session_id] = { ...log };
        }
      }

      return latestBySessionId;
    },

    getRecords() {
      return logs.map((log) => ({ ...log }));
    }
  };
}

function createSessionsTestHarness() {
  const authService = createFakeAuthService();
  const paymentModel = createMemoryPaymentModel();
  const sessionModel = createMemorySessionModel();
  const executionLogModel = createMemoryExecutionLogModel();
  const secretStore = createMockSecretStore();
  const sandboxRunner = createMockSandboxRunner();
  const streamEmitter = createMockStreamEmitter();
  const requireAuth = createRequireAuth({ authService });
  const attachCurrentUserProfile = createAttachCurrentUserProfile({
    authService
  });
  const sessionService = createSessionService({
    sessionModel,
    executionLogModel,
    paymentModel,
    secretStore,
    sandboxRunner,
    streamEmitter
  });

  return {
    app: createApp({
      frontendUrl,
      additionalRouters: [
        {
          path: "/api/v1/sessions",
          router: createSessionsRouter({
            sessionService,
            streamEmitter,
            requireAuth,
            attachCurrentUserProfile
          })
        }
      ]
    }),
    sessionService,
    paymentModel,
    sessionModel,
    executionLogModel,
    secretStore,
    sandboxRunner
  };
}

test("only buyers can create approved sessions, the flow stays sanitized and the same payment never creates two sessions", async () => {
  const harness = createSessionsTestHarness();

  const unauthenticatedResponse = await request(harness.app)
    .post("/api/v1/sessions")
    .send({
      payment_id: approvedPaymentId,
      credentials: {
        OPENAI_API_KEY: "sk-live"
      }
    });
  assert.equal(unauthenticatedResponse.status, 401);
  assert.equal(unauthenticatedResponse.body.error.code, "AUTH_REQUIRED");

  const sellerResponse = await request(harness.app)
    .post("/api/v1/sessions")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=seller-access-token`])
    .send({
      payment_id: approvedPaymentId,
      credentials: {
        OPENAI_API_KEY: "sk-live"
      }
    });
  assert.equal(sellerResponse.status, 403);
  assert.equal(sellerResponse.body.error.code, "AUTH_ROLE_FORBIDDEN");

  const pendingResponse = await request(harness.app)
    .post("/api/v1/sessions")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`])
    .send({
      payment_id: pendingPaymentId,
      credentials: {
        OPENAI_API_KEY: "sk-live"
      }
    });
  assert.equal(pendingResponse.status, 409);
  assert.equal(pendingResponse.body.error.code, "PAYMENT_NOT_APPROVED");

  const rejectedResponse = await request(harness.app)
    .post("/api/v1/sessions")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`])
    .send({
      payment_id: rejectedPaymentId,
      credentials: {
        OPENAI_API_KEY: "sk-live"
      }
    });
  assert.equal(rejectedResponse.status, 409);
  assert.equal(rejectedResponse.body.error.code, "PAYMENT_NOT_APPROVED");

  const foreignResponse = await request(harness.app)
    .post("/api/v1/sessions")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`])
    .send({
      payment_id: foreignApprovedPaymentId,
      credentials: {
        OPENAI_API_KEY: "sk-live"
      }
    });
  assert.equal(foreignResponse.status, 404);
  assert.equal(foreignResponse.body.error.code, "PAYMENT_NOT_FOUND");

  const successResponse = await request(harness.app)
    .post("/api/v1/sessions")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`])
    .send({
      payment_id: approvedPaymentId,
      credentials: {
        OPENAI_API_KEY: "super-secret-key",
        GOOGLE_SHEETS_TOKEN: "gsheets-secret"
      }
    });

  assert.equal(successResponse.status, 201);
  assert.equal(
    successResponse.body.session.status,
    SESSION_STATUSES.INITIALIZING
  );
  const createdSessionId = successResponse.body.session.id;

  const duplicateResponse = await request(harness.app)
    .post("/api/v1/sessions")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`])
    .send({
      payment_id: approvedPaymentId,
      credentials: {
        OPENAI_API_KEY: "another-secret"
      }
    });
  assert.equal(duplicateResponse.status, 200);
  assert.equal(duplicateResponse.body.session.id, createdSessionId);

  const storedSession = harness.sessionModel
    .getRecords()
    .find((session) => session.id === createdSessionId);
  assert.ok(storedSession);
  assert.match(storedSession.vault_path, /^mock\/session\//);
  assert.equal(typeof storedSession.phantom_token_hash, "string");
  assert.equal(storedSession.phantom_token_hash.length > 10, true);
  assert.equal(
    JSON.stringify(storedSession).includes("super-secret-key"),
    false
  );

  const storedPayment = harness.paymentModel
    .getRecords()
    .find((payment) => payment.id === approvedPaymentId);
  assert.ok(storedPayment);
  assert.equal(storedPayment.session_id, createdSessionId);
  assert.equal(harness.secretStore.hasPath(storedSession.vault_path), true);
  assert.equal(
    harness.sandboxRunner.hasActiveTokenHash(storedSession.phantom_token_hash),
    true
  );

  await harness.sandboxRunner.waitForIdle();

  const detailResponse = await request(harness.app)
    .get(`/api/v1/sessions/${createdSessionId}`)
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`]);
  assert.equal(detailResponse.status, 200);
  assert.equal(detailResponse.body.session.status, SESSION_STATUSES.COMPLETED);
  assert.equal(typeof detailResponse.body.session.summary, "string");
  assert.equal(detailResponse.body.session.logs.length, 3);
  assert.equal(detailResponse.body.session.logs[0].message.startsWith("PROGRESS:"), false);
  assert.equal(
    JSON.stringify(detailResponse.body.session).includes("super-secret-key"),
    false
  );

  const otherBuyerDetail = await request(harness.app)
    .get(`/api/v1/sessions/${createdSessionId}`)
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-two-access-token`]);
  assert.equal(otherBuyerDetail.status, 404);
  assert.equal(otherBuyerDetail.body.error.code, "SESSION_NOT_FOUND");

  const historyResponse = await request(harness.app)
    .get("/api/v1/sessions")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`]);
  assert.equal(historyResponse.status, 200);
  assert.equal(historyResponse.body.sessions.length, 1);
  assert.equal(historyResponse.body.sessions[0].id, createdSessionId);
  assert.equal(typeof historyResponse.body.sessions[0].latest_update?.message, "string");

  const storedLogs = harness.executionLogModel.getRecords();
  assert.equal(
    storedLogs.some((log) => log.message.includes("super-secret-key")),
    false
  );
  assert.equal(harness.secretStore.size(), 0);
  assert.equal(harness.sandboxRunner.activeTokenCount(), 0);
});

test("session creation validates credential_schema and rejects missing or undeclared values", async () => {
  const harness = createSessionsTestHarness();

  const missingCredentialResponse = await request(harness.app)
    .post("/api/v1/sessions")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`])
    .send({
      payment_id: approvedPaymentId,
      credentials: {}
    });
  assert.equal(missingCredentialResponse.status, 400);
  assert.equal(
    missingCredentialResponse.body.error.code,
    "CREDENTIAL_REQUIRED"
  );

  const undeclaredCredentialResponse = await request(harness.app)
    .post("/api/v1/sessions")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`])
    .send({
      payment_id: approvedPaymentId,
      credentials: {
        OPENAI_API_KEY: "sk-live",
        AWS_SECRET_ACCESS_KEY: "should-not-be-here"
      }
    });
  assert.equal(undeclaredCredentialResponse.status, 400);
  assert.equal(
    undeclaredCredentialResponse.body.error.code,
    "CREDENTIAL_NOT_DECLARED"
  );
});

test("session service covers failed, timed_out and stopped states while cleaning mock secrets and token registry", async () => {
  const scenarios = [
    {
      paymentId: failedPaymentId,
      terminalStatus: SESSION_STATUSES.FAILED
    },
    {
      paymentId: timedOutPaymentId,
      terminalStatus: SESSION_STATUSES.TIMED_OUT
    },
    {
      paymentId: stoppedPaymentId,
      terminalStatus: SESSION_STATUSES.STOPPED
    }
  ];

  for (const scenario of scenarios) {
    const harness = createSessionsTestHarness();
    harness.sandboxRunner.enqueueScenario({
      terminalStatus: scenario.terminalStatus,
      stepDelayMs: 0,
      progressLines: ["PROGRESS: Mensaje visible antes del cierre."]
    });

    const creation = await harness.sessionService.createSession({
      buyerId: buyerOneId,
      paymentId: scenario.paymentId,
      credentials: {
        OPENAI_API_KEY: "secret-for-state-tests"
      }
    });
    const createdSession = harness.sessionModel
      .getRecords()
      .find((session) => session.id === creation.session.id);

    assert.ok(createdSession);
    await harness.sandboxRunner.waitForIdle();

    const detailedSession = await harness.sessionService.getBuyerSession({
      buyerId: buyerOneId,
      sessionId: creation.session.id
    });

    assert.equal(detailedSession.status, scenario.terminalStatus);
    assert.equal(detailedSession.logs.length, 1);
    assert.equal(harness.secretStore.size(), 0);
    assert.equal(harness.secretStore.hasPath(createdSession.vault_path), false);
    assert.equal(harness.sandboxRunner.activeTokenCount(), 0);
    assert.equal(
      harness.sandboxRunner.hasActiveTokenHash(createdSession.phantom_token_hash),
      false
    );

    if (scenario.terminalStatus === SESSION_STATUSES.FAILED) {
      assert.equal(typeof detailedSession.error_message, "string");
    }

    if (scenario.terminalStatus === SESSION_STATUSES.TIMED_OUT) {
      assert.match(
        detailedSession.error_message ?? "",
        /tiempo esperado/i
      );
    }

    if (scenario.terminalStatus === SESSION_STATUSES.STOPPED) {
      assert.match(detailedSession.error_message ?? "", /detuvo/i);
    }
  }
});
