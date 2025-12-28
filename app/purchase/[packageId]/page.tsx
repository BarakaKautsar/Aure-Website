// app/purchase/[packageId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { FiClock, FiCreditCard, FiCheck } from "react-icons/fi";

type PackageType = {
  id: string;
  name: string;
  category: string;
  class_credits: number;
  price: number;
  validity_days: number;
  description: string | null;
};

export default function PurchasePage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.packageId as string;

  const [packageType, setPackageType] = useState<PackageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

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
      router.push("/");
      return;
    }

    setPackageType(data);
    setLoading(false);
  };

  const handlePurchase = async () => {
    if (!user || !packageType) return;

    setProcessing(true);

    try {
      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", user.id)
        .single();

      if (!profile) {
        alert("Profile not found");
        setProcessing(false);
        return;
      }

      // Create payment invoice
      const response = await fetch("/api/payment/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: profile.email,
          userName: profile.full_name || "Member",
          packageName: packageType.name,
          amount: packageType.price,
          packageTypeId: packageType.id,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert("Failed to create payment. Please try again.");
        setProcessing(false);
        return;
      }

      // Redirect to Xendit payment page
      window.location.href = result.invoiceUrl;
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Failed to process purchase. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[#2F3E55]">Loading package details...</p>
      </main>
    );
  }

  if (!packageType) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="text-[#2F3E55] mb-6 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-4xl font-light text-[#2F3E55] mb-8">
          Purchase Package
        </h1>

        {/* Package Details Card */}
        <div className="bg-[#F7F4EF] rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-medium text-[#2F3E55] mb-4">
            {packageType.name}
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <FiCheck className="text-green-600" size={20} />
              <span className="text-[#2F3E55]">
                {packageType.class_credits} Class Credits
              </span>
            </div>

            <div className="flex items-center gap-3">
              <FiClock className="text-blue-600" size={20} />
              <span className="text-[#2F3E55]">
                Valid for {packageType.validity_days} days
              </span>
            </div>

            <div className="flex items-center gap-3">
              <FiCreditCard className="text-purple-600" size={20} />
              <span className="text-[#2F3E55]">
                Category:{" "}
                {packageType.category === "reformer"
                  ? "Reformer"
                  : packageType.category === "matt"
                  ? "Matt"
                  : "Spine Corrector"}
              </span>
            </div>
          </div>

          {packageType.description && (
            <p className="text-[#2F3E55] mb-6">{packageType.description}</p>
          )}

          <div className="border-t border-gray-300 pt-6 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-xl text-[#2F3E55]">Total:</span>
              <span className="text-4xl font-bold text-[#2F3E55]">
                Rp.{packageType.price.toLocaleString("id-ID")}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2 text-right">
              ~Rp.
              {Math.round(
                packageType.price / packageType.class_credits
              ).toLocaleString("id-ID")}{" "}
              per class
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-medium text-[#2F3E55] mb-4">
            Payment Methods
          </h3>

          <p className="text-[#2F3E55] mb-4">
            We accept various payment methods through Xendit:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div className="text-center">
              <div className="bg-[#F7F4EF] rounded-lg p-3 mb-2">🏦</div>
              <p>Bank Transfer</p>
            </div>
            <div className="text-center">
              <div className="bg-[#F7F4EF] rounded-lg p-3 mb-2">📱</div>
              <p>E-Wallet</p>
            </div>
            <div className="text-center">
              <div className="bg-[#F7F4EF] rounded-lg p-3 mb-2">💳</div>
              <p>Credit Card</p>
            </div>
            <div className="text-center">
              <div className="bg-[#F7F4EF] rounded-lg p-3 mb-2">🏪</div>
              <p>Retail</p>
            </div>
          </div>
        </div>

        {/* Purchase Button */}
        <button
          onClick={handlePurchase}
          disabled={processing}
          className="w-full bg-[#2F3E55] text-white py-4 rounded-xl text-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? "Processing..." : "Proceed to Payment"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Secure payment powered by Xendit
        </p>
      </div>
    </main>
  );
}
