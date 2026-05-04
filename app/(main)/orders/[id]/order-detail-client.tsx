"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { XIcon, CheckCircleIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { ReviewForm } from "./review-form";

const STATUS_STEPS = ["PENDING", "ACCEPTED", "PICKED_UP", "WASHING", "READY", "DELIVERED"];
const STEP_LABELS = ["Posted", "Accepted", "Picked Up", "Washing", "Ready", "Done"];

const RUNNER_ACTIONS: Record<string, { label: string; action: string }> = {
  PENDING:   { label: "Accept Job",          action: "accept"  },
  ACCEPTED:  { label: "Mark as Picked Up",   action: "pickup"  },
  PICKED_UP: { label: "Start Washing",       action: "wash"    },
  WASHING:   { label: "Mark as Ready",       action: "ready"   },
  READY:     { label: "Mark as Delivered",   action: "deliver" },
};

const ACTION_TO_STATUS: Record<string, string> = {
  accept:  "ACCEPTED",
  pickup:  "PICKED_UP",
  wash:    "WASHING",
  ready:   "READY",
  deliver: "DELIVERED",
  cancel:  "CANCELLED",
};

const CUSTOMER_TOASTS: Record<string, { emoji: string; message: string }> = {
  ACCEPTED:  { emoji: "🎉", message: "A runner has accepted your order!" },
  PICKED_UP: { emoji: "🧺", message: "Your laundry has been picked up!" },
  WASHING:   { emoji: "🫧", message: "Your laundry is now being washed!" },
  READY:     { emoji: "📦", message: "Your laundry is ready for delivery!" },
  DELIVERED: { emoji: "✅", message: "Your laundry has been delivered!" },
};

interface Props {
  orderId: string;
  initialStatus: string;
  isRunner: boolean;
  isCustomer: boolean;
  isAssignedRunner: boolean;
  existingReview: boolean;
}

export function OrderDetailClient({
  orderId,
  initialStatus,
  isRunner,
  isCustomer,
  isAssignedRunner: initialIsAssignedRunner,
  existingReview,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [isAssignedRunner, setIsAssignedRunner] = useState(initialIsAssignedRunner);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ emoji: string; message: string } | null>(null);
  const [flash, setFlash] = useState(false);

  const showToast = useCallback((t: { emoji: string; message: string }) => {
    setToast(t);
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`order-detail-${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Order", filter: `id=eq.${orderId}` },
        (payload) => {
          const newStatus = (payload.new as { status: string }).status;
          if (newStatus && newStatus !== status) {
            setStatus(newStatus);
            setFlash(true);
            setTimeout(() => setFlash(false), 2000);
            if (isCustomer && CUSTOMER_TOASTS[newStatus]) {
              showToast(CUSTOMER_TOASTS[newStatus]);
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, isCustomer, showToast]);

  async function doAction(action: string) {
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (res.ok) {
      const nextStatus = ACTION_TO_STATUS[action];
      if (nextStatus) {
        setStatus(nextStatus);
        setFlash(true);
        setTimeout(() => setFlash(false), 2000);
      }
      if (action === "accept") {
        setIsAssignedRunner(true);
        router.refresh();
      }
      if (action === "cancel") {
        router.refresh();
      }
    }
    setLoading(false);
  }

  const runnerAction =
    isRunner && (status === "PENDING" || isAssignedRunner)
      ? RUNNER_ACTIONS[status]
      : null;

  const canCancel = isCustomer && ["PENDING", "ACCEPTED"].includes(status);
  const canEdit = isCustomer && status === "PENDING";
  const showReview = status === "DELIVERED" && (isCustomer || isAssignedRunner) && !existingReview;
  const currentStep = STATUS_STEPS.indexOf(status);

  if (status === "CANCELLED") return null;

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 px-4 w-full max-w-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-gray-900 px-4 py-3.5 shadow-2xl shadow-black/20">
            <span className="text-2xl">{toast.emoji}</span>
            <p className="flex-1 text-sm font-semibold text-white">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className={`card mb-6 p-5 transition-all duration-500 ${flash ? "ring-2 ring-blue-400 shadow-lg shadow-blue-100" : ""}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Order Progress</h2>
          <span className={`badge ${ORDER_STATUS_COLORS[status]} text-sm px-3 py-1 transition-all duration-500`}>
            {ORDER_STATUS_LABELS[status]}
            {flash && <span className="ml-1 inline-block animate-pulse">•</span>}
          </span>
        </div>

        {/* Steps — desktop */}
        <div className="hidden sm:flex items-center gap-1">
          {STATUS_STEPS.map((step, index) => (
            <div key={step} className="flex flex-1 items-center gap-1">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${
                index <= currentStep ? "bg-blue-600 text-white scale-110" : "bg-gray-100 text-gray-400"
              }`}>
                {index < currentStep ? "✓" : index + 1}
              </div>
              {index < STATUS_STEPS.length - 1 && (
                <div className={`h-1 flex-1 rounded-full transition-all duration-700 ${index < currentStep ? "bg-blue-600" : "bg-gray-100"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 hidden sm:flex justify-between text-xs text-gray-400">
          {STEP_LABELS.map((label) => <span key={label}>{label}</span>)}
        </div>

        {/* Steps — mobile (vertical list) */}
        <div className="flex sm:hidden flex-col gap-2">
          {STATUS_STEPS.map((step, index) => {
            const isDone = index < currentStep;
            const isCurrent = index === currentStep;
            return (
              <div key={step} className="flex items-center gap-3">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${
                  isDone ? "bg-blue-600 text-white" : isCurrent ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-gray-100 text-gray-400"
                }`}>
                  {isDone ? "✓" : index + 1}
                </div>
                <span className={`text-sm font-medium ${isCurrent ? "text-blue-700" : isDone ? "text-gray-400 line-through" : "text-gray-400"}`}>
                  {STEP_LABELS[index]}
                </span>
                {isCurrent && (
                  <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Now</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      {(runnerAction || canCancel || canEdit) && (
        <div className="mb-6 flex flex-wrap gap-3">
          {runnerAction && (
            <button
              onClick={() => doAction(runnerAction.action)}
              disabled={loading}
              className="btn-primary flex items-center gap-2 px-6 py-3"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Updating…
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  {runnerAction.label}
                </>
              )}
            </button>
          )}
          {canEdit && (
            <Link href={`/orders/${orderId}/edit`} className="btn-secondary px-6 py-3">
              Edit Order
            </Link>
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
      )}

      {/* Review form */}
      {showReview && (
        <div className="mt-2">
          <ReviewForm orderId={orderId} />
        </div>
      )}
    </>
  );
}
