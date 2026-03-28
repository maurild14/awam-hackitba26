import { sanitizeForLog } from "@awam/shared";

/**
 * @param {string} service
 */
export function createLogger(service) {
  /**
   * @param {"info" | "error"} level
   * @param {string} message
   * @param {Record<string, unknown>} [context]
   */
  function log(level, message, context = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      context: sanitizeForLog(context)
    };

    const serialized = JSON.stringify(entry);
    if (level === "error") {
      console.error(serialized);
      return;
    }

    console.log(serialized);
  }

  /**
   * @param {string} message
   * @param {Record<string, unknown>} [context]
   */
  function info(message, context) {
    log("info", message, context);
  }

  /**
   * @param {string} message
   * @param {Record<string, unknown>} [context]
   */
  function error(message, context) {
    log("error", message, context);
  }

  return { info, error };
}
