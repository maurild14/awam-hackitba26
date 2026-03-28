"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiRequest } from "../lib/api.js";
import { formatCurrencyArs } from "../lib/bots.js";

/**
 * @param {{
 *   bot: {
 *     id: string,
 *     slug: string,
 *     price_ars: number
 *   },
 *   user: null | { role: string }
 * }} props
 */
export default function CheckoutStartPanel({ bot, user }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleStartCheckout() {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await apiRequest("/api/v1/payments/create-preference", {
        method: "POST",
        body: {
          bot_id: bot.id
        }
      });

      router.push(`/checkout/${response.payment.id}`);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo iniciar el checkout."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <span className="meta-label">Precio por ejecuci\u00f3n</span>
      <strong>{formatCurrencyArs(bot.price_ars)}</strong>
      <p>
        M4 habilita un checkout dummy para registrar la intenci\u00f3n de compra y el
        resultado del pago sin cobrar de forma irreversible ni crear una sesi\u00f3n.
      </p>

      {user?.role === "buyer" ? (
        <button
          className="primary-button"
          disabled={isSubmitting}
          onClick={handleStartCheckout}
          type="button"
        >
          {isSubmitting ? "Creando checkout..." : "Iniciar checkout simb\u00f3lico"}
        </button>
      ) : !user ? (
        <Link className="primary-button" href="/auth/login">
          Inici\u00e1 sesi\u00f3n para comprar
        </Link>
      ) : (
        <div className="muted-panel compact-muted-panel">
          <p>Solo un buyer autenticado puede iniciar checkout desde un bot publicado.</p>
        </div>
      )}

      {error ? <p className="form-error">{error}</p> : null}

      <Link className="nav-action ghost-button" href={`/marketplace/${bot.slug || bot.id}`}>
        Ver detalle del bot
      </Link>
      <Link className="nav-action ghost-button" href="/marketplace">
        Volver al marketplace
      </Link>
    </>
  );
}
