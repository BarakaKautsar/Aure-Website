"use client";

import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

export default function SignupPage() {
  const router = useRouter();

  const isPasswordValid = (password: string) => password.length >= 6;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const passwordsMatch =
    form.password.length > 0 &&
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword;

  const nameError =
    form.name.trim().length < 2
      ? "Full name must be at least 2 characters"
      : null;

  const emailError =
    form.email.length > 0 && !form.email.includes("@")
      ? "Invalid email address"
      : null;

  const phoneError =
    form.phone.length > 0 && !/^[0-9+\s-]+$/.test(form.phone)
      ? "Invalid phone number"
      : null;

  const passwordError =
    form.password.length > 0 && form.password.length < 6
      ? "Password must be at least 6 characters"
      : null;

  const confirmPasswordError =
    form.confirmPassword.length > 0 && !passwordsMatch
      ? "Passwords do not match"
      : null;

  const canSubmit =
    !nameError &&
    !emailError &&
    !phoneError &&
    !passwordError &&
    !confirmPasswordError &&
    status !== "loading";

  const inputBase =
    "w-full border border-[#D1D5DB] rounded-xl px-4 py-3 bg-white text-[#2F3E55] focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    if (!isPasswordValid(form.password)) {
      setStatus("error");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setStatus("error");
      return;
    }

    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
          phone_number: form.phone,
        },
      },
    });

    if (error || !data.user) {
      console.error(error);
      setStatus("error");
      return;
    }

    // 2. Update profile with name & phone
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: form.name,
        phone_number: form.phone,
        email: form.email,
      })
      .eq("id", data.user.id);

    if (profileError) {
      console.error(profileError);
      setStatus("error");
      return;
    }

    // 3. Redirect to login
    router.push("/login");
  };

  const handleGoogleSignUp = async () => {
    setStatus("loading");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/`,
      },
    });

    if (error) {
      console.error(error);
      setStatus("error");
    }
    // If successful, user will be redirected to Google
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/login.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-lg p-10">
        <h1 className="text-4xl font-light text-center text-[#2F3E55] mb-8">
          Sign Up
        </h1>

        {/* Google Sign Up Button - First */}
        <button
          onClick={handleGoogleSignUp}
          disabled={status === "loading"}
          className="w-full border rounded-xl py-3 flex items-center justify-center gap-3 hover:bg-gray-50 disabled:opacity-60 transition mb-6"
        >
          <FcGoogle size={20} />
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-sm text-gray-400">or</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className={inputBase}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className={inputBase}
            required
          />

          <input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className={inputBase}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className={inputBase}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Retype Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={inputBase}
            required
          />

          {form.confirmPassword.length > 0 && (
            <p
              className={`text-sm ${
                passwordsMatch ? "text-green-600" : "text-red-500"
              }`}
            >
              {passwordsMatch ? "Passwords match" : "Passwords do not match"}
            </p>
          )}

          {status === "error" && (
            <p className="text-sm text-red-500">
              Password must be at least 6 characters and match confirmation
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-3 rounded-xl transition ${
              canSubmit
                ? "bg-[#2F3E55] text-white hover:opacity-90"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {status === "loading" ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-[#2F3E55] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
