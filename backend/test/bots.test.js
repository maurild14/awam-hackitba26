import assert from "node:assert/strict";
import test from "node:test";

import request from "supertest";

import { BOT_STATUSES } from "@awam/shared";

import { createApp } from "../src/app.js";
import { ACCESS_COOKIE_NAME } from "../src/config/cookies.js";
import {
  createAttachCurrentUserProfile,
  createRequireAuth
} from "../src/middleware/auth.js";
import { createAdminBotsRouter } from "../src/routes/adminBots.js";
import { createBotsRouter } from "../src/routes/bots.js";
import { createSellerBotsRouter } from "../src/routes/sellerBots.js";
import { createBotService } from "../src/services/botService.js";

const frontendUrl = "http://localhost:3000";

/** @type {Record<string, { id: string, username: string, role: string, mpCustomerId: null, createdAt: string }>} */
const profilesById = {
  "seller-1111-1111-4111-8111-111111111111": {
    id: "seller-1111-1111-4111-8111-111111111111",
    username: "seller-uno",
    role: "seller",
    mpCustomerId: null,
    createdAt: "2026-03-28T00:00:00.000Z"
  },
  "seller-2222-2222-4222-8222-222222222222": {
    id: "seller-2222-2222-4222-8222-222222222222",
    username: "seller-dos",
    role: "seller",
    mpCustomerId: null,
    createdAt: "2026-03-28T00:00:00.000Z"
  },
  "buyer-3333-3333-4333-8333-333333333333": {
    id: "buyer-3333-3333-4333-8333-333333333333",
    username: "buyer-uno",
    role: "buyer",
    mpCustomerId: null,
    createdAt: "2026-03-28T00:00:00.000Z"
  },
  "admin-4444-4444-4444-8444-444444444444": {
    id: "admin-4444-4444-4444-8444-444444444444",
    username: "admin-root",
    role: "admin",
    mpCustomerId: null,
    createdAt: "2026-03-28T00:00:00.000Z"
  }
};

/** @type {Record<string, { id: string, email: string }>} */
const accessTokens = {
  "seller-access-token": {
    id: "seller-1111-1111-4111-8111-111111111111",
    email: "seller1@example.com"
  },
  "seller-two-access-token": {
    id: "seller-2222-2222-4222-8222-222222222222",
    email: "seller2@example.com"
  },
  "buyer-access-token": {
    id: "buyer-3333-3333-4333-8333-333333333333",
    email: "buyer@example.com"
  },
  "admin-access-token": {
    id: "admin-4444-4444-4444-8444-444444444444",
    email: "admin@example.com"
  }
};

function createBaseBotRecords() {
  return [
    {
      id: "10000000-0000-4000-8000-000000000001",
      slug: "agente-publicado",
      seller_id: "seller-1111-1111-4111-8111-111111111111",
      seller_username: "seller-uno",
      title: "Agente publicado",
      description:
        "Automatiza tareas repetitivas y entrega un resumen claro para equipos de operaciones.",
      price_ars: 18000,
      category: "operations",
      image_uri: "https://example.com/publicado.png",
      status: BOT_STATUSES.PUBLISHED,
      allowed_domains: ["api.openai.com", "sheets.googleapis.com"],
      credential_schema: [
        {
          env_var: "OPENAI_API_KEY",
          label: "OpenAI API key",
          type: "password",
          required: true,
          placeholder: null,
          description: "La clave que usa el agente para consultar OpenAI."
        }
      ],
      resources: {
        cpu: 1,
        memory_mb: 512,
        max_minutes: 10
      },
      total_executions: 12,
      average_rating: 4.8,
      created_at: "2026-03-28T00:00:00.000Z"
    },
    {
      id: "20000000-0000-4000-8000-000000000002",
      slug: "agente-borrador",
      seller_id: "seller-1111-1111-4111-8111-111111111111",
      seller_username: "seller-uno",
      title: "Agente borrador",
      description:
        "Prepara reportes internos y todavía está en revisión antes de salir al marketplace público.",
      price_ars: 9000,
      category: "research",
      image_uri: null,
      status: BOT_STATUSES.DRAFT,
      allowed_domains: ["api.notion.com"],
      credential_schema: [],
      resources: {
        cpu: 0.5,
        memory_mb: 256,
        max_minutes: 8
      },
      total_executions: 0,
      average_rating: 0,
      created_at: "2026-03-27T00:00:00.000Z"
    }
  ];
}

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

