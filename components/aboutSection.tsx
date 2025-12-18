import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="about" className="w-full bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 min-h-[500px]">
        {/* LEFT — TEXT */}
        <div className="flex-1">
          <h2 className="leading-tight text-[#2E3A4A] mb-8">About Us</h2>

          <p className="text-[#2E3A4A] leading-relaxed max-w-xl">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>

        {/* RIGHT — IMAGE */}
        <div className="flex-1 flex justify-end">
          <Image
            src="/images/ABOUT.jpg"
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
