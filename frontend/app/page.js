import Link from "next/link";

import AuthStatusCard from "../components/AuthStatusCard.js";

const defaultApiUrl = "http://localhost:3001";

export default function HomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || defaultApiUrl;

  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">Milestone 2</p>
        <h1>AWAM auth y persistencia base</h1>
        <p className="lead">
          El proyecto ya tiene la base del milestone 2: auth por backend,
          perfiles, roles y superficie de configuración para Supabase real.
        </p>
        <div className="status-grid">
          <article>
            <h2>Frontend</h2>
            <p>Login y registro mínimos contra el backend con cookies httpOnly.</p>
          </article>
          <article>
            <h2>Backend</h2>
            <p>Endpoints de auth, middlewares de rol y contrato base de sesión.</p>
          </article>
          <article>
            <h2>Persistencia</h2>
            <p>Schema base versionado en SQL para perfiles, bots, sesiones y pagos.</p>
          </article>
        </div>
        <div className="inline-actions hero-actions">
          <Link className="primary-button" href="/auth/register">
            Crear cuenta
          </Link>
          <Link className="secondary-link" href="/auth/login">
            Iniciar sesión
          </Link>
        </div>
        <div className="api-box">
          <span>Backend API base</span>
          <code>{apiUrl}</code>
        </div>
        <AuthStatusCard />
      </section>
    </main>
  );
}
