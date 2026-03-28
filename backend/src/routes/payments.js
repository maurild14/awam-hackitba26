import { PAYMENT_STATUSES } from "@awam/shared";
import { Router } from "express";

import { requireRole } from "../middleware/auth.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "./asyncHandler.js";

/**
 * @param {unknown} value
 * @param {string} fieldName
 */
function readRequiredString(value, fieldName) {
  if (typeof value !== "string") {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      `El campo ${fieldName} es obligatorio.`
    );
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      `El campo ${fieldName} es obligatorio.`
    );
  }

  return normalized;
}

/**
 * @param {unknown} body
 */
function readCreatePreferencePayload(body) {
  const payload = /** @type {Record<string, unknown>} */ (body ?? {});

  return {
    botId: readRequiredString(payload.bot_id, "bot_id")
  };
}

/**
 * @param {unknown} body
 */
function readWebhookPayload(body) {
  const payload = /** @type {Record<string, unknown>} */ (body ?? {});

  return {
    provider: readRequiredString(payload.provider, "provider"),
    preferenceId: readRequiredString(payload.preference_id, "preference_id"),
    providerPaymentId:
      payload.payment_id == null
        ? null
        : readRequiredString(payload.payment_id, "payment_id"),
    status: readRequiredString(payload.status, "status")
  };
}

/**
 * @param {unknown} body
 */
function readDummyOutcome(body) {
  const payload = /** @type {Record<string, unknown>} */ (body ?? {});
  const outcome = readRequiredString(payload.outcome, "outcome");

  if (
    outcome !== PAYMENT_STATUSES.APPROVED &&
    outcome !== PAYMENT_STATUSES.REJECTED
  ) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      "El resultado del pago simb\u00f3lico no es v\u00e1lido."
    );
  }

  return outcome;
}

/**
 * @param {import("express").Request} req
 */
function buildBackendOrigin(req) {
  return `${req.protocol}://${req.get("host")}`;
}

/**
 * @param {string} value
 */
function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * @param {import("express").Request} req
 * @param {{
 *   id: string,
 *   provider: {
 *     name: string,
 *     preference_id: string | null
 *   }
 * }} payment
 * @param {string} frontendUrl
 */
function buildCheckoutPayload(req, payment, frontendUrl) {
  const preferenceId = payment.provider.preference_id;

  return {
    provider: payment.provider.name,
    preference_id: preferenceId,
    checkout_url: preferenceId
      ? `${buildBackendOrigin(req)}/api/v1/payments/dummy-provider/${encodeURIComponent(preferenceId)}`
      : null,
    review_url: `${frontendUrl}/checkout/${payment.id}`
  };
}

/**
 * @param {{
 *   payment: {
 *     id: string,
 *     bot: null | { title: string },
 *     amount_ars: number,
 *     status: string
 *   },
 *   preferenceId: string,
 *   actionUrl: string,
 *   reviewUrl: string
 * }} input
 */
