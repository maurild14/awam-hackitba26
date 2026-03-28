import assert from "node:assert/strict";
import test from "node:test";

import { Router } from "express";
import request from "supertest";

import { createApp } from "../src/app.js";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "../src/config/cookies.js";
import {
  createAttachCurrentUserProfile,
  createRequireAuth,
  requireRole
} from "../src/middleware/auth.js";
import { createAuthRouter } from "../src/routes/auth.js";

const frontendUrl = "http://localhost:3000";
const accessCookiePrefix = `${ACCESS_COOKIE_NAME}=`;
const refreshCookiePrefix = `${REFRESH_COOKIE_NAME}=`;

/**
 * @param {string} message
 * @param {number} statusCode
 * @param {string} code
 */
function createTestError(message, statusCode, code) {
  return /** @type {Error & { statusCode: number, code: string }} */ (
    Object.assign(new Error(message), {
      statusCode,
      code
    })
  );
}

/**
 * @param {import("supertest").Response} response
 */
function getSetCookies(response) {
  const rawCookies = response.headers["set-cookie"];

  return Array.isArray(rawCookies)
    ? rawCookies
    : rawCookies
      ? [rawCookies]
      : [];
}

function createFakeAuthService() {
  return {
    /**
     * @param {{ email: string, password: string, username: string, role: string }} input
     */
    async register(input) {
      return {
        session: {
          accessToken: "register-access-token",
          refreshToken: "register-refresh-token",
          expiresIn: 3600
        },
        user: {
          id: "user-register-1",
          email: input.email,
          username: input.username,
          role: input.role
        }
      };
    },

    /**
     * @param {{ email: string, password: string }} input
     */
    async login(input) {
      if (input.password === "wrong-password") {
        throw createTestError(
          "Invalid login credentials",
          401,
          "AUTH_INVALID_CREDENTIALS"
        );
      }

      return {
        session: {
          accessToken: "login-access-token",
          refreshToken: "login-refresh-token",
          expiresIn: 3600
        },
        user: {
          id: "user-login-1",
          email: input.email,
          username: "mauri",
          role: "buyer"
        }
      };
    },

    /**
     * @param {{ refreshToken: string }} input
     */
    async refreshSession(input) {
      if (input.refreshToken !== "valid-refresh-token") {
        throw createTestError("Refresh failed", 401, "AUTH_SESSION_INVALID");
      }

      return {
        session: {
          accessToken: "refreshed-access-token",
          refreshToken: "refreshed-refresh-token",
          expiresIn: 3600
        },
        user: {
          id: "user-refresh-1",
          email: "buyer@example.com",
          username: "buyer-one",
          role: "buyer"
        }
      };
    },

    async logout() {
      return;
    },

    /**
     * @param {{ accessToken: string }} input
     */
    async getUserFromAccessToken(input) {
      if (input.accessToken === "seller-access-token") {
        return {
          id: "seller-1",
          email: "seller@example.com"
        };
      }

      if (input.accessToken === "buyer-access-token") {
        return {
          id: "buyer-1",
          email: "buyer@example.com"
        };
      }

      if (input.accessToken === "login-access-token") {
        return {
          id: "user-login-1",
          email: "buyer@example.com"
        };
      }

      throw createTestError("Auth required", 401, "AUTH_REQUIRED");
    },

    /**
     * @param {{ userId: string }} input
     */
    async getProfileByUserId(input) {
      if (input.userId === "seller-1") {
        return {
          id: "seller-1",
          username: "seller-user",
          role: "seller",
          mpCustomerId: null,
          createdAt: "2026-03-28T00:00:00.000Z"
        };
      }

      if (input.userId === "buyer-1") {
        return {
          id: "buyer-1",
          username: "buyer-user",
          role: "buyer",
          mpCustomerId: null,
          createdAt: "2026-03-28T00:00:00.000Z"
        };
      }

      if (input.userId === "user-login-1") {
        return {
          id: "user-login-1",
          username: "mauri",
          role: "buyer",
          mpCustomerId: null,
          createdAt: "2026-03-28T00:00:00.000Z"
        };
      }

      throw createTestError("Profile missing", 401, "PROFILE_NOT_FOUND");
    }
  };
}

