export const MARKETPLACE_CATEGORIES = [
  {
    value: "sales",
    label: "Sales",
    description: "Prospección, seguimiento y enriquecimiento comercial."
  },
  {
    value: "marketing",
    label: "Marketing",
    description: "Campañas, research creativo y automatización de contenido."
  },
  {
    value: "operations",
    label: "Operations",
    description: "Procesos repetitivos, backoffice y coordinación interna."
  },
  {
    value: "research",
    label: "Research",
    description: "Análisis rápido, síntesis y exploración de fuentes."
  },
  {
    value: "data-extraction",
    label: "Data Extraction",
    description: "Captura, limpieza y estructuración de datos."
  },
  {
    value: "customer-support",
    label: "Customer Support",
    description: "Ayuda operativa, respuestas y workflows de soporte."
  },
  {
    value: "finance",
    label: "Finance",
    description: "Control, reportes y tareas de finanzas operativas."
  },
  {
    value: "content",
    label: "Content",
    description: "Briefs, borradores y producción de materiales."
  },
  {
    value: "general",
    label: "General",
    description: "Casos flexibles que no encajan en una sola categoría."
  }
];

export const BOT_STATUS_LABELS = {
  draft: "Borrador",
  pending_review: "En revisión",
  published: "Publicado",
  suspended: "Suspendido"
};

/**
 * @param {number} amount
 */
export function formatCurrencyArs(amount) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * @param {string} dateString
 */
export function formatDate(dateString) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(dateString));
}

/**
 * @param {string} status
 */
export function formatBotStatus(status) {
  return BOT_STATUS_LABELS[status] ?? status;
}

/**
 * @param {Array<any>} bots
 * @param {{
 *   q?: string,
 *   category?: string,
 *   sort?: string,
 *   rating?: string,
 *   integration?: string
 * }} searchParams
 */
export function filterMarketplaceBots(bots, searchParams) {
  const query = searchParams.q?.trim().toLowerCase() ?? "";
  const category = searchParams.category?.trim().toLowerCase() ?? "";
  const integration = searchParams.integration?.trim().toLowerCase() ?? "";
  const minRating = Number(searchParams.rating ?? 0);
  const filteredBots = bots.filter((bot) => {
    const matchesQuery =
      !query ||
      bot.title.toLowerCase().includes(query) ||
      bot.description.toLowerCase().includes(query) ||
      bot.category.toLowerCase().includes(query) ||
      bot.seller_username.toLowerCase().includes(query);
    const matchesCategory = !category || bot.category === category;
    const matchesIntegration =
      !integration ||
      bot.allowed_domains.some((domain) => domain.includes(integration));
    const matchesRating =
      !Number.isFinite(minRating) || minRating <= 0
        ? true
        : bot.average_rating >= minRating;

    return (
      matchesQuery &&
      matchesCategory &&
      matchesIntegration &&
      matchesRating
    );
  });

  const sortedBots = [...filteredBots];
  const sort = searchParams.sort ?? "newest";

  if (sort === "price-asc") {
    sortedBots.sort((left, right) => left.price_ars - right.price_ars);
  } else if (sort === "price-desc") {
    sortedBots.sort((left, right) => right.price_ars - left.price_ars);
  } else if (sort === "rating") {
    sortedBots.sort((left, right) => right.average_rating - left.average_rating);
  } else {
    sortedBots.sort(
      (left, right) =>
        new Date(right.created_at ?? 0).getTime() -
        new Date(left.created_at ?? 0).getTime()
    );
  }

  return sortedBots;
}
