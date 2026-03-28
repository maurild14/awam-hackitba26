import { SESSION_STATUSES } from "@awam/shared";

const DEFAULT_PROGRESS_LINES = Object.freeze([
  "PROGRESS: Validando la configuración del agente.",
  "PROGRESS: Ejecutando la tarea con las credenciales del buyer.",
  "PROGRESS: Preparando el resumen final para mostrar en AWAM."
]);

/** @type {Set<string>} */
const TERMINAL_SESSION_STATUSES = new Set([
  SESSION_STATUSES.COMPLETED,
  SESSION_STATUSES.FAILED,
  SESSION_STATUSES.TIMED_OUT,
  SESSION_STATUSES.STOPPED
]);

/**
 * @param {number} delayMs
 */
function wait(delayMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

/**
 * @param {unknown} value
 */
function normalizeTerminalStatus(value) {
  if (typeof value !== "string" || !TERMINAL_SESSION_STATUSES.has(value)) {
    return SESSION_STATUSES.COMPLETED;
  }

  return value;
}

/**
 * @param {unknown} scenario
 */
function normalizeScenario(scenario) {
  const entry =
    scenario && typeof scenario === "object" && !Array.isArray(scenario)
      ? /** @type {Record<string, unknown>} */ (scenario)
      : {};
  const terminalStatus = normalizeTerminalStatus(entry.terminalStatus);
  const progressLines = Array.isArray(entry.progressLines)
    ? entry.progressLines.filter((line) => typeof line === "string")
    : [...DEFAULT_PROGRESS_LINES];
  const summary =
    typeof entry.summary === "string" && entry.summary.trim()
      ? entry.summary.trim()
      : terminalStatus === SESSION_STATUSES.COMPLETED
        ? "La ejecución mock terminó bien y el resultado ya quedó listo para el buyer."
        : null;
  const errorMessage =
    typeof entry.errorMessage === "string" && entry.errorMessage.trim()
      ? entry.errorMessage.trim()
      : terminalStatus === SESSION_STATUSES.FAILED
        ? "La ejecución no pudo completarse. Revisá el resumen de la sesión."
        : terminalStatus === SESSION_STATUSES.TIMED_OUT
          ? "La ejecución superó el tiempo esperado y se cerró automáticamente."
          : terminalStatus === SESSION_STATUSES.STOPPED
            ? "La ejecución se detuvo antes de terminar."
            : null;
  const stepDelayMs =
    typeof entry.stepDelayMs === "number" && Number.isFinite(entry.stepDelayMs)
      ? Math.max(0, Math.round(entry.stepDelayMs))
      : 25;

  return {
    terminalStatus,
    progressLines,
    summary,
    errorMessage,
    stepDelayMs
  };
}

/**
 * @param {{}} [dependencies]
 */
export function createMockSandboxRunner(dependencies = {}) {
  void dependencies;

  /** @type {unknown[]} */
  const queuedScenarios = [];
  /** @type {Set<string>} */
  const activeTokenHashes = new Set();
  /** @type {Set<Promise<void>>} */
  const activeRuns = new Set();

  return {
    /**
     * @param {unknown} scenario
     */
    enqueueScenario(scenario) {
      queuedScenarios.push(scenario);
    },

    /**
     * @param {{
     *   sessionId: string,
     *   vaultPath: string,
     *   phantomTokenHash: string,
     *   onStatus: (input: { status: string }) => Promise<void>,
     *   onProgress: (input: { line: string }) => Promise<void>,
     *   onFinish: (input: { status: string, summary: string | null, errorMessage: string | null }) => Promise<void>,
     *   onCleanup: (input: { sessionId: string, vaultPath: string, phantomTokenHash: string }) => Promise<void>
     * }} input
     */
    start(input) {
      const scenario = normalizeScenario(queuedScenarios.shift());
      activeTokenHashes.add(input.phantomTokenHash);

      const runPromise = (async () => {
        try {
          await wait(scenario.stepDelayMs);
          await input.onStatus({
            status: SESSION_STATUSES.RUNNING
          });

          for (const line of scenario.progressLines) {
            await wait(scenario.stepDelayMs);
            await input.onProgress({
              line
            });
          }

          await wait(scenario.stepDelayMs);
          await input.onFinish({
            status: scenario.terminalStatus,
            summary: scenario.summary,
            errorMessage: scenario.errorMessage
          });
        } finally {
          activeTokenHashes.delete(input.phantomTokenHash);
          await input.onCleanup({
            sessionId: input.sessionId,
            vaultPath: input.vaultPath,
            phantomTokenHash: input.phantomTokenHash
          });
        }
      })().finally(() => {
        activeRuns.delete(runPromise);
      });

      activeRuns.add(runPromise);
      return runPromise;
    },

    async waitForIdle() {
      await Promise.all([...activeRuns]);
    },

    activeTokenCount() {
      return activeTokenHashes.size;
    },

    /**
     * @param {string} tokenHash
     */
    hasActiveTokenHash(tokenHash) {
      return activeTokenHashes.has(tokenHash);
    }
  };
}
