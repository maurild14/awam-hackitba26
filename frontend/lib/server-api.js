import { cookies } from "next/headers";

const defaultApiUrl = "http://localhost:3001";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || defaultApiUrl;

export class ApiRequestError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} code
   * @param {string} message
   */
  constructor(statusCode, code, message) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * @param {string} path
 * @param {{
 *   method?: string,
 *   body?: Record<string, unknown> | null,
 *   cache?: RequestCache
 * }} [options]
 */
export async function apiRequestOnServer(path, options = {}) {
  const cookieHeader = cookies()
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body
        ? {
            "Content-Type": "application/json"
          }
        : {}),
      ...(cookieHeader
        ? {
            Cookie: cookieHeader
          }
        : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: options.cache ?? "no-store"
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new ApiRequestError(
      response.status,
      data?.error?.code ?? "API_REQUEST_FAILED",
      data?.error?.message ?? "La solicitud al backend falló."
    );
  }

  return data;
}

/**
 * @param {string} path
 * @param {{
 *   method?: string,
 *   body?: Record<string, unknown> | null,
 *   cache?: RequestCache
 * }} [options]
 */
export async function safeApiRequestOnServer(path, options = {}) {
  try {
    return {
      data: await apiRequestOnServer(path, options),
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error
    };
  }
}
