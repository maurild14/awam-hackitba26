import { randomUUID } from "node:crypto";

import { PAYMENT_STATUSES } from "@awam/shared";

import { HttpError } from "../lib/httpError.js";

export const DUMMY_PAYMENT_PROVIDER_NAME = "dummy";

/**
 * @param {{}} [dependencies]
 */
export function createDummyPaymentProvider(dependencies = {}) {
  void dependencies;

  return {
    name: DUMMY_PAYMENT_PROVIDER_NAME,

    /**
     * @param {{ botId: string, buyerId: string, amountArs: number }} _input
     */
    createPreference(_input) {
      void _input;

      return {
        provider: DUMMY_PAYMENT_PROVIDER_NAME,
        preferenceId: `dummy_pref_${randomUUID()}`
      };
    },

    /**
     * @param {{ preferenceId: string, outcome: string }} input
     */
    createSettlement(input) {
      if (
        input.outcome !== PAYMENT_STATUSES.APPROVED &&
        input.outcome !== PAYMENT_STATUSES.REJECTED
      ) {
        throw new HttpError(
          400,
          "VALIDATION_ERROR",
          "El resultado del pago simb\u00f3lico no es v\u00e1lido."
        );
      }

      return {
        provider: DUMMY_PAYMENT_PROVIDER_NAME,
        preferenceId: input.preferenceId,
        providerPaymentId: `dummy_pay_${randomUUID()}`,
        status: input.outcome
      };
    }
  };
}
