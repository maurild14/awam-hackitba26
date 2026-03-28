import {
  BOT_STATUSES,
  isUuid,
  normalizeBotMutationInput,
  slugifyBotTitle
} from "@awam/shared";

import { HttpError } from "../lib/httpError.js";

/** @type {Set<string>} */
const SELLER_MUTABLE_STATUSES = new Set([
  BOT_STATUSES.DRAFT,
  BOT_STATUSES.PENDING_REVIEW
]);
/** @type {Set<string>} */
const ALL_BOT_STATUSES = new Set(Object.values(BOT_STATUSES));

/**
 * @param {unknown} value
 */
function readOptionalStatus(value) {
  if (value == null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      "El campo status debe ser texto."
    );
  }

  const status = value.trim();

  if (!status) {
    return null;
  }

  if (!ALL_BOT_STATUSES.has(status)) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      "El estado del agente no es válido."
    );
  }

  return status;
}

/**
 * @param {unknown} value
 */
function readRequiredStatus(value) {
  const status = readOptionalStatus(value);

  if (!status) {
    throw new HttpError(
      400,
      "VALIDATION_ERROR",
      "El campo status es obligatorio."
    );
  }

  return status;
}

/**
 * @param {unknown} error
 */
function mapValidationError(error) {
  if (
    error instanceof Error &&
    (error.name === "BotValidationError" || error.name === "Error")
  ) {
    return new HttpError(400, "VALIDATION_ERROR", error.message);
  }

  return error;
}

/**
 * @param {Array<{ id: string, slug: string, seller_id: string, seller_username: string, title: string, description: string, price_ars: number, category: string, image_uri: string | null, status: string, allowed_domains: string[], credential_schema: unknown[], resources: Record<string, unknown>, total_executions: number, average_rating: number, created_at: string }>} bots
 */
function serializePublicBots(bots) {
  return bots.map((bot) => ({
    id: bot.id,
    slug: bot.slug,
    title: bot.title,
    description: bot.description,
    price_ars: bot.price_ars,
    category: bot.category,
    image_uri: bot.image_uri,
    average_rating: bot.average_rating,
    total_executions: bot.total_executions,
    credential_schema: bot.credential_schema,
    allowed_domains: bot.allowed_domains,
    resources: bot.resources,
    seller_username: bot.seller_username
  }));
}

/**
 * @param {{ id: string, slug: string, seller_id: string, seller_username: string, title: string, description: string, price_ars: number, category: string, image_uri: string | null, status: string, allowed_domains: string[], credential_schema: unknown[], resources: Record<string, unknown>, total_executions: number, average_rating: number, created_at: string }} bot
 */
function serializeManagedBot(bot) {
  return {
    id: bot.id,
    slug: bot.slug,
    seller_id: bot.seller_id,
    seller_username: bot.seller_username,
    title: bot.title,
    description: bot.description,
    price_ars: bot.price_ars,
    category: bot.category,
    image_uri: bot.image_uri,
    status: bot.status,
    average_rating: bot.average_rating,
    total_executions: bot.total_executions,
    credential_schema: bot.credential_schema,
    allowed_domains: bot.allowed_domains,
    resources: bot.resources,
    created_at: bot.created_at
  };
}

/**
 * @param {string} sellerId
 * @param {{ seller_id: string }} bot
 */
function assertSellerOwnsBot(sellerId, bot) {
  if (bot.seller_id !== sellerId) {
    throw new HttpError(
      403,
      "BOT_OWNERSHIP_FORBIDDEN",
      "Solo podés editar agentes creados por tu cuenta."
    );
  }
}

/**
 * @param {string} status
 */
function assertSellerCanUseStatus(status) {
  if (!SELLER_MUTABLE_STATUSES.has(status)) {
    throw new HttpError(
      403,
      "BOT_STATUS_FORBIDDEN",
      "Como seller solo podés mover el agente a draft o pending_review."
    );
  }
}

/**
 * @param {string[]} existingSlugs
 * @param {string} baseSlug
 */