function createMemoryBotModel() {
  const bots = createBaseBotRecords().map((bot) => ({ ...bot }));

  return {
    async listPublished() {
      return bots.filter((bot) => bot.status === BOT_STATUSES.PUBLISHED);
    },

    /**
     * @param {string} botId
     */
    async findPublishedById(botId) {
      return (
        bots.find(
          (bot) => bot.id === botId && bot.status === BOT_STATUSES.PUBLISHED
        ) ?? null
      );
    },

    /**
     * @param {string} slug
     */
    async findPublishedBySlug(slug) {
      return (
        bots.find(
          (bot) => bot.slug === slug && bot.status === BOT_STATUSES.PUBLISHED
        ) ?? null
      );
    },

    /**
     * @param {string} sellerId
     */
    async listBySellerId(sellerId) {
      return bots.filter((bot) => bot.seller_id === sellerId);
    },

    /**
     * @param {string} botId
     */
    async findById(botId) {
      return bots.find((bot) => bot.id === botId) ?? null;
    },

    async listAll() {
      return bots;
    },

    /**
     * @param {any} input
     */
    async insert(input) {
      const seller = profilesById[input.seller_id];
      const createdBot = {
        id: `30000000-0000-4000-8000-${String(bots.length + 1).padStart(12, "0")}`,
        total_executions: 0,
        average_rating: 0,
        created_at: "2026-03-29T00:00:00.000Z",
        seller_username: seller.username,
        ...input
      };

      bots.unshift(createdBot);
      return createdBot;
    },

    /**
     * @param {string} botId
     * @param {Record<string, unknown>} patch
     */
    async update(botId, patch) {
      const index = bots.findIndex((bot) => bot.id === botId);
      const currentBot = bots[index];
      const updatedBot = {
        ...currentBot,
        ...patch
      };

      bots[index] = updatedBot;
      return updatedBot;
    },

    /**
     * @param {string} baseSlug
     * @param {string | null} excludeBotId
     */
    async listSlugsStartingWith(baseSlug, excludeBotId = null) {
      return bots
        .filter(
          (bot) =>
            bot.id !== excludeBotId &&
            (bot.slug === baseSlug || bot.slug.startsWith(`${baseSlug}-`))
        )
        .map((bot) => bot.slug);
    }
  };
}

function createBotsTestApp() {
  const authService = createFakeAuthService();
  const botModel = createMemoryBotModel();
  const botService = createBotService({ botModel });
  const requireAuth = createRequireAuth({ authService });
  const attachCurrentUserProfile = createAttachCurrentUserProfile({
    authService
  });

  return createApp({
    frontendUrl,
    additionalRouters: [
      {
        path: "/api/v1/bots",
        router: createBotsRouter({ botService })
      },
      {
        path: "/api/v1/seller/bots",
        router: createSellerBotsRouter({
          botService,
          requireAuth,
          attachCurrentUserProfile
        })
      },
      {
        path: "/api/v1/admin/bots",
        router: createAdminBotsRouter({
          botService,
          requireAuth,
          attachCurrentUserProfile
        })
      }
    ]
  });
}

test("public list only exposes published bots", async () => {
  const app = createBotsTestApp();
  const response = await request(app).get("/api/v1/bots");

  assert.equal(response.status, 200);
  assert.equal(response.body.bots.length, 1);
  assert.equal(response.body.bots[0].slug, "agente-publicado");
  assert.equal(response.body.bots[0].seller_username, "seller-uno");
  assert.equal(response.body.bots[0].status, undefined);
});

test("public detail resolves published bots by slug and id only", async () => {
  const app = createBotsTestApp();

  const slugResponse = await request(app).get("/api/v1/bots/agente-publicado");
  assert.equal(slugResponse.status, 200);
  assert.equal(slugResponse.body.bot.id, "10000000-0000-4000-8000-000000000001");

  const idResponse = await request(app).get(
    "/api/v1/bots/10000000-0000-4000-8000-000000000001"
  );
  assert.equal(idResponse.status, 200);
  assert.equal(idResponse.body.bot.slug, "agente-publicado");

  const hiddenDraftResponse = await request(app).get(
    "/api/v1/bots/20000000-0000-4000-8000-000000000002"
  );
  assert.equal(hiddenDraftResponse.status, 404);
  assert.equal(hiddenDraftResponse.body.error.code, "BOT_NOT_FOUND");
});

