import AdminBotsPanel from "../../../components/AdminBotsPanel.js";
import SiteHeader from "../../../components/SiteHeader.js";
import { requireRoleOnServer } from "../../../lib/session.js";
import { safeApiRequestOnServer } from "../../../lib/server-api.js";

export const dynamic = "force-dynamic";

export default async function AdminBotsPage() {
  const user = await requireRoleOnServer(["admin"]);
  const result = await safeApiRequestOnServer("/api/v1/admin/bots");
  const bots = result.data?.bots ?? [];

  return (
    <main className="app-shell workspace-shell">
      <SiteHeader context="workspace" user={user} />
      {result.error ? (
        <div className="muted-panel">
          <p>No pudimos cargar el flujo admin desde el backend.</p>
        </div>
      ) : (
        <AdminBotsPanel bots={bots} />
      )}
    </main>
  );
}
