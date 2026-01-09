// components/FloatingWhatsAppButton.tsx
"use client";

import { FaWhatsapp } from "react-icons/fa";

export default function FloatingWhatsAppButton() {
  const whatsappNumber = "6281370251119"; // Your WhatsApp number
  const whatsappMessage = "Hi! I'd like to inquire about Aure Pilates classes.";

  const handleClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      whatsappMessage
    )}`;
    window.open(url, "_blank");
  };

  return (
    <>
      {/* Desktop: Full button with text */}
      <button
        onClick={handleClick}
        className="hidden md:flex fixed bottom-8 right-8 items-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
        aria-label="Chat with us on WhatsApp"
      >
        <FaWhatsapp className="w-6 h-6" />
        <span className="font-medium text-lg">Contact Us</span>
      </button>

      {/* Mobile: Icon only */}
      <button
        onClick={handleClick}
        className="md:hidden fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#20BA5A] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        aria-label="Chat with us on WhatsApp"
      >
        <FaWhatsapp className="w-7 h-7" />
      </button>
    </>
  );
}
