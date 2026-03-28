import { HttpError } from "../lib/httpError.js";

const SESSION_SELECT = `
  id,
  bot_id,
  buyer_id,
  payment_id,
  status,
  container_id,
  proxy_container_id,
  vault_path,
  phantom_token_hash,
  started_at,
  completed_at,
  error_message,
  summary,
  created_at,
  bot:bots(
    id,
    slug,
    title,
    description,
    category,
    price_ars,
    image_uri
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
    category:
      typeof castedBot.category === "string" ? castedBot.category : "",
    price_ars:
      typeof castedBot.price_ars === "number" ? castedBot.price_ars : 0,
    image_uri:
      typeof castedBot.image_uri === "string" ? castedBot.image_uri : null
  };
}

/**
 * @param {any} row
 */
function mapSessionRow(row) {
  return {
    id: row.id,
    bot_id: row.bot_id,
    buyer_id: row.buyer_id,
    payment_id: row.payment_id,
    status: row.status,
    container_id: row.container_id,
    proxy_container_id: row.proxy_container_id,
    vault_path: row.vault_path,
    phantom_token_hash: row.phantom_token_hash,
    started_at: row.started_at,
    completed_at: row.completed_at,
    error_message: row.error_message,
    summary: row.summary,
    created_at: row.created_at,
    bot: mapBotRelation(row.bot)
  };
}

/**
 * @param {{ adminClient: import("@supabase/supabase-js").SupabaseClient }} dependencies
 */
export function createSessionModel({ adminClient }) {
  return {
    /**
     * @param {{
     *   id?: string,
     *   bot_id: string,
     *   buyer_id: string,
     *   payment_id: string,
     *   status: string,
     *   vault_path: string | null,
     *   phantom_token_hash: string | null,
     *   started_at?: string | null,
     *   completed_at?: string | null,
     *   error_message?: string | null,
     *   summary?: string | null
     * }} input
     */
    async insert(input) {
      const payload = {
        bot_id: input.bot_id,
        buyer_id: input.buyer_id,
        payment_id: input.payment_id,
        status: input.status,
        vault_path: input.vault_path,
        phantom_token_hash: input.phantom_token_hash,
        started_at: input.started_at ?? null,
        completed_at: input.completed_at ?? null,
        error_message: input.error_message ?? null,
        summary: input.summary ?? null
      };

      if (input.id) {
        Object.assign(payload, {
          id: input.id
        });
      }

      const { data, error } = await adminClient
        .from("sessions")
        .insert(payload)
        .select(SESSION_SELECT)
        .maybeSingle();

      if (error || !data) {
        throw new HttpError(
          500,
          "SESSION_CREATE_FAILED",
          "No se pudo crear la sesión."
        );
      }

      return mapSessionRow(data);
    },

    /**
     * @param {string} sessionId
     */
    async findById(sessionId) {
      const { data, error } = await adminClient
        .from("sessions")
        .select(SESSION_SELECT)
        .eq("id", sessionId)
        .maybeSingle();

      if (error) {
        throw new HttpError(
          500,
          "SESSION_READ_FAILED",
          "No se pudo cargar la sesión solicitada."
        );
      }

      return data ? mapSessionRow(data) : null;
    },

    /**
     * @param {string} buyerId
     */
    async listByBuyerId(buyerId) {
      const { data, error } = await adminClient
        .from("sessions")
        .select(SESSION_SELECT)
        .eq("buyer_id", buyerId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new HttpError(
          500,
          "SESSION_READ_FAILED",
          "No se pudo cargar el historial de sesiones."
        );
      }

      return (data ?? []).map(mapSessionRow);
    },

    /**
     * @param {string} sessionId
     * @param {{
     *   status?: string,
     *   started_at?: string | null,
     *   completed_at?: string | null,
     *   error_message?: string | null,
     *   summary?: string | null
     * }} patch
     */
    async update(sessionId, patch) {
      /** @type {Record<string, string | null>} */
      const payload = {};

      if (patch.status !== undefined) {
        payload.status = patch.status;
      }

      if (patch.started_at !== undefined) {
        payload.started_at = patch.started_at;
      }

      if (patch.completed_at !== undefined) {
        payload.completed_at = patch.completed_at;
      }

      if (patch.error_message !== undefined) {
        payload.error_message = patch.error_message;
      }

      if (patch.summary !== undefined) {
        payload.summary = patch.summary;
      }

      const { data, error } = await adminClient
        .from("sessions")
        .update(payload)
        .eq("id", sessionId)
        .select(SESSION_SELECT)
        .maybeSingle();

      if (error || !data) {
        throw new HttpError(
          500,
          "SESSION_UPDATE_FAILED",
          "No se pudo actualizar la sesión."
        );
      }

      return mapSessionRow(data);
    }
  };
}
