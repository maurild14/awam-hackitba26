import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "../config/cookies.js";
import { HttpError } from "../lib/httpError.js";

/**
 * @param {{
 *   authService: {
 *     getUserFromAccessToken(input: { accessToken: string }): Promise<{ id: string, email: string }>
 *   }
 * }} dependencies
 */
export function createRequireAuth({ authService }) {
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  return async function requireAuth(req, res, next) {
    try {
      const accessToken = req.cookies?.[ACCESS_COOKIE_NAME];

      if (!accessToken) {
        throw new HttpError(
          401,
          "AUTH_REQUIRED",
          "Necesitás iniciar sesión para continuar."
        );
      }

      const user = await authService.getUserFromAccessToken({ accessToken });

      res.locals.auth = {
        user
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * @param {{
 *   authService: {
 *     getProfileByUserId(input: { userId: string }): Promise<{ id: string, username: string, role: string, mpCustomerId: string | null, createdAt: string }>
 *   }
 * }} dependencies
 */
export function createAttachCurrentUserProfile({ authService }) {
  /**
   * @param {import("express").Request} _req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  return async function attachCurrentUserProfile(_req, res, next) {
    try {
      const currentUserId = res.locals.auth?.user?.id;

      if (!currentUserId) {
        throw new HttpError(
          401,
          "AUTH_REQUIRED",
          "Necesitás iniciar sesión para continuar."
        );
      }

      const profile = await authService.getProfileByUserId({
        userId: currentUserId
      });

      res.locals.auth = {
        ...res.locals.auth,
        profile
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * @param {...string} roles
 */
export function requireRole(...roles) {
  /**
   * @param {import("express").Request} _req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  return function enforceRole(_req, res, next) {
    const currentRole = res.locals.auth?.profile?.role;

    if (!currentRole) {
      next(
        new HttpError(
          401,
          "AUTH_REQUIRED",
          "Necesitás iniciar sesión para continuar."
        )
      );
      return;
    }

    if (!roles.includes(currentRole)) {
      next(
        new HttpError(
          403,
          "AUTH_ROLE_FORBIDDEN",
          "Tu rol no tiene permiso para esta acción."
        )
      );
      return;
    }

    next();
  };
}

export { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME };
