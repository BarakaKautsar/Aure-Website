"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  const inputBase =
    "w-full border border-[#D1D5DB] rounded-xl px-4 py-3 bg-white text-[#2F3E55] focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Fake email send – replace with Supabase later
    setTimeout(() => {
      setStatus("sent");
    }, 1000);
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/login.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-lg p-10">
        <h1 className="text-4xl font-light text-center text-[#2F3E55] mb-4">
          Forgot Password
        </h1>

        {status === "sent" ? (
          <p className="text-center text-[#2F3E55]">
            If an account exists for <strong>{email}</strong>, you’ll receive an
            email with instructions to reset your password.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-sm text-[#2F3E55] text-center">
              Enter your email address and we’ll send you instructions to reset
              your password.
            </p>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputBase}
              required
            />

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-[#2F3E55] text-white py-3 rounded-xl hover:opacity-90 transition disabled:opacity-60"
            >
              {status === "loading" ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-[#2F3E55] mt-6">
          <Link href="/login" className="underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
