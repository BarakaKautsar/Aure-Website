import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

export default function CTASection() {
  return (
    <section id="cta" className="w-full bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-16 min-h-[500px]">
        {/* RIGHT — TEXT */}
        <div className="flex-1">
          <h2 className="leading-tight text-[#2E3A4A] mb-8">Start Today!</h2>

          <p className="text-[#2E3A4A] leading-relaxed max-w-xl mb-8">
            We offer classes designed to meet you where you are—whether you're
            new to Pilates or deepening your practice. From mat work to reformer
            sessions, each class is thoughtfully structured to build strength,
            enhance flexibility, and cultivate mindful movement.
            <br />
            <br />
            Join us for group classes that foster connection and motivation, or
            book a private session tailored to your unique goals. Our
            experienced instructors are here to guide you every step of the way.
            <br />
            <br />
            Your journey starts now. Let's move together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/classes"
              className="inline-flex items-center justify-center gap-2 bg-[#2E3A4A] text-white px-6 py-3 rounded-full hover:opacity-90 transition font-medium"
            >
              View Classes
            </Link>

            <Link
              href="/schedule"
              className="inline-flex items-center justify-center gap-2 bg-[#2E3A4A] text-white px-6 py-3 rounded-full hover:opacity-90 transition font-medium"
            >
              Join Class
            </Link>

            <a
              href="https://wa.me/6281370251119?text=Hi%2C%20I%27d%20like%20to%20book%20a%20private%20Pilates%20class"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#2E3A4A] text-[#2E3A4A] px-6 py-3 rounded-full hover:bg-[#2E3A4A] hover:text-white transition font-medium"
            >
              <FaWhatsapp size={20} />
              Book Private Class
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
