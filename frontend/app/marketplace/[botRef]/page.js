import { notFound } from "next/navigation";

import CheckoutStartPanel from "../../../components/CheckoutStartPanel.js";
import SiteFooter from "../../../components/SiteFooter.js";
import SiteHeader from "../../../components/SiteHeader.js";
import {
  getCurrentUserOnServer,
  isNotFoundApiError
} from "../../../lib/session.js";
import {
  apiRequestOnServer,
  safeApiRequestOnServer
} from "../../../lib/server-api.js";

export const dynamic = "force-dynamic";

/**
 * @param {{ params: { botRef: string } }} props
 */
export async function generateMetadata({ params }) {
  const result = await safeApiRequestOnServer(`/api/v1/bots/${params.botRef}`);
  const bot = result.data?.bot;

  if (!bot) {
    return {
      title: "Agente | AWAM"
    };
  }

  return {
    title: `${bot.title} | AWAM`,
    description: bot.description
  };
}

/**
 * @param {{ params: { botRef: string } }} props
 */
export default async function BotDetailPage({ params }) {
  const user = await getCurrentUserOnServer();

  try {
    const response = await apiRequestOnServer(`/api/v1/bots/${params.botRef}`);
    const bot = response.bot;

    return (
      <main className="app-shell">
        <SiteHeader user={user} />

        <section className="bot-detail-hero">
          <div className="bot-detail-main">
            <span className="eyebrow">Bot publicado</span>
            <h1>{bot.title}</h1>
            <p className="lead">{bot.description}</p>

            <div className="inline-badges">
              <span className="category-chip">{bot.category}</span>
              <span className="rating-chip">Seller {bot.seller_username}</span>
              <span className="rating-chip">
                {bot.average_rating > 0
                  ? `★ ${bot.average_rating.toFixed(1)}`
                  : "Sin reviews todavía"}
              </span>
            </div>

            <div className="detail-grid">
              <article className="detail-card">
                <span className="meta-label">Qué hace</span>
                <p>
                  Resuelve tareas del dominio <strong>{bot.category}</strong> con
                  metadata pública, precio claro y requisitos visibles antes del
                  checkout.
                </p>
              </article>
              <article className="detail-card">
                <span className="meta-label">Capacidades comunicadas</span>
                <ul className="simple-list">
                  <li>{bot.description}</li>
                  <li>
                    Dominios declarados:{" "}
                    {bot.allowed_domains.length > 0
                      ? bot.allowed_domains.join(", ")
                      : "sin acceso externo"}
                  </li>
                  <li>
                    Credenciales necesarias:{" "}
                    {bot.credential_schema.length > 0
                      ? bot.credential_schema.length
                      : "ninguna"}
                  </li>
                </ul>
              </article>
            </div>
          </div>

          <aside className="sticky-purchase-card">
            <CheckoutStartPanel bot={bot} user={user} />
          </aside>
        </section>

        <section className="bot-detail-content">
          <article className="workspace-card">
            <div className="section-head">
              <h2>Credenciales requeridas</h2>
              <p>Esto es exactamente lo que el seller declaró para este agente.</p>
            </div>

            {bot.credential_schema.length === 0 ? (
              <div className="muted-panel">
                <p>Este bot no requiere credenciales del buyer para funcionar.</p>
              </div>
            ) : (
              <div className="credential-list">
                {bot.credential_schema.map((credential) => (
                  <article className="credential-card" key={credential.env_var}>
                    <div className="credential-inline">
                      <strong>{credential.label}</strong>
                      <span className="category-chip">{credential.type}</span>
                    </div>
                    <p>
                      <code>{credential.env_var}</code>
                    </p>
                    {credential.description ? <p>{credential.description}</p> : null}
                    <p>
                      {credential.required
                        ? "Campo obligatorio para ejecutar el agente."
                        : "Campo opcional."}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </article>

          <article className="workspace-card">
            <div className="section-head">
              <h2>Dominios permitidos y recursos</h2>
              <p>La metadata ya está preparada para milestones de proxy y runtime.</p>
            </div>

            <div className="detail-grid">
              <div className="detail-card">
                <span className="meta-label">Allowed domains</span>
                {bot.allowed_domains.length > 0 ? (
                  <ul className="simple-list">
                    {bot.allowed_domains.map((domain) => (
                      <li key={domain}>{domain}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Este bot no declaró acceso a dominios externos.</p>
                )}
              </div>

              <div className="detail-card">
                <span className="meta-label">Resources</span>
                <ul className="simple-list">
                  <li>CPU: {bot.resources.cpu}</li>
                  <li>Memoria: {bot.resources.memory_mb} MB</li>
                  <li>Tiempo máximo: {bot.resources.max_minutes} min</li>
                </ul>
              </div>
            </div>
          </article>

          <article className="trust-message-card">
            <span className="eyebrow">Mensaje de confianza</span>
            <h2>Qué prometemos hoy y qué viene después</h2>
            <p>
              Este milestone ya permite iniciar checkout dummy y registrar el
              resultado del pago. La arquitectura del producto sigue diseñada
              para que el código del seller no vea la credencial real del buyer y
              para ejecutar cada agente en un entorno aislado, pero la carga de
              credenciales y el runtime todavía quedan para M5 en adelante.
            </p>
          </article>
        </section>

        <SiteFooter />
      </main>
    );
  } catch (error) {
    if (isNotFoundApiError(error)) {
      notFound();
    }

    return (
      <main className="app-shell">
        <SiteHeader user={user} />
        <div className="muted-panel">
          <p>No pudimos cargar este bot desde el backend en este momento.</p>
        </div>
        <SiteFooter />
      </main>
    );
  }
}
