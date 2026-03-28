"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiRequest } from "../lib/api.js";
import { formatCurrencyArs, formatDate } from "../lib/bots.js";
import StatusBadge from "./StatusBadge.js";

const adminStatuses = ["draft", "pending_review", "published", "suspended"];

/**
 * @param {{
 *   bots: Array<any>
 * }} props
 */
export default function AdminBotsPanel({ bots }) {
  const router = useRouter();
  const [pendingKey, setPendingKey] = useState("");
  const [error, setError] = useState("");

  async function handleStatusChange(botId, status) {
    const actionKey = `${botId}:${status}`;
    setPendingKey(actionKey);
    setError("");

    try {
      await apiRequest(`/api/v1/admin/bots/${botId}/status`, {
        method: "PATCH",
        body: {
          status
        }
      });
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo actualizar el estado."
      );
    } finally {
      setPendingKey("");
    }
  }

  return (
    <div className="workspace-card">
      <div className="workspace-card-head">
        <div>
          <p className="eyebrow">Admin review</p>
          <h1>Revisión editorial de agentes</h1>
          <p className="lead compact">
            Mové bots entre draft, pending_review, published y suspended sin tocar
            pagos, build ni runtime.
          </p>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="admin-bot-list">
        {bots.length === 0 ? (
          <div className="muted-panel">
            <p>No hay bots para revisar todavía.</p>
          </div>
        ) : null}

        {bots.map((bot) => (
          <article className="admin-bot-card" key={bot.id}>
            <div className="admin-bot-top">
              <div>
                <h2>{bot.title}</h2>
                <p>
                  Seller {bot.seller_username} · Creado {formatDate(bot.created_at)}
                </p>
              </div>
              <StatusBadge status={bot.status} />
            </div>

            <p className="admin-bot-description">{bot.description}</p>

            <div className="admin-metadata-row">
              <span>{formatCurrencyArs(bot.price_ars)}</span>
              <span>{bot.category}</span>
              <span>{bot.credential_schema.length} credenciales</span>
              <span>{bot.allowed_domains.length} dominios</span>
            </div>

            <div className="status-action-row">
              {adminStatuses.map((status) => {
                const actionKey = `${bot.id}:${status}`;

                return (
                  <button
                    className={
                      status === bot.status ? "nav-action ghost-button active-pill" : "nav-action ghost-button"
                    }
                    disabled={pendingKey === actionKey}
                    key={status}
                    onClick={() => handleStatusChange(bot.id, status)}
                    type="button"
                  >
                    {pendingKey === actionKey ? "Guardando..." : status}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
