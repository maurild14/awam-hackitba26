import { notFound } from "next/navigation";

import SessionProgress from "../../../../components/SessionProgress.js";
import SiteFooter from "../../../../components/SiteFooter.js";
import SiteHeader from "../../../../components/SiteHeader.js";
import {
  isNotFoundApiError,
  requireRoleOnServer
} from "../../../../lib/session.js";
import { apiRequestOnServer } from "../../../../lib/server-api.js";

export const dynamic = "force-dynamic";

/**
 * @param {{ params: { sessionId: string } }} props
 */
export default async function BuyerSessionDetailPage({ params }) {
  const user = await requireRoleOnServer(["buyer"]);

  try {
    const response = await apiRequestOnServer(
      `/api/v1/sessions/${params.sessionId}`
    );

    return (
      <main className="app-shell">
        <SiteHeader user={user} />
        <SessionProgress initialSession={response.session} />
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
          <p>No pudimos cargar esta sesión desde el backend en este momento.</p>
        </div>
        <SiteFooter />
      </main>
    );
  }
}
