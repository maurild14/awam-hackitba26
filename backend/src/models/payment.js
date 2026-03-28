import { HttpError } from "../lib/httpError.js";

const PAYMENT_SELECT = `
  id,
  session_id,
  buyer_id,
  bot_id,
  mp_payment_id,
  mp_preference_id,
  amount_ars,
  commission_ars,
  status,
  paid_at,
  created_at,
  bot:bots(
    id,
    slug,
    title,
    description,
    price_ars,
    category,
    image_uri,
    credential_schema
  )
`;

/**
 * @param {unknown} value
 */
function readSingleRelation(value) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

/**
 * @param {unknown} value
 */
function mapBotRelation(value) {
  const bot = readSingleRelation(value);

  if (!bot || typeof bot !== "object") {
    return null;
  }

  const castedBot = /** @type {Record<string, unknown>} */ (bot);

  return {
    id: typeof castedBot.id === "string" ? castedBot.id : "",
    slug: typeof castedBot.slug === "string" ? castedBot.slug : "",
    title: typeof castedBot.title === "string" ? castedBot.title : "",
    description:
      typeof castedBot.description === "string" ? castedBot.description : "",
    price_ars:
      typeof castedBot.price_ars === "number" ? castedBot.price_ars : 0,
    category:
      typeof castedBot.category === "string" ? castedBot.category : "",
    image_uri:
      typeof castedBot.image_uri === "string" ? castedBot.image_uri : null,
    credential_schema: Array.isArray(castedBot.credential_schema)
      ? castedBot.credential_schema
      : []
  };
}

/**
 * @param {any} row
 */
function mapPaymentRow(row) {
  return {
    id: row.id,
    session_id: row.session_id,
    buyer_id: row.buyer_id,
    bot_id: row.bot_id,
    provider_payment_id: row.mp_payment_id,
    provider_preference_id: row.mp_preference_id,
    amount_ars: row.amount_ars,
    commission_ars: row.commission_ars,
    status: row.status,
    paid_at: row.paid_at,
    created_at: row.created_at,
    bot: mapBotRelation(row.bot)
  };
}

/**
 * @param {{ adminClient: import("@supabase/supabase-js").SupabaseClient }} dependencies
 */
export function createPaymentModel({ adminClient }) {
  return {
    /**
     * @param {{
     *   session_id?: string | null,
     *   buyer_id: string,
     *   bot_id: string,
     *   provider_payment_id?: string | null,
     *   provider_preference_id: string,
     *   amount_ars: number,
     *   commission_ars: number,
     *   status: string,
     *   paid_at?: string | null
     * }} input
     */
    async insert(input) {
      const { data, error } = await adminClient
        .from("payments")
        .insert({
          session_id: input.session_id ?? null,
          buyer_id: input.buyer_id,
          bot_id: input.bot_id,
          mp_payment_id: input.provider_payment_id ?? null,
          mp_preference_id: input.provider_preference_id,
          amount_ars: input.amount_ars,
          commission_ars: input.commission_ars,
          status: input.status,
          paid_at: input.paid_at ?? null
        })
        .select(PAYMENT_SELECT)
        .maybeSingle();

      if (error || !data) {
        throw new HttpError(
          500,
          "PAYMENT_CREATE_FAILED",
          "No se pudo registrar el pago."
        );
      }

      return mapPaymentRow(data);
    },

    /**
     * @param {string} paymentId
     */
    async findById(paymentId) {
      const { data, error } = await adminClient
        .from("payments")
        .select(PAYMENT_SELECT)
        .eq("id", paymentId)
        .maybeSingle();

      if (error) {
        throw new HttpError(
          500,
          "PAYMENT_READ_FAILED",
          "No se pudo cargar el pago solicitado."
        );
      }

      return data ? mapPaymentRow(data) : null;
    },

    /**
     * @param {string} providerPreferenceId
     */
    async findByProviderPreferenceId(providerPreferenceId) {
      const { data, error } = await adminClient
        .from("payments")
        .select(PAYMENT_SELECT)
        .eq("mp_preference_id", providerPreferenceId)
        .maybeSingle();

      if (error) {
        throw new HttpError(
          500,
          "PAYMENT_READ_FAILED",
          "No se pudo cargar el pago solicitado."
        );
      }

      return data ? mapPaymentRow(data) : null;
    },

    /**
     * @param {string} paymentId
     * @param {{
     *   provider_payment_id?: string | null,
     *   status: string,
     *   paid_at?: string | null
     * }} patch
     */
    async updateProviderState(paymentId, patch) {
      const { data, error } = await adminClient
        .from("payments")
        .update({
          mp_payment_id: patch.provider_payment_id ?? null,
          status: patch.status,
          paid_at: patch.paid_at ?? null
        })
        .eq("id", paymentId)
        .select(PAYMENT_SELECT)
        .maybeSingle();

      if (error || !data) {
        throw new HttpError(
          500,
          "PAYMENT_UPDATE_FAILED",
          "No se pudo actualizar el estado del pago."
        );
      }

      return mapPaymentRow(data);
    },

    /**
     * @param {string} paymentId
     * @param {string} sessionId
     */
    async attachSession(paymentId, sessionId) {
      const { data, error } = await adminClient
        .from("payments")
        .update({
          session_id: sessionId
        })
        .eq("id", paymentId)
        .select(PAYMENT_SELECT)
        .maybeSingle();

      if (error || !data) {
        throw new HttpError(
          500,
          "PAYMENT_UPDATE_FAILED",
          "No se pudo enlazar el pago con la sesión."
        );
      }

      return mapPaymentRow(data);
    }
  };
}
