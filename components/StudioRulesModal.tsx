"use client";

import { useState } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import { useLanguage } from "@/lib/i18n";

type StudioRulesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
};

export default function StudioRulesModal({
  isOpen,
  onClose,
  onAccept,
}: StudioRulesModalProps) {
  const [hasRead, setHasRead] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  const handleAccept = () => {
    if (hasRead && hasAgreed) {
      onAccept();
    }
  };

  const rules = language === "id" ? rulesID : rulesEN;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-[#2E3A4A]">
              {language === "id" ? "Peraturan Studio" : "Studio Rules"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {language === "id"
                ? "Harap baca dan setujui sebelum melanjutkan"
                : "Please read and agree before continuing"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4 text-[#2E3A4A]">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
              >
                <div className="shrink-0 w-6 h-6 rounded-full bg-[#2E3A4A] text-white flex items-center justify-center text-sm font-semibold mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed flex-1">{rule}</p>
              </div>
            ))}
          </div>

          {/* Important Notice */}
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-red-600 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-red-900 mb-1">
                  {language === "id"
                    ? "PENTING - TIDAK ADA PENGEMBALIAN DANA"
                    : "IMPORTANT - NO REFUNDS"}
                </p>
                <p className="text-sm text-red-800">
                  {language === "id"
                    ? "Paket yang sudah dibeli tidak dapat dikembalikan dalam bentuk uang. Harap reschedule minimal 12 jam sebelum kelas dimulai."
                    : "Purchased packages are non-refundable. Please reschedule at least 12 hours before class begins."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {/* Checkboxes */}
          <div className="space-y-3 mb-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={hasRead}
                onChange={(e) => setHasRead(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-[#2E3A4A] focus:ring-[#2E3A4A] cursor-pointer"
              />
              <span className="text-sm text-[#2E3A4A] group-hover:text-[#2E3A4A]/80 transition">
                {language === "id"
                  ? "Saya telah membaca semua peraturan studio"
                  : "I have read all the studio rules"}
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-[#2E3A4A] focus:ring-[#2E3A4A] cursor-pointer"
              />
              <span className="text-sm text-[#2E3A4A] group-hover:text-[#2E3A4A]/80 transition">
                {language === "id"
                  ? "Saya setuju untuk mengikuti semua peraturan yang berlaku"
                  : "I agree to follow all the rules stated above"}
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-[#2E3A4A] rounded-xl font-medium hover:bg-gray-100 transition"
            >
              {language === "id" ? "Batal" : "Cancel"}
            </button>
            <button
              onClick={handleAccept}
              disabled={!hasRead || !hasAgreed}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                hasRead && hasAgreed
                  ? "bg-[#2E3A4A] text-white hover:opacity-90"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <FiCheck size={20} />
              {language === "id" ? "Setuju & Lanjutkan" : "Agree & Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Studio Rules Content
const rulesEN = [
  "Our booking system uses RSVP on website",
  "We do not offer refunds for purchased packages",
  "Reschedule confirmation must be made at least 12 hours before class. Otherwise it will be considered forfeited.",
  "Please SILENT your PHONE when during class",
  "Children under 12 are not allowed",
  "Keep an eye your personal items, we aren't responsible for any losses",
  "Anti slip socks are required for safety",
  "Please arrive 10-15 minutes before class begins. The maximum late arrival is 10 minutes, beyond this you will not be able to join the warm-up session.",
  "Class duration 50 minutes for any session",
  "You are permitted to record during class using the tripod provided in the studio.",
  "Aure Pilates Studio may take photos/videos during class for our social media purposes. The coach will announce documentation sessions beforehand. If you have any objections, please inform our coach in advance.",
];

const rulesID = [
  "Sistem booking class adalah RSVP melalui website kami",
  "Kebijakan dari Management Aure Pilates Studio adalah NO REFUND, untuk segala pembayaran package yang sudah dibeli tidak bisa kami kembalikan dalam bentuk uang",
  "Konfirmasi reschedule 12 jam sebelum kelas dimulai, apabila kurang dari itu dianggap hangus",
  "Demi kenyamanan bersama, wajib untuk men-SILENT HANDPHONE",
  "Demi kenyamanan bersama, dilarang untuk membawa anak dibawah 12 tahun",
  "Dimohon untuk menjaga barang bawaan karena segala jenis kehilangan bukan tanggung jawab kami",
  "Wajib menggunakan kaos kaki anti slip dikarenakan untuk menghindari risiko tergelincir akibat alat yang licin",
  "Dimohon untuk datang 10-15 menit sebelum sesi class dimulai. Maksimal keterlambatan 10 menit, lebih dari itu tidak dapat melakukan sesi pemanasan",
  "Durasi kelas 50 menit per sesi",
  "Diperkenankan merekam saat kelas berlangsung dengan menggunakan tripod yang telah kami sediakan di studio",
  "Aure Pilates Studio akan mendokumentasikan photo/video selama kelas berlangsung untuk keperluan media social kami, coach akan mengumumkan bahwa akan ada sesi dokumentasi sebelum kelas berlangsung, apabila ada yang keberatan harap untuk informasikan ke coach kami.",
];
