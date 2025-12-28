// app/payment/failed/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";

export default function PaymentFailedPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-red-500 flex items-center justify-center text-white">
          <FiX size={48} />
        </div>

        <h1 className="text-3xl font-medium text-[#2F3E55] mb-4">
          Pembayaran Gagal
        </h1>

        <p className="text-[#2F3E55] mb-8">
          Pembayaran Anda tidak berhasil diproses. Silakan coba lagi atau
          hubungi kami jika masalah berlanjut.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full bg-[#2F3E55] text-white py-3 rounded-xl hover:opacity-90 transition"
          >
            Coba Lagi
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
    </main>
  );
}
