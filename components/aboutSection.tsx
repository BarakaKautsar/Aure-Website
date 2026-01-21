"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n";

export default function AboutSection() {
  const { t } = useLanguage();

  return (
    <section id="about" className="w-full bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 min-h-[500px]">
        {/* LEFT — TEXT */}
        <div className="flex-1">
          <h2 className="leading-tight text-[#2E3A4A] mb-8">{t.about.title}</h2>

          <p className="text-[#2E3A4A] leading-relaxed max-w-xl">
            {t.about.paragraph1}
            <br />
            <br />
            {t.about.paragraph2}
            <br />
            <br />
            {t.about.paragraph3}
            <br />
            <br />
            {t.about.paragraph4}
          </p>
        </div>

        {/* RIGHT — IMAGE */}
        <div className="flex-1 flex justify-end">
          <Image
            src="/images/about.jpg"
            alt="About Aure Pilates"
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
