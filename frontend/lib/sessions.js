export const SESSION_STATUS_LABELS = {
  initializing: "Preparando",
  running: "En progreso",
  completed: "Completada",
  failed: "Falló",
  timed_out: "Tiempo agotado",
  stopped: "Detenida"
};

/**
 * @param {string} status
 */
export function formatSessionStatus(status) {
  return SESSION_STATUS_LABELS[status] ?? status;
}

/**
 * @param {string} status
 */
export function isTerminalSessionStatus(status) {
  return ["completed", "failed", "timed_out", "stopped"].includes(status);
}

/**
 * @param {string} status
 */
export function getSessionHeadline(status) {
  if (status === "completed") {
    return "Tu ejecución terminó bien";
  }

  if (status === "failed") {
    return "La ejecución no pudo completarse";
  }

  if (status === "timed_out") {
    return "La ejecución tardó más de lo esperado";
  }

  if (status === "stopped") {
    return "La ejecución se detuvo antes de terminar";
  }

  if (status === "running") {
    return "Tu agente ya está trabajando";
  }

  return "Estamos preparando tu ejecución";
}

/**
 * @param {string} status
 */
export function getSessionStatusMessage(status) {
  if (status === "completed") {
    return "Ya podés revisar el resumen final y el progreso que dejó la ejecución.";
  }

  if (status === "failed") {
    return "Mostramos solo el mensaje buyer-facing para que entiendas qué pasó sin exponer detalles internos.";
  }

  if (status === "timed_out") {
    return "La sesión se cerró automáticamente cuando llegó al límite esperado.";
  }

  if (status === "stopped") {
    return "La sesión quedó cerrada antes del resultado final.";
  }

  if (status === "running") {
    return "El progreso va entrando en tiempo real a medida que el runner mock emite mensajes buyer-facing.";
  }

  return "La sesión ya fue creada y está iniciando el flujo mock de ejecución.";
}

/**
 * @param {string | null | undefined} value
 */
export function formatSessionDateTime(value) {
  if (!value) {
    return "Todavía no disponible";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
