"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AcceptJobButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function accept() {
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(`/orders/${orderId}`);
    }
  }

  return (
    <button
      onClick={accept}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
    >
      {loading ? "Accepting…" : "Accept Job"}
    </button>
  );
}
