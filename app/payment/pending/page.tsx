// app/payment/pending/page.tsx
"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiClock } from "react-icons/fi";

function PaymentPendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  return (
    <div className="max-w-md w-full text-center">
      <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-yellow-500 flex items-center justify-center text-white">
        <FiClock size={48} />
      </div>

      <h1 className="text-3xl font-medium text-[#2F3E55] mb-4">
        Menunggu Pembayaran
      </h1>

      <p className="text-[#2F3E55] mb-8">
        Pembayaran Anda sedang diproses. Ini mungkin memakan waktu beberapa
        menit tergantung metode pembayaran yang Anda pilih.
      </p>

      <div className="bg-[#FFF4E6] border border-[#FFD700] rounded-xl p-4 mb-8">
        <p className="text-sm text-[#2F3E55]">
          <strong>Penting:</strong> Harap selesaikan pembayaran Anda dalam batas
          waktu yang ditentukan untuk menghindari pembatalan otomatis.
        </p>
      </div>

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
          onClick={() => router.push("/")}
          className="w-full border border-[#2F3E55] text-[#2F3E55] py-3 rounded-xl hover:bg-[#F7F4EF] transition"
        >
          Kembali ke Beranda
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-8">
        Butuh bantuan? Hubungi kami di WhatsApp: <br />
        <a
          href="https://wa.me/6281370251119"
          className="text-[#2F3E55] underline"
        >
          +62 813-7025-1119
        </a>
      </p>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <Suspense
        fallback={
          <div className="max-w-md w-full text-center">
            <p className="text-[#2F3E55]">Loading...</p>
          </div>
        }
      >
        <PaymentPendingContent />
      </Suspense>
    </main>
  );
}
