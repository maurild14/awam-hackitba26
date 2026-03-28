const defaultApiUrl = "http://localhost:3001";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || defaultApiUrl;

/**
 * @param {string} path
 * @param {{
 *   method?: string,
 *   body?: Record<string, unknown> | null,
 *   signal?: AbortSignal
 * }} [options]
 */
export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers:
      options.body && Object.keys(options.body).length > 0
        ? {
            "Content-Type": "application/json"
          }
        : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
    signal: options.signal
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.error?.message ?? "La solicitud falló.");
  }

  return data;
}