function renderDummyProviderPage(input) {
  const title = escapeHtml(input.payment.bot?.title ?? "Bot publicado");
  const preferenceId = escapeHtml(input.preferenceId);
  const amount = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(input.payment.amount_ars);

  if (input.payment.status !== PAYMENT_STATUSES.PENDING) {
    const statusLabel =
      input.payment.status === PAYMENT_STATUSES.APPROVED
        ? "aprobado"
        : "rechazado";

    return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pago simb\u00f3lico resuelto</title>
    <style>
      body { font-family: "Segoe UI", sans-serif; background: #f6f3ee; color: #22211d; padding: 2rem; }
      main { max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 28px; padding: 2rem; box-shadow: 0 24px 60px rgba(62, 44, 26, 0.08); }
      a, button { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0.85rem 1.25rem; border-radius: 999px; text-decoration: none; border: none; font-weight: 700; cursor: pointer; }
      a { background: linear-gradient(135deg, #9a4700 0%, #ffb17d 100%); color: #fffaf5; }
      p { line-height: 1.7; color: #666057; }
    </style>
  </head>
  <body>
    <main>
      <p>Dummy payment provider</p>
      <h1>Este pago simb\u00f3lico ya fue ${statusLabel}.</h1>
      <p>Bot: <strong>${title}</strong></p>
      <p>Preferencia: <code>${preferenceId}</code></p>
      <p>No se realiza ning\u00fan cargo real. Si el pago queda aprobado, el buyer puede seguir con la carga de credenciales y la sesión mock.</p>
      <a href="${escapeHtml(input.reviewUrl)}">Volver a AWAM</a>
    </main>
  </body>
</html>`;
  }

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Proveedor dummy</title>
    <style>
      body { font-family: "Segoe UI", sans-serif; background: #f6f3ee; color: #22211d; padding: 2rem; }
      main { max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 28px; padding: 2rem; box-shadow: 0 24px 60px rgba(62, 44, 26, 0.08); display: grid; gap: 1rem; }
      .eyebrow { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.14em; color: #9a4700; font-weight: 800; }
      .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }
      button, a { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0.85rem 1.25rem; border-radius: 999px; text-decoration: none; border: none; font-weight: 700; cursor: pointer; }
      .approve { background: linear-gradient(135deg, #9a4700 0%, #ffb17d 100%); color: #fffaf5; }
      .reject { background: #efe6de; color: #22211d; }
      a { background: #f5f1eb; color: #22211d; }
      p { line-height: 1.7; color: #666057; margin: 0; }
      code { padding: 0.15rem 0.4rem; border-radius: 999px; background: rgba(34, 33, 29, 0.08); }
    </style>
  </head>
  <body>
    <main>
      <span class="eyebrow">Dummy payment provider</span>
      <h1>Eleg\u00ed el resultado simb\u00f3lico del pago.</h1>
      <p>Bot: <strong>${title}</strong></p>
      <p>Monto registrado: <strong>${escapeHtml(amount)}</strong></p>
      <p>Preferencia: <code>${preferenceId}</code></p>
      <p>Este paso no realiza ning\u00fan cobro irreversible. Solo actualiza el estado simbólico del pago para habilitar el flujo buyer-facing.</p>
      <form action="${escapeHtml(input.actionUrl)}" method="post">
        <div class="actions">
          <button class="approve" name="outcome" type="submit" value="approved">Aprobar simb\u00f3licamente</button>
          <button class="reject" name="outcome" type="submit" value="rejected">Rechazar simb\u00f3licamente</button>
          <a href="${escapeHtml(input.reviewUrl)}">Volver al checkout</a>
        </div>
      </form>
    </main>
  </body>
</html>`;
}

/**
 * @param {{
 *   paymentService: ReturnType<typeof import("../services/paymentService.js").createPaymentService>,
 *   requireAuth: import("express").RequestHandler,
 *   attachCurrentUserProfile: import("express").RequestHandler,
 *   requireInternalApiToken: import("express").RequestHandler,
 *   config: { frontendUrl: string }
 * }} dependencies
 */
export function createPaymentsRouter({
  paymentService,
  requireAuth,
  attachCurrentUserProfile,
  requireInternalApiToken,
  config
}) {
  const router = Router();

  router.post(
    "/create-preference",
    requireAuth,
    attachCurrentUserProfile,
    requireRole("buyer"),
    asyncHandler(async (req, res) => {
      const payload = readCreatePreferencePayload(req.body);
      const payment = await paymentService.createCheckoutPreference({
        buyerId: res.locals.auth.profile.id,
        botId: payload.botId
      });

      res.status(201).json({
        payment,
        checkout: buildCheckoutPayload(req, payment, config.frontendUrl)
      });
    })
  );

  router.post(
    "/webhook",
    requireInternalApiToken,
    asyncHandler(async (req, res) => {
      const payload = readWebhookPayload(req.body);
      const payment = await paymentService.applyWebhookEvent(payload);

      res.status(200).json({
        payment
      });
    })
  );

  router.get(
    "/dummy-provider/:preferenceId",
    asyncHandler(async (req, res) => {
      const preferenceId = readRequiredString(
        Array.isArray(req.params.preferenceId)
          ? req.params.preferenceId[0]
          : req.params.preferenceId,
        "preferenceId"
      );
      const payment = await paymentService.getProviderCheckout({
        preferenceId
      });
      const checkout = buildCheckoutPayload(req, payment, config.frontendUrl);

      res.status(200).type("html").send(
        renderDummyProviderPage({
          payment,
          preferenceId,
          actionUrl: `${buildBackendOrigin(req)}/api/v1/payments/dummy-provider/${encodeURIComponent(preferenceId)}/decision`,
          reviewUrl: checkout.review_url
        })
      );
    })
  );

  router.post(
    "/dummy-provider/:preferenceId/decision",
    asyncHandler(async (req, res) => {
      const preferenceId = readRequiredString(
        Array.isArray(req.params.preferenceId)
          ? req.params.preferenceId[0]
          : req.params.preferenceId,
        "preferenceId"
      );
      const outcome = readDummyOutcome(req.body);
      const payment = await paymentService.registerDummyOutcome({
        preferenceId,
        outcome
      });

      res.redirect(303, `${config.frontendUrl}/checkout/${payment.id}`);
    })
  );

  router.get(
    "/:paymentId",
    requireAuth,
    attachCurrentUserProfile,
    requireRole("buyer"),
    asyncHandler(async (req, res) => {
      const paymentId = readRequiredString(
        Array.isArray(req.params.paymentId)
          ? req.params.paymentId[0]
          : req.params.paymentId,
        "paymentId"
      );
      const payment = await paymentService.getBuyerPayment({
        buyerId: res.locals.auth.profile.id,
        paymentId
      });

      res.status(200).json({
        payment,
        checkout: buildCheckoutPayload(req, payment, config.frontendUrl)
      });
    })
  );

  return router;
}
