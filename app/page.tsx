import HeroSection from "@/components/heroSection";
import AboutSection from "@/components/aboutSection";
import LocationsSection from "@/components/locationsSection";
import CTASection from "@/components/ctaSection";

export default function HomePage() {
  return (
    <main className="w-full">
      <section id="hero">
        <HeroSection />
      </section>
      <section id="about">
        <AboutSection />
      </section>
      <section id="locations">
        <LocationsSection />
      </section>
      <section id="cta">
        <CTASection />
      </section>
    </main>
  );
}
