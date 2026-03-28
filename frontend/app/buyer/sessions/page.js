import Link from "next/link";

import SiteFooter from "../../../components/SiteFooter.js";
import SiteHeader from "../../../components/SiteHeader.js";
import { requireRoleOnServer } from "../../../lib/session.js";
import { safeApiRequestOnServer } from "../../../lib/server-api.js";
import {
  formatSessionDateTime,
  formatSessionStatus,
  getSessionStatusMessage
} from "../../../lib/sessions.js";

export const dynamic = "force-dynamic";

export default async function BuyerSessionsPage() {
  const user = await requireRoleOnServer(["buyer"]);
  const result = await safeApiRequestOnServer("/api/v1/sessions");
  const sessions = result.data?.sessions ?? [];

  return (
    <main className="app-shell">
      <SiteHeader user={user} />

      <section className="page-hero compact-hero">
        <div>
          <span className="eyebrow">Dashboard buyer</span>
          <h1>Segu\u00ed tus ejecuciones desde un solo lugar.</h1>
          <p className="lead compact">
            Ac\u00e1 ves el historial b\u00e1sico, el \u00faltimo update buyer-facing y el
            acceso al detalle con progreso en tiempo real.
          </p>
        </div>
      </section>

      {result.error ? (
        <div className="muted-panel">
          <p>No pudimos cargar el historial de sesiones desde el backend.</p>
        </div>
      ) : sessions.length === 0 ? (
        <section className="workspace-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">Todav\u00eda sin ejecuciones</span>
              <h2>Tu historial buyer est\u00e1 vac\u00edo</h2>
            </div>
            <p>
              El flujo completo aparece despu\u00e9s de aprobar un pago y crear una
              sesi\u00f3n desde checkout.
            </p>
          </div>

          <div className="inline-actions">
            <Link className="primary-button" href="/marketplace">
              Explorar marketplace
            </Link>
          </div>
        </section>
      ) : (
        <section className="buyer-history-grid">
          {sessions.map((session) => (
            <article className="workspace-card buyer-history-card" key={session.id}>
              <div className="workspace-card-head">
                <div>
                  <p className="eyebrow">Sesi\u00f3n buyer-facing</p>
                  <h2>{session.bot?.title ?? "Agente sin título"}</h2>
                  <p className="lead compact">
                    {getSessionStatusMessage(session.status)}
                  </p>
                </div>
                <span className={`status-badge status-${session.status}`}>
                  {formatSessionStatus(session.status)}
                </span>
              </div>

              <div className="detail-grid">
                <article className="detail-card">
                  <span className="meta-label">Creada</span>
                  <strong>{formatSessionDateTime(session.created_at)}</strong>
                </article>
                <article className="detail-card">
                  <span className="meta-label">\u00daltimo update</span>
                  <strong>
                    {session.latest_update?.message ?? "Todavía sin mensajes."}
                  </strong>
                </article>
              </div>

              <div className="inline-actions">
                <Link
                  className="primary-button"
                  href={`/buyer/sessions/${session.id}`}
                >
                  Ver detalle
                </Link>
                {session.bot?.slug ? (
                  <Link
                    className="nav-action ghost-button"
                    href={`/marketplace/${session.bot.slug}`}
                  >
                    Volver al bot
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
