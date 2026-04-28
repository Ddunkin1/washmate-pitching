"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShirtIcon, AlertCircleIcon, MailCheckIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function RegisterForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "CUSTOMER";

  const [role, setRole] = useState(defaultRole);
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    studentId: "",
    dormitory: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gender) {
      setError("Please select your gender.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          role: role,
          gender: gender,
          studentId: form.studentId,
          dormitory: form.dormitory,
          phone: form.phone,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="card p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <MailCheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Check your email</h2>
            <p className="mt-2 text-gray-500">
              We sent a verification link to{" "}
              <span className="font-semibold text-gray-800">{form.email}</span>.
              Click the link to activate your account.
            </p>
            <p className="mt-4 text-xs text-gray-400">
              Didn&apos;t receive it? Check your spam folder.
            </p>
            <Link href="/login" className="btn-secondary mt-6 w-full">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <ShirtIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">WashMate</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-1 text-sm text-gray-500">Join the campus laundry network</p>
        </div>

        <div className="card p-8">
          <div className="mb-6 flex rounded-xl border border-gray-200 p-1 bg-gray-50">
            <button
              type="button"
              onClick={() => setRole("CUSTOMER")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                role === "CUSTOMER"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              I need laundry done
            </button>
            <button
              type="button"
              onClick={() => setRole("RUNNER")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                role === "RUNNER"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              I want to earn (Runner)
            </button>
          </div>

          <div className="mb-6">
            <label className="label">Your Gender <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender("MALE")}
                className={`rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
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
                className={`rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                  gender === "FEMALE"
                    ? "border-pink-500 bg-pink-50 text-pink-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                Female
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertCircleIcon className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="input"
                  placeholder="Juan dela Cruz"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Student ID</label>
                <input
                  name="studentId"
                  type="text"
                  className="input"
                  placeholder="2021-00001"
                  value={form.studentId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <input
                name="email"
                type="email"
                required
                className="input"
                placeholder="you@school.edu.ph"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Dormitory / Building</label>
                <input
                  name="dormitory"
                  type="text"
                  className="input"
                  placeholder="Dorm A, Room 204"
                  value={form.dormitory}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  className="input"
                  placeholder="09XX-XXX-XXXX"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="input"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className="input"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 mt-2 ${
                role === "RUNNER"
                  ? "inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                  : "btn-primary"
              }`}
            >
              {loading ? "Creating account…" : role === "RUNNER" ? "Join as Runner" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
