import Link from "next/link";

import { formatCurrencyArs } from "../lib/bots.js";
import {
  getPaymentHeadline,
  getPaymentMessage
} from "../lib/payments.js";
import CredentialsForm from "./CredentialsForm.js";
import PaymentStatusBadge from "./PaymentStatusBadge.js";

/**
 * @param {{
 *   payment: {
 *     id: string,
 *     session_id: string | null,
 *     bot: null | {
 *       id: string,
 *       slug: string,
 *       title: string,
 *       description: string,
 *       category: string,
 *       price_ars: number,
 *       credential_schema: Array<{
 *         env_var: string,
 *         label: string,
 *         type: string,
 *         required: boolean,
 *         placeholder?: string | null,
 *         description?: string | null
 *       }>
 *     },
 *     amount_ars: number,
 *     commission_ars: number,
 *     status: string
 *   },
 *   checkout: {
 *     checkout_url: string | null,
 *     review_url: string,
 *     provider: string
 *   }
 * }} props
 */
export default function CheckoutFlow({ payment, checkout }) {
  const botHref = payment.bot?.slug
    ? `/marketplace/${payment.bot.slug}`
    : "/marketplace";
  const isPending = payment.status === "pending";
  const isApproved = payment.status === "approved";
  const hasSession = typeof payment.session_id === "string" && payment.session_id;

  return (
    <>
      <section className="checkout-hero">
        <article className="checkout-main-card">
          <div className="workspace-card-head">
            <div>
              <p className="eyebrow">Checkout M4</p>
              <h1>{getPaymentHeadline(payment.status)}</h1>
              <p className="lead compact">{getPaymentMessage(payment.status)}</p>
            </div>
            <PaymentStatusBadge status={payment.status} />
          </div>

          {payment.bot ? (
            <div className="checkout-bot-card">
              <div>
                <span className="category-chip">{payment.bot.category}</span>
                <h2>{payment.bot.title}</h2>
              </div>
              <p>{payment.bot.description}</p>
            </div>
          ) : (
            <div className="muted-panel compact-muted-panel">
              <p>El bot asociado ya no est\u00e1 disponible, pero el pago sigue registrado.</p>
            </div>
          )}

          <div className="detail-grid">
            <article className="detail-card">
              <span className="meta-label">Qu\u00e9 cierra este milestone</span>
              <p>
                Registro de pago dummy, formulario din\u00e1mico desde
                credential_schema y handoff directo hacia la sesi\u00f3n buyer-facing.
              </p>
            </article>
            <article className="detail-card">
              <span className="meta-label">Qu\u00e9 todav\u00eda no hacemos</span>
              <p>
                Seguimos usando mocks intercambiables. No hay Vault real, Redis
                real, proxy real ni runtime Docker real.
              </p>
            </article>
          </div>
        </article>

        <aside className="checkout-side-card">
          <span className="meta-label">Resumen del pago</span>
          <strong>{formatCurrencyArs(payment.amount_ars)}</strong>
          <div className="payment-breakdown">
            <div>
              <span>Monto del bot</span>
              <strong>{formatCurrencyArs(payment.amount_ars)}</strong>
            </div>
            <div>
              <span>Comisi\u00f3n registrada</span>
              <strong>{formatCurrencyArs(payment.commission_ars)}</strong>
            </div>
          </div>
          <p className="muted-line">
            La comisi\u00f3n se registra para el dominio de pagos, pero no representa un
            cargo extra en este checkout simb\u00f3lico.
          </p>

          {isPending && checkout.checkout_url ? (
            <a className="primary-button" href={checkout.checkout_url}>
              Ir al provider dummy
            </a>
          ) : hasSession ? (
            <Link className="primary-button" href={`/buyer/sessions/${payment.session_id}`}>
              Ver sesi\u00f3n
            </Link>
          ) : (
            <Link className="primary-button" href={botHref}>
              Volver al bot
            </Link>
          )}

          <Link className="nav-action ghost-button" href="/marketplace">
            Seguir explorando bots
          </Link>
        </aside>
      </section>

      <section
        className={`checkout-result-card checkout-result-${payment.status}`}
      >
        <div>
          <p className="eyebrow">Estado actual</p>
          <h2>{getPaymentHeadline(payment.status)}</h2>
        </div>
        <p>{getPaymentMessage(payment.status)}</p>
        {isPending ? (
          <p>
            Al salir del provider dummy vas a volver a esta pantalla para ver el
            resultado actualizado.
          </p>
        ) : isApproved && !hasSession ? (
          <p>
            El siguiente paso es completar las credenciales requeridas por el bot
            para crear una sesi\u00f3n mock y seguirla desde el dashboard buyer.
          </p>
        ) : hasSession ? (
          <p>
            Esta compra ya tiene una sesi\u00f3n asociada. Pod\u00e9s retomarla desde
            el detalle buyer-facing.
          </p>
        ) : (
          <p>
            Pod\u00e9s volver al detalle del bot y generar un nuevo intento de checkout
            si quer\u00e9s probar el otro resultado simb\u00f3lico.
          </p>
        )}
      </section>

      {isApproved && payment.bot && !hasSession ? (
        <CredentialsForm bot={payment.bot} paymentId={payment.id} />
      ) : null}

      {isApproved && hasSession ? (
        <section className="workspace-card session-launch-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Sesi\u00f3n en curso</p>
              <h2>Este checkout ya se transform\u00f3 en una ejecuci\u00f3n mock</h2>
            </div>
            <p>
              No volvemos a crear la sesi\u00f3n para el mismo payment aprobado. Te
              llevamos al detalle buyer-facing existente.
            </p>
          </div>

          <div className="inline-actions">
            <Link className="primary-button" href={`/buyer/sessions/${payment.session_id}`}>
              Abrir detalle de sesi\u00f3n
            </Link>
            <Link className="nav-action ghost-button" href="/buyer/sessions">
              Ver historial buyer
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}
