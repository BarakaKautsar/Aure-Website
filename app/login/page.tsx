"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }

    router.push(redirectTo);
  };

  const inputBase =
    "w-full border border-[#D1D5DB] rounded-xl px-4 py-3 bg-white text-[#2F3E55] focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]";

  return (
    <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-lg p-10">
      <h1 className="text-4xl font-light text-center text-[#2F3E55] mb-8">
        {t.login.title}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm mb-1 text-[#2F3E55]">
            {t.login.email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputBase}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-[#2F3E55]">
            {t.login.password}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputBase + " pr-12"}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#2F3E55] hover:opacity-70"
            >
              {showPassword ? t.login.hide : t.login.show}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-[#2F3E55]"
            />
            {t.login.rememberMe}
          </label>

          <Link
            href="/forgot-password"
            className="text-[#2F3E55] hover:underline"
          >
            {t.login.forgotPassword}
          </Link>
        </div>

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-[#2F3E55] text-white py-3 rounded-xl mt-2 hover:opacity-90 transition disabled:opacity-60"
        >
          {status === "loading" ? t.login.loggingIn : t.login.loginButton}
        </button>
      </form>

      <p className="text-center text-sm text-[#2F3E55] mt-6">
        {t.login.noAccount}{" "}
        <Link href="/signup" className="underline">
          {t.login.signUp}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen relative flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/login.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />

      <Suspense
        fallback={
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-lg p-10">
            <p className="text-center text-[#2F3E55]">Loading...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
