import { notFound } from "next/navigation";

import CheckoutFlow from "../../../components/CheckoutFlow.js";
import SiteFooter from "../../../components/SiteFooter.js";
import SiteHeader from "../../../components/SiteHeader.js";
import {
  isNotFoundApiError,
  requireRoleOnServer
} from "../../../lib/session.js";
import { apiRequestOnServer } from "../../../lib/server-api.js";

export const dynamic = "force-dynamic";

/**
 * @param {{ params: { paymentId: string } }} props
 */
export default async function CheckoutPage({ params }) {
  const user = await requireRoleOnServer(["buyer"]);

  try {
    const response = await apiRequestOnServer(
      `/api/v1/payments/${params.paymentId}`
    );

    return (
      <main className="app-shell">
        <SiteHeader user={user} />
        <CheckoutFlow checkout={response.checkout} payment={response.payment} />
        <SiteFooter />
      </main>
    );
  } catch (error) {
    if (isNotFoundApiError(error)) {
      notFound();
    }

    return (
      <main className="app-shell">
        <SiteHeader user={user} />
        <div className="muted-panel">
          <p>No pudimos cargar este checkout desde el backend en este momento.</p>
        </div>
        <SiteFooter />
      </main>
    );
  }
}
