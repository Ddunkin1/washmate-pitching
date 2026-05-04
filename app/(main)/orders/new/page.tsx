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
  const [itemQty, setItemQty] = useState<Record<string, number>>({});
  const [popup, setPopup] = useState<{ item: string; input: string; error: string } | null>(null);
  const [form, setForm] = useState({
    pickupLocation: "",
    deliveryLocation: "",
    scheduledPickup: "",
    weight: "1",
    specialInstructions: "",
  });
  const [genderPref, setGenderPref] = useState("ANY");
  const INTIMATE_ITEMS = ["Underwear"];
  const selectedItems = Object.keys(itemQty).filter((k) => itemQty[k] > 0);
  const hasIntimateItems = selectedItems.some((i) => INTIMATE_ITEMS.includes(i));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function openPopup(item: string) {
    setPopup({ item, input: itemQty[item] ? String(itemQty[item]) : "", error: "" });
  }

  function closePopup() {
    setPopup(null);
  }

  function confirmPopup() {
    if (!popup) return;
    const qty = parseInt(popup.input);
    if (!popup.input || isNaN(qty) || qty < 1) {
      setPopup((p) => p ? { ...p, error: "Please enter a valid number (at least 1)." } : p);
      return;
    }
    setItemQty((prev) => ({ ...prev, [popup.item]: qty }));
    setPopup(null);
  }

  function removeItem(item: string) {
    setItemQty((prev) => {
      const next = { ...prev };
      delete next[item];
      return next;
    });
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const BEDSHEET_SURCHARGE = 10;
  const hasBedsheets = selectedItems.includes("Bedsheets");
  const basePrice = parseFloat(form.weight || "1") * 25;
  const estimatedPrice = basePrice + (hasBedsheets ? BEDSHEET_SURCHARGE : 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setError("Please select at least one laundry item.");
      return;
    }
    setLoading(true);
    setError("");

    const items = Object.entries(itemQty)
      .filter(([, qty]) => qty > 0)
      .map(([name, qty]) => ({ name, qty }));

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items, runnerGenderPreference: genderPref }),
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
      {/* Quantity Popup */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={closePopup}>
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 text-lg font-bold text-gray-900">How many?</h3>
            <p className="mb-4 text-sm text-gray-500">
              Enter the number of <span className="font-semibold text-blue-600">{popup.item}</span> to include.
            </p>
            <input
              type="number"
              min={1}
              max={99}
              autoFocus
              className="input mb-1 text-center text-2xl font-bold"
              placeholder="e.g. 5"
              value={popup.input}
              onChange={(e) => setPopup((p) => p ? { ...p, input: e.target.value, error: "" } : p)}
              onKeyDown={(e) => e.key === "Enter" && confirmPopup()}
            />
            {popup.error && (
              <p className="mb-3 text-xs text-red-500">{popup.error}</p>
            )}
            <div className="mt-4 flex gap-2">
              {itemQty[popup.item] && (
                <button
                  type="button"
                  onClick={() => { removeItem(popup.item); closePopup(); }}
                  className="flex-1 rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              )}
              <button
                type="button"
                onClick={closePopup}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPopup}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

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
              const qty = itemQty[item] ?? 0;
              const selected = qty > 0;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => openPopup(item)}
                  className={`relative rounded-xl border px-3 py-3 text-left transition-all ${
                    selected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
                  }`}
                >
                  {selected && (
                    <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white shadow">
                      {qty}
                    </span>
                  )}
                  <span className={`block text-sm font-medium leading-tight ${selected ? "text-blue-700" : "text-gray-700"}`}>
                    {selected && <span className="mr-1 text-blue-400">✓</span>}
                    {item}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-gray-400">
                    {selected ? "tap to edit" : "tap to add"}
                  </span>
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

        {/* Runner Gender Preference */}
        <div className={`card p-6 ${hasIntimateItems ? "border-pink-200 bg-pink-50" : ""}`}>
          <h2 className="mb-1 font-semibold text-gray-900">Preferred Runner Gender</h2>
          {hasIntimateItems && (
            <p className="mb-3 text-xs text-pink-600">You have intimate items. Consider choosing a preferred runner gender for your comfort.</p>
          )}
          {!hasIntimateItems && (
            <p className="mb-3 text-xs text-gray-400">Optional. Choose if you prefer a male or female runner.</p>
          )}
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "ANY", label: "Any" },
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGenderPref(opt.value)}
                className={`rounded-lg border-2 py-2.5 text-sm font-semibold transition-all ${
                  genderPref === opt.value
                    ? opt.value === "FEMALE"
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Preview + Submit */}
        <div className="card p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="mb-2 text-sm font-semibold text-gray-700">Price Breakdown</p>
              <div className="space-y-1 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>{form.weight} kg × ₱25/kg</span>
                  <span>₱{basePrice.toFixed(2)}</span>
                </div>
                {hasBedsheets && (
                  <div className="flex justify-between text-orange-600">
                    <span>Bedsheet surcharge</span>
                    <span>+₱{BEDSHEET_SURCHARGE}.00</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-1 font-bold text-blue-600">
                  <span>Total</span>
                  <span className="text-2xl">₱{estimatedPrice.toFixed(2)}</span>
                </div>
              </div>
              {hasBedsheets && (
                <p className="mt-2 rounded-lg bg-orange-50 border border-orange-100 px-3 py-2 text-xs text-orange-600">
                  Bedsheets require extra handling effort — ₱10 surcharge added.
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary shrink-0 px-8 py-3 text-base"
            >
              {loading ? "Posting…" : "Post Order"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
