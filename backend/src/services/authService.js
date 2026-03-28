import { ROLES } from "@awam/shared";

import { HttpError } from "../lib/httpError.js";

/** @type {Set<string>} */
const PUBLIC_SIGNUP_ROLES = new Set([ROLES.BUYER, ROLES.SELLER]);
const PROFILE_RETRY_DELAYS_IN_MS = [0, 50, 100, 200, 400];

/**
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * @param {unknown} error
 * @param {string} fallbackCode
 * @param {string} fallbackMessage
 */
function mapAuthError(error, fallbackCode, fallbackMessage) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : fallbackMessage;
  const normalized = message.toLowerCase();

  if (
    normalized.includes("already registered") ||
    normalized.includes("user already registered")
  ) {
    return new HttpError(
      409,
      "AUTH_ALREADY_REGISTERED",
      "Ese email ya está registrado."
    );
  }

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("email not confirmed")
  ) {
    return new HttpError(
      401,
      "AUTH_INVALID_CREDENTIALS",
      "Email o contraseña inválidos."
    );
  }

  if (
    normalized.includes("profiles_username_key") ||
    normalized.includes("duplicate key value") ||
    normalized.includes("username")
  ) {
    return new HttpError(
      409,
      "USERNAME_UNAVAILABLE",
      "Ese nombre de usuario ya está en uso."
    );
  }

  return new HttpError(400, fallbackCode, fallbackMessage);
}

/**
 * @param {unknown} user
 * @param {{ id: string, username: string, role: string }} profile
 */
function normalizeAuthUser(user, profile) {
  return {
    id: /** @type {{ id: string }} */ (user).id,
    email: /** @type {{ email?: string | null }} */ (user).email ?? "",
    username: profile.username,
    role: profile.role
  };
}

/**
 * @param {unknown} session
 */
function normalizeSession(session) {
  const castedSession = /** @type {{
   * access_token?: string,
   * refresh_token?: string,
   * expires_in?: number
   * }} */ (session);

  if (!castedSession.access_token || !castedSession.refresh_token) {
    throw new HttpError(
      500,
      "AUTH_SESSION_MISSING",
      "No se pudo crear la sesión autenticada."
    );
  }

  return {
    accessToken: castedSession.access_token,
    refreshToken: castedSession.refresh_token,
    expiresIn: castedSession.expires_in ?? 3600
  };
}

/**
 * @param {{
 *   publicAuthClient: import("@supabase/supabase-js").SupabaseClient,
 *   adminClient: import("@supabase/supabase-js").SupabaseClient,
 *   profileModel: { getByUserId(userId: string): Promise<null | { id: string, username: string, role: string, mpCustomerId: string | null, createdAt: string }> }
 * }} dependencies
 */
export function createAuthService({
  publicAuthClient,
  adminClient,
  profileModel
}) {
  /**
   * @param {string} userId
   */
  async function resolveProfile(userId) {
    for (const delay of PROFILE_RETRY_DELAYS_IN_MS) {
      if (delay > 0) {
        await sleep(delay);
      }

      const profile = await profileModel.getByUserId(userId);
      if (profile) {
        return profile;
      }
    }

    throw new HttpError(
      500,
      "PROFILE_BOOTSTRAP_FAILED",
      "No se pudo inicializar el perfil del usuario."
    );
  }

  return {
    /**
     * @param {{ email: string, password: string, username: string, role: string }} input
     */
    async register(input) {
      if (!PUBLIC_SIGNUP_ROLES.has(input.role)) {
        throw new HttpError(
          400,
          "AUTH_ROLE_INVALID",
          "Solo se permite registro público como buyer o seller."
        );
      }

      const { data, error } = await adminClient.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: {
          username: input.username,
          role: input.role
        }
      });

      if (error) {
        throw mapAuthError(
          error,
          "AUTH_REGISTER_FAILED",
          "No se pudo completar el registro."
        );
      }

      if (!data.user?.id) {
        throw new HttpError(
          500,
          "AUTH_REGISTER_FAILED",
          "Supabase no devolvió el usuario creado."
        );
      }

      const loginResult = await this.login({
        email: input.email,
        password: input.password
      });

      return loginResult;
    },

    /**
     * @param {{ email: string, password: string }} input
     */
    async login(input) {
      const { data, error } = await publicAuthClient.auth.signInWithPassword({
        email: input.email,
        password: input.password
      });

      if (error) {
        throw mapAuthError(
          error,
          "AUTH_LOGIN_FAILED",
          "No se pudo iniciar sesión."
        );
      }

      if (!data.user?.id || !data.session) {
        throw new HttpError(
          500,
          "AUTH_LOGIN_FAILED",
          "Supabase no devolvió una sesión válida."
        );
      }

      const profile = await resolveProfile(data.user.id);

      return {
        session: normalizeSession(data.session),
        user: normalizeAuthUser(data.user, profile)
      };
    },

    /**
     * @param {{ refreshToken: string }} input
     */
    async refreshSession(input) {
      const { data, error } = await publicAuthClient.auth.refreshSession({
        refresh_token: input.refreshToken
      });

      if (error) {
        throw mapAuthError(
          error,
          "AUTH_REFRESH_FAILED",
          "No se pudo refrescar la sesión."
        );
      }

      if (!data.user?.id || !data.session) {
        throw new HttpError(
          401,
          "AUTH_SESSION_INVALID",
          "La sesión ya no es válida."
        );
      }

      const profile = await resolveProfile(data.user.id);

      return {
        session: normalizeSession(data.session),
        user: normalizeAuthUser(data.user, profile)
      };
    },

    /**
     * @param {{ accessToken: string }} input
     */
    async getUserFromAccessToken(input) {
      const { data, error } = await publicAuthClient.auth.getUser(
        input.accessToken
      );

      if (error || !data.user?.id) {
        throw new HttpError(
          401,
          "AUTH_REQUIRED",
          "Necesitás iniciar sesión para continuar."
        );
      }

      return {
        id: data.user.id,
        email: data.user.email ?? ""
      };
    },

    /**
     * @param {{ userId: string }} input
     */
    async getProfileByUserId(input) {
      const profile = await profileModel.getByUserId(input.userId);

      if (!profile) {
        throw new HttpError(
          401,
          "PROFILE_NOT_FOUND",
          "No se encontró el perfil asociado a esta sesión."
        );
      }

      return profile;
    },

    /**
     * @param {{ accessToken?: string | null }} _input
     */
    async logout(_input) {
      void _input;
      return;
    }
  };
}
