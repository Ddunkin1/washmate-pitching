"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FlagActions({ flagId }: { flagId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(status: string) {
    setLoading(true);
    await fetch("/api/admin/flags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flagId, status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex shrink-0 gap-2">
      <button
        onClick={() => update("REVIEWED")}
        disabled={loading}
        className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
      >
        Reviewed
      </button>
      <button
        onClick={() => update("DISMISSED")}
        disabled={loading}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        Dismiss
      </button>
    </div>
  );
}
