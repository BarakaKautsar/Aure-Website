// app/purchase/[packageId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { FiClock, FiCheck, FiMapPin, FiPackage } from "react-icons/fi";

type PackageType = {
  id: string;
  name: string;
  category: string;
  class_credits: number;
  price: number;
  validity_days: number;
  location: string;
  description: string | null;
};

// Map database categories to display names
const categoryDisplayMap: Record<string, string> = {
  reformer: "Reformer",
  spine_corrector: "Spine Corrector",
  matt: "Matt",
  aerial: "Aerial",
};

export default function PurchasePage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.packageId as string;

  const [packageType, setPackageType] = useState<PackageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPackage();
    checkAuth();
  }, [packageId]);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(`/purchase/${packageId}`)}`
      );
      return;
    }

    setUser(user);
  };

  const loadPackage = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("package_types")
      .select("*")
      .eq("id", packageId)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      console.error("Error loading package:", error);
      router.push("/#packages");
      return;
    }

    setPackageType(data);
    setLoading(false);
  };

  const handlePurchase = async () => {
    if (!user || !packageType) return;

    setProcessing(true);
    setError(null);

    try {
      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (!profile) {
        setError("Profile not found");
        setProcessing(false);
        return;
      }

      // Create payment invoice
      const response = await fetch("/api/payment/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userName: profile.full_name || "Member",
          packageName: packageType.name,
          amount: packageType.price,
          packageTypeId: packageType.id,
          type: "package",
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError("Failed to create payment. Please try again.");
        setProcessing(false);
        return;
      }

      // Redirect to Xendit payment page
      window.location.href = result.invoiceUrl;
    } catch (error) {
      console.error("Purchase error:", error);
      setError("Failed to process purchase. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F4EF]">
        <p className="text-[#2F3E55]">Loading...</p>
      </div>
    );
  }

  if (!packageType) {
    return null;
  }

  const pricePerClass = Math.round(
    packageType.price / packageType.class_credits
  );

  return (
    <div className="min-h-screen bg-[#F7F4EF] py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-[#2E3A4A] hover:underline mb-4 flex items-center gap-2"
          >
            ← Back to Packages
          </button>
          <h1 className="text-4xl font-light text-[#2E3A4A]">
            Purchase Package
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Package Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-medium text-[#2E3A4A] mb-4">
                {packageType.name}
              </h2>
              <div className="space-y-3 text-[#2E3A4A]">
                <div className="flex items-center gap-3">
                  <FiPackage
                    className="text-[#2E3A4A] flex-shrink-0"
                    size={18}
                  />
                  <span className="text-sm">
                    <strong>{packageType.class_credits} credits</strong> for{" "}
                    <strong>{categoryDisplayMap[packageType.category]}</strong>{" "}
                    classes
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <FiClock className="text-[#2E3A4A] flex-shrink-0" size={18} />
                  <span className="text-sm">
                    Valid for <strong>{packageType.validity_days} days</strong>{" "}
                    from purchase
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <FiMapPin
                    className="text-[#2E3A4A] flex-shrink-0"
                    size={18}
                  />
                  <span className="text-sm">
                    <strong>{packageType.location}</strong> studio
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <FiCheck className="text-green-600 flex-shrink-0" size={18} />
                  <span className="text-sm">One-time payment</span>
                </div>
              </div>

              {packageType.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-[#2E3A4A]">
                    {packageType.description}
                  </p>
                </div>
              )}
            </div>

            {/* Package Benefits */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-medium text-[#2E3A4A] mb-4">
                Package Benefits
              </h3>
              <ul className="space-y-2 text-sm text-[#2E3A4A]">
                <li className="flex items-start gap-2">
                  <FiCheck
                    className="text-green-600 flex-shrink-0 mt-0.5"
                    size={16}
                  />
                  <span>Save money compared to single class bookings</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheck
                    className="text-green-600 flex-shrink-0 mt-0.5"
                    size={16}
                  />
                  <span>Flexible scheduling within validity period</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheck
                    className="text-green-600 flex-shrink-0 mt-0.5"
                    size={16}
                  />
                  <span>Easy booking with package credits</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheck
                    className="text-green-600 flex-shrink-0 mt-0.5"
                    size={16}
                  />
                  <span>Credits automatically refunded for cancellations</span>
                </li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Right: Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-medium text-[#2E3A4A] mb-4">
                Purchase Summary
              </h3>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Package</span>
                  <span className="font-medium text-right">
                    {packageType.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Credits</span>
                  <span className="font-medium">
                    {packageType.class_credits}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Validity</span>
                  <span className="font-medium">
                    {packageType.validity_days} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per class</span>
                  <span className="font-medium">
                    Rp.{pricePerClass.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-[#2E3A4A]">Total</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#2E3A4A]">
                        Rp.{packageType.price.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={processing}
                className="w-full bg-orange-500 text-white py-4 rounded-full font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? "Processing..." : "Proceed to Payment"}
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Secure payment powered by Xendit
              </p>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  <strong>Note:</strong> Your package will be activated
                  immediately after successful payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
