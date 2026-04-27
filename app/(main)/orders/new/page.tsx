"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircleIcon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

const LAUNDRY_ITEMS = [
  "T-Shirts",
  "Polo Shirts",
  "Pants / Jeans",
  "Shorts",
  "Dresses / Skirts",
  "School Uniform",
  "Socks",
  "Underwear",
  "Towels",
  "Bedsheets",
  "Pillowcases",
  "Jackets / Hoodies",
];

export default function NewOrderPage() {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [form, setForm] = useState({
    pickupLocation: "",
    deliveryLocation: "",
    scheduledPickup: "",
    weight: "1",
    specialInstructions: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleItem(item: string) {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const estimatedPrice = parseFloat(form.weight || "1") * 25;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setError("Please select at least one laundry item.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items: selectedItems }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create order.");
      setLoading(false);
      return;
    }

    router.push(`/orders/${data.id}`);
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Laundry Order</h1>
          <p className="text-sm text-gray-500">Fill in the details below to post your order.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircleIcon className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Items */}
        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-gray-900">
            Select Laundry Items <span className="text-red-500">*</span>
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {LAUNDRY_ITEMS.map((item) => {
              const selected = selectedItems.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleItem(item)}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-all ${
                    selected
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {selected ? "✓ " : ""}{item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Locations */}
        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Pickup & Delivery</h2>
          <div className="space-y-4">
            <div>
              <label className="label">
                Pickup Location <span className="text-red-500">*</span>
              </label>
              <input
                name="pickupLocation"
                type="text"
                required
                className="input"
                placeholder="e.g. Dorm A, Room 204"
                value={form.pickupLocation}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">
                Delivery Location <span className="text-red-500">*</span>
              </label>
              <input
                name="deliveryLocation"
                type="text"
                required
                className="input"
                placeholder="e.g. Same as pickup / Library"
                value={form.deliveryLocation}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="card p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Order Details</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Estimated Weight (kg)</label>
                <input
                  name="weight"
                  type="number"
                  min="0.5"
                  max="20"
                  step="0.5"
                  className="input"
                  value={form.weight}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-gray-400">₱25 per kilogram</p>
              </div>
              <div>
                <label className="label">Preferred Pickup Time</label>
                <input
                  name="scheduledPickup"
                  type="datetime-local"
                  className="input"
                  value={form.scheduledPickup}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="label">Special Instructions</label>
              <textarea
                name="specialInstructions"
                rows={3}
                className="input resize-none"
                placeholder="e.g. Please use fabric softener. Separate dark colors."
                value={form.specialInstructions}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    specialInstructions: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Price Preview + Submit */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Estimated Price</p>
              <p className="text-3xl font-bold text-blue-600">
                ₱{estimatedPrice.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">
                {form.weight} kg × ₱25/kg
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-8 py-3 text-base"
            >
              {loading ? "Posting…" : "Post Order"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
