import Link from "next/link";

import BotCard from "../components/BotCard.js";
import SiteFooter from "../components/SiteFooter.js";
import SiteHeader from "../components/SiteHeader.js";
import {
  MARKETPLACE_CATEGORIES,
  formatCurrencyArs
} from "../lib/bots.js";
import { getCurrentUserOnServer } from "../lib/session.js";
import { safeApiRequestOnServer } from "../lib/server-api.js";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AWAM | Marketplace de agentes IA",
  description:
    "Descubrí agentes de IA con metadata clara, publicación curada y flujos pensados para buyers, sellers y admins."
};

export default async function HomePage() {
  const user = await getCurrentUserOnServer();
  const result = await safeApiRequestOnServer("/api/v1/bots");
  const featuredBots = result.data?.bots?.slice(0, 3) ?? [];

  return (
    <main className="app-shell">
      <SiteHeader user={user} />

      <section className="hero-surface">
        <div className="hero-copy">
          <span className="eyebrow">Marketplace curado</span>
          <h1>Descubrí agentes de IA listos para resolver tareas reales.</h1>
          <p className="lead">
            Encontrá agentes publicados con precio claro, credenciales declaradas,
            dominios permitidos y metadata estable para lo que viene después:
            checkout, runtime y ejecución segura.
          </p>

          <form action="/marketplace" className="hero-search">
            <input
              aria-label="Buscar agentes"
              name="q"
              placeholder="Buscá por categoría, seller o problema a resolver"
              type="search"
            />
            <button className="primary-button" type="submit">
              Explorar agentes
            </button>
          </form>

          <div className="inline-actions hero-inline-actions">
            <Link className="nav-action ghost-button" href="/marketplace">
              Ver marketplace público
            </Link>
            <Link className="nav-action ghost-button" href="/seller/bots">
              Publicar como seller
            </Link>
          </div>
        </div>

        <aside className="hero-aside">
          <div className="metric-card accent-card">
            <span className="meta-label">Metadata real</span>
            <strong>credential_schema, allowed_domains y resources</strong>
            <p>
              La metadata publicada ya alimenta el checkout dummy y prepara el
              camino para build, proxy y runtime.
            </p>
          </div>

          <div className="metric-grid">
            <article className="metric-card">
              <span className="meta-label">Confianza</span>
              <strong>Flujo editorial</strong>
              <p>Draft, review, publish y suspensión con reglas claras para admin.</p>
            </article>
            <article className="metric-card lilac-card">
              <span className="meta-label">Transparencia</span>
              <strong>Precio en ARS</strong>
              <p>El buyer ve de entrada el costo por ejecución y lo que debe preparar.</p>
            </article>
          </div>
        </aside>
      </section>

      <section className="category-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Categorías destacadas</span>
            <h2>Encontrá un agente por el tipo de trabajo que querés acelerar.</h2>
          </div>
          <p>
            La experiencia pública prioriza claridad y curaduría, no dashboards
            densos ni jerga técnica.
          </p>
        </div>

        <div className="category-grid">
          {MARKETPLACE_CATEGORIES.slice(0, 6).map((category, index) => (
            <Link
              className={`category-card ${index === 2 ? "category-card-dark" : ""}`}
              href={`/marketplace?category=${category.value}`}
              key={category.value}
            >
              <span className="category-chip">{category.label}</span>
              <h3>{category.label}</h3>
              <p>{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="manifesto-card">
        <p className="eyebrow">Confianza en lenguaje simple</p>
        <h2>
          Publicamos agentes con metadata legible para buyers y con revisión básica
          para sellers y admins.
        </h2>
        <p>
          El checkout dummy ya está disponible para registrar intención de compra y
          resultado de pago sin cargos irreversibles. Build, credenciales y runtime
          real siguen fuera hasta milestones posteriores.
        </p>
      </section>

      <section className="benefit-grid">
        <article className="benefit-card">
          <h3>Seguridad como producto</h3>
          <p>
            La arquitectura está diseñada para que el seller no vea la credencial
            real del buyer cuando la ejecución segura entre en escena.
          </p>
        </article>
        <article className="benefit-card">
          <h3>Ejecución aislada</h3>
          <p>
            El contrato ya contempla dominios permitidos, recursos y límites para
            el runtime de milestones posteriores.
          </p>
        </article>
        <article className="benefit-card">
          <h3>Curaduría operacional</h3>
          <p>
            Seller y admin trabajan sobre estados concretos para no mezclar borradores
            con bots publicados.
          </p>
        </article>
      </section>

      <section className="marketplace-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Agentes destacados</span>
            <h2>Solo aparecen bots publicados y listos para descubrir.</h2>
          </div>
          <Link className="nav-action ghost-button" href="/marketplace">
            Ver todo el catálogo
          </Link>
        </div>

        {result.error ? (
          <div className="muted-panel">
            <p>
              El marketplace todavía no pudo cargar bots publicados desde el backend.
            </p>
          </div>
        ) : featuredBots.length === 0 ? (
          <div className="muted-panel">
            <p>No hay bots publicados todavía. El primer seller puede empezar ahora.</p>
          </div>
        ) : (
          <div className="bot-grid">
            {featuredBots.map((bot) => (
              <BotCard bot={bot} key={bot.id} />
            ))}
          </div>
        )}
      </section>

      <section className="trust-banner">
        <div>
          <span className="eyebrow">Mensaje de confianza</span>
          <h2>El seller declara lo que necesita. El buyer entiende lo que va a compartir.</h2>
        </div>
        <p>
          Ahora ya mostramos precio, credenciales requeridas, dominios y recursos
          por bot, y además podés recorrer un checkout dummy completo. La ejecución
          real sigue fuera hasta milestones posteriores.
        </p>
        {featuredBots[0] ? (
          <div className="trust-price-chip">
            Ejemplo de precio publicado: {formatCurrencyArs(featuredBots[0].price_ars)}
          </div>
        ) : null}
      </section>

      <SiteFooter />
    </main>
  );
}