test("seller can create a bot with full metadata and unique slug", async () => {
  const app = createBotsTestApp();
  const response = await request(app)
    .post("/api/v1/seller/bots")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=seller-access-token`])
    .send({
      title: "Agente publicado",
      description:
        "Este agente prepara informes comerciales con datos de CRM y entrega hallazgos accionables al equipo.",
      price_ars: 22000,
      category: "sales",
      image_uri: "https://example.com/sales.png",
      credential_schema: [
        {
          env_var: "HUBSPOT_API_KEY",
          label: "HubSpot API key",
          type: "password",
          required: true,
          placeholder: "",
          description: "Token privado del workspace."
        }
      ],
      allowed_domains: ["api.hubapi.com", "api.openai.com"],
      resources: {
        cpu: 1.5,
        memory_mb: 768,
        max_minutes: 15
      }
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.bot.slug, "agente-publicado-2");
  assert.equal(response.body.bot.status, BOT_STATUSES.DRAFT);
  assert.equal(response.body.bot.seller_id, "seller-1111-1111-4111-8111-111111111111");
});

test("seller can move own bot to pending_review but not to published", async () => {
  const app = createBotsTestApp();

  const pendingReviewResponse = await request(app)
    .patch("/api/v1/seller/bots/20000000-0000-4000-8000-000000000002")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=seller-access-token`])
    .send({
      title: "Agente borrador",
      description:
        "Prepara reportes internos con mejor copy y ya está listo para pasar a revisión editorial.",
      price_ars: 9500,
      category: "research",
      image_uri: "",
      credential_schema: [],
      allowed_domains: ["api.notion.com"],
      resources: {
        cpu: 1,
        memory_mb: 512,
        max_minutes: 9
      },
      status: "pending_review"
    });

  assert.equal(pendingReviewResponse.status, 200);
  assert.equal(
    pendingReviewResponse.body.bot.status,
    BOT_STATUSES.PENDING_REVIEW
  );

  const forbiddenResponse = await request(app)
    .patch("/api/v1/seller/bots/20000000-0000-4000-8000-000000000002")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=seller-access-token`])
    .send({
      title: "Agente borrador",
      description:
        "Sigue siendo el mismo agente pero intenta saltarse la revisión manual del admin.",
      price_ars: 9500,
      category: "research",
      image_uri: "",
      credential_schema: [],
      allowed_domains: ["api.notion.com"],
      resources: {
        cpu: 1,
        memory_mb: 512,
        max_minutes: 9
      },
      status: "published"
    });

  assert.equal(forbiddenResponse.status, 403);
  assert.equal(forbiddenResponse.body.error.code, "BOT_STATUS_FORBIDDEN");
});

test("seller cannot edit bots owned by another seller", async () => {
  const app = createBotsTestApp();
  const response = await request(app)
    .patch("/api/v1/seller/bots/20000000-0000-4000-8000-000000000002")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=seller-two-access-token`])
    .send({
      title: "Intento ajeno",
      description:
        "Otra cuenta intenta modificar la metadata de un bot que no le pertenece.",
      price_ars: 10000,
      category: "research",
      image_uri: "",
      credential_schema: [],
      allowed_domains: ["api.notion.com"],
      resources: {
        cpu: 1,
        memory_mb: 512,
        max_minutes: 9
      }
    });

  assert.equal(response.status, 403);
  assert.equal(response.body.error.code, "BOT_OWNERSHIP_FORBIDDEN");
});

test("admin can move bots across every documented state", async () => {
  const app = createBotsTestApp();

  for (const status of [
    BOT_STATUSES.DRAFT,
    BOT_STATUSES.PENDING_REVIEW,
    BOT_STATUSES.PUBLISHED,
    BOT_STATUSES.SUSPENDED
  ]) {
    const response = await request(app)
      .patch("/api/v1/admin/bots/20000000-0000-4000-8000-000000000002/status")
      .set("Cookie", [`${ACCESS_COOKIE_NAME}=admin-access-token`])
      .send({
        status
      });

    assert.equal(response.status, 200);
    assert.equal(response.body.bot.status, status);
  }
});

