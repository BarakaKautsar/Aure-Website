"use client";

import { useState } from "react";
import { FiX, FiCheck, FiPackage, FiClock, FiDollarSign } from "react-icons/fi";
import { supabase } from "@/lib/supabase/client";

type PackageInfo = {
  id: string;
  name: string;
  class_credits: number;
  validity_days: number;
  price: number;
  category: string;
};

type Props = {
  packageInfo: PackageInfo;
  onClose: () => void;
  onSuccess: () => void;
};

export default function PurchasePackageModal({
  packageInfo,
  onClose,
  onSuccess,
}: Props) {
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in to purchase a package");
        window.location.href = "/login";
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", user.id)
        .single();

      if (!profile) {
        alert("Profile not found");
        setPurchasing(false);
        return;
      }

      // ✅ Create payment invoice with Xendit
      const response = await fetch("/api/payment/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: profile.email,
          userName: profile.full_name || "Member",
          packageName: packageInfo.name,
          amount: packageInfo.price,
          packageTypeId: packageInfo.id,
          type: "package",
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert("Failed to create payment. Please try again.");
        setPurchasing(false);
        return;
      }

      // ✅ Redirect to Xendit payment page
      window.location.href = result.invoiceUrl;
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Failed to process purchase. Please try again.");
      setPurchasing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={purchasing}
        >
          <FiX size={20} />
        </button>

        <h3 className="text-2xl font-medium text-[#2F3E55] mb-6">
          Purchase Package
        </h3>

        {/* Package Details Card */}
        <div className="bg-linear-to-br from-[#B7C9E5] to-[#ABC3E5] rounded-xl p-6 mb-6 text-[#2F3E55]">
          <h4 className="text-2xl font-bold mb-4">{packageInfo.name}</h4>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FiPackage className="w-5 h-5" />
              <span className="text-lg">
                {packageInfo.class_credits} Classes
              </span>
            </div>

            <div className="flex items-center gap-3">
              <FiClock className="w-5 h-5" />
              <span>Valid for {packageInfo.validity_days} days</span>
            </div>

            <div className="flex items-center gap-3">
              <FiDollarSign className="w-5 h-5" />
              <span className="text-xl font-bold">
                Rp.{packageInfo.price.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Price per class */}
          <div className="mt-4 pt-4 border-t border-[#2F3E55]/20">
            <p className="text-sm">
              <strong>
                Rp.
                {Math.round(
                  packageInfo.price / packageInfo.class_credits
                ).toLocaleString("id-ID")}
              </strong>{" "}
              per class
            </p>
          </div>
        </div>

        {/* Package Benefits */}
        <div className="bg-[#F7F4EF] rounded-xl p-4 mb-6">
          <p className="text-sm text-[#2F3E55] font-medium mb-2">
            ✓ Package Benefits:
          </p>
          <ul className="text-sm text-[#2F3E55] space-y-1">
            <li>• Save money compared to single class bookings</li>
            <li>• Flexible scheduling within validity period</li>
            <li>• Easy booking with package credits</li>
            <li>• Credits automatically refunded for cancellations</li>
          </ul>
        </div>

        {/* Payment Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Payment:</strong> You'll be redirected to secure payment
            gateway after confirming. Your package will be activated once
            payment is completed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={purchasing}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className="flex-1 px-6 py-3 bg-[#2F3E55] text-white rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {purchasing ? "Processing..." : "Purchase Package"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Success Modal
export function PurchaseSuccessModal({ onClose }: { onClose: () => void }) {
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
          Package Purchased!
        </h3>

        <p className="text-sm text-[#2F3E55] mb-6">
          Your package has been successfully activated. You can now use your
          credits to book classes!
        </p>

        <button
          onClick={onClose}
          className="bg-[#B7C9E5] text-[#2F3E55] px-6 py-3 rounded-xl hover:opacity-90 w-full mb-3"
        >
          View My Packages
        </button>

        <button
          onClick={() => (window.location.href = "/#schedule")}
          className="text-[#2F3E55] underline text-sm hover:opacity-70"
        >
          Book a Class
        </button>
      </div>
    </div>
  );
}
