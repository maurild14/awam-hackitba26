"use client";

import { normalizeBotMutationInput } from "@awam/shared/botMetadata";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiRequest } from "../lib/api.js";
import StatusBadge from "./StatusBadge.js";

function createEmptyCredential() {
  return {
    env_var: "",
    label: "",
    type: "password",
    required: true,
    placeholder: "",
    description: ""
  };
}

/**
 * @param {Record<string, unknown>} credential
 */
function isCredentialRowBlank(credential) {
  return (
    typeof credential.env_var === "string" &&
    credential.env_var.trim() === "" &&
    typeof credential.label === "string" &&
    credential.label.trim() === "" &&
    typeof credential.placeholder === "string" &&
    credential.placeholder.trim() === "" &&
    typeof credential.description === "string" &&
    credential.description.trim() === ""
  );
}

/**
 * @param {{
 *   initialBot?: any,
 *   mode: "create" | "edit"
 * }} props
 */
export default function SellerBotForm({ initialBot, mode }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialBot?.title ?? "");
  const [description, setDescription] = useState(initialBot?.description ?? "");
  const [priceArs, setPriceArs] = useState(String(initialBot?.price_ars ?? 0));
  const [category, setCategory] = useState(initialBot?.category ?? "");
  const [imageUri, setImageUri] = useState(initialBot?.image_uri ?? "");
  const [domainsText, setDomainsText] = useState(
    initialBot?.allowed_domains?.join("\n") ?? ""
  );
  const [cpu, setCpu] = useState(String(initialBot?.resources?.cpu ?? 1));
  const [memoryMb, setMemoryMb] = useState(
    String(initialBot?.resources?.memory_mb ?? 512)
  );
  const [maxMinutes, setMaxMinutes] = useState(
    String(initialBot?.resources?.max_minutes ?? 10)
  );
  const [credentials, setCredentials] = useState(
    initialBot?.credential_schema?.length > 0
      ? initialBot.credential_schema.map((credential) => ({
          env_var: credential.env_var ?? "",
          label: credential.label ?? "",
          type: credential.type ?? "password",
          required: Boolean(credential.required),
          placeholder: credential.placeholder ?? "",
          description: credential.description ?? ""
        }))
      : []
  );
  const [submissionStatus, setSubmissionStatus] = useState(
    !initialBot
      ? "draft"
      : ["draft", "pending_review"].includes(initialBot.status)
        ? initialBot.status
        : ""
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStatus = initialBot?.status ?? "draft";
  const canChooseStatus =
    mode === "create" || ["draft", "pending_review"].includes(currentStatus);

  function updateCredentialRow(index, patch) {
    setCredentials((currentCredentials) =>
      currentCredentials.map((credential, credentialIndex) =>
        credentialIndex === index
          ? {
              ...credential,
              ...patch
            }
          : credential
      )
    );
  }

  function addCredentialRow() {
    setCredentials((currentCredentials) => [
      ...currentCredentials,
      createEmptyCredential()
    ]);
  }

  function removeCredentialRow(index) {
    setCredentials((currentCredentials) =>
      currentCredentials.filter((_, credentialIndex) => credentialIndex !== index)
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const credentialPayload = credentials
        .filter((credential) => !isCredentialRowBlank(credential))
        .map((credential) => ({
          ...credential,
          env_var: credential.env_var.trim(),
          label: credential.label.trim(),
          placeholder: credential.placeholder.trim(),
          description: credential.description.trim()
        }));
      const payload = {
        title,
        description,
        price_ars: Number(priceArs),
        category,
        image_uri: imageUri.trim(),
        credential_schema: credentialPayload,
        allowed_domains: domainsText
          .split(/\r?\n/)
          .map((domain) => domain.trim())
          .filter(Boolean),
        resources: {
          cpu: Number(cpu),
          memory_mb: Number(memoryMb),
          max_minutes: Number(maxMinutes)
        },
        ...(canChooseStatus && submissionStatus
          ? {
              status: submissionStatus
            }
          : {})
      };

      normalizeBotMutationInput(payload);

      await apiRequest(
        mode === "create"
          ? "/api/v1/seller/bots"
          : `/api/v1/seller/bots/${initialBot.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          body: payload
        }
      );

      router.push("/seller/bots");
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo guardar el agente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="workspace-card">
      <div className="workspace-card-head">
        <div>
          <p className="eyebrow">Seller metadata</p>
          <h1>{mode === "create" ? "Crear agente" : "Editar agente"}</h1>
          <p className="lead compact">
            Definí la metadata pública y la configuración que luego usarán build,
            checkout, proxy y runtime.
          </p>
        </div>
        {initialBot ? <StatusBadge status={currentStatus} /> : null}
      </div>

      <form className="bot-form" onSubmit={handleSubmit}>
        <section className="editor-section">
          <div className="section-head">
            <h2>Presentación pública</h2>
            <p>Esta información aparece en landing, marketplace y detalle.</p>
          </div>

          <div className="form-grid two-columns">
            <label>
              <span>Título</span>
              <input
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Agente de research para ventas"
                required
                value={title}
              />
            </label>

            <label>
              <span>Categoría</span>
              <input
                onChange={(event) => setCategory(event.target.value)}
                placeholder="sales, operations, research..."
                required
                value={category}
              />
            </label>

            <label>
              <span>Precio por ejecución (ARS)</span>
              <input
                min="0"
                onChange={(event) => setPriceArs(event.target.value)}
                required
                type="number"
                value={priceArs}
              />
            </label>

            <label>
              <span>Imagen o thumbnail</span>
              <input
                onChange={(event) => setImageUri(event.target.value)}
                placeholder="https://..."
                type="url"
                value={imageUri}
              />
            </label>
          </div>

          <label>
            <span>Descripción</span>
            <textarea
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Explicá qué problema resuelve, qué entrega y cómo ayuda al buyer."
              required
              rows={5}
              value={description}
            />
          </label>
        </section>

        <section className="editor-section">
          <div className="section-head">
            <h2>Credenciales requeridas</h2>
            <p>
              Si el agente no necesita credenciales del buyer, dejá la lista vacía.
            </p>
          </div>

          <div className="credential-list">
            {credentials.length === 0 ? (
              <div className="muted-panel">
                <p>No agregaste credenciales todavía.</p>
              </div>
            ) : null}

            {credentials.map((credential, index) => (
              <article className="credential-card" key={`credential-${index}`}>
                <div className="credential-grid">
                  <label>
                    <span>ENV_VAR</span>
                    <input
                      onChange={(event) =>
                        updateCredentialRow(index, {
                          env_var: event.target.value
                        })
                      }
                      placeholder="OPENAI_API_KEY"
                      value={credential.env_var}
                    />
                  </label>

                  <label>
                    <span>Label visible</span>
                    <input
                      onChange={(event) =>
                        updateCredentialRow(index, {
                          label: event.target.value
                        })
                      }
                      placeholder="OpenAI API key"
                      value={credential.label}
                    />
                  </label>

                  <label>
                    <span>Tipo</span>
                    <select
                      onChange={(event) =>
                        updateCredentialRow(index, {
                          type: event.target.value
                        })
                      }
                      value={credential.type}
                    >
                      <option value="password">password</option>
                      <option value="text">text</option>
                      <option value="textarea">textarea</option>
                    </select>
                  </label>

                  <label className="checkbox-field">
                    <input
                      checked={credential.required}
                      onChange={(event) =>
                        updateCredentialRow(index, {
                          required: event.target.checked
                        })
                      }
                      type="checkbox"
                    />
                    <span>Campo obligatorio</span>
                  </label>

                  <label>
                    <span>Placeholder</span>
                    <input
                      onChange={(event) =>
                        updateCredentialRow(index, {
                          placeholder: event.target.value
                        })
                      }
                      placeholder="sk-..."
                      value={credential.placeholder}
                    />
                  </label>

                  <label>
                    <span>Descripción</span>
                    <input
                      onChange={(event) =>
                        updateCredentialRow(index, {
                          description: event.target.value
                        })
                      }
                      placeholder="Solo se usa durante la ejecución."
                      value={credential.description}
                    />
                  </label>
                </div>

                <button
                  className="nav-action ghost-button"
                  onClick={() => removeCredentialRow(index)}
                  type="button"
                >
                  Eliminar credencial
                </button>
              </article>
            ))}
          </div>

          <button
            className="nav-action ghost-button"
            onClick={addCredentialRow}
            type="button"
          >
            Agregar credencial
          </button>
        </section>

        <section className="editor-section">
          <div className="section-head">
            <h2>Allowed domains y recursos</h2>
            <p>
              Estas definiciones quedan listas para milestones de proxy, runtime y
              checkout.
            </p>
          </div>

          <label>
            <span>Allowed domains</span>
            <textarea
              onChange={(event) => setDomainsText(event.target.value)}
              placeholder={"api.openai.com\nsheets.googleapis.com"}
              rows={5}
              value={domainsText}
            />
          </label>

          <div className="form-grid three-columns">
            <label>
              <span>CPU</span>
              <input
                min="0.1"
                onChange={(event) => setCpu(event.target.value)}
                required
                step="0.1"
                type="number"
                value={cpu}
              />
            </label>

            <label>
              <span>Memoria (MB)</span>
              <input
                min="1"
                onChange={(event) => setMemoryMb(event.target.value)}
                required
                step="1"
                type="number"
                value={memoryMb}
              />
            </label>

            <label>
              <span>Tiempo máximo (min)</span>
              <input
                min="1"
                onChange={(event) => setMaxMinutes(event.target.value)}
                required
                step="1"
                type="number"
                value={maxMinutes}
              />
            </label>
          </div>
        </section>

        <section className="editor-section">
          <div className="section-head">
            <h2>Estado editorial</h2>
            <p>
              El seller solo puede guardar en draft o enviar a pending_review. La
              publicación final la decide admin.
            </p>
          </div>

          {canChooseStatus ? (
            <label>
              <span>Estado al guardar</span>
              <select
                onChange={(event) => setSubmissionStatus(event.target.value)}
                value={submissionStatus}
              >
                <option value="draft">draft</option>
                <option value="pending_review">pending_review</option>
              </select>
            </label>
          ) : (
            <div className="muted-panel">
              <p>
                Este agente está en <strong>{currentStatus}</strong>. Podés editar
                metadata, pero la visibilidad pública sigue controlada por admin.
              </p>
            </div>
          )}
        </section>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="form-actions">
          <Link className="nav-action ghost-button" href="/seller/bots">
            Volver al panel
          </Link>
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? "Guardando..."
              : mode === "create"
                ? "Crear agente"
                : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
