"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";

const STATUS_STEPS = ["PENDING", "ACCEPTED", "PICKED_UP", "WASHING", "READY", "DELIVERED"];
const STEP_LABELS = ["Posted", "Accepted", "Picked Up", "Washing", "Ready", "Done"];

export function OrderStatusRealtime({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Order", filter: `id=eq.${orderId}` },
        (payload) => {
          const newStatus = (payload.new as { status: string }).status;
          if (newStatus && newStatus !== status) {
            setStatus(newStatus);
            setFlash(true);
            setTimeout(() => setFlash(false), 2000);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  if (status === "CANCELLED") return null;

  const currentStep = STATUS_STEPS.indexOf(status);

  return (
    <div className={`card mb-6 p-6 transition-all duration-500 ${flash ? "ring-2 ring-blue-400 shadow-blue-100 shadow-lg" : ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Order Progress</h2>
        <span className={`badge ${ORDER_STATUS_COLORS[status]} text-sm px-3 py-1 transition-all duration-500`}>
          {ORDER_STATUS_LABELS[status]}
          {flash && <span className="ml-1 animate-pulse">•</span>}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {STATUS_STEPS.map((step, index) => (
          <div key={step} className="flex flex-1 items-center gap-1">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-500 ${
              index <= currentStep ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
            }`}>
              {index < currentStep ? "✓" : index + 1}
            </div>
            {index < STATUS_STEPS.length - 1 && (
              <div className={`h-1 flex-1 rounded-full transition-colors duration-500 ${index < currentStep ? "bg-blue-600" : "bg-gray-100"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-xs text-gray-400">
        {STEP_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
