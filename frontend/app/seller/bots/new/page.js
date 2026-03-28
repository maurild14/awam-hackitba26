import SiteHeader from "../../../../components/SiteHeader.js";
import SellerBotForm from "../../../../components/SellerBotForm.js";
import { requireRoleOnServer } from "../../../../lib/session.js";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Crear agente | AWAM"
};

export default async function NewSellerBotPage() {
  const user = await requireRoleOnServer(["seller"]);

  return (
    <main className="app-shell workspace-shell">
      <SiteHeader context="workspace" user={user} />
      <SellerBotForm mode="create" />
    </main>
  );
}
