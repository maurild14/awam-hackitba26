import assert from "node:assert/strict";
import test from "node:test";

import { PAYMENT_STATUSES } from "@awam/shared";
import request from "supertest";

import { createApp } from "../src/app.js";
import { ACCESS_COOKIE_NAME } from "../src/config/cookies.js";
import {
  createAttachCurrentUserProfile,
  createRequireAuth
} from "../src/middleware/auth.js";
import { createRequireInternalApiToken } from "../src/middleware/internalApi.js";
import { createPaymentsRouter } from "../src/routes/payments.js";
import { createDummyPaymentProvider } from "../src/services/dummyPaymentProvider.js";
import { createPaymentService } from "../src/services/paymentService.js";

const frontendUrl = "http://localhost:3000";
const internalApiToken = "test-internal-token";
const buyerOneId = "buyer-1111-1111-4111-8111-111111111111";
const buyerTwoId = "buyer-2222-2222-4222-8222-222222222222";
const sellerId = "seller-3333-3333-4333-8333-333333333333";
const publishedBotId = "10000000-0000-4000-8000-000000000001";
const draftBotId = "20000000-0000-4000-8000-000000000002";

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
      description: "Bot publicado y disponible para checkout dummy.",
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
          description: "Clave privada del buyer."
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
    },
    {
      id: draftBotId,
      slug: "agente-borrador",
      seller_id: sellerId,
      seller_username: "seller-uno",
      title: "Agente borrador",
      description: "No deber\u00eda poder comprarse.",
      price_ars: 9000,
      category: "research",
      image_uri: null,
      status: "draft",
      allowed_domains: [],
      credential_schema: [],
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

function createMemoryBotModel() {
  const bots = createBaseBotRecords().map((bot) => ({ ...bot }));

  return {
    /**
     * @param {string} botId
     */
    async findPublishedById(botId) {
      return (
        bots.find((bot) => bot.id === botId && bot.status === "published") ??
        null
      );
    }
  };
}

function createMemoryPaymentModel() {
  /** @type {Array<any>} */
  const payments = [];
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
     * @param {any} input
     */
    async insert(input) {
      const payment = {
        id: `payment-${String(payments.length + 1).padStart(4, "0")}`,
        session_id: input.session_id ?? null,
        buyer_id: input.buyer_id,
        bot_id: input.bot_id,
        provider_payment_id: input.provider_payment_id ?? null,
        provider_preference_id: input.provider_preference_id,
        amount_ars: input.amount_ars,
        commission_ars: input.commission_ars,
        status: input.status,
        paid_at: input.paid_at ?? null,
        created_at: "2026-03-29T00:00:00.000Z"
      };

      payments.push(payment);
      return mapPayment(payment);
    },

    /**
     * @param {string} paymentId
     */
    async findById(paymentId) {
      const payment = payments.find((entry) => entry.id === paymentId);
      return payment ? mapPayment(payment) : null;
    },

    /**
     * @param {string} preferenceId
     */
    async findByProviderPreferenceId(preferenceId) {
      const payment = payments.find(
        (entry) => entry.provider_preference_id === preferenceId
      );
      return payment ? mapPayment(payment) : null;
    },

    /**
     * @param {string} paymentId
     * @param {any} patch
     */
    async updateProviderState(paymentId, patch) {
      const index = payments.findIndex((entry) => entry.id === paymentId);
      const currentPayment = payments[index];
      const updatedPayment = {
        ...currentPayment,
        ...patch
      };

      payments[index] = updatedPayment;
      return mapPayment(updatedPayment);
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

function createPaymentsTestApp() {
  const authService = createFakeAuthService();
  const botModel = createMemoryBotModel();
  const paymentModel = createMemoryPaymentModel();
  const requireAuth = createRequireAuth({ authService });
  const attachCurrentUserProfile = createAttachCurrentUserProfile({
    authService
  });
  const requireInternalApiToken = createRequireInternalApiToken({
    internalApiToken
  });
  const paymentService = createPaymentService({
    paymentModel,
    botModel,
    paymentProvider: createDummyPaymentProvider()
  });

  return {
    app: createApp({
      frontendUrl,
      additionalRouters: [
        {
          path: "/api/v1/payments",
          router: createPaymentsRouter({
            paymentService,
            requireAuth,
            attachCurrentUserProfile,
            requireInternalApiToken,
            config: {
              frontendUrl
            }
          })
        }
      ]
    }),
    paymentModel
  };
}

test("checkout creation requires a buyer, only works for published bots and stores pending payment rows", async () => {
  const { app, paymentModel } = createPaymentsTestApp();

  const unauthenticatedResponse = await request(app)
    .post("/api/v1/payments/create-preference")
    .send({
      bot_id: publishedBotId
    });
  assert.equal(unauthenticatedResponse.status, 401);
  assert.equal(unauthenticatedResponse.body.error.code, "AUTH_REQUIRED");

  const sellerResponse = await request(app)
    .post("/api/v1/payments/create-preference")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=seller-access-token`])
    .send({
      bot_id: publishedBotId
    });
  assert.equal(sellerResponse.status, 403);
  assert.equal(sellerResponse.body.error.code, "AUTH_ROLE_FORBIDDEN");

  const draftResponse = await request(app)
    .post("/api/v1/payments/create-preference")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`])
    .send({
      bot_id: draftBotId
    });
  assert.equal(draftResponse.status, 404);
  assert.equal(draftResponse.body.error.code, "BOT_NOT_FOUND");

  const successResponse = await request(app)
    .post("/api/v1/payments/create-preference")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`])
    .send({
      bot_id: publishedBotId
    });

  assert.equal(successResponse.status, 201);
  assert.equal(successResponse.body.payment.status, PAYMENT_STATUSES.PENDING);
  assert.equal(successResponse.body.payment.amount_ars, 18000);
  assert.equal(successResponse.body.payment.commission_ars, 3600);
  assert.equal(successResponse.body.payment.provider.name, "dummy");
  assert.match(
    successResponse.body.checkout.checkout_url,
    /\/api\/v1\/payments\/dummy-provider\//
  );

  const storedPayments = paymentModel.getRecords();
  assert.equal(storedPayments.length, 1);
  assert.equal(storedPayments[0].buyer_id, buyerOneId);
  assert.equal(storedPayments[0].bot_id, publishedBotId);
  assert.equal(storedPayments[0].session_id, null);
  assert.equal(storedPayments[0].commission_ars, 3600);
  assert.equal(storedPayments[0].status, PAYMENT_STATUSES.PENDING);
});

test("webhook endpoint requires the internal token and approved payments stay owned by the buyer", async () => {
  const { app, paymentModel } = createPaymentsTestApp();
  const creationResponse = await request(app)
    .post("/api/v1/payments/create-preference")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`])
    .send({
      bot_id: publishedBotId
    });
  const paymentId = creationResponse.body.payment.id;
  const preferenceId = creationResponse.body.payment.provider.preference_id;

  const missingTokenResponse = await request(app)
    .post("/api/v1/payments/webhook")
    .send({
      provider: "dummy",
      preference_id: preferenceId,
      payment_id: "dummy_pay_manual",
      status: "approved"
    });
  assert.equal(missingTokenResponse.status, 401);
  assert.equal(
    missingTokenResponse.body.error.code,
    "INTERNAL_CALLBACK_UNAUTHORIZED"
  );

  const approvalResponse = await request(app)
    .post("/api/v1/payments/webhook")
    .set("x-internal-api-token", internalApiToken)
    .send({
      provider: "dummy",
      preference_id: preferenceId,
      payment_id: "dummy_pay_manual",
      status: "approved"
    });
  assert.equal(approvalResponse.status, 200);
  assert.equal(approvalResponse.body.payment.status, PAYMENT_STATUSES.APPROVED);
  assert.equal(typeof approvalResponse.body.payment.paid_at, "string");

  const buyerPaymentResponse = await request(app)
    .get(`/api/v1/payments/${paymentId}`)
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`]);
  assert.equal(buyerPaymentResponse.status, 200);
  assert.equal(
    buyerPaymentResponse.body.payment.status,
    PAYMENT_STATUSES.APPROVED
  );

  const secondBuyerResponse = await request(app)
    .get(`/api/v1/payments/${paymentId}`)
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-two-access-token`]);
  assert.equal(secondBuyerResponse.status, 404);
  assert.equal(secondBuyerResponse.body.error.code, "PAYMENT_NOT_FOUND");

  const storedPayments = paymentModel.getRecords();
  assert.equal(storedPayments[0].provider_payment_id, "dummy_pay_manual");
  assert.equal(storedPayments[0].session_id, null);

  const conflictResponse = await request(app)
    .post("/api/v1/payments/webhook")
    .set("x-internal-api-token", internalApiToken)
    .send({
      provider: "dummy",
      preference_id: preferenceId,
      payment_id: "dummy_pay_second",
      status: "rejected"
    });
  assert.equal(conflictResponse.status, 409);
  assert.equal(conflictResponse.body.error.code, "PAYMENT_STATUS_CONFLICT");
});

