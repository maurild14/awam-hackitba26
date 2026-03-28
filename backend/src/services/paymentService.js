import { PAYMENT_STATUSES } from "@awam/shared";

import { HttpError } from "../lib/httpError.js";

const PLATFORM_COMMISSION_RATE = 0.2;

/**
 * @param {number} amountArs
 */
function calculateCommissionArs(amountArs) {
  return Math.round(amountArs * PLATFORM_COMMISSION_RATE);
}

/**
 * @param {{
 *   id: string,
 *   session_id: string | null,
 *   buyer_id: string,
 *   bot_id: string,
 *   provider_payment_id: string | null,
 *   provider_preference_id: string | null,
 *   amount_ars: number,
 *   commission_ars: number,
 *   status: string,
 *   paid_at: string | null,
 *   created_at: string,
 *   bot: null | {
 *     id: string,
 *     slug: string,
 *     title: string,
 *     description: string,
 *     price_ars: number,
 *     category: string,
 *     image_uri: string | null,
 *     credential_schema: unknown[]
 *   }
 * }} payment
 * @param {string} providerName
 */
function serializePayment(payment, providerName) {
  return {
    id: payment.id,
    session_id: payment.session_id,
    bot: payment.bot
      ? {
          id: payment.bot.id,
          slug: payment.bot.slug,
          title: payment.bot.title,
          description: payment.bot.description,
          price_ars: payment.bot.price_ars,
          category: payment.bot.category,
          image_uri: payment.bot.image_uri,
          credential_schema: Array.isArray(payment.bot.credential_schema)
            ? payment.bot.credential_schema
            : []
        }
      : null,
    amount_ars: payment.amount_ars,
    commission_ars: payment.commission_ars,
    status: payment.status,
    paid_at: payment.paid_at,
    created_at: payment.created_at,
    provider: {
      name: providerName,
      preference_id: payment.provider_preference_id
    }
  };
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
 * @param {string} currentStatus
 * @param {string} nextStatus
 */
function assertPaymentTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) {
    return;
  }

  if (currentStatus !== PAYMENT_STATUSES.PENDING) {
    throw new HttpError(
      409,
      "PAYMENT_STATUS_CONFLICT",
      "El pago ya tiene un estado final y no se puede cambiar."
    );
  }
}

/**
 * @param {{
 *   paymentModel: ReturnType<typeof import("../models/payment.js").createPaymentModel>,
 *   botModel: Pick<ReturnType<typeof import("../models/bot.js").createBotModel>, "findPublishedById">,
 *   paymentProvider: {
 *     name: string,
 *     createPreference(input: { botId: string, buyerId: string, amountArs: number }): { provider: string, preferenceId: string },
 *     createSettlement(input: { preferenceId: string, outcome: string }): { provider: string, preferenceId: string, providerPaymentId: string, status: string }
 *   }
 * }} dependencies
 */
export function createPaymentService({
  paymentModel,
  botModel,
  paymentProvider
}) {
  /**
   * @param {Parameters<typeof serializePayment>[0]} payment
   */
  function serializeProviderPayment(payment) {
    return serializePayment(payment, paymentProvider.name);
  }

  /**
   * @param {string} botId
   */
  async function getPublishedBotOrThrow(botId) {
    const bot = await botModel.findPublishedById(botId);

    if (!bot) {
      throw new HttpError(
        404,
        "BOT_NOT_FOUND",
        "Solo pod\u00e9s iniciar checkout sobre bots publicados."
      );
    }

    return bot;
  }

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
   * @param {string} preferenceId
   */
  async function getPaymentByPreferenceOrThrow(preferenceId) {
    const payment = await paymentModel.findByProviderPreferenceId(preferenceId);

    if (!payment) {
      throw new HttpError(404, "PAYMENT_NOT_FOUND", "No encontramos ese pago.");
    }

    return payment;
  }

  /**
   * @param {{
   *   provider: string,
   *   preferenceId: string,
   *   providerPaymentId?: string | null,
   *   status: string
   * }} input
   */
  async function applyWebhookEvent(input) {
    if (input.provider !== paymentProvider.name) {
      throw new HttpError(
        400,
        "PAYMENT_PROVIDER_UNSUPPORTED",
        "El provider de pago no est\u00e1 soportado."
      );
    }

    if (
      input.status !== PAYMENT_STATUSES.APPROVED &&
      input.status !== PAYMENT_STATUSES.REJECTED
    ) {
      throw new HttpError(
        400,
        "VALIDATION_ERROR",
        "El estado del pago no es v\u00e1lido para este milestone."
      );
    }

    const existingPayment = await getPaymentByPreferenceOrThrow(input.preferenceId);
    assertPaymentTransition(existingPayment.status, input.status);

    if (existingPayment.status === input.status) {
      return serializeProviderPayment(existingPayment);
    }

    const updatedPayment = await paymentModel.updateProviderState(
      existingPayment.id,
      {
        provider_payment_id:
          input.providerPaymentId ?? existingPayment.provider_payment_id,
        status: input.status,
        paid_at:
          input.status === PAYMENT_STATUSES.APPROVED
            ? new Date().toISOString()
            : null
      }
    );

    return serializeProviderPayment(updatedPayment);
  }

  return {
    /**
     * @param {{ buyerId: string, botId: string }} input
     */
    async createCheckoutPreference(input) {
      const bot = await getPublishedBotOrThrow(input.botId);
      const amountArs = bot.price_ars;
      const providerPreference = paymentProvider.createPreference({
        botId: bot.id,
        buyerId: input.buyerId,
        amountArs
      });
      const payment = await paymentModel.insert({
        session_id: null,
        buyer_id: input.buyerId,
        bot_id: bot.id,
        provider_preference_id: providerPreference.preferenceId,
        amount_ars: amountArs,
        commission_ars: calculateCommissionArs(amountArs),
        status: PAYMENT_STATUSES.PENDING,
        paid_at: null
      });

      return serializeProviderPayment(payment);
    },

    /**
     * @param {{ buyerId: string, paymentId: string }} input
     */
    async getBuyerPayment(input) {
      const payment = await getPaymentOrThrow(input.paymentId);
      assertBuyerOwnsPayment(input.buyerId, payment);
      return serializeProviderPayment(payment);
    },

    /**
     * @param {{ preferenceId: string }} input
     */
    async getProviderCheckout(input) {
      const payment = await getPaymentByPreferenceOrThrow(input.preferenceId);
      return serializeProviderPayment(payment);
    },

    /**
     * @param {{
     *   provider: string,
     *   preferenceId: string,
     *   providerPaymentId?: string | null,
     *   status: string
     * }} input
     */
    applyWebhookEvent,

    /**
     * @param {{ preferenceId: string, outcome: string }} input
     */
    async registerDummyOutcome(input) {
      const settlement = paymentProvider.createSettlement({
        preferenceId: input.preferenceId,
        outcome: input.outcome
      });

      return applyWebhookEvent({
        provider: settlement.provider,
        preferenceId: settlement.preferenceId,
        providerPaymentId: settlement.providerPaymentId,
        status: settlement.status
      });
    }
  };
}
