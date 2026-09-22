"use client";

import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
  async function logout() {
    await authClient.signOut();
    window.location.href = "/";
  }

  return (
    <button
      onClick={logout}
      className="rounded-lg border px-4 py-2 text-sm"
    >
      Wyloguj
    </button>
  );
}