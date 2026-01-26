// app/payment/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

declare global {
  interface Window {
    snap: any;
  }
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const type = searchParams.get("type"); // "package" or "class"
  const id = searchParams.get("id"); // packageTypeId or classId

  useEffect(() => {
    // Load Midtrans Snap script
    const script = document.createElement("script");
    script.src =
      process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
    );
    script.async = true;

    script.onload = () => {
      console.log("Midtrans Snap loaded");
      initializePayment();
    };

    script.onerror = () => {
      setError("Failed to load payment gateway");
      setLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializePayment = async () => {
    try {
      if (!type || !id) {
        throw new Error("Invalid payment parameters");
      }

      // Get user info
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=/payment");
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone_number")
        .eq("id", user.id)
        .single();

      let endpoint = "";
      let payload: any = {
        userId: user.id,
        userEmail: user.email!,
        userName: profile?.full_name || "User",
        userPhone: profile?.phone_number || "",
      };

      if (type === "package") {
        // Get package details
        const { data: packageType } = await supabase
          .from("package_types")
          .select("*")
          .eq("id", id)
          .single();

        if (!packageType) throw new Error("Package not found");

        endpoint = "/api/payment/create-package";
        payload = {
          ...payload,
          packageTypeId: id,
          packageName: packageType.name,
          amount: packageType.price,
        };
      } else if (type === "class") {
        // Get class details from searchParams
        const className = searchParams.get("className");
        const classDate = searchParams.get("classDate");
        const amount = searchParams.get("amount");
        const bookingIds = searchParams.get("bookingIds")?.split(",") || [];

        if (!className || !classDate || !amount) {
          throw new Error("Missing class details");
        }

        endpoint = "/api/payment/create-class";
        payload = {
          ...payload,
          classId: id,
          className,
          classDate,
          amount: parseFloat(amount),
          bookingIds,
        };
      }

      // Create transaction
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create transaction");
      }

      // Open Snap payment popup
      window.snap.pay(data.token, {
        onSuccess: function (result: any) {
          console.log("Payment success:", result);
          router.push(`/payment/success?type=${type}`);
        },
        onPending: function (result: any) {
          console.log("Payment pending:", result);
          router.push(`/payment/pending?type=${type}`);
        },
        onError: function (result: any) {
          console.log("Payment error:", result);
          router.push(`/payment/failed`);
        },
        onClose: function () {
          console.log("Payment popup closed");
          router.push("/");
        },
      });

      setLoading(false);
    } catch (err) {
      console.error("Payment initialization error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize payment",
      );
      setLoading(false);
    }
  };

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F7F4EF]">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md text-center">
          <h1 className="text-2xl font-medium text-red-600 mb-4">
            Payment Error
          </h1>
          <p className="text-[#2F3E55] mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-[#2F3E55] text-white px-6 py-3 rounded-xl hover:opacity-90"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F7F4EF]">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2F3E55] mx-auto mb-6"></div>
            <h1 className="text-2xl font-medium text-[#2F3E55] mb-2">
              Preparing Payment
            </h1>
            <p className="text-gray-600">Please wait...</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-medium text-[#2F3E55] mb-4">
              Complete Your Payment
            </h1>
            <p className="text-gray-600">
              Payment window will open automatically
            </p>
          </>
        )}
      </div>
    </main>
  );
}
