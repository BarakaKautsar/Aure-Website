import HeroSection from "@/components/heroSection";
import AboutSection from "@/components/aboutSection";
import ClassesSection from "@/components/classSection";
import CoachesSection from "@/components/coachSection";
import PackagesSection from "@/components/packagesSection";
import ScheduleSection from "@/components/scheduleSection";

export default function HomePage() {
  return (
    <main className="w-full">
      <section id="hero">
        <HeroSection />
      </section>
      <section id="about">
        <AboutSection />
      </section>
      <section id="classes" className="scroll-mt-24">
        <ClassesSection />
      </section>
      <section id="schedule" className="scroll-mt-24">
        <ScheduleSection />
      </section>
      <section id="packages" className="scroll-mt-24">
        <PackagesSection />
      </section>
      <section id="coaches" className="scroll-mt-24">
        <CoachesSection />
      </section>
    </main>
  );
}
