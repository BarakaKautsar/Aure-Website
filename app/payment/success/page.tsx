// app/payment/success/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiCheck } from "react-icons/fi";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      if (type === "class") {
        router.push("/account?tab=manage-booking");
      } else {
        router.push("/account?tab=packages");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [type, router]);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-white">
          <FiCheck size={48} />
        </div>

        <h1 className="text-3xl font-medium text-[#2F3E55] mb-4">
          Pembayaran Berhasil!
        </h1>

        <p className="text-[#2F3E55] mb-8">
          {type === "class"
            ? "Booking kelas Anda telah dikonfirmasi. Kami sudah mengirimkan email konfirmasi."
            : "Paket Anda telah aktif dan siap digunakan. Anda dapat mulai booking kelas sekarang!"}
        </p>

        <div className="space-y-3">
          <button
            onClick={() =>
              type === "class"
                ? router.push("/account?tab=manage-booking")
                : router.push("/account?tab=packages")
            }
            className="w-full bg-[#2F3E55] text-white py-3 rounded-xl hover:opacity-90 transition"
          >
            {type === "class" ? "Lihat Booking Saya" : "Lihat Paket Saya"}
          </button>

          <button
            onClick={() => router.push("/#schedule")}
            className="w-full border border-[#2F3E55] text-[#2F3E55] py-3 rounded-xl hover:bg-[#F7F4EF] transition"
          >
            Book Kelas Sekarang
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Otomatis dialihkan dalam 5 detik...
        </p>
      </div>
    </main>
  );
}
