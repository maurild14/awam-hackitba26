"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { apiRequest } from "../lib/api.js";

/**
 * @param {{ mode: "login" | "register" }} props
 */
export default function AuthForm({ mode }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("buyer");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = useMemo(() => {
    return isRegister ? "Crear cuenta" : "Iniciar sesión";
  }, [isRegister]);

  const subtitle = useMemo(() => {
    return isRegister
      ? "Registrate como buyer o seller para empezar a usar la plataforma."
      : "Entrá con tu cuenta para continuar.";
  }, [isRegister]);

  /**
   * @param {import("react").FormEvent<HTMLFormElement>} event
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = isRegister
        ? { email, password, username, role }
        : { email, password };

      await apiRequest(
        isRegister ? "/api/v1/auth/register" : "/api/v1/auth/login",
        {
          method: "POST",
          body: payload
        }
      );

      router.push("/");
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo completar la operación."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="auth-card">
        <p className="eyebrow">Auth M2</p>
        <h1>{title}</h1>
        <p className="lead compact">{subtitle}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister ? (
            <label>
              <span>Nombre de usuario</span>
              <input
                autoComplete="username"
                name="username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="mauri"
                required
                value={username}
              />
            </label>
          ) : null}

          <label>
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vos@ejemplo.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label>
            <span>Contraseña</span>
            <input
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={8}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              required
              type="password"
              value={password}
            />
          </label>

          {isRegister ? (
            <label>
              <span>Quiero entrar como</span>
              <select
                name="role"
                onChange={(event) => setRole(event.target.value)}
                value={role}
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </label>
          ) : null}

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? "Procesando..."
              : isRegister
                ? "Crear cuenta"
                : "Entrar"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "¿Ya tenés cuenta?" : "¿Todavía no tenés cuenta?"}{" "}
          <Link href={isRegister ? "/auth/login" : "/auth/register"}>
            {isRegister ? "Iniciá sesión" : "Registrate"}
          </Link>
        </p>
      </section>
    </main>
  );
}
