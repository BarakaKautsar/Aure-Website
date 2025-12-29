import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="about" className="w-full bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 min-h-[500px]">
        {/* LEFT — TEXT */}
        <div className="flex-1">
          <h2 className="leading-tight text-[#2E3A4A] mb-8">About Us</h2>

          <p className="text-[#2E3A4A] leading-relaxed max-w-xl">
            At Aure Pilates, we believe in the power of flow, where movement
            feels natural, breath guides the body, and strength is built with
            ease. Our studio is a space designed for connection: between body
            and mind, effort and release, movement and stillness.
            <br />
            <br />
            Our Pilates approach emphasizes fluid transitions, mindful control,
            and rhythmic breath. Each session invites you to move with
            awareness, allowing the body to flow freely while building balance,
            stability, and grace.
            <br />
            <br />
            Guided by experienced and attentive instructors, our classes are
            thoughtfully designed to support your unique journey, whether you
            are beginning your Pilates practice or refining it. We honor
            progress that feels sustainable, intuitive, and aligned with your
            body.
            <br />
            <br />
            This is more than a workout—it's a practice, a community, and a
            lifestyle
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
