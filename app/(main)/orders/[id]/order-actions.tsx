"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  orderId: string;
  status: string;
  isRunner: boolean;
  isCustomer: boolean;
  isAssignedRunner: boolean;
};

const RUNNER_ACTIONS: Record<string, { label: string; action: string; style: string }> = {
  PENDING: { label: "Accept Job", action: "accept", style: "btn-primary" },
  ACCEPTED: { label: "Mark as Picked Up", action: "pickup", style: "btn-primary" },
  PICKED_UP: { label: "Start Washing", action: "wash", style: "btn-primary" },
  WASHING: { label: "Mark as Ready", action: "ready", style: "btn-primary" },
  READY: { label: "Mark as Delivered", action: "deliver", style: "btn-primary" },
};

export function OrderActions({
  orderId,
  status,
  isRunner,
  isCustomer,
  isAssignedRunner,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const runnerAction =
    isRunner && (status === "PENDING" || isAssignedRunner)
      ? RUNNER_ACTIONS[status]
      : null;

  const canCancel =
    isCustomer && ["PENDING", "ACCEPTED"].includes(status);

  async function doAction(action: string) {
    setLoading(true);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(false);
    router.refresh();
  }

  if (!runnerAction && !canCancel) return null;

  return (
    <div className="flex gap-3">
      {runnerAction && (
        <button
          onClick={() => doAction(runnerAction.action)}
          disabled={loading}
          className={`${runnerAction.style} px-6 py-3`}
        >
          {loading ? "Updating…" : runnerAction.label}
        </button>
      )}
      {canCancel && (
        <button
          onClick={() => doAction("cancel")}
          disabled={loading}
          className="btn-danger px-6 py-3"
        >
          {loading ? "Cancelling…" : "Cancel Order"}
        </button>
      )}
    </div>
  );
}
