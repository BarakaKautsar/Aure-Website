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
      <div className="max-w-6xl px-6 py-8 mx-auto">
        {/* Title */}
        <h2 className="text-2xl font-semibold mb-6">
          {t.footer?.contactUs || "Contact Us"}
        </h2>

        {/* Main Contact Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Tasikmalaya Location */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiMapPin size={20} />
              Tasikmalaya Studio
            </h3>
            <div className="space-y-3 text-base">
              <a
                href="https://wa.me/6281370251119"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#25D366] transition"
              >
                <FaWhatsapp size={20} />
                +62 813-7025-1119
              </a>
              <a
                href="https://maps.app.goo.gl/jSRH6wySTe6Lrip59"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:underline transition"
              >
                <FiMapPin size={20} className="shrink-0 mt-1" />
                <span>
                  Jl. Sutisna Senjaya No.57, Empangsari, Kec. Tawang,
                  Kab.Tasikmalaya, Jawa Barat 46122
                </span>
              </a>
            </div>
          </div>

          {/* KBP Location */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiMapPin size={20} />
              KBP Studio
            </h3>
            <div className="space-y-3 text-base">
              <a
                href="https://wa.me/6281381409810"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#25D366] transition"
              >
                <FaWhatsapp size={20} />
                +62 813-8140-9810
              </a>
              {/* Add KBP address when available */}
              {/* <a
                href="[KBP_GOOGLE_MAPS_LINK]"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:underline transition"
              >
                <FiMapPin size={20} className="shrink-0 mt-1" />
                <span>
                  [KBP Studio Address]
                </span>
              </a> */}
            </div>
          </div>
        </div>

        {/* General Contact */}
        <div className="border-t border-[#304155]/20 pt-6">
          <div className="flex flex-col md:flex-row md:gap-8 gap-3 text-base">
            <a
              href="https://instagram.com/aurepilatesstudio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-[#E4405F] transition"
            >
              <FiInstagram size={20} />
              @aurepilatesstudio
            </a>

            <a
              href="mailto:aurepilatesstudio1@gmail.com"
              className="flex items-center gap-2 hover:underline transition"
            >
              <FiMail size={20} />
              aurepilatesstudio1@gmail.com
            </a>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-sm mt-8 text-center md:text-left border-t border-[#304155]/20 pt-6">
          {t.footer?.copyright ||
            "Copyrights © 2025 All Rights Reserved by Aure Pilates Studio"}
        </p>
      </div>
    </footer>
  );
}