test("guards protect seller and admin surfaces by auth and role", async () => {
  const app = createBotsTestApp();

  const unauthenticatedResponse = await request(app).get("/api/v1/seller/bots");
  assert.equal(unauthenticatedResponse.status, 401);
  assert.equal(unauthenticatedResponse.body.error.code, "AUTH_REQUIRED");

  const buyerResponse = await request(app)
    .get("/api/v1/seller/bots")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`]);
  assert.equal(buyerResponse.status, 403);
  assert.equal(buyerResponse.body.error.code, "AUTH_ROLE_FORBIDDEN");

  const sellerOnAdminResponse = await request(app)
    .get("/api/v1/admin/bots")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=seller-access-token`]);
  assert.equal(sellerOnAdminResponse.status, 403);
  assert.equal(sellerOnAdminResponse.body.error.code, "AUTH_ROLE_FORBIDDEN");
});

test("metadata validation rejects invalid credential_schema, domains and resources", async () => {
  const app = createBotsTestApp();

  const invalidCredentialResponse = await request(app)
    .post("/api/v1/seller/bots")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=seller-access-token`])
    .send({
      title: "Agente inválido",
      description:
        "Tiene una credencial con nombre inválido y por eso la validación debe rechazarlo.",
      price_ars: 15000,
      category: "finance",
      image_uri: "",
      credential_schema: [
        {
          env_var: "openai_api_key",
          label: "OpenAI",
          type: "password",
          required: true
        }
      ],
      allowed_domains: ["api.openai.com"],
      resources: {
        cpu: 1,
        memory_mb: 512,
        max_minutes: 10
      }
    });

  assert.equal(invalidCredentialResponse.status, 400);
  assert.equal(invalidCredentialResponse.body.error.code, "VALIDATION_ERROR");

  const invalidDomainResponse = await request(app)
    .post("/api/v1/seller/bots")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=seller-access-token`])
    .send({
      title: "Agente inválido",
      description:
        "Tiene un dominio con protocolo y path, algo que no se permite en allowed_domains.",
      price_ars: 15000,
      category: "finance",
      image_uri: "",
      credential_schema: [],
      allowed_domains: ["https://api.openai.com/v1"],
      resources: {
        cpu: 1,
        memory_mb: 512,
        max_minutes: 10
      }
    });

  assert.equal(invalidDomainResponse.status, 400);
  assert.equal(invalidDomainResponse.body.error.code, "VALIDATION_ERROR");

  const invalidResourcesResponse = await request(app)
    .post("/api/v1/seller/bots")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=seller-access-token`])
    .send({
      title: "Agente inválido",
      description:
        "Tiene recursos con tiempo máximo inválido y por eso no debería persistirse.",
      price_ars: 15000,
      category: "finance",
      image_uri: "",
      credential_schema: [],
      allowed_domains: ["api.openai.com"],
      resources: {
        cpu: 1,
        memory_mb: 512,
        max_minutes: 0
      }
    });

  assert.equal(invalidResourcesResponse.status, 400);
  assert.equal(invalidResourcesResponse.body.error.code, "VALIDATION_ERROR");
});

test("missing bots return consistent 404 errors on seller and public routes", async () => {
  const app = createBotsTestApp();

  const publicResponse = await request(app).get(
    "/api/v1/bots/99999999-0000-4000-8000-999999999999"
  );
  assert.equal(publicResponse.status, 404);
  assert.equal(publicResponse.body.error.code, "BOT_NOT_FOUND");
  assert.equal(typeof publicResponse.body.error.requestId, "string");

  const sellerResponse = await request(app)
    .get("/api/v1/seller/bots/99999999-0000-4000-8000-999999999999")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=seller-access-token`]);
  assert.equal(sellerResponse.status, 404);
  assert.equal(sellerResponse.body.error.code, "BOT_NOT_FOUND");
  assert.equal(typeof sellerResponse.body.error.requestId, "string");
});
