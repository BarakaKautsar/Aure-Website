import HeroSection from "@/components/heroSection";
import AboutSection from "@/components/aboutSection";

export default function HomePage() {
  return (
    <main className="w-full">
      <section id="hero">
        <HeroSection />
      </section>
      <section id="about">
        <AboutSection />
      </section>
    </main>
  );
}
