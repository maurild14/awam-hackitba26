import { ROLES } from "@awam/shared";
import { Router } from "express";

import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  clearAuthCookies,
  setAuthCookies
} from "../config/cookies.js";
import { HttpError } from "../lib/httpError.js";

/** @type {Set<string>} */
const PUBLIC_SIGNUP_ROLES = new Set([ROLES.BUYER, ROLES.SELLER]);

/**
 * @param {unknown} value
 * @param {string} fieldName
 * @param {{ minLength?: number, maxLength?: number }} [options]
 */
function readRequiredString(value, fieldName, options = {}) {
  if (typeof value !== "string") {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      `El campo ${fieldName} es obligatorio.`
    );
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      `El campo ${fieldName} es obligatorio.`
    );
  }

  if (options.minLength && trimmed.length < options.minLength) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      `El campo ${fieldName} debe tener al menos ${options.minLength} caracteres.`
    );
  }

  if (options.maxLength && trimmed.length > options.maxLength) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      `El campo ${fieldName} debe tener como máximo ${options.maxLength} caracteres.`
    );
  }

  return trimmed;
}

/**
 * @param {unknown} value
 */
function readEmail(value) {
  const email = readRequiredString(value, "email", {
    minLength: 5,
    maxLength: 120
  });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      "Ingresá un email válido."
    );
  }

  return email.toLowerCase();
}

/**
 * @param {unknown} value
 * @returns {"buyer" | "seller"}
 */
function readPublicRole(value) {
  const role = readRequiredString(value, "role");

  if (!PUBLIC_SIGNUP_ROLES.has(role)) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      "Solo podés registrarte como buyer o seller."
    );
  }

  return /** @type {"buyer" | "seller"} */ (role);
}

/**
 * @param {unknown} body
 */
function readRegisterPayload(body) {
  const castedBody = /** @type {Record<string, unknown>} */ (body ?? {});

  return {
    email: readEmail(castedBody.email),
    password: readRequiredString(castedBody.password, "password", {
      minLength: 8,
      maxLength: 128
    }),
    username: readRequiredString(castedBody.username, "username", {
      minLength: 3,
      maxLength: 32
    }),
    role: readPublicRole(castedBody.role)
  };
}

/**
 * @param {unknown} body
 */
function readLoginPayload(body) {
  const castedBody = /** @type {Record<string, unknown>} */ (body ?? {});

  return {
    email: readEmail(castedBody.email),
    password: readRequiredString(castedBody.password, "password", {
      minLength: 8,
      maxLength: 128
    })
  };
}

/**
 * @param {(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>} handler
 */
function asyncHandler(handler) {
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

/**
 * @param {{
 *   authService: {
 *     register(input: { email: string, password: string, username: string, role: string }): Promise<{ session: { accessToken: string, refreshToken: string, expiresIn: number }, user: { id: string, email: string, username: string, role: string } }>,
 *     login(input: { email: string, password: string }): Promise<{ session: { accessToken: string, refreshToken: string, expiresIn: number }, user: { id: string, email: string, username: string, role: string } }>,
 *     refreshSession(input: { refreshToken: string }): Promise<{ session: { accessToken: string, refreshToken: string, expiresIn: number }, user: { id: string, email: string, username: string, role: string } }>,
 *     logout(input: { accessToken?: string | null }): Promise<void>
 *   },
 *   config: { nodeEnv: string },
 *   requireAuth: import("express").RequestHandler,
 *   attachCurrentUserProfile: import("express").RequestHandler
 * }} dependencies
 */
export function createAuthRouter({
  authService,
  config,
  requireAuth,
  attachCurrentUserProfile
}) {
  const router = Router();

  router.post(
    "/register",
    asyncHandler(async (req, res) => {
      const payload = readRegisterPayload(req.body);
      const result = await authService.register(payload);

      setAuthCookies(res, config, result.session);
      res.status(201).json({
        user: result.user
      });
    })
  );

  router.post(
    "/login",
    asyncHandler(async (req, res) => {
      const payload = readLoginPayload(req.body);
      const result = await authService.login(payload);

      setAuthCookies(res, config, result.session);
      res.status(200).json({
        user: result.user
      });
    })
  );

  router.post(
    "/refresh",
    asyncHandler(async (req, res) => {
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

      if (!refreshToken) {
        throw new HttpError(
          401,
          "AUTH_REQUIRED",
          "Necesitás iniciar sesión para continuar."
        );
      }

      const result = await authService.refreshSession({
        refreshToken
      });

      setAuthCookies(res, config, result.session);
      res.status(200).json({
        user: result.user
      });
    })
  );

  router.post(
    "/logout",
    asyncHandler(async (req, res) => {
      const accessToken = req.cookies?.[ACCESS_COOKIE_NAME] ?? null;

      await authService.logout({ accessToken });
      clearAuthCookies(res, config);

      res.status(200).json({
        success: true
      });
    })
  );

  router.get("/me", requireAuth, attachCurrentUserProfile, (_req, res) => {
    res.status(200).json({
      user: {
        id: res.locals.auth.user.id,
        email: res.locals.auth.user.email,
        username: res.locals.auth.profile.username,
        role: res.locals.auth.profile.role
      }
    });
  });

  return router;
}
