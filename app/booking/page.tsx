"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { FiUser } from "react-icons/fi";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import StudioRulesModal from "@/components/StudioRulesModal";

type Package = {
  id: string;
  remaining_credits: number;
  expires_at: string;
  package_type: {
    category: string;
  };
};

type Attendee = {
  name: string;
  phone: string;
};

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();

  // Get class info from URL params
  const classId = searchParams.get("classId");
  const classTitle = searchParams.get("title");
  const classTime = searchParams.get("time");
  const classDate = searchParams.get("date");
  const classCoach = searchParams.get("coach");
  const classPrice = searchParams.get("price");
  const classOriginalPrice = searchParams.get("originalPrice");
  const classLocation = searchParams.get("location");
  const classType = searchParams.get("classType");
  const availableSpots = parseInt(searchParams.get("availableSpots") || "1");

  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Booking state
  const [quantity, setQuantity] = useState(1);
  const [attendees, setAttendees] = useState<Attendee[]>([
    { name: "", phone: "" },
  ]);
  const [paymentMethod, setPaymentMethod] = useState<"package" | "single">(
    "package",
  );
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [availablePackages, setAvailablePackages] = useState<Package[]>([]);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedMyDetails, setUsedMyDetails] = useState(false);
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);

  // Studio Rules state
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [hasAgreedToRules, setHasAgreedToRules] = useState(false);

  const locale = language === "id" ? "id-ID" : "en-US";

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    // Update attendees array when quantity changes
    setAttendees((prev) => {
      const newAttendees = [...prev];
      if (quantity > prev.length) {
        // Add empty attendees
        for (let i = prev.length; i < quantity; i++) {
          newAttendees.push({ name: "", phone: "" });
        }
      } else if (quantity < prev.length) {
        // Remove extra attendees
        return newAttendees.slice(0, quantity);
      }
      return newAttendees;
    });
  }, [quantity]);

  const loadUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(
          `/booking?${searchParams.toString()}`,
        )}`,
      );
      return;
    }

    setUser(user);

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setUserProfile(profile);

    // Get user's packages that match the class type and haven't expired
    const now = new Date().toISOString();
    const { data: packages } = await supabase
      .from("packages")
      .select(
        `
        id,
        remaining_credits,
        expires_at,
        package_type:package_type_id (
          category
        )
      `,
      )
      .eq("user_id", user.id)
      .eq("status", "active")
      .gt("remaining_credits", 0)
      .gt("expires_at", now) // Only include packages that haven't expired
      .order("expires_at", { ascending: true });

    // Transform and filter packages that match class type
    const transformedPackages = (packages || []).map((pkg: any) => ({
      id: pkg.id,
      remaining_credits: pkg.remaining_credits,
      expires_at: pkg.expires_at,
      package_type: Array.isArray(pkg.package_type)
        ? pkg.package_type[0]
        : pkg.package_type,
    }));

    const matchingPackages = transformedPackages.filter(
      (pkg) => pkg.package_type?.category === classType,
    ) as Package[];

    setAvailablePackages(matchingPackages);

    // Auto-select first package if available
    if (matchingPackages.length > 0) {
      setSelectedPackage(matchingPackages[0].id);
      setPaymentMethod("package");
    } else {
      setPaymentMethod("single");
    }

    setLoading(false);
  };

  const handleUseMyDetails = () => {
    if (usedMyDetails || !userProfile) return;

    setAttendees((prev) => {
      const updated = [...prev];
      updated[0] = {
        name: userProfile.full_name || "",
        phone: userProfile.phone_number || "",
      };
      return updated;
    });
    setUsedMyDetails(true);
  };

  const handleAttendeeChange = (
    index: number,
    field: "name" | "phone",
    value: string,
  ) => {
    setAttendees((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validateAttendees = () => {
    for (let i = 0; i < attendees.length; i++) {
      if (!attendees[i].name.trim()) {
        setError(
          t.booking.errorAttendeeName.replace("{number}", (i + 1).toString()),
        );
        return false;
      }
      if (!attendees[i].phone.trim()) {
        setError(
          t.booking.errorAttendeePhone.replace("{number}", (i + 1).toString()),
        );
        return false;
      }
    }
    return true;
  };

  const handleBooking = async () => {
    // Check if user has agreed to rules
    if (!hasAgreedToRules) {
      setShowRulesModal(true);
      return;
    }

    if (!validateAttendees()) return;
    if (paymentMethod === "package" && !selectedPackage) {
      setError(t.booking.errorSelectPackage);
      return;
    }
    if (paymentMethod === "package" && !hasEnoughCredits) {
      setError(t.booking.errorNotEnoughCredits);
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      if (paymentMethod === "package") {
        // Create bookings using package
        const bookingsToCreate = attendees.map((attendee) => ({
          user_id: user.id,
          class_id: classId,
          package_id: selectedPackage,
          payment_method: "package_credit",
          payment_status: "paid",
          status: "confirmed",
          attendee_name: attendee.name,
          attendee_phone: attendee.phone,
        }));

        const { error: bookingError } = await supabase
          .from("bookings")
          .insert(bookingsToCreate);

        if (bookingError) throw bookingError;

        // Deduct credits from package
        const selectedPkg = availablePackages.find(
          (p) => p.id === selectedPackage,
        );
        if (selectedPkg) {
          const { error: packageError } = await supabase
            .from("packages")
            .update({
              remaining_credits: selectedPkg.remaining_credits - quantity,
            })
            .eq("id", selectedPackage);

          if (packageError) throw packageError;
        }

        // Success - redirect to account
        router.push("/account?tab=manage-booking&success=true");
      } else {
        // Single payment - create pending bookings
        const bookingsToCreate = attendees.map((attendee) => ({
          user_id: user.id,
          class_id: classId,
          package_id: null,
          payment_method: "single_payment",
          payment_status: "pending",
          status: "pending",
          attendee_name: attendee.name,
          attendee_phone: attendee.phone,
        }));

        const { data: createdBookings, error: bookingError } = await supabase
          .from("bookings")
          .insert(bookingsToCreate)
          .select();

        if (bookingError) throw bookingError;

        // Call API route to create Xendit invoice
        const bookingIds = createdBookings.map((b: any) => b.id).join(",");

        const response = await fetch("/api/create-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            userEmail: user.email,
            userName: userProfile?.full_name || "User",
            className: classTitle,
            classDate: classDate,
            amount: totalPrice,
            classId: classId,
            bookingId: bookingIds,
          }),
        });

        const invoice = await response.json();

        if (invoice.success && invoice.invoiceUrl) {
          window.location.href = invoice.invoiceUrl;
        } else {
          throw new Error(invoice.error || "Failed to create invoice");
        }
      }
    } catch (err) {
      console.error("Booking error:", err);
      setError(err instanceof Error ? err.message : "Failed to create booking");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#2F3E55]">{t.booking.loading}</p>
      </div>
    );
  }

  const pricePerPerson = parseInt(classPrice || "0");
  const originalPricePerPerson = classOriginalPrice
    ? parseInt(classOriginalPrice)
    : null;
  const totalPrice = pricePerPerson * quantity;
  const totalOriginalPrice = originalPricePerPerson
    ? originalPricePerPerson * quantity
    : null;
  const hasDiscount =
    originalPricePerPerson && originalPricePerPerson > pricePerPerson;

  // Check if selected package has enough credits
  const selectedPkg = availablePackages.find((p) => p.id === selectedPackage);
  const hasEnoughCredits = selectedPkg
    ? selectedPkg.remaining_credits >= quantity
    : false;

  return (
    <div className="min-h-screen bg-[#F7F4EF] py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-[#2E3A4A] hover:underline mb-4 flex items-center gap-2"
          >
            ← {t.booking.backToSchedule}
          </button>
          <h1 className="text-4xl font-light text-[#2E3A4A]">
            {t.booking.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Class Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-medium text-[#2E3A4A] mb-4">
                {classTitle}
              </h2>
              <div className="space-y-2 text-[#2E3A4A]">
                <p>
                  <strong>{t.common.date}:</strong> {classDate}
                </p>
                <p>
                  <strong>{t.common.time}:</strong> {classTime}
                </p>
                <p>
                  <strong>{t.common.coach}:</strong> {classCoach}
                </p>
                <p>
                  <strong>{t.common.location}:</strong> {classLocation}
                </p>
                {hasDiscount && (
                  <div className="flex items-center gap-3 mt-4">
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                      SALE
                    </span>
                    <span className="line-through text-gray-500">
                      Rp.{originalPricePerPerson?.toLocaleString("id-ID")}
                    </span>
                    <span className="text-red-600 font-semibold text-lg">
                      Rp.{pricePerPerson.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <label className="block text-lg font-medium text-[#2E3A4A] mb-4">
                {t.booking.numberOfAttendees}
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-12 h-12 rounded-full border-2 border-[#2E3A4A] flex items-center justify-center text-xl font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#2E3A4A] hover:text-white transition"
                >
                  −
                </button>
                <span className="text-3xl font-semibold text-[#2E3A4A] w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(availableSpots, quantity + 1))
                  }
                  disabled={quantity >= availableSpots}
                  className="w-12 h-12 rounded-full border-2 border-[#2E3A4A] flex items-center justify-center text-xl font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#2E3A4A] hover:text-white transition"
                >
                  +
                </button>
                <span className="text-sm text-gray-600 ml-2">
                  ({t.booking.max}: {availableSpots} {t.booking.available})
                </span>
              </div>
            </div>

            {/* Attendee Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-[#2E3A4A]">
                  {t.booking.attendeeDetails}
                </h3>
                {!usedMyDetails && (
                  <button
                    onClick={handleUseMyDetails}
                    className="text-sm text-[#2E3A4A] hover:underline flex items-center gap-2"
                  >
                    <FiUser size={16} />
                    {t.booking.useMyDetails}
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {attendees.map((attendee, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                  >
                    <p className="text-sm font-medium text-gray-600 mb-3">
                      {t.booking.attendee} {index + 1}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-[#2E3A4A] mb-1">
                          {t.booking.fullName} *
                        </label>
                        <input
                          type="text"
                          value={attendee.name}
                          onChange={(e) =>
                            handleAttendeeChange(index, "name", e.target.value)
                          }
                          placeholder={t.booking.enterFullName}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#2E3A4A] mb-1">
                          {t.booking.phoneNumber} *
                        </label>
                        <input
                          type="tel"
                          value={attendee.phone}
                          onChange={(e) =>
                            handleAttendeeChange(index, "phone", e.target.value)
                          }
                          placeholder={t.booking.enterPhone}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-medium text-[#2E3A4A] mb-4">
                {t.booking.paymentMethod}
              </h3>

              {availablePackages.length > 0 ? (
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-[#2E3A4A] transition">
                    <input
                      type="radio"
                      name="payment"
                      value="package"
                      checked={paymentMethod === "package"}
                      onChange={() => setPaymentMethod("package")}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-[#2E3A4A]">
                        {t.booking.usePackageCredits}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {t.booking.selectFromPackages}
                      </p>

                      {paymentMethod === "package" && (
                        <div className="mt-3 relative">
                          {/* Custom Dropdown Button */}
                          <button
                            type="button"
                            onClick={() =>
                              setShowPackageDropdown(!showPackageDropdown)
                            }
                            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-xl hover:border-[#2E3A4A] transition text-left"
                          >
                            {selectedPackage && selectedPkg ? (
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-[#2E3A4A] capitalize">
                                    {selectedPkg.package_type.category}
                                  </span>
                                  <span className="px-2 py-0.5 bg-[#B7C9E5] text-[#2E3A4A] text-xs rounded-full font-medium">
                                    {selectedPkg.remaining_credits}{" "}
                                    {t.booking.credits}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {t.booking.expires}:{" "}
                                  {new Date(
                                    selectedPkg.expires_at,
                                  ).toLocaleDateString(locale, {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-500">
                                {t.booking.selectPackage}
                              </span>
                            )}
                            <svg
                              className={`w-5 h-5 text-gray-400 transition-transform ${
                                showPackageDropdown ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>

                          {/* Custom Dropdown Menu */}
                          {showPackageDropdown && (
                            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 max-h-64 overflow-y-auto">
                              {availablePackages.map((pkg) => {
                                const expiryDate = new Date(pkg.expires_at);
                                const daysUntilExpiry = Math.ceil(
                                  (expiryDate.getTime() - Date.now()) /
                                    (1000 * 60 * 60 * 24),
                                );
                                const isExpiringSoon = daysUntilExpiry <= 7;

                                return (
                                  <button
                                    key={pkg.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedPackage(pkg.id);
                                      setShowPackageDropdown(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${
                                      selectedPackage === pkg.id
                                        ? "bg-blue-50"
                                        : ""
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-[#2E3A4A] capitalize">
                                            {pkg.package_type.category}
                                          </span>
                                          <span className="px-2 py-0.5 bg-[#B7C9E5] text-[#2E3A4A] text-xs rounded-full font-medium">
                                            {pkg.remaining_credits}{" "}
                                            {t.booking.credits}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                          <span
                                            className={
                                              isExpiringSoon
                                                ? "text-orange-600 font-medium"
                                                : "text-gray-500"
                                            }
                                          >
                                            {t.booking.expires}:{" "}
                                            {expiryDate.toLocaleDateString(
                                              locale,
                                              {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                              },
                                            )}
                                          </span>
                                          {isExpiringSoon && (
                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                                              {t.booking.expiringSoon}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {selectedPackage === pkg.id && (
                                        <svg
                                          className="w-5 h-5 text-[#2E3A4A] shrink-0"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {paymentMethod === "package" &&
                        !hasEnoughCredits &&
                        selectedPkg && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              {t.booking.notEnoughCredits
                                .replace("{quantity}", quantity.toString())
                                .replace(
                                  "{remaining}",
                                  selectedPkg.remaining_credits.toString(),
                                )}
                            </p>
                          </div>
                        )}
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-[#2E3A4A] transition">
                    <input
                      type="radio"
                      name="payment"
                      value="single"
                      checked={paymentMethod === "single"}
                      onChange={() => setPaymentMethod("single")}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-[#2E3A4A]">
                        {t.booking.singlePayment}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t.booking.paymentDescription}
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800 mb-3">
                      {t.booking.noPackagesAvailable}
                    </p>
                    <Link
                      href="/#packages"
                      className="inline-block bg-[#2E3A4A] text-white px-6 py-2 rounded-full text-sm font-medium hover:opacity-90 transition"
                    >
                      {t.booking.explorePackages}
                    </Link>
                  </div>

                  <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-[#2E3A4A] transition">
                    <input
                      type="radio"
                      name="payment"
                      value="single"
                      checked={paymentMethod === "single"}
                      onChange={() => setPaymentMethod("single")}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-[#2E3A4A]">
                        {t.booking.singlePayment}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t.booking.paymentDescription}
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-medium text-[#2E3A4A] mb-4">
                {t.booking.bookingSummary}
              </h3>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.common.class}</span>
                  <span className="font-medium text-right">{classTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.booking.attendees}</span>
                  <span className="font-medium">{quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {t.booking.pricePerPerson}
                  </span>
                  <div className="text-right">
                    {hasDiscount && (
                      <div className="line-through text-gray-400 text-xs">
                        Rp.{originalPricePerPerson?.toLocaleString("id-ID")}
                      </div>
                    )}
                    <div
                      className={
                        hasDiscount ? "text-red-600 font-semibold" : ""
                      }
                    >
                      Rp.{pricePerPerson.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-[#2E3A4A]">
                      {t.booking.total}
                    </span>
                    <div className="text-right">
                      {totalOriginalPrice &&
                        totalOriginalPrice > totalPrice && (
                          <div className="line-through text-gray-400 text-sm">
                            Rp.{totalOriginalPrice.toLocaleString("id-ID")}
                          </div>
                        )}
                      <div className="text-2xl font-bold text-[#2E3A4A]">
                        {paymentMethod === "package"
                          ? `${quantity} ${
                              quantity === 1
                                ? t.booking.credit
                                : t.booking.credits
                            }`
                          : `Rp.${totalPrice.toLocaleString("id-ID")}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={
                  processing ||
                  (paymentMethod === "package" && !hasEnoughCredits)
                }
                className="w-full bg-[#2E3A4A] text-white py-4 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing
                  ? t.booking.processing
                  : paymentMethod === "package"
                    ? hasEnoughCredits
                      ? t.booking.confirmBooking
                      : t.booking.errorNotEnoughCredits.split(".")[0]
                    : t.booking.proceedToPayment}
              </button>

              {paymentMethod === "package" &&
                selectedPackage &&
                hasEnoughCredits && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    {t.booking.creditsWillBeDeducted
                      .replace("{quantity}", quantity.toString())
                      .replace(
                        "{unit}",
                        quantity === 1 ? t.booking.credit : t.booking.credits,
                      )}
                  </p>
                )}

              {paymentMethod === "package" &&
                !hasEnoughCredits &&
                selectedPkg && (
                  <p className="text-xs text-red-500 mt-3 text-center">
                    {t.booking.needMoreCredits
                      .replace(
                        "{quantity}",
                        (quantity - selectedPkg.remaining_credits).toString(),
                      )
                      .replace(
                        "{unit}",
                        quantity - selectedPkg.remaining_credits === 1
                          ? t.booking.credit
                          : t.booking.credits,
                      )}
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Studio Rules Modal */}
      <StudioRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        onAccept={() => {
          setHasAgreedToRules(true);
          setShowRulesModal(false);
          // Automatically retry booking after rules accepted
          setTimeout(() => handleBooking(), 100);
        }}
      />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
