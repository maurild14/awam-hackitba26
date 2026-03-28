import { HttpError } from "../lib/httpError.js";

const EXECUTION_LOG_SELECT = `
  id,
  session_id,
  level,
  message,
  is_buyer_facing,
  created_at
`;

/**
 * @param {any} row
 */
function mapExecutionLogRow(row) {
  return {
    id: row.id,
    session_id: row.session_id,
    level: row.level,
    message: row.message,
    is_buyer_facing: row.is_buyer_facing,
    created_at: row.created_at
  };
}

/**
 * @param {{ adminClient: import("@supabase/supabase-js").SupabaseClient }} dependencies
 */
export function createExecutionLogModel({ adminClient }) {
  return {
    /**
     * @param {{
     *   session_id: string,
     *   level: string,
     *   message: string,
     *   is_buyer_facing: boolean
     * }} input
     */
    async insert(input) {
      const { data, error } = await adminClient
        .from("execution_logs")
        .insert({
          session_id: input.session_id,
          level: input.level,
          message: input.message,
          is_buyer_facing: input.is_buyer_facing
        })
        .select(EXECUTION_LOG_SELECT)
        .maybeSingle();

      if (error || !data) {
        throw new HttpError(
          500,
          "EXECUTION_LOG_CREATE_FAILED",
          "No se pudo guardar el progreso de la sesión."
        );
      }

      return mapExecutionLogRow(data);
    },

    /**
     * @param {string} sessionId
     */
    async listBuyerFacingBySessionId(sessionId) {
      const { data, error } = await adminClient
        .from("execution_logs")
        .select(EXECUTION_LOG_SELECT)
        .eq("session_id", sessionId)
        .eq("is_buyer_facing", true)
        .order("created_at", { ascending: true });

      if (error) {
        throw new HttpError(
          500,
          "EXECUTION_LOG_READ_FAILED",
          "No se pudo cargar el progreso de la sesión."
        );
      }

      return (data ?? []).map(mapExecutionLogRow);
    },

    /**
     * @param {string[]} sessionIds
     */
    async listLatestBuyerFacingBySessionIds(sessionIds) {
      if (sessionIds.length === 0) {
        return {};
      }

      const { data, error } = await adminClient
        .from("execution_logs")
        .select(EXECUTION_LOG_SELECT)
        .in("session_id", sessionIds)
        .eq("is_buyer_facing", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw new HttpError(
          500,
          "EXECUTION_LOG_READ_FAILED",
          "No se pudo cargar el historial de progreso."
        );
      }

      /** @type {Record<string, ReturnType<typeof mapExecutionLogRow>>} */
      const latestBySessionId = {};

      for (const row of data ?? []) {
        if (!latestBySessionId[row.session_id]) {
          latestBySessionId[row.session_id] = mapExecutionLogRow(row);
        }
      }

      return latestBySessionId;
    }
  };
}
