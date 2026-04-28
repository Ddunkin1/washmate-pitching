"use client";

import { useState } from "react";

export function GenderEdit({ currentGender }: { currentGender: string | null }) {
  const [gender, setGender] = useState(currentGender ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  async function handleSave(value: string) {
    setLoading(true);
    const res = await fetch("/api/user/gender", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gender: value }),
    });
    if (res.ok) {
      setGender(value);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    }
    setLoading(false);
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          gender === "FEMALE" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
        }`}>
          {gender === "FEMALE" ? "Female" : "Male"}
        </span>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-gray-400 hover:text-blue-600 underline"
        >
          {saved ? "Saved!" : "Edit"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={loading}
        onClick={() => handleSave("MALE")}
        className={`rounded-lg border-2 px-3 py-1.5 text-xs font-semibold transition-all ${
          gender === "MALE" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500"
        }`}
      >
        Male
      </button>
      <button
        disabled={loading}
        onClick={() => handleSave("FEMALE")}
        className={`rounded-lg border-2 px-3 py-1.5 text-xs font-semibold transition-all ${
          gender === "FEMALE" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-gray-200 text-gray-500"
        }`}
      >
        Female
      </button>
      <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-600">
        Cancel
      </button>
    </div>
  );
}
