"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiRequest } from "../lib/api.js";

export default function AuthStatusCard() {
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(
    /** @type {null | { username: string, role: string, email: string }} */ (
      null
    )
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadSession() {
      try {
        const response = await apiRequest("/api/v1/auth/me");

        if (!ignore) {
          setUser(response.user);
          setStatus("authenticated");
        }
      } catch (sessionError) {
        if (!ignore) {
          setStatus("guest");
          setError(
            sessionError instanceof Error ? sessionError.message : ""
          );
        }
      }
    }

    loadSession();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleLogout() {
    await apiRequest("/api/v1/auth/logout", {
      method: "POST",
      body: {}
    });

    setUser(null);
    setStatus("guest");
    setError("");
  }

  if (status === "loading") {
    return (
      <section className="session-card">
        <h2>Sesión actual</h2>
        <p>Cargando estado de autenticación...</p>
      </section>
    );
  }

  if (status === "authenticated" && user) {
    return (
      <section className="session-card">
        <h2>Sesión actual</h2>
        <p>
          Entraste como <strong>{user.username}</strong> ({user.role}).
        </p>
        <p className="muted-line">{user.email}</p>
        <button className="secondary-button" onClick={handleLogout} type="button">
          Cerrar sesión
        </button>
      </section>
    );
  }

  return (
    <section className="session-card">
      <h2>Sesión actual</h2>
      <p>No hay una sesión activa en este navegador.</p>
      {error ? <p className="muted-line">{error}</p> : null}
      <div className="inline-actions">
        <Link className="primary-button" href="/auth/register">
          Crear cuenta
        </Link>
        <Link className="secondary-link" href="/auth/login">
          Iniciar sesión
        </Link>
      </div>
    </section>
  );
}
