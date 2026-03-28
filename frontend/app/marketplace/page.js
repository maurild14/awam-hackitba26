import BotCard from "../../components/BotCard.js";
import SiteFooter from "../../components/SiteFooter.js";
import SiteHeader from "../../components/SiteHeader.js";
import {
  MARKETPLACE_CATEGORIES,
  filterMarketplaceBots
} from "../../lib/bots.js";
import { getCurrentUserOnServer } from "../../lib/session.js";
import { safeApiRequestOnServer } from "../../lib/server-api.js";

export const dynamic = "force-dynamic";

/**
 * @param {string | string[] | undefined} value
 */
function readSearchParam(value) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

/**
 * @param {{ searchParams?: Record<string, string | string[] | undefined> }} props
 */
export default async function MarketplacePage({ searchParams = {} }) {
  const user = await getCurrentUserOnServer();
  const result = await safeApiRequestOnServer("/api/v1/bots");
  const bots = result.data?.bots ?? [];
  const filters = {
    q: readSearchParam(searchParams.q),
    category: readSearchParam(searchParams.category),
    sort: readSearchParam(searchParams.sort),
    rating: readSearchParam(searchParams.rating),
    integration: readSearchParam(searchParams.integration)
  };
  const filteredBots = filterMarketplaceBots(bots, filters);

  return (
    <main className="app-shell">
      <SiteHeader user={user} />

      <section className="page-hero compact-hero">
        <div>
          <span className="eyebrow">Marketplace público</span>
          <h1>Explorá solo bots publicados.</h1>
          <p className="lead compact">
            Filtrá por categoría, rating, precio o integración declarada sin exponer
            estados internos ni bots en borrador.
          </p>
        </div>
      </section>

      <section className="workspace-card">
        <form className="filters-grid" method="GET">
          <label>
            <span>Búsqueda</span>
            <input defaultValue={filters.q} name="q" placeholder="ventas, seller, research" />
          </label>

          <label>
            <span>Categoría</span>
            <select defaultValue={filters.category} name="category">
              <option value="">Todas</option>
              {MARKETPLACE_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Orden</span>
            <select defaultValue={filters.sort || "newest"} name="sort">
              <option value="newest">Más nuevos</option>
              <option value="rating">Mejor rating</option>
              <option value="price-asc">Precio menor</option>
              <option value="price-desc">Precio mayor</option>
            </select>
          </label>

          <label>
            <span>Rating mínimo</span>
            <select defaultValue={filters.rating} name="rating">
              <option value="">Cualquiera</option>
              <option value="4">4 o más</option>
              <option value="4.5">4.5 o más</option>
            </select>
          </label>

          <label>
            <span>Integración</span>
            <input
              defaultValue={filters.integration}
              name="integration"
              placeholder="openai, google, notion..."
            />
          </label>

          <button className="primary-button filters-submit" type="submit">
            Aplicar filtros
          </button>
        </form>
      </section>

      {result.error ? (
        <div className="muted-panel">
          <p>No pudimos cargar el marketplace desde el backend en este momento.</p>
        </div>
      ) : filteredBots.length === 0 ? (
        <div className="muted-panel">
          <p>No encontramos bots publicados con esos filtros.</p>
        </div>
      ) : (
        <section className="bot-grid">
          {filteredBots.map((bot) => (
            <BotCard bot={bot} key={bot.id} />
          ))}
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
