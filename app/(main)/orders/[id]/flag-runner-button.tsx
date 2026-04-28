"use client";

import { useState } from "react";
import { FlagIcon } from "lucide-react";

export function FlagRunnerButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!reason.trim()) {
      setError("Please enter a reason.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch(`/api/orders/${orderId}/flag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (res.ok) {
      setDone(true);
      setOpen(false);
    } else {
      setError(data.error || "Failed to submit flag.");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <p className="text-xs text-orange-600 font-medium">Flag submitted. Admin will review it.</p>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-orange-500 transition-colors"
      >
        <FlagIcon className="h-3.5 w-3.5" />
        Report runner
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-semibold text-gray-900">Report this runner</h3>
            <p className="mt-1 text-sm text-gray-500">
              Let us know what happened. The admin will review your report.
            </p>

            <div className="mt-4 space-y-2">
              {[
                "Gender mismatch — runner is not the preferred gender",
                "Rude or inappropriate behavior",
                "Damaged or lost items",
                "Other",
              ].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-all ${
                    reason === r
                      ? "border-orange-400 bg-orange-50 text-orange-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="btn-secondary flex-1 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !reason}
                className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {loading ? "Submitting…" : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
