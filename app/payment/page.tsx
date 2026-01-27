// app/payment/page.tsx
// This page is now simplified since we use Midtrans redirect URL directly
// It can be used as a fallback or for handling edge cases

"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type"); // "package" or "class"

  useEffect(() => {
    // If someone lands here without proper context, redirect them
    const timer = setTimeout(() => {
      if (type === "package") {
        router.push("/#packages");
      } else if (type === "class") {
        router.push("/#schedule");
      } else {
        router.push("/");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [type, router]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2F3E55] mx-auto mb-6"></div>
      <h1 className="text-2xl font-medium text-[#2F3E55] mb-2">
        Redirecting...
      </h1>
      <p className="text-gray-600">
        If you're not redirected automatically,{" "}
        <button
          onClick={() => router.push("/")}
          className="text-[#2F3E55] underline hover:opacity-70"
        >
          click here
        </button>
      </p>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F7F4EF]">
      <Suspense
        fallback={
          <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2F3E55] mx-auto mb-6"></div>
            <h1 className="text-2xl font-medium text-[#2F3E55] mb-2">
              Loading...
            </h1>
          </div>
        }
      >
        <PaymentContent />
      </Suspense>
    </main>
  );
}
