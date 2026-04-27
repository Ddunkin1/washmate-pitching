"use client";

import { useState } from "react";
import { StarIcon } from "lucide-react";

export function ReviewForm({ orderId }: { orderId: string }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch(`/api/orders/${orderId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to submit review.");
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="card p-6 text-center">
        <div className="mb-2 text-3xl">⭐</div>
        <p className="font-semibold text-gray-900">Review submitted!</p>
        <p className="mt-1 text-sm text-gray-500">Thank you for your feedback.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="mb-4 font-semibold text-gray-900">Leave a Review</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="mb-2 text-sm text-gray-600">Rate your experience</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110"
              >
                <StarIcon
                  className={`h-8 w-8 ${
                    star <= (hovered || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="label">
            Comment <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            id="comment"
            rows={3}
            className="input resize-none"
            placeholder="How was your experience?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? "Submitting…" : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