function createAuthTestApp() {
  const authService = createFakeAuthService();
  const requireAuth = createRequireAuth({ authService });
  const attachCurrentUserProfile = createAttachCurrentUserProfile({
    authService
  });
  const authRouter = createAuthRouter({
    authService,
    config: {
      nodeEnv: "test"
    },
    requireAuth,
    attachCurrentUserProfile
  });

  const guardRouter = Router();
  guardRouter.get(
    "/seller-only",
    requireAuth,
    attachCurrentUserProfile,
    requireRole("seller"),
    (_req, res) => {
      res.status(200).json({
        ok: true
      });
    }
  );

  return createApp({
    frontendUrl,
    authRouter,
    additionalRouters: [
      {
        path: "/test",
        router: guardRouter
      }
    ]
  });
}

test("register creates a user session for buyer or seller", async () => {
  const app = createAuthTestApp();
  const response = await request(app).post("/api/v1/auth/register").send({
    email: "seller@example.com",
    password: "supersecret",
    username: "seller-user",
    role: "seller"
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.user.role, "seller");
  assert.equal(response.body.user.username, "seller-user");
  assert.equal(
    getSetCookies(response).some((cookie) =>
      cookie.startsWith(accessCookiePrefix)
    ),
    true
  );
  assert.equal(
    getSetCookies(response).some((cookie) =>
      cookie.startsWith(refreshCookiePrefix)
    ),
    true
  );
});

test("register rejects admin as a public role", async () => {
  const app = createAuthTestApp();
  const response = await request(app).post("/api/v1/auth/register").send({
    email: "admin@example.com",
    password: "supersecret",
    username: "admin-user",
    role: "admin"
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, "VALIDATION_ERROR");
});

test("login returns a user and cookies", async () => {
  const app = createAuthTestApp();
  const response = await request(app).post("/api/v1/auth/login").send({
    email: "buyer@example.com",
    password: "supersecret"
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.user.email, "buyer@example.com");
  assert.equal(
    getSetCookies(response).some((cookie) =>
      cookie.startsWith(accessCookiePrefix)
    ),
    true
  );
});

test("login invalid credentials returns a consistent auth error", async () => {
  const app = createAuthTestApp();
  const response = await request(app).post("/api/v1/auth/login").send({
    email: "buyer@example.com",
    password: "wrong-password"
  });

  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, "AUTH_INVALID_CREDENTIALS");
});

test("me rejects unauthenticated requests", async () => {
  const app = createAuthTestApp();
  const response = await request(app).get("/api/v1/auth/me");

  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, "AUTH_REQUIRED");
});

test("me returns the authenticated user profile", async () => {
  const app = createAuthTestApp();
  const response = await request(app)
    .get("/api/v1/auth/me")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`]);

  assert.equal(response.status, 200);
  assert.deepEqual(response.body.user, {
    id: "buyer-1",
    email: "buyer@example.com",
    username: "buyer-user",
    role: "buyer"
  });
});

test("refresh rotates the auth cookies from the refresh token", async () => {
  const app = createAuthTestApp();
  const response = await request(app)
    .post("/api/v1/auth/refresh")
    .set("Cookie", [`${REFRESH_COOKIE_NAME}=valid-refresh-token`]);

  assert.equal(response.status, 200);
  assert.equal(response.body.user.username, "buyer-one");
  assert.equal(
    getSetCookies(response).some((cookie) =>
      cookie.startsWith(accessCookiePrefix)
    ),
    true
  );
});

test("logout clears auth cookies", async () => {
  const app = createAuthTestApp();
  const response = await request(app)
    .post("/api/v1/auth/logout")
    .set("Cookie", [
      `${ACCESS_COOKIE_NAME}=buyer-access-token`,
      `${REFRESH_COOKIE_NAME}=valid-refresh-token`
    ]);

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(
    getSetCookies(response).some((cookie) =>
      cookie.startsWith(`${ACCESS_COOKIE_NAME}=;`)
    ),
    true
  );
});

test("requireRole allows the matching role and blocks the wrong one", async () => {
  const app = createAuthTestApp();

  const sellerResponse = await request(app)
    .get("/test/seller-only")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=seller-access-token`]);

  assert.equal(sellerResponse.status, 200);
  assert.equal(sellerResponse.body.ok, true);

  const buyerResponse = await request(app)
    .get("/test/seller-only")
    .set("Cookie", [`${ACCESS_COOKIE_NAME}=buyer-access-token`]);

  assert.equal(buyerResponse.status, 403);
  assert.equal(buyerResponse.body.error.code, "AUTH_ROLE_FORBIDDEN");
});
