"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShirtIcon } from "lucide-react";

export default function SetupGenderPage() {
  const router = useRouter();
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!gender) {
      setError("Please select your gender.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/user/gender", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gender }),
    });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <ShirtIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">One more step</h1>
          <p className="mt-2 text-sm text-gray-500">
            Tell us your gender so customers can choose their preferred runner.
          </p>
        </div>

        <div className="card p-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGender("MALE")}
              className={`rounded-xl border-2 py-4 text-sm font-semibold transition-all ${
                gender === "MALE"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => setGender("FEMALE")}
              className={`rounded-xl border-2 py-4 text-sm font-semibold transition-all ${
                gender === "FEMALE"
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              Female
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading || !gender}
            className="btn-primary mt-4 w-full py-3"
          >
            {loading ? "Saving…" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
