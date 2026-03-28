import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";

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
const approvedPaymentId = "payment-approved-sse";

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

function createMemoryPaymentModel() {
  /** @type {Array<any>} */
  const payments = [
    {
      id: approvedPaymentId,
      session_id: null,
      buyer_id: buyerOneId,
      bot_id: publishedBotId,
      provider_payment_id: "dummy-pay-sse",
      provider_preference_id: "dummy-pref-sse",
      amount_ars: 18000,
      commission_ars: 3600,
      status: "approved",
      paid_at: "2026-03-29T00:00:00.000Z",
      created_at: "2026-03-29T00:00:00.000Z"
    }
  ];
  const bot = {
    id: publishedBotId,
    slug: "agente-publicado",
    title: "Agente publicado",
    description: "Bot buyer-facing listo para SSE.",
    price_ars: 18000,
    category: "operations",
    image_uri: null,
    credential_schema: [
      {
        env_var: "OPENAI_API_KEY",
        label: "OpenAI API key",
        type: "password",
        required: true,
        placeholder: null,
        description: "Clave privada para ejecutar el agente."
      }
    ]
  };

  return {
    /**
     * @param {string} paymentId
     */
    async findById(paymentId) {
      const payment = payments.find((entry) => entry.id === paymentId);

      if (!payment) {
        return null;
      }

      return {
        ...payment,
        bot
      };
    },

    /**
     * @param {string} paymentId
     * @param {string} sessionId
     */
    async attachSession(paymentId, sessionId) {
      const index = payments.findIndex((entry) => entry.id === paymentId);
      payments[index] = {
        ...payments[index],
        session_id: sessionId
      };

      return {
        ...payments[index],
        bot
      };
    }
  };
}

function createMemorySessionModel() {
  /** @type {Array<any>} */
  const sessions = [];
  const bot = {
    id: publishedBotId,
    slug: "agente-publicado",
    title: "Agente publicado",
    description: "Bot buyer-facing listo para SSE.",
    category: "operations",
    price_ars: 18000,
    image_uri: null
  };

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
        started_at: null,
        completed_at: null,
        error_message: null,
        summary: null,
        created_at: "2026-03-29T00:00:00.000Z"
      };

      sessions.push(session);
      return {
        ...session,
        bot
      };
    },

    /**
     * @param {string} sessionId
     */
    async findById(sessionId) {
      const session = sessions.find((entry) => entry.id === sessionId);
      return session
        ? {
            ...session,
            bot
          }
        : null;
    },

    /**
     * @param {string} buyerId
     */
    async listByBuyerId(buyerId) {
      return sessions
        .filter((session) => session.buyer_id === buyerId)
        .map((session) => ({
          ...session,
          bot
        }))
        .reverse();
    },

    /**
     * @param {string} sessionId
     * @param {Record<string, unknown>} patch
     */
    async update(sessionId, patch) {
      const index = sessions.findIndex((entry) => entry.id === sessionId);
      sessions[index] = {
        ...sessions[index],
        ...patch
      };

      return {
        ...sessions[index],
        bot
      };
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
        .filter((log) => log.session_id === sessionId && log.is_buyer_facing)
        .map((log) => ({ ...log }));
    },

    /**
     * @param {string[]} sessionIds
     */
    async listLatestBuyerFacingBySessionIds(sessionIds) {
      /** @type {Record<string, any>} */
      const latestBySessionId = {};

      for (const log of [...logs].reverse()) {
        if (sessionIds.includes(log.session_id) && !latestBySessionId[log.session_id]) {
          latestBySessionId[log.session_id] = { ...log };
        }
      }

      return latestBySessionId;
    }
  };
}

function createStreamHarness() {
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
    sandboxRunner
  };
}

/**
 * @param {import("express").Express} app
 */
function startServer(app) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      resolve(server);
    });

    server.on("error", reject);
  });
}

/**
 * @param {number} port
 * @param {string} path
 * @param {string} cookie
 */
function collectSseEvents(port, path, cookie) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let raw = "";

    const requestStream = http.request({
      hostname: "127.0.0.1",
      port,
      path,
      method: "GET",
      headers: {
        Cookie: cookie
      }
    });

    requestStream.on("response", (response) => {
      response.setEncoding("utf8");

      if (response.statusCode !== 200) {
        settled = true;
        reject(new Error(`Unexpected SSE status ${response.statusCode}.`));
        requestStream.destroy();
        return;
      }

      response.on("data", (chunk) => {
        raw += chunk;

        if (raw.includes("event: summary")) {
          settled = true;
          resolve(raw);
          requestStream.destroy();
        }
      });

      response.on("error", (error) => {
        if (!settled) {
          settled = true;
          reject(error);
        }
      });

      response.on("end", () => {
        if (!settled) {
          settled = true;
          resolve(raw);
        }
      });
    });

    requestStream.on("error", (error) => {
      if (!settled && error.message !== "socket hang up") {
        settled = true;
        reject(error);
      }
    });

    requestStream.end();
  });
}

test("stream endpoint only exposes buyer-owned sessions and pushes buyer-facing SSE events", async () => {
  const harness = createStreamHarness();
  harness.sandboxRunner.enqueueScenario({
    stepDelayMs: 40,
    progressLines: [
      "DEBUG: internal only",
      "PROGRESS: Mensaje visible para el buyer."
    ],
    summary: "Resumen SSE listo para mostrar.",
    terminalStatus: "completed"
  });

  const creationResponse = await request(harness.app)
    .post("/api/v1/sessions")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`])
    .send({
      payment_id: approvedPaymentId,
      credentials: {
        OPENAI_API_KEY: "stream-secret"
      }
    });
  assert.equal(creationResponse.status, 201);
  const sessionId = creationResponse.body.session.id;

  const unauthenticatedStream = await request(harness.app).get(
    `/api/v1/sessions/${sessionId}/stream`
  );
  assert.equal(unauthenticatedStream.status, 401);
  assert.equal(unauthenticatedStream.body.error.code, "AUTH_REQUIRED");

  const sellerStream = await request(harness.app)
    .get(`/api/v1/sessions/${sessionId}/stream`)
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=seller-access-token`]);
  assert.equal(sellerStream.status, 403);
  assert.equal(sellerStream.body.error.code, "AUTH_ROLE_FORBIDDEN");

  const foreignBuyerStream = await request(harness.app)
    .get(`/api/v1/sessions/${sessionId}/stream`)
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-two-access-token`]);
  assert.equal(foreignBuyerStream.status, 404);
  assert.equal(foreignBuyerStream.body.error.code, "SESSION_NOT_FOUND");

  /** @type {http.Server} */
  const server = /** @type {http.Server} */ (await startServer(harness.app));

  try {
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("No se pudo obtener el puerto del servidor de pruebas.");
    }

    const rawSse = await collectSseEvents(
      address.port,
      `/api/v1/sessions/${sessionId}/stream`,
      `${ACCESS_COOKIE_NAME}=buyer-access-token`
    );

    assert.match(rawSse, /event: ready/);
    assert.match(rawSse, /event: log/);
    assert.match(rawSse, /Mensaje visible para el buyer/);
    assert.match(rawSse, /event: summary/);
    assert.equal(rawSse.includes("DEBUG: internal only"), false);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(undefined);
      });
    });
  }

  await harness.sandboxRunner.waitForIdle();
});
