import { createHash, randomUUID } from "node:crypto";

import {
  PAYMENT_STATUSES,
  SESSION_STATUSES,
  normalizeCredentialSchema
} from "@awam/shared";

import { HttpError } from "../lib/httpError.js";

/** @type {Set<string>} */
const TERMINAL_SESSION_STATUSES = new Set([
  SESSION_STATUSES.COMPLETED,
  SESSION_STATUSES.FAILED,
  SESSION_STATUSES.TIMED_OUT,
  SESSION_STATUSES.STOPPED
]);

/**
 * @param {string} buyerId
 * @param {{ buyer_id: string }} resource
 */
function assertBuyerOwnsResource(buyerId, resource) {
  if (resource.buyer_id !== buyerId) {
    throw new HttpError(404, "SESSION_NOT_FOUND", "No encontramos esa sesión.");
  }
}

/**
 * @param {string} buyerId
 * @param {{ buyer_id: string }} payment
 */
function assertBuyerOwnsPayment(buyerId, payment) {
  if (payment.buyer_id !== buyerId) {
    throw new HttpError(404, "PAYMENT_NOT_FOUND", "No encontramos ese pago.");
  }
}

/**
 * @param {string} sessionId
 */
function buildVaultPath(sessionId) {
  return `mock/session/${sessionId}`;
}

/**
 * @param {string} rawToken
 */
function hashPhantomToken(rawToken) {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * @param {string} line
 */
function toBuyerFacingProgress(line) {
  if (!line.startsWith("PROGRESS:")) {
    return null;
  }

  const message = line.slice("PROGRESS:".length).trim();
  return message || null;
}

/**
 * @param {unknown} credentialSchema
 */
function readCredentialSchema(credentialSchema) {
  try {
    return normalizeCredentialSchema(credentialSchema);
  } catch {
    throw new HttpError(
      500,
      "SESSION_CREDENTIAL_SCHEMA_INVALID",
      "El agente tiene un esquema de credenciales inválido."
    );
  }
}

/**
 * @param {unknown} value
 */
function readCredentialsObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      "Las credenciales deben enviarse como un objeto."
    );
  }

  return /** @type {Record<string, unknown>} */ (value);
}

/**
 * @param {unknown} credentials
 * @param {unknown} credentialSchema
 */
function validateCredentialValues(credentials, credentialSchema) {
  const declaredCredentials = readCredentialSchema(credentialSchema);
  const rawCredentials = readCredentialsObject(credentials);
  /** @type {Record<string, string>} */
  const validatedCredentials = {};
  const declaredEnvVars = new Set(
    declaredCredentials.map((credential) => credential.env_var)
  );

  for (const envVar of Object.keys(rawCredentials)) {
    if (!declaredEnvVars.has(envVar)) {
      throw new HttpError(
        400,
        "CREDENTIAL_NOT_DECLARED",
        `La credencial ${envVar} no forma parte del contrato del agente.`
      );
    }
  }

  for (const credential of declaredCredentials) {
    const rawValue = rawCredentials[credential.env_var];

    if (rawValue == null || rawValue === "") {
      if (credential.required) {
        throw new HttpError(
          400,
          "CREDENTIAL_REQUIRED",
          `Completá la credencial ${credential.label}.`
        );
      }

      continue;
    }

    if (typeof rawValue !== "string") {
      throw new HttpError(
        400,
        "VALIDATION_ERROR",
        `La credencial ${credential.label} debe ser texto.`
      );
    }

    if (!rawValue.trim()) {
      if (credential.required) {
        throw new HttpError(
          400,
          "CREDENTIAL_REQUIRED",
          `Completá la credencial ${credential.label}.`
        );
      }

      continue;
    }

    validatedCredentials[credential.env_var] = rawValue;
  }

  return {
    schema: declaredCredentials,
    values: validatedCredentials
  };
}

/**
 * @param {{
 *   id: string,
 *   status: string,
 *   started_at: string | null,
 *   completed_at: string | null,
 *   error_message: string | null,
 *   summary: string | null
 * }} session
 */
function serializeStatusPayload(session) {
  return {
    id: session.id,
    status: session.status,
    started_at: session.started_at,
    completed_at: session.completed_at,
    error_message: session.error_message,
    summary: session.summary
  };
}

/**
 * @param {{
 *   id: string,
 *   bot_id: string,
 *   buyer_id: string,
 *   payment_id: string,
 *   status: string,
 *   started_at: string | null,
 *   completed_at: string | null,
 *   error_message: string | null,
 *   summary: string | null,
 *   created_at: string,
 *   bot: null | {
 *     id: string,
 *     slug: string,
 *     title: string,
 *     description: string,
 *     category: string,
 *     price_ars: number,
 *     image_uri: string | null
 *   }
 * }} session
 * @param {Array<{
 *   id: string,
 *   level: string,
 *   message: string,
 *   created_at: string
 * }>} logs
 * @param {{ id: string, message: string, created_at: string } | null} latestUpdate
 */
