"use client";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const isPasswordValid = (password: string) => password.length >= 6;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setErrorMessage(null);

    if (!isPasswordValid(form.password)) {
      setErrorMessage("Password must be at least 6 characters");
      setStatus("error");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Passwords do not match");
      setStatus("error");
      return;
    }

    try {
      // 1. Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (error) {
        setErrorMessage(error.message);
        setStatus("error");
        return;
      }

      if (!data.user) {
        setErrorMessage("Failed to create user");
        setStatus("error");
        return;
      }

      // 2. Update profile with name, phone, AND email
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: form.name,
          phone_number: form.phone,
          email: form.email, // ✅ Now saving email to profiles table
        })
        .eq("id", data.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        setErrorMessage(
          "Account created but profile update failed. Please contact support."
        );
        setStatus("error");
        return;
      }

      // 3. Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setStatus("error");
    }
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

          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                className={inputBase + " pr-12"}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#2F3E55] hover:opacity-70"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword2 ? "text" : "password"}
                name="confirmPassword"
                placeholder="Retype password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={inputBase + " pr-12"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword2((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#2F3E55] hover:opacity-70"
              >
                {showPassword2 ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {form.confirmPassword.length > 0 && (
            <p
              className={`text-sm ${
                passwordsMatch ? "text-green-600" : "text-red-500"
              }`}
            >
              {passwordsMatch ? "Passwords match" : "Passwords do not match"}
            </p>
          )}

          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
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
