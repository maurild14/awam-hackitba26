"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiRequest } from "../lib/api.js";

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      await apiRequest("/api/v1/auth/logout", {
        method: "POST",
        body: {}
      });
      router.push("/");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      className="nav-action ghost-button"
      disabled={isPending}
      onClick={handleLogout}
      type="button"
    >
      {isPending ? "Saliendo..." : "Cerrar sesión"}
    </button>
  );
}