function serializeBuyerSession(session, logs, latestUpdate) {
  return {
    id: session.id,
    payment_id: session.payment_id,
    status: session.status,
    created_at: session.created_at,
    started_at: session.started_at,
    completed_at: session.completed_at,
    summary: session.summary,
    error_message: session.error_message,
    is_terminal: TERMINAL_SESSION_STATUSES.has(session.status),
    bot: session.bot
      ? {
          id: session.bot.id,
          slug: session.bot.slug,
          title: session.bot.title,
          description: session.bot.description,
          category: session.bot.category,
          price_ars: session.bot.price_ars,
          image_uri: session.bot.image_uri
        }
      : null,
    latest_update: latestUpdate
      ? {
          id: latestUpdate.id,
          message: latestUpdate.message,
          created_at: latestUpdate.created_at
        }
      : null,
    logs
  };
}

/**
 * @param {{
 *   sessionModel: ReturnType<typeof import("../models/session.js").createSessionModel>,
 *   executionLogModel: ReturnType<typeof import("../models/executionLog.js").createExecutionLogModel>,
 *   paymentModel: Pick<ReturnType<typeof import("../models/payment.js").createPaymentModel>, "findById" | "attachSession">,
 *   secretStore: {
 *     writeSecrets(input: { path: string, secrets: Record<string, string> }): Promise<{ path: string }>,
 *     deleteSecrets(input: { path: string }): Promise<void>
 *   },
 *   sandboxRunner: {
 *     start(input: {
 *       sessionId: string,
 *       vaultPath: string,
 *       phantomTokenHash: string,
 *       onStatus: (input: { status: string }) => Promise<void>,
 *       onProgress: (input: { line: string }) => Promise<void>,
 *       onFinish: (input: { status: string, summary: string | null, errorMessage: string | null }) => Promise<void>,
 *       onCleanup: (input: { sessionId: string, vaultPath: string, phantomTokenHash: string }) => Promise<void>
 *     }): Promise<void>
 *   },
 *   streamEmitter: {
 *     emit(sessionId: string, event: { type: string, payload: Record<string, unknown> }): void
 *   }
 * }} dependencies
 */
