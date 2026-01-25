"use client";

import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();

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

  const nameError =
    form.name.trim().length > 0 && form.name.trim().length < 2
      ? t.signup.errors.nameTooShort
      : null;

  const emailError =
    form.email.length > 0 && !form.email.includes("@")
      ? t.signup.errors.invalidEmail
      : null;

  const phoneError =
    form.phone.length > 0 && !/^[0-9+\s-]+$/.test(form.phone)
      ? t.signup.errors.invalidPhone
      : null;

  const dobError =
    form.dateOfBirth.length > 0
      ? (() => {
          const dob = new Date(form.dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();
          if (isNaN(dob.getTime())) return t.signup.errors.invalidDate;
          if (dob > today) return t.signup.errors.dateFuture;
          if (age < 13) return t.signup.errors.ageMinimum;
          if (age > 120) return t.signup.errors.ageMaximum;
          return null;
        })()
      : null;

  const addressError =
    form.address.trim().length > 0 && form.address.trim().length < 10
      ? t.signup.errors.addressTooShort
      : null;

  const passwordError =
    form.password.length > 0 && form.password.length < 6
      ? t.signup.errors.passwordTooShort
      : null;

  const confirmPasswordError =
    form.confirmPassword.length > 0 && !passwordsMatch
      ? t.signup.passwordsNoMatch
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error message when user starts typing again
    if (errorMessage) setErrorMessage(null);
  };

  // Normalize phone number - remove all non-digits except leading +
  const normalizePhone = (phone: string): string => {
    // Remove all spaces, dashes, parentheses
    let normalized = phone.replace(/[\s\-\(\)]/g, "");

    // Convert +62 to 0 for Indonesian numbers
    if (normalized.startsWith("+62")) {
      normalized = "0" + normalized.slice(3);
    } else if (normalized.startsWith("62")) {
      normalized = "0" + normalized.slice(2);
    }

    return normalized;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    // Validation checks
    if (form.password.length < 6) {
      setErrorMessage(t.signup.errors.passwordTooShort);
      setStatus("error");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage(t.signup.passwordsNoMatch);
      setStatus("error");
      return;
    }

    const dob = new Date(form.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();

    if (age < 13) {
      setErrorMessage(t.signup.errors.ageMinimum);
      setStatus("error");
      return;
    }

    // Check if email already exists
    const emailToCheck = form.email.toLowerCase().trim();
    const { data: existingEmail, error: emailCheckError } = await supabase
      .from("profiles")
      .select("id, email")
      .ilike("email", emailToCheck)
      .limit(1);

    if (emailCheckError) {
      console.error("Email check error:", emailCheckError);
    }

    if (existingEmail && existingEmail.length > 0) {
      setErrorMessage(
        t.signup.errors?.emailExists ||
          "This email is already registered. Please contact us if this is a mistake.",
      );
      setStatus("error");
      return;
    }

    // Check if phone already exists (with multiple format checks)
    const normalizedPhone = normalizePhone(form.phone);

    // Get all profiles and check phone numbers with normalization
    const { data: allProfiles, error: phoneCheckError } = await supabase
      .from("profiles")
      .select("id, phone_number")
      .not("phone_number", "is", null);

    if (phoneCheckError) {
      console.error("Phone check error:", phoneCheckError);
    }

    const phoneExists = allProfiles?.some((profile) => {
      if (!profile.phone_number) return false;
      const existingNormalized = normalizePhone(profile.phone_number);
      return existingNormalized === normalizedPhone;
    });

    if (phoneExists) {
      setErrorMessage(
        t.signup.errors?.phoneExists ||
          "This phone number is already registered. Please contact us if this is a mistake.",
      );
      setStatus("error");
      return;
    }

    // Proceed with signup
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
          phone_number: normalizedPhone,
        },
      },
    });

    if (error || !data.user) {
      console.error(error);
      if (error?.message?.includes("already registered")) {
        setErrorMessage(
          t.signup.errors?.emailExists ||
            "This email is already registered. Please contact us if this is a mistake.",
        );
      } else {
        setErrorMessage(error?.message || t.signup.errors.failedToCreate);
      }
      setStatus("error");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: form.name,
        phone_number: normalizedPhone,
        email: emailToCheck,
        date_of_birth: form.dateOfBirth,
        address: form.address,
      })
      .eq("id", data.user.id);

    if (profileError) {
      console.error(profileError);
      setErrorMessage(t.signup.errors.failedToSaveProfile);
      setStatus("error");
      return;
    }

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
    }

    router.push("/login");
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center py-12">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/login.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-lg p-10 my-8">
        <h1 className="text-4xl font-light text-center text-[#2F3E55] mb-8">
          {t.signup.title}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              {t.signup.fullName} *
            </label>
            <input
              name="name"
              placeholder={t.signup.fullName}
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

          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              {t.signup.email} *
            </label>
            <input
              type="email"
              name="email"
              placeholder={t.signup.email}
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

          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              {t.signup.phoneNumber} *
            </label>
            <input
              name="phone"
              placeholder={t.signup.phoneNumber}
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

          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              {t.signup.dateOfBirth} *
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

          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              {t.signup.address} *
            </label>
            <textarea
              name="address"
              placeholder={t.signup.addressPlaceholder}
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

          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              {t.signup.password} *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t.signup.passwordPlaceholder}
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
                {showPassword ? t.signup.hide : t.signup.show}
              </button>
            </div>
            {passwordError && form.password.length > 0 && (
              <p className="text-xs text-red-500 mt-1">{passwordError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              {t.signup.confirmPassword} *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder={t.signup.retypePassword}
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
                {showConfirmPassword ? t.signup.hide : t.signup.show}
              </button>
            </div>
            {form.confirmPassword.length > 0 && (
              <p
                className={`text-xs mt-1 ${
                  passwordsMatch ? "text-green-600" : "text-red-500"
                }`}
              >
                {passwordsMatch
                  ? `✓ ${t.signup.passwordsMatch}`
                  : `✗ ${t.signup.passwordsNoMatch}`}
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
              <p>{errorMessage}</p>
            </div>
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
            {status === "loading"
              ? t.signup.creatingAccount
              : t.signup.createAccount}
          </button>
        </form>

        <p className="text-center text-sm text-[#2F3E55] mt-6">
          {t.signup.alreadyHaveAccount}{" "}
          <Link href="/login" className="underline">
            {t.signup.loginLink}
          </Link>
        </p>
      </div>
    </main>
  );
}
