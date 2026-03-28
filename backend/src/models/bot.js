import { HttpError } from "../lib/httpError.js";

const BOT_SELECT = `
  id,
  slug,
  seller_id,
  title,
  description,
  price_ars,
  category,
  image_uri,
  status,
  allowed_domains,
  credential_schema,
  resources,
  total_executions,
  average_rating,
  created_at,
  seller:profiles!bots_seller_id_fkey(username)
`;

/**
 * @param {unknown} seller
 */
function readSellerUsername(seller) {
  if (seller && typeof seller === "object" && "username" in seller) {
    const username = /** @type {{ username?: unknown }} */ (seller).username;
    return typeof username === "string" ? username : "";
  }

  if (Array.isArray(seller) && seller.length > 0) {
    return readSellerUsername(seller[0]);
  }

  return "";
}

/**
 * @param {any} row
 */
function mapBotRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    seller_id: row.seller_id,
    seller_username: readSellerUsername(row.seller),
    title: row.title,
    description: row.description,
    price_ars: row.price_ars,
    category: row.category,
    image_uri: row.image_uri,
    status: row.status,
    allowed_domains: Array.isArray(row.allowed_domains) ? row.allowed_domains : [],
    credential_schema: Array.isArray(row.credential_schema)
      ? row.credential_schema
      : [],
    resources:
      row.resources && typeof row.resources === "object" ? row.resources : {},
    total_executions: row.total_executions ?? 0,
    average_rating: Number(row.average_rating ?? 0),
    created_at: row.created_at
  };
}

/**
 * @param {{ adminClient: import("@supabase/supabase-js").SupabaseClient }} dependencies
 */
export function createBotModel({ adminClient }) {
  return {
    async listPublished() {
      const { data, error } = await adminClient
        .from("bots")
        .select(BOT_SELECT)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) {
        throw new HttpError(
          500,
          "BOT_READ_FAILED",
          "No se pudieron cargar los agentes publicados."
        );
      }

      return (data ?? []).map(mapBotRow);
    },

    /**
     * @param {string} botId
     */
    async findPublishedById(botId) {
      const { data, error } = await adminClient
        .from("bots")
        .select(BOT_SELECT)
        .eq("id", botId)
        .eq("status", "published")
        .maybeSingle();

      if (error) {
        throw new HttpError(
          500,
          "BOT_READ_FAILED",
          "No se pudo cargar el agente solicitado."
        );
      }

      return data ? mapBotRow(data) : null;
    },

    /**
     * @param {string} slug
     */
    async findPublishedBySlug(slug) {
      const { data, error } = await adminClient
        .from("bots")
        .select(BOT_SELECT)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) {
        throw new HttpError(
          500,
          "BOT_READ_FAILED",
          "No se pudo cargar el agente solicitado."
        );
      }

      return data ? mapBotRow(data) : null;
    },

    /**
     * @param {string} sellerId
     */
    async listBySellerId(sellerId) {
      const { data, error } = await adminClient
        .from("bots")
        .select(BOT_SELECT)
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new HttpError(
          500,
          "BOT_READ_FAILED",
          "No se pudieron cargar tus agentes."
        );
      }

      return (data ?? []).map(mapBotRow);
    },

    /**
     * @param {string} botId
     */
    async findById(botId) {
      const { data, error } = await adminClient
        .from("bots")
        .select(BOT_SELECT)
        .eq("id", botId)
        .maybeSingle();

      if (error) {
        throw new HttpError(
          500,
          "BOT_READ_FAILED",
          "No se pudo cargar el agente solicitado."
        );
      }

      return data ? mapBotRow(data) : null;
    },

    async listAll() {
      const { data, error } = await adminClient
        .from("bots")
        .select(BOT_SELECT)
        .order("created_at", { ascending: false });

      if (error) {
        throw new HttpError(
          500,
          "BOT_READ_FAILED",
          "No se pudieron cargar los agentes."
        );
      }

      return (data ?? []).map(mapBotRow);
    },

    /**
     * @param {{
     *   seller_id: string,
     *   slug: string,
     *   status: string,
     *   title: string,
     *   description: string,
     *   price_ars: number,
     *   category: string,
     *   image_uri: string | null,
     *   credential_schema: unknown[],
     *   allowed_domains: string[],
     *   resources: Record<string, unknown>
     * }} input
     */
    async insert(input) {
      const { data, error } = await adminClient
        .from("bots")
        .insert(input)
        .select(BOT_SELECT)
        .maybeSingle();

      if (error || !data) {
        throw new HttpError(
          500,
          "BOT_CREATE_FAILED",
          "No se pudo crear el agente."
        );
      }

      return mapBotRow(data);
    },

    /**
     * @param {string} botId
     * @param {{
     *   status?: string,
     *   title?: string,
     *   description?: string,
     *   price_ars?: number,
     *   category?: string,
     *   image_uri?: string | null,
     *   credential_schema?: unknown[],
     *   allowed_domains?: string[],
     *   resources?: Record<string, unknown>
     * }} patch
     */
    async update(botId, patch) {
      const { data, error } = await adminClient
        .from("bots")
        .update(patch)
        .eq("id", botId)
        .select(BOT_SELECT)
        .maybeSingle();

      if (error || !data) {
        throw new HttpError(
          500,
          "BOT_UPDATE_FAILED",
          "No se pudo actualizar el agente."
        );
      }

      return mapBotRow(data);
    },

    /**
     * @param {string} baseSlug
     * @param {string | null} excludeBotId
     */
    async listSlugsStartingWith(baseSlug, excludeBotId = null) {
      let query = adminClient
        .from("bots")
        .select("id, slug")
        .like("slug", `${baseSlug}%`);

      if (excludeBotId) {
        query = query.neq("id", excludeBotId);
      }

      const { data, error } = await query;

      if (error) {
        throw new HttpError(
          500,
          "BOT_SLUG_FAILED",
          "No se pudo generar un slug único para el agente."
        );
      }

      return (data ?? [])
        .map((row) => row.slug)
        .filter(
          (slug) =>
            typeof slug === "string" &&
            (slug === baseSlug || slug.startsWith(`${baseSlug}-`))
        );
    }
  };
}
