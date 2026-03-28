import { formatPaymentStatus } from "../lib/payments.js";

/**
 * @param {{ status: string }} props
 */
export default function PaymentStatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status}`}>
      {formatPaymentStatus(status)}
    </span>
  );
}
