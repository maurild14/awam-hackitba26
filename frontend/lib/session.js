import { redirect } from "next/navigation";

import { ApiRequestError, safeApiRequestOnServer } from "./server-api.js";

export async function getCurrentUserOnServer() {
  const result = await safeApiRequestOnServer("/api/v1/auth/me");

  if (result.error) {
    return null;
  }

  return result.data?.user ?? null;
}

/**
 * @param {string[]} roles
 */
export async function requireRoleOnServer(roles) {
  const user = await getCurrentUserOnServer();

  if (!user) {
    redirect("/auth/login");
  }

  if (!roles.includes(user.role)) {
    redirect("/");
  }

  return user;
}

/**
 * @param {unknown} error
 */
export function isNotFoundApiError(error) {
  return error instanceof ApiRequestError && error.statusCode === 404;
}
