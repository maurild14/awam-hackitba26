"use client";

import { useEffect, useState } from "react";

import { API_BASE_URL } from "../lib/api.js";
import {
  formatSessionDateTime,
  formatSessionStatus,
  getSessionHeadline,
  getSessionStatusMessage,
  isTerminalSessionStatus
} from "../lib/sessions.js";

/**
 * @param {{
 *   initialSession: {
 *     id: string,
 *     status: string,
 *     created_at: string,
 *     started_at: string | null,
 *     completed_at: string | null,
 *     summary: string | null,
 *     error_message: string | null,
 *     latest_update: null | { message: string, created_at: string },
 *     logs: Array<{ id: string, message: string, created_at: string }>
 *   }
 * }} props
 */
export default function SessionProgress({ initialSession }) {
  const [session, setSession] = useState(initialSession);
  const [logs, setLogs] = useState(initialSession.logs ?? []);
  const [streamState, setStreamState] = useState(
    initialSession.status === "completed" ||
      initialSession.status === "failed" ||
      initialSession.status === "timed_out" ||
      initialSession.status === "stopped"
      ? "closed"
      : "connecting"
  );

  useEffect(() => {
    if (isTerminalSessionStatus(initialSession.status)) {
      return undefined;
    }

    const eventSource = new EventSource(
      `${API_BASE_URL}/api/v1/sessions/${initialSession.id}/stream`,
      {
        withCredentials: true
      }
    );

    eventSource.addEventListener("ready", () => {
      setStreamState("live");
    });

    eventSource.addEventListener("status", (event) => {
      const payload = JSON.parse(event.data);

      setSession((currentSession) => ({
        ...currentSession,
        status: payload.status ?? currentSession.status,
        started_at: payload.started_at ?? currentSession.started_at,
        completed_at: payload.completed_at ?? currentSession.completed_at,
        error_message: payload.error_message ?? currentSession.error_message,
        summary: payload.summary ?? currentSession.summary
      }));

      if (isTerminalSessionStatus(payload.status ?? "")) {
        setStreamState("closing");
      }
    });

    eventSource.addEventListener("log", (event) => {
      const payload = JSON.parse(event.data);

      setLogs((currentLogs) => {
        if (currentLogs.some((log) => log.id === payload.id)) {
          return currentLogs;
        }

        return [...currentLogs, payload];
      });
      setSession((currentSession) => ({
        ...currentSession,
        latest_update: {
          message: payload.message,
          created_at: payload.created_at
        }
      }));
    });

    eventSource.addEventListener("summary", (event) => {
      const payload = JSON.parse(event.data);

      setSession((currentSession) => ({
        ...currentSession,
        status: payload.status ?? currentSession.status,
        summary: payload.summary ?? currentSession.summary,
        error_message: payload.error_message ?? currentSession.error_message,
        completed_at: payload.completed_at ?? currentSession.completed_at,
        latest_update:
          payload.summary || payload.error_message
            ? {
                message: payload.summary ?? payload.error_message,
                created_at:
                  payload.completed_at ??
                  currentSession.completed_at ??
                  currentSession.created_at
              }
            : currentSession.latest_update
      }));
      setStreamState("closed");
      eventSource.close();
    });

    eventSource.onerror = () => {
      setStreamState((currentState) =>
        currentState === "closed" ? currentState : "reconnecting"
      );
    };

    return () => {
      setStreamState((currentState) =>
        currentState === "closed" ? currentState : "closed"
      );
      eventSource.close();
    };
  }, [initialSession.id, initialSession.status]);

  return (
    <section className="session-progress-layout">
      <article className="workspace-card">
        <div className="workspace-card-head">
          <div>
            <p className="eyebrow">Detalle de sesión</p>
            <h1>{getSessionHeadline(session.status)}</h1>
            <p className="lead compact">{getSessionStatusMessage(session.status)}</p>
          </div>
          <span className={`status-badge status-${session.status}`}>
            {formatSessionStatus(session.status)}
          </span>
        </div>

        <div className="detail-grid">
          <article className="detail-card">
            <span className="meta-label">Creada</span>
            <strong>{formatSessionDateTime(session.created_at)}</strong>
          </article>
          <article className="detail-card">
            <span className="meta-label">Inicio</span>
            <strong>{formatSessionDateTime(session.started_at)}</strong>
          </article>
          <article className="detail-card">
            <span className="meta-label">Cierre</span>
            <strong>{formatSessionDateTime(session.completed_at)}</strong>
          </article>
        </div>

        <div className="session-stream-state">
          <span className="meta-label">Streaming</span>
          <strong>
            {streamState === "live"
              ? "Conectado"
              : streamState === "reconnecting"
                ? "Reconectando"
                : streamState === "closing"
                  ? "Cerrando"
                  : "Cerrado"}
          </strong>
        </div>

        <div className="muted-panel compact-muted-panel">
          <p>
            {session.latest_update?.message ??
              "Todavía no hay mensajes buyer-facing para mostrar."}
          </p>
        </div>
      </article>

      <article className="workspace-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Progreso buyer-facing</span>
            <h2>Mensajes legibles de la ejecución</h2>
          </div>
          <p>
            Solo mostramos líneas con prefijo <code>PROGRESS:</code> ya limpiadas
            para el buyer.
          </p>
        </div>

        {logs.length === 0 ? (
          <div className="muted-panel compact-muted-panel">
            <p>La sesión todavía no emitió mensajes de progreso visibles.</p>
          </div>
        ) : (
          <div className="session-log-list">
            {logs.map((log) => (
              <article className="session-log-card" key={log.id}>
                <strong>{log.message}</strong>
                <span>{formatSessionDateTime(log.created_at)}</span>
              </article>
            ))}
          </div>
        )}
      </article>

      <article className="workspace-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Resultado final</span>
            <h2>Resumen de la sesión</h2>
          </div>
          <p>
            El resumen final queda persistido en <code>sessions.summary</code> para
            el buyer, sin incluir secretos.
          </p>
        </div>

        {session.summary ? (
          <div className="session-summary-card">
            <p>{session.summary}</p>
          </div>
        ) : session.error_message ? (
          <div className="session-summary-card session-summary-warning">
            <p>{session.error_message}</p>
          </div>
        ) : (
          <div className="muted-panel compact-muted-panel">
            <p>
              El resumen final todavía no está listo. Va a aparecer apenas la
              sesión alcance un estado terminal.
            </p>
          </div>
        )}
      </article>
    </section>
  );
}
