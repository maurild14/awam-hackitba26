import Link from "next/link";

import SiteHeader from "../../../components/SiteHeader.js";
import StatusBadge from "../../../components/StatusBadge.js";
import { formatCurrencyArs, formatDate } from "../../../lib/bots.js";
import { requireRoleOnServer } from "../../../lib/session.js";
import { safeApiRequestOnServer } from "../../../lib/server-api.js";

export const dynamic = "force-dynamic";

export default async function SellerBotsPage() {
  const user = await requireRoleOnServer(["seller"]);
  const result = await safeApiRequestOnServer("/api/v1/seller/bots");
  const bots = result.data?.bots ?? [];

  return (
    <main className="app-shell workspace-shell">
      <SiteHeader context="workspace" user={user} />

      <section className="workspace-card">
        <div className="workspace-card-head">
          <div>
            <p className="eyebrow">Panel seller</p>
            <h1>Mis agentes</h1>
            <p className="lead compact">
              Creá, editá y enviá a revisión tus bots con metadata real lista para
              el resto del roadmap.
            </p>
          </div>
          <Link className="primary-button" href="/seller/bots/new">
            Crear agente
          </Link>
        </div>

        {result.error ? (
          <div className="muted-panel">
            <p>No pudimos cargar tus bots desde el backend.</p>
          </div>
        ) : bots.length === 0 ? (
          <div className="muted-panel">
            <p>Todavía no creaste bots. El primer paso es cargar metadata completa.</p>
          </div>
        ) : (
          <div className="workspace-list">
            {bots.map((bot) => (
              <article className="workspace-row" key={bot.id}>
                <div>
                  <div className="workspace-row-top">
                    <h2>{bot.title}</h2>
                    <StatusBadge status={bot.status} />
                  </div>
                  <p>{bot.description}</p>
                  <div className="admin-metadata-row">
                    <span>{formatCurrencyArs(bot.price_ars)}</span>
                    <span>{bot.category}</span>
                    <span>{bot.allowed_domains.length} dominios</span>
                    <span>{bot.credential_schema.length} credenciales</span>
                    <span>Creado {formatDate(bot.created_at)}</span>
                  </div>
                </div>

                <div className="workspace-row-actions">
                  <code>/{bot.slug}</code>
                  <Link
                    className="nav-action ghost-button"
                    href={`/seller/bots/${bot.id}/edit`}
                  >
                    Editar metadata
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
