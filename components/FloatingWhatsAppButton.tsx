"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiX, FiMapPin } from "react-icons/fi";
import { useLanguage } from "@/lib/i18n";

const WHATSAPP_NUMBERS = {
  tasikmalaya: "6281370251119",
  kbp: "6281381409810", // Removed spaces and special chars for WhatsApp link
};

export default function FloatingWhatsAppButton() {
  const { t, language } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const handleLocationSelect = (location: "tasikmalaya" | "kbp") => {
    const number = WHATSAPP_NUMBERS[location];
    const message =
      t.whatsapp?.defaultMessage ||
      "Hello, I'd like to know more about Aure Pilates Studio";
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setShowModal(false);
  };

  return (
    <>
      {/* Desktop: Full button with text */}
      <button
        onClick={() => setShowModal(true)}
        className="hidden md:flex fixed bottom-8 right-8 items-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
        aria-label="Chat with us on WhatsApp"
      >
        <FaWhatsapp className="w-6 h-6" />
        <span className="font-medium text-lg">
          {t.whatsapp?.contactUs || "Contact Us"}
        </span>
      </button>

      {/* Mobile: Icon only */}
      <button
        onClick={() => setShowModal(true)}
        className="md:hidden fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#20BA5A] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        aria-label="Chat with us on WhatsApp"
      >
        <FaWhatsapp className="w-7 h-7" />
      </button>

      {/* Location Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-8 z-10 animate-fadeIn">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <FiX size={24} />
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center mb-4">
                <FaWhatsapp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-medium text-[#2F3E55] mb-2">
                {t.whatsapp?.selectLocation || "Select Location"}
              </h3>
              <p className="text-sm text-gray-600">
                {t.whatsapp?.selectLocationDesc ||
                  "Choose which studio location you'd like to contact"}
              </p>
            </div>

            <div className="space-y-3">
              {/* Tasikmalaya Option */}
              <button
                onClick={() => handleLocationSelect("tasikmalaya")}
                className="w-full bg-[#F7F4EF] hover:bg-[#25D366] hover:text-white border-2 border-transparent hover:border-[#25D366] rounded-xl p-5 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white group-hover:bg-white/20 rounded-full flex items-center justify-center transition">
                    <FiMapPin className="w-6 h-6 text-[#2E3A4A] group-hover:text-white transition" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-[#2E3A4A] group-hover:text-white text-lg mb-1 transition">
                      Tasikmalaya
                    </h4>
                    <p className="text-sm text-gray-600 group-hover:text-white/90 transition">
                      +62 813-7025-1119
                    </p>
                  </div>
                  <FaWhatsapp className="w-6 h-6 text-[#25D366] group-hover:text-white transition" />
                </div>
              </button>

              {/* KBP Option */}
              <button
                onClick={() => handleLocationSelect("kbp")}
                className="w-full bg-[#F7F4EF] hover:bg-[#25D366] hover:text-white border-2 border-transparent hover:border-[#25D366] rounded-xl p-5 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white group-hover:bg-white/20 rounded-full flex items-center justify-center transition">
                    <FiMapPin className="w-6 h-6 text-[#2E3A4A] group-hover:text-white transition" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-[#2E3A4A] group-hover:text-white text-lg mb-1 transition">
                      KBP
                    </h4>
                    <p className="text-sm text-gray-600 group-hover:text-white/90 transition">
                      +62 813-8140-9810
                    </p>
                  </div>
                  <FaWhatsapp className="w-6 h-6 text-[#25D366] group-hover:text-white transition" />
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 px-4 py-3 text-gray-600 hover:text-[#2E3A4A] text-sm transition"
            >
              {t.common?.cancel || "Cancel"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
