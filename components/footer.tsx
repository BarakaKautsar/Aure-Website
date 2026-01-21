"use client";

import { FiInstagram, FiMail, FiMapPin } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { Cabin } from "next/font/google";
import { useLanguage } from "@/lib/i18n";

const cabin = Cabin({
  subsets: ["latin"],
  weight: ["400"],
});

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className={`${cabin.className} w-full bg-[#ABC3E5] text-[#304155]`}>
      <div className="max-w-6xl px-6 py-6 justify-start">
        {/* Title */}
        <h2 className="text-2xl font-semibold mb-6">{t.footer.contactUs}</h2>

        {/* Contact Row */}
        <div className="flex flex-col md:flex-row md:gap-10 gap-4 text-lg">
          {/* Instagram */}
          <a
            href="https://instagram.com/aurepilatesstudio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <FiInstagram size={22} />
            @aurepilatesstudio
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/6281370251119"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <FaWhatsapp size={22} />
            +6281370251119
          </a>

          {/* Email */}
          <a
            href="mailto:aurepilatesstudio1@gmail.com"
            className="flex items-center gap-2"
          >
            <FiMail size={22} />
            aurepilatesstudio1@gmail.com
          </a>

          {/* Location */}
          <a
            href="https://maps.app.goo.gl/jSRH6wySTe6Lrip59"
            className="flex items-center gap-2"
          >
            <FiMapPin size={22} className="shrink-0" />
            <span>
              Jl. Sutisna Senjaya No.57, Empangsari, Kec. Tawang,
              Kab.Tasikmalaya, Jawa Barat 46122
            </span>
          </a>
        </div>

        {/* Copyright */}
        <p className="text-sm mt-8">{t.footer.copyright}</p>
      </div>
    </footer>
  );
}
