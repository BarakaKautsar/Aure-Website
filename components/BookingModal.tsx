"use client";

import { useEffect, useState } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import { supabase } from "@/lib/supabase/client";

type ClassInfo = {
  id: string;
  title: string;
  time: string;
  date: string;
  coach: string;
  price: number;
  location: string;
  classType: string; // 'reformer', 'spine_corrector', 'matt'
};

type UserPackage = {
  id: string;
  remaining_credits: number;
  expires_at: string;
  package_type: {
    name: string;
    category: string;
  };
};

type Props = {
  classInfo: ClassInfo;
  onClose: () => void;
  onSuccess: () => void;
};

export default function BookingModal({ classInfo, onClose, onSuccess }: Props) {
  const [paymentMethod, setPaymentMethod] = useState<"single" | "package">(
    "single"
  );
  const [availablePackages, setAvailablePackages] = useState<UserPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUserPackages();
  }, []);

  const loadUserPackages = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch active packages with remaining credits that match the class type
    const { data, error } = await supabase
      .from("packages")
      .select(
        `
        id,
        remaining_credits,
        expires_at,
        package_type:package_type_id (
          name,
          category
        )
      `
      )
      .eq("user_id", user.id)
      .eq("status", "active")
      .gt("remaining_credits", 0)
      .gte("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: true });

    if (!error && data) {
      // Filter packages by matching category
      const matchingPackages = (data as unknown as UserPackage[]).filter(
        (pkg) => pkg.package_type.category === classInfo.classType
      );

      setAvailablePackages(matchingPackages);

      // Auto-select first matching package if available
      if (matchingPackages.length > 0) {
        setSelectedPackageId(matchingPackages[0].id);
      }
    }

    setLoading(false);
  };

  const handleBooking = async () => {
    if (!user) {
      alert("Please log in to book a class");
      return;
    }

    if (paymentMethod === "package" && !selectedPackageId) {
      alert("Please select a package");
      return;
    }

    setBooking(true);

    try {
      // Create booking
      const bookingData: any = {
        user_id: user.id,
        class_id: classInfo.id,
        payment_method:
          paymentMethod === "single" ? "single_payment" : "package_credit",
        payment_status: paymentMethod === "single" ? "pending" : "paid",
        status: paymentMethod === "single" ? "pending" : "confirmed", // Pending until payment complete
        package_id: paymentMethod === "package" ? selectedPackageId : null, // Explicitly set null for single payment
      };

      const { data: newBooking, error: bookingError } = await supabase
        .from("bookings")
        .insert(bookingData)
        .select()
        .single();

      if (bookingError) {
        console.error("Booking insert error details:", {
          error: bookingError,
          message: bookingError.message,
          details: bookingError.details,
          hint: bookingError.hint,
          code: bookingError.code,
        });
        throw bookingError;
      }

      // If using package, deduct credit
      if (paymentMethod === "package" && selectedPackageId) {
        const selectedPkg = availablePackages.find(
          (p) => p.id === selectedPackageId
        );

        if (selectedPkg) {
          const { error: updateError } = await supabase
            .from("packages")
            .update({
              remaining_credits: selectedPkg.remaining_credits - 1,
            })
            .eq("id", selectedPackageId);

          if (updateError) {
            console.error("Package update error:", updateError);
            throw updateError;
          }
        }
      }

      // If single payment, redirect to Xendit
      if (paymentMethod === "single") {
        // Get user profile for payment
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", user.id)
          .single();

        if (profile?.email) {
          // Create payment invoice
          const paymentResponse = await fetch("/api/payment/create-invoice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              userEmail: profile.email,
              userName: profile.full_name || "Member",
              className: classInfo.title,
              classDate: classInfo.date,
              amount: classInfo.price,
              classId: classInfo.id,
              bookingId: newBooking.id,
              type: "single_class",
            }),
          });

          const paymentResult = await paymentResponse.json();

          if (paymentResult.success) {
            // Redirect to Xendit payment page
            window.location.href = paymentResult.invoiceUrl;
            return; // Stop here, don't show success modal
          } else {
            alert("Failed to create payment. Please try again.");
            // Delete the pending booking
            await supabase.from("bookings").delete().eq("id", newBooking.id);
            setBooking(false);
            return;
          }
        }
      }

      // ✅ Send booking confirmation email
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", user.id)
          .single();

        if (profile?.email) {
          await fetch("/api/send-email/booking-confirmation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: profile.email,
              userName: profile.full_name || "Member",
              className: classInfo.title,
              date: classInfo.date,
              time: classInfo.time,
              coach: classInfo.coach,
              location: classInfo.location,
            }),
          });
        }
      } catch (emailError) {
        console.error("Failed to send booking confirmation email:", emailError);
        // Don't block the booking if email fails
      }

      onSuccess();
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const canUsePackage = availablePackages.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 z-10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={booking}
        >
          <FiX size={20} />
        </button>

        <h3 className="text-2xl font-medium text-[#2F3E55] mb-2">Book Class</h3>

        {/* Class Details */}
        <div className="bg-[#F7F4EF] rounded-xl p-4 mb-6">
          <h4 className="font-medium text-[#2F3E55] mb-2">{classInfo.title}</h4>
          <div className="space-y-1 text-sm text-[#2F3E55]">
            <p>
              <strong>Date:</strong> {classInfo.date}
            </p>
            <p>
              <strong>Time:</strong> {classInfo.time}
            </p>
            <p>
              <strong>Coach:</strong> {classInfo.coach}
            </p>
            <p>
              <strong>Location:</strong> {classInfo.location}
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-4">
            Loading payment options...
          </p>
        ) : (
          <>
            <h4 className="font-medium text-[#2F3E55] mb-4">
              Select Payment Method
            </h4>

            {/* Payment Options */}
            <div className="space-y-3 mb-6">
              {/* Single Payment */}
              <label
                className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${
                  paymentMethod === "single"
                    ? "border-[#2F3E55] bg-[#F7F4EF]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="single"
                  checked={paymentMethod === "single"}
                  onChange={() => setPaymentMethod("single")}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-[#2F3E55]">Single Payment</p>
                  <p className="text-2xl font-bold text-[#2F3E55] mt-1">
                    Rp.{classInfo.price.toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pay for this class only
                  </p>
                </div>
              </label>

              {/* Package Credit */}
              <label
                className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${
                  paymentMethod === "package"
                    ? "border-[#2F3E55] bg-[#F7F4EF]"
                    : "border-gray-200 hover:border-gray-300"
                } ${!canUsePackage ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="package"
                  checked={paymentMethod === "package"}
                  onChange={() => setPaymentMethod("package")}
                  disabled={!canUsePackage}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-[#2F3E55]">
                    Use Package Credit
                  </p>
                  {canUsePackage ? (
                    <p className="text-sm text-gray-600 mt-1">
                      You have {availablePackages.length} compatible package(s)
                    </p>
                  ) : (
                    <p className="text-sm text-red-500 mt-1">
                      No compatible packages available for this class type
                    </p>
                  )}
                </div>
              </label>
            </div>

            {/* Package Selection Dropdown */}
            {paymentMethod === "package" && canUsePackage && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#2F3E55] mb-2">
                  Select Package
                </label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                >
                  {availablePackages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.package_type.name} - {pkg.remaining_credits} credits
                      left (Expires:{" "}
                      {new Date(pkg.expires_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={booking}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                disabled={
                  booking || (paymentMethod === "package" && !selectedPackageId)
                }
                className="flex-1 px-6 py-3 bg-[#2F3E55] text-white rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {booking ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Success Modal
export function BookingSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-10 z-10 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX size={20} />
        </button>

        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white">
          <FiCheck size={36} />
        </div>

        <h3 className="text-2xl font-medium text-[#2F3E55] mb-3">
          Booking Confirmed!
        </h3>

        <p className="text-sm text-[#2F3E55] mb-6">
          Your class has been successfully booked. A confirmation email has been
          sent to your email address.
        </p>

        <button
          onClick={onClose}
          className="bg-[#B7C9E5] text-[#2F3E55] px-6 py-3 rounded-xl hover:opacity-90 w-full"
        >
          View My Bookings
        </button>
      </div>
    </div>
  );
}
