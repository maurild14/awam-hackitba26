export const PAYMENT_STATUS_LABELS = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  refunded: "Reintegrado"
};

/**
 * @param {string} status
 */
export function formatPaymentStatus(status) {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

/**
 * @param {string} status
 */
export function getPaymentHeadline(status) {
  if (status === "approved") {
    return "Pago simb\u00f3lico aprobado";
  }

  if (status === "rejected") {
    return "Pago simb\u00f3lico rechazado";
  }

  return "Checkout pendiente";
}

/**
 * @param {string} status
 */
export function getPaymentMessage(status) {
  if (status === "approved") {
    return "El sistema ya registró este pago como aprobado. Ahora podés completar las credenciales para crear la sesión mock y seguir el progreso en tiempo real.";
  }

  if (status === "rejected") {
    return "El pago qued\u00f3 marcado como rechazado. No hubo cobro irreversible y pod\u00e9s volver al bot para intentar otro checkout simb\u00f3lico.";
  }

  return "Todav\u00eda no resolviste el pago simb\u00f3lico. Pod\u00e9s abrir el provider dummy para aprobarlo o rechazarlo sin crear una sesi\u00f3n.";
}
