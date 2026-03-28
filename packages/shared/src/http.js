import { randomUUID } from "node:crypto";

/**
 * @returns {string}
 */
export function createRequestId() {
  return randomUUID();
}

/**
 * @param {string} code
 * @param {string} message
 * @param {string} requestId
 */
export function createErrorPayload(code, message, requestId) {
  return {
    error: {
      code,
      message,
      requestId
    }
  };
}
