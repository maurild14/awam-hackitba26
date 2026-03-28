const REDACTED = "[REDACTED]";
const SENSITIVE_KEYS = new Set([
  "authorization",
  "cookie",
  "proxy-authorization",
  "set-cookie",
  "x-api-key"
]);

/**
 * @param {string} key
 * @returns {boolean}
 */
function isSensitiveKey(key) {
  return SENSITIVE_KEYS.has(key.toLowerCase());
}

/**
 * @param {unknown} value
 * @returns {unknown}
 */
export function sanitizeForLog(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeForLog(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(/** @type {Record<string, unknown>} */ (value)).map(
        ([key, entryValue]) => [
          key,
          isSensitiveKey(key) ? REDACTED : sanitizeForLog(entryValue)
        ]
      )
    );
  }

  return value;
}
