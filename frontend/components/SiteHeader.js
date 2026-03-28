import Link from "next/link";

import LogoutButton from "./LogoutButton.js";

/**
 * @param {{
 *   user: null | { username: string, role: string },
 *   context?: "public" | "workspace"
 * }} props
 */
export default function SiteHeader({ user, context = "public" }) {
  return (
    <header className={`site-header ${context === "workspace" ? "workspace-header" : ""}`}>
      <div className="brand-cluster">
        <Link className="brand-mark" href="/">
          AWAM
        </Link>
        <p className="brand-copy">
          Marketplace curado para agentes de IA listos para tareas reales.
        </p>
      </div>

      <nav className="site-nav" aria-label="Principal">
        <Link href="/">Inicio</Link>
        <Link href="/marketplace">Marketplace</Link>
        {user?.role === "buyer" ? <Link href="/buyer/sessions">Mis ejecuciones</Link> : null}
        {user?.role === "seller" ? <Link href="/seller/bots">Panel seller</Link> : null}
        {user?.role === "admin" ? <Link href="/admin/bots">Admin</Link> : null}
      </nav>

      <div className="nav-actions">
        {user ? (
          <>
            <span className="nav-user">
              {user.username}
              <small>{user.role}</small>
            </span>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link className="nav-action ghost-button" href="/auth/login">
              Iniciar sesión
            </Link>
            <Link className="nav-action primary-button" href="/auth/register">
              Crear cuenta
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
