"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="text-sm text-gray-500 underline"
    >
      {loading ? "Saindo..." : "Sair"}
    </button>
  );
}
