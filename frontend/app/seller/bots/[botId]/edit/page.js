import { notFound, redirect } from "next/navigation";

import SiteHeader from "../../../../../components/SiteHeader.js";
import SellerBotForm from "../../../../../components/SellerBotForm.js";
import {
  isNotFoundApiError,
  requireRoleOnServer
} from "../../../../../lib/session.js";
import {
  apiRequestOnServer,
  ApiRequestError
} from "../../../../../lib/server-api.js";

export const dynamic = "force-dynamic";

/**
 * @param {{ params: { botId: string } }} props
 */
export default async function EditSellerBotPage({ params }) {
  const user = await requireRoleOnServer(["seller"]);

  try {
    const response = await apiRequestOnServer(`/api/v1/seller/bots/${params.botId}`);

    return (
      <main className="app-shell workspace-shell">
        <SiteHeader context="workspace" user={user} />
        <SellerBotForm initialBot={response.bot} mode="edit" />
      </main>
    );
  } catch (error) {
    if (isNotFoundApiError(error)) {
      notFound();
    }

    if (error instanceof ApiRequestError && error.statusCode === 403) {
      redirect("/seller/bots");
    }

    throw error;
  }
}
