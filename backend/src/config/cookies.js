export const ACCESS_COOKIE_NAME = "awam-access-token";
export const REFRESH_COOKIE_NAME = "awam-refresh-token";
const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * @param {{ nodeEnv: string }} config
 * @param {{ maxAge?: number }} [options]
 * @returns {import("express").CookieOptions}
 */
function createCookieOptions(config, options = {}) {
  return {
    httpOnly: true,
    sameSite: /** @type {"lax"} */ ("lax"),
    secure: config.nodeEnv === "production",
    path: "/",
    ...(typeof options.maxAge === "number" ? { maxAge: options.maxAge } : {})
  };
}

/**
 * @param {import("express").Response} res
 * @param {{ nodeEnv: string }} config
 * @param {{ accessToken: string, refreshToken: string, expiresIn: number }} session
 */
export function setAuthCookies(res, config, session) {
  const accessCookieMaxAge =
    typeof session.expiresIn === "number" && session.expiresIn > 0
      ? session.expiresIn * 1000
      : 60 * 60 * 1000;

  res.cookie(
    ACCESS_COOKIE_NAME,
    session.accessToken,
    createCookieOptions(config, { maxAge: accessCookieMaxAge })
  );
  res.cookie(
    REFRESH_COOKIE_NAME,
    session.refreshToken,
    createCookieOptions(config, { maxAge: THIRTY_DAYS_IN_MS })
  );
}

/**
 * @param {import("express").Response} res
 * @param {{ nodeEnv: string }} config
 */
export function clearAuthCookies(res, config) {
  res.clearCookie(ACCESS_COOKIE_NAME, createCookieOptions(config));
  res.clearCookie(REFRESH_COOKIE_NAME, createCookieOptions(config));
}
