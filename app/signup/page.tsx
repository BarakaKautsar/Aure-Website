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
    dateOfBirth: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch =
    form.password.length > 0 &&
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword;

  // Validation
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

  const dobError =
    form.dateOfBirth.length > 0
      ? (() => {
          const dob = new Date(form.dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();

          if (isNaN(dob.getTime())) return "Invalid date";
          if (dob > today) return "Date cannot be in the future";
          if (age < 13) return "You must be at least 13 years old";
          if (age > 120) return "Please enter a valid date of birth";

          return null;
        })()
      : null;

  const addressError =
    form.address.trim().length > 0 && form.address.trim().length < 10
      ? "Address must be at least 10 characters"
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
    form.name.trim().length >= 2 &&
    form.email.includes("@") &&
    form.phone.length > 0 &&
    form.dateOfBirth.length > 0 &&
    form.address.trim().length >= 10 &&
    form.password.length >= 6 &&
    passwordsMatch &&
    !nameError &&
    !emailError &&
    !phoneError &&
    !dobError &&
    !addressError &&
    !passwordError &&
    !confirmPasswordError &&
    status !== "loading";

  const inputBase =
    "w-full border border-[#D1D5DB] rounded-xl px-4 py-3 bg-white text-[#2F3E55] focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

    // Validate DOB
    const dob = new Date(form.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();

    if (age < 13) {
      setErrorMessage("You must be at least 13 years old to sign up");
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
      setErrorMessage(error?.message || "Failed to create account");
      setStatus("error");
      return;
    }

    // 2. Update profile with all data including DOB and address
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: form.name,
        phone_number: form.phone,
        email: form.email,
        date_of_birth: form.dateOfBirth,
        address: form.address,
      })
      .eq("id", data.user.id);

    if (profileError) {
      console.error(profileError);
      setErrorMessage("Failed to save profile information");
      setStatus("error");
      return;
    }

    // 3. Send welcome email
    try {
      await fetch("/api/send-email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: form.email,
          userName: form.name,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't block signup if email fails
    }

    // 4. Redirect to login
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
      setErrorMessage(error.message);
      setStatus("error");
    }
    // If successful, user will be redirected to Google
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center py-12">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/login.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-lg p-10 my-8">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              Full Name *
            </label>
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className={`${inputBase} ${
                nameError && form.name.length > 0 ? "border-red-500" : ""
              }`}
              required
            />
            {nameError && form.name.length > 0 && (
              <p className="text-xs text-red-500 mt-1">{nameError}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">Email *</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className={`${inputBase} ${
                emailError && form.email.length > 0 ? "border-red-500" : ""
              }`}
              required
            />
            {emailError && form.email.length > 0 && (
              <p className="text-xs text-red-500 mt-1">{emailError}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              Phone Number *
            </label>
            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className={`${inputBase} ${
                phoneError && form.phone.length > 0 ? "border-red-500" : ""
              }`}
              required
            />
            {phoneError && form.phone.length > 0 && (
              <p className="text-xs text-red-500 mt-1">{phoneError}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              Date of Birth *
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              className={`${inputBase} ${
                dobError && form.dateOfBirth.length > 0 ? "border-red-500" : ""
              }`}
              required
            />
            {dobError && form.dateOfBirth.length > 0 && (
              <p className="text-xs text-red-500 mt-1">{dobError}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              Address *
            </label>
            <textarea
              name="address"
              placeholder="Full Address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              className={`${inputBase} resize-none ${
                addressError && form.address.length > 0 ? "border-red-500" : ""
              }`}
              required
            />
            {addressError && form.address.length > 0 && (
              <p className="text-xs text-red-500 mt-1">{addressError}</p>
            )}
          </div>

          {/* Password with Show/Hide */}
          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password (min. 6 characters)"
                value={form.password}
                onChange={handleChange}
                className={`${inputBase} pr-12 ${
                  passwordError && form.password.length > 0
                    ? "border-red-500"
                    : ""
                }`}
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
            {passwordError && form.password.length > 0 && (
              <p className="text-xs text-red-500 mt-1">{passwordError}</p>
            )}
          </div>

          {/* Confirm Password with Show/Hide */}
          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Retype Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`${inputBase} pr-12 ${
                  confirmPasswordError && form.confirmPassword.length > 0
                    ? "border-red-500"
                    : ""
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#2F3E55] hover:opacity-70"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {form.confirmPassword.length > 0 && (
              <p
                className={`text-xs mt-1 ${
                  passwordsMatch ? "text-green-600" : "text-red-500"
                }`}
              >
                {passwordsMatch
                  ? "✓ Passwords match"
                  : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          {errorMessage && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
              {errorMessage}
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
