"use client";

import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "@/lib/i18n";

export default function CTASection() {
  const { t } = useLanguage();

  return (
    <section id="cta" className="w-full bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-16 min-h-[500px]">
        {/* RIGHT — TEXT */}
        <div className="flex-1">
          <h2 className="leading-tight text-[#2E3A4A] mb-8">{t.cta.title}</h2>

          <p className="text-[#2E3A4A] leading-relaxed max-w-xl mb-8">
            {t.cta.paragraph1}
            <br />
            <br />
            {t.cta.paragraph2}
            <br />
            <br />
            {t.cta.paragraph3}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/classes"
              className="inline-flex items-center justify-center gap-2 bg-[#2E3A4A] text-white px-6 py-3 rounded-full hover:opacity-90 transition font-medium"
            >
              {t.cta.viewClasses}
            </Link>

            <Link
              href="/schedule"
              className="inline-flex items-center justify-center gap-2 bg-[#2E3A4A] text-white px-6 py-3 rounded-full hover:opacity-90 transition font-medium"
            >
              {t.cta.joinClass}
            </Link>

            <a
              href="https://wa.me/6281370251119?text=Hi%2C%20I%27d%20like%20to%20book%20a%20private%20Pilates%20class"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#2E3A4A] text-[#2E3A4A] px-6 py-3 rounded-full hover:bg-[#2E3A4A] hover:text-white transition font-medium"
            >
              <FaWhatsapp size={20} />
              {t.cta.bookPrivate}
            </a>
          </div>
        </div>

        {/* LEFT — IMAGE */}
        <div className="flex-1 flex justify-start">
          <Image
            src="/images/cta.jpg"
            alt="Start Your Pilates Journey"
            width={480}
            height={480}
            className="rounded-2xl object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