test("dummy provider decision route can reject a payment and redirect back to frontend checkout", async () => {
  const { app } = createPaymentsTestApp();
  const creationResponse = await request(app)
    .post("/api/v1/payments/create-preference")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`])
    .send({
      bot_id: publishedBotId
    });
  const paymentId = creationResponse.body.payment.id;
  const preferenceId = creationResponse.body.payment.provider.preference_id;

  const providerPageResponse = await request(app).get(
    `/api/v1/payments/dummy-provider/${preferenceId}`
  );
  assert.equal(providerPageResponse.status, 200);
  assert.match(providerPageResponse.text, /Dummy payment provider/);

  const rejectionResponse = await request(app)
    .post(`/api/v1/payments/dummy-provider/${preferenceId}/decision`)
    .type("form")
    .send({
      outcome: "rejected"
    });
  assert.equal(rejectionResponse.status, 303);
  assert.equal(
    rejectionResponse.headers.location,
    `${frontendUrl}/checkout/${paymentId}`
  );

  const paymentResponse = await request(app)
    .get(`/api/v1/payments/${paymentId}`)
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`]);
  assert.equal(paymentResponse.status, 200);
  assert.equal(
    paymentResponse.body.payment.status,
    PAYMENT_STATUSES.REJECTED
  );
  assert.equal(paymentResponse.body.payment.paid_at, null);
});