function buildUniqueSlug(existingSlugs, baseSlug) {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let maxSuffix = 1;

  for (const slug of existingSlugs) {
    const match = new RegExp(`^${baseSlug}-(\\d+)$`).exec(slug);
    if (match) {
      maxSuffix = Math.max(maxSuffix, Number(match[1]));
    }
  }

  return `${baseSlug}-${maxSuffix + 1}`;
}

/**
 * @param {{ botModel: ReturnType<typeof import("../models/bot.js").createBotModel> }} dependencies
 */
export function createBotService({ botModel }) {
  return {
    async listPublicBots() {
      const bots = await botModel.listPublished();
      return serializePublicBots(bots);
    },

    /**
     * @param {{ botRef: string }} input
     */
    async getPublicBot(input) {
      const bot = isUuid(input.botRef)
        ? await botModel.findPublishedById(input.botRef)
        : await botModel.findPublishedBySlug(input.botRef);

      if (!bot) {
        throw new HttpError(404, "BOT_NOT_FOUND", "No encontramos ese agente.");
      }

      return serializePublicBots([bot])[0];
    },

    /**
     * @param {{ sellerId: string }} input
     */
    async listSellerBots(input) {
      const bots = await botModel.listBySellerId(input.sellerId);
      return bots.map(serializeManagedBot);
    },

    /**
     * @param {{ sellerId: string, botId: string }} input
     */
    async getSellerBot(input) {
      const bot = await botModel.findById(input.botId);

      if (!bot) {
        throw new HttpError(404, "BOT_NOT_FOUND", "No encontramos ese agente.");
      }

      assertSellerOwnsBot(input.sellerId, bot);
      return serializeManagedBot(bot);
    },

    /**
     * @param {{ sellerId: string, payload: unknown }} input
     */
    async createSellerBot(input) {
      let payload;

      try {
        payload = normalizeBotMutationInput(input.payload);
      } catch (error) {
        throw mapValidationError(error);
      }

      const requestedStatus = readOptionalStatus(
        /** @type {Record<string, unknown>} */ (input.payload).status
      );
      const status = requestedStatus ?? BOT_STATUSES.DRAFT;
      assertSellerCanUseStatus(status);

      const baseSlug = slugifyBotTitle(payload.title);
      const slug = buildUniqueSlug(
        await botModel.listSlugsStartingWith(baseSlug),
        baseSlug
      );

      const bot = await botModel.insert({
        seller_id: input.sellerId,
        slug,
        status,
        ...payload
      });

      return serializeManagedBot(bot);
    },

    /**
     * @param {{ sellerId: string, botId: string, payload: unknown }} input
     */
    async updateSellerBot(input) {
      const existingBot = await botModel.findById(input.botId);

      if (!existingBot) {
        throw new HttpError(404, "BOT_NOT_FOUND", "No encontramos ese agente.");
      }

      assertSellerOwnsBot(input.sellerId, existingBot);

      let payload;

      try {
        payload = normalizeBotMutationInput(input.payload);
      } catch (error) {
        throw mapValidationError(error);
      }

      const requestedStatus = readOptionalStatus(
        /** @type {Record<string, unknown>} */ (input.payload).status
      );

      if (requestedStatus) {
        assertSellerCanUseStatus(requestedStatus);
      }

      const bot = await botModel.update(input.botId, {
        ...payload,
        status: requestedStatus ?? existingBot.status
      });

      return serializeManagedBot(bot);
    },

    async listAdminBots() {
      const bots = await botModel.listAll();
      return bots.map(serializeManagedBot);
    },

    /**
     * @param {{ botId: string, status: unknown }} input
     */
    async updateAdminBotStatus(input) {
      const bot = await botModel.findById(input.botId);

      if (!bot) {
        throw new HttpError(404, "BOT_NOT_FOUND", "No encontramos ese agente.");
      }

      const status = readRequiredStatus(input.status);
      const updatedBot = await botModel.update(input.botId, {
        status
      });

      return serializeManagedBot(updatedBot);
    }
  };
}
