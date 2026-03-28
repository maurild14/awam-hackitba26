const defaultApiUrl = "http://localhost:3001";

export default function HomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || defaultApiUrl;

  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">Milestone 1</p>
        <h1>AWAM workspace inicializado</h1>
        <p className="lead">
          El monorepo ya tiene frontend, backend, proxy y contratos internos
          base listos para seguir con el MVP.
        </p>
        <div className="status-grid">
          <article>
            <h2>Frontend</h2>
            <p>Next.js 14 con App Router y una home operativa de placeholder.</p>
          </article>
          <article>
            <h2>Backend</h2>
            <p>Express con healthcheck y convención base de errores JSON.</p>
          </article>
          <article>
            <h2>Proxy</h2>
            <p>Proceso separado con healthcheck, sin lógica de runtime todavía.</p>
          </article>
        </div>
        <div className="api-box">
          <span>Backend API base</span>
          <code>{apiUrl}</code>
        </div>
      </section>
    </main>
  );
}
