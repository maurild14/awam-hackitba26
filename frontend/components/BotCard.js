import Link from "next/link";

import { formatCurrencyArs } from "../lib/bots.js";

/**
 * @param {{
 *   bot: {
 *     id: string,
 *     slug: string,
 *     title: string,
 *     description: string,
 *     price_ars: number,
 *     category: string,
 *     image_uri: string | null,
 *     seller_username: string,
 *     credential_schema: unknown[],
 *     allowed_domains: string[],
 *     average_rating: number,
 *     total_executions?: number
 *   }
 * }} props
 */
export default function BotCard({ bot }) {
  return (
    <Link className="bot-card" href={`/marketplace/${bot.slug || bot.id}`}>
      <div className="bot-card-top">
        <span className="category-chip">{bot.category}</span>
        <span className="rating-chip">
          {bot.average_rating > 0 ? `★ ${bot.average_rating.toFixed(1)}` : "Nuevo"}
        </span>
      </div>

      <div className="bot-card-body">
        <div className="bot-avatar" aria-hidden="true">
          {bot.title.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h3>{bot.title}</h3>
          <p>{bot.description}</p>
        </div>
      </div>

      <div className="bot-meta-grid">
        <div>
          <span className="meta-label">Seller</span>
          <strong>{bot.seller_username}</strong>
        </div>
        <div>
          <span className="meta-label">Credenciales</span>
          <strong>
            {bot.credential_schema.length > 0
              ? `${bot.credential_schema.length} requeridas`
              : "No requiere"}
          </strong>
        </div>
        <div>
          <span className="meta-label">Dominios</span>
          <strong>
            {bot.allowed_domains.length > 0
              ? `${bot.allowed_domains.length} permitidos`
              : "Sin acceso externo"}
          </strong>
        </div>
      </div>

      <div className="bot-card-footer">
        <span className="price-pill">{formatCurrencyArs(bot.price_ars)}</span>
        <span className="text-link">Ver detalle</span>
      </div>
    </Link>
  );
}