export function createSessionService({
  sessionModel,
  executionLogModel,
  paymentModel,
  secretStore,
  sandboxRunner,
  streamEmitter
}) {
  /**
   * @param {string} paymentId
   */
  async function getPaymentOrThrow(paymentId) {
    const payment = await paymentModel.findById(paymentId);

    if (!payment) {
      throw new HttpError(404, "PAYMENT_NOT_FOUND", "No encontramos ese pago.");
    }

    return payment;
  }

  /**
   * @param {string} buyerId
   * @param {string} sessionId
   */
  async function getOwnedSessionOrThrow(buyerId, sessionId) {
    const session = await sessionModel.findById(sessionId);

    if (!session) {
      throw new HttpError(404, "SESSION_NOT_FOUND", "No encontramos esa sesión.");
    }

    assertBuyerOwnsResource(buyerId, session);
    return session;
  }

  /**
   * @param {string} sessionId
   */
  async function buildDetailedSession(sessionId) {
    const session = await sessionModel.findById(sessionId);

    if (!session) {
      throw new HttpError(404, "SESSION_NOT_FOUND", "No encontramos esa sesión.");
    }

    const logs = await executionLogModel.listBuyerFacingBySessionId(sessionId);
    const latestUpdate =
      logs.length > 0
        ? {
            id: logs[logs.length - 1].id,
            message: logs[logs.length - 1].message,
            created_at: logs[logs.length - 1].created_at
          }
        : session.summary
          ? {
              id: `${session.id}:summary`,
              message: session.summary,
              created_at: session.completed_at ?? session.created_at
            }
          : null;

    return serializeBuyerSession(
      session,
      logs.map((log) => ({
        id: log.id,
        level: log.level,
        message: log.message,
        created_at: log.created_at
      })),
      latestUpdate
    );
  }

  /**
   * @param {string} sessionId
   * @param {string} status
   */
  async function persistStatus(sessionId, status) {
    const updatedSession = await sessionModel.update(sessionId, {
      status,
      started_at:
        status === SESSION_STATUSES.RUNNING ? new Date().toISOString() : undefined
    });

    streamEmitter.emit(sessionId, {
      type: "status",
      payload: serializeStatusPayload(updatedSession)
    });
  }

  /**
   * @param {string} sessionId
   * @param {string} line
   */
  async function persistProgress(sessionId, line) {
    const message = toBuyerFacingProgress(line);

    if (!message) {
      return;
    }

    const log = await executionLogModel.insert({
      session_id: sessionId,
      level: "info",
      message,
      is_buyer_facing: true
    });

    streamEmitter.emit(sessionId, {
      type: "log",
      payload: {
        id: log.id,
        level: log.level,
        message: log.message,
        created_at: log.created_at
      }
    });
  }

  /**
   * @param {string} sessionId
   * @param {{ status: string, summary: string | null, errorMessage: string | null }} result
   */
  async function persistResult(sessionId, result) {
    const updatedSession = await sessionModel.update(sessionId, {
      status: result.status,
      completed_at: new Date().toISOString(),
      summary: result.summary,
      error_message: result.errorMessage
    });

    streamEmitter.emit(sessionId, {
      type: "status",
      payload: serializeStatusPayload(updatedSession)
    });
    streamEmitter.emit(sessionId, {
      type: "summary",
      payload: {
        status: updatedSession.status,
        summary: updatedSession.summary,
        error_message: updatedSession.error_message,
        completed_at: updatedSession.completed_at
      }
    });
  }

  return {
    /**
     * @param {{ buyerId: string, paymentId: string, credentials: unknown }} input
     */
    async createSession(input) {
      const payment = await getPaymentOrThrow(input.paymentId);
      assertBuyerOwnsPayment(input.buyerId, payment);

      if (payment.status !== PAYMENT_STATUSES.APPROVED) {
        throw new HttpError(
          409,
          "PAYMENT_NOT_APPROVED",
          "Solo podés crear una sesión cuando el pago ya está aprobado."
        );
      }

      if (!payment.bot) {
        throw new HttpError(
          409,
          "PAYMENT_BOT_UNAVAILABLE",
          "El pago ya no tiene un agente asociado disponible para ejecutarse."
        );
      }

      if (payment.session_id) {
        await getOwnedSessionOrThrow(input.buyerId, payment.session_id);

        return {
          created: false,
          session: await buildDetailedSession(payment.session_id)
        };
      }

      const validatedCredentials = validateCredentialValues(
        input.credentials,
        payment.bot.credential_schema
      );
      const sessionId = randomUUID();
      const vaultPath = buildVaultPath(sessionId);
      const phantomTokenHash = hashPhantomToken(`mock-phantom-${randomUUID()}`);

      await secretStore.writeSecrets({
        path: vaultPath,
        secrets: validatedCredentials.values
      });

      const session = await sessionModel.insert({
        id: sessionId,
        bot_id: payment.bot.id,
        buyer_id: input.buyerId,
        payment_id: payment.id,
        status: SESSION_STATUSES.INITIALIZING,
        vault_path: vaultPath,
        phantom_token_hash: phantomTokenHash
      });
      await paymentModel.attachSession(payment.id, session.id);

      void sandboxRunner.start({
        sessionId: session.id,
        vaultPath,
        phantomTokenHash,
        onStatus: async ({ status }) => {
          await persistStatus(session.id, status);
        },
        onProgress: async ({ line }) => {
          await persistProgress(session.id, line);
        },
        onFinish: async (result) => {
          await persistResult(session.id, result);
        },
        onCleanup: async ({ vaultPath: cleanupPath }) => {
          await secretStore.deleteSecrets({
            path: cleanupPath
          });
        }
      });

      return {
        created: true,
        session: serializeBuyerSession(session, [], null)
      };
    },

    /**
     * @param {{ buyerId: string }} input
     */
    async listBuyerSessions(input) {
      const sessions = await sessionModel.listByBuyerId(input.buyerId);
      const latestLogsBySessionId =
        await executionLogModel.listLatestBuyerFacingBySessionIds(
          sessions.map((session) => session.id)
        );

      return sessions.map((session) => {
        const latestLog = latestLogsBySessionId[session.id] ?? null;
        const latestUpdate = latestLog
          ? {
              id: latestLog.id,
              message: latestLog.message,
              created_at: latestLog.created_at
            }
          : session.summary
            ? {
                id: `${session.id}:summary`,
                message: session.summary,
                created_at: session.completed_at ?? session.created_at
              }
            : null;

        return serializeBuyerSession(session, [], latestUpdate);
      });
    },

    /**
     * @param {{ buyerId: string, sessionId: string }} input
     */
    async getBuyerSession(input) {
      await getOwnedSessionOrThrow(input.buyerId, input.sessionId);
      return buildDetailedSession(input.sessionId);
    }
  };
}
