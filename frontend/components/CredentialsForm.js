"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiRequest } from "../lib/api.js";

/**
 * @param {{
 *   paymentId: string,
 *   bot: null | {
 *     slug: string,
 *     title: string,
 *     credential_schema: Array<{
 *       env_var: string,
 *       label: string,
 *       type: string,
 *       required: boolean,
 *       placeholder?: string | null,
 *       description?: string | null
 *     }>
 *   }
 * }} props
 */
export default function CredentialsForm({ paymentId, bot }) {
  const router = useRouter();
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      (bot?.credential_schema ?? []).map((credential) => [
        credential.env_var,
        ""
      ])
    )
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const credentialSchema = bot?.credential_schema ?? [];
  const requiresCredentials = credentialSchema.length > 0;
  const helperText = !requiresCredentials
    ? "Este agente no requiere credenciales para este milestone. Podés crear la sesión mock directamente."
    : "Tus credenciales solo se guardan en el secret store mock de esta sesión. No quedan persistidas en PostgreSQL ni aparecen en logs.";

  /**
   * @param {string} envVar
   * @param {string} value
   */
  function updateValue(envVar, value) {
    setValues((currentValues) => ({
      ...currentValues,
      [envVar]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      for (const credential of credentialSchema) {
        const currentValue = values[credential.env_var] ?? "";

        if (credential.required && !currentValue.trim()) {
          throw new Error(`Completá la credencial ${credential.label}.`);
        }
      }

      const credentials = Object.fromEntries(
        credentialSchema.flatMap((credential) => {
          const currentValue = values[credential.env_var] ?? "";

          if (!currentValue.trim()) {
            return [];
          }

          return [[credential.env_var, currentValue]];
        })
      );
      const response = await apiRequest("/api/v1/sessions", {
        method: "POST",
        body: {
          payment_id: paymentId,
          credentials
        }
      });

      router.push(`/buyer/sessions/${response.session.id}`);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo crear la sesión."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="workspace-card session-launch-card">
      <div className="section-head">
        <div>
          <p className="eyebrow">Paso siguiente</p>
          <h2>Completá las credenciales para iniciar la sesión</h2>
        </div>
        <p>{helperText}</p>
      </div>

      <form className="credentials-form" onSubmit={handleSubmit}>
        {requiresCredentials ? (
          <div className="credentials-form-grid">
            {credentialSchema.map((credential) => (
              <label className="credential-entry-card" key={credential.env_var}>
                <div className="credential-inline">
                  <strong>{credential.label}</strong>
                  <span className="category-chip">
                    {credential.required ? "Obligatoria" : "Opcional"}
                  </span>
                </div>
                {credential.description ? <p>{credential.description}</p> : null}
                <span className="meta-label">
                  <code>{credential.env_var}</code>
                </span>
                {credential.type === "textarea" ? (
                  <textarea
                    onChange={(event) =>
                      updateValue(credential.env_var, event.target.value)
                    }
                    placeholder={credential.placeholder ?? ""}
                    rows={5}
                    value={values[credential.env_var] ?? ""}
                  />
                ) : (
                  <input
                    onChange={(event) =>
                      updateValue(credential.env_var, event.target.value)
                    }
                    placeholder={credential.placeholder ?? ""}
                    type={credential.type === "password" ? "password" : "text"}
                    value={values[credential.env_var] ?? ""}
                  />
                )}
              </label>
            ))}
          </div>
        ) : (
          <div className="muted-panel compact-muted-panel">
            <p>
              No hay campos para completar. La sesión mock se puede crear apenas
              confirmás este paso.
            </p>
          </div>
        )}

        {error ? <p className="form-error">{error}</p> : null}

        <div className="inline-actions">
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creando sesión..." : "Crear sesión mock"}
          </button>
          <Link className="nav-action ghost-button" href={`/marketplace/${bot?.slug ?? ""}`}>
            Volver al bot
          </Link>
        </div>
      </form>
    </section>
  );
}
