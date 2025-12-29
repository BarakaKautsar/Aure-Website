import Image from "next/image";
import { FiInstagram, FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const classes = [
  {
    title: "Reformer",
    image: "/images/Classes/Reformer.jpg",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    title: "Spine Corrector",
    image: "/images/Classes/Spine.jpg",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    title: "Matt",
    image: "/images/Classes/Matt.jpg",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
];

export default function ClassesSection() {
  return (
    <section id="classes" className="w-full bg-[#F7F4EF] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h2 className="text-center mb-16">Classes Available</h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {classes.map((item) => (
            <div
              key={item.title}
              className="group bg-white rounded-sm overflow-hidden transition-all duration-300 ease-out
           shadow-sm hover:shadow-lg hover:-translate-y-0.5 min-h-[600px]"
            >
              <div className="p-6">
                <div className="flex items-center justify-center mb-6">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={400}
                    height={300}
                    className="rounded-xl object-cover"
                  />
                </div>

                <h3 className="text-2xl font-medium text-[#2E3A4A] mb-4">
                  {item.title}
                </h3>

                <p className="leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom text */}
        <div className="mt-20 max-w-4xl">
          <p className="text-lg leading-relaxed mb-8">
            Not sure which of our class best fit your needs?
            <br />
            <span className="font-medium">
              Contact us here, Our team will be pleased to answer any question
              you have!
            </span>
          </p>

          {/* Contact row */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Instagram */}
            <a
              href="https://instagram.com/aurepilatesstudio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3 border border-[#2E3A4A] rounded-full text-[#2E3A4A] hover:bg-[#2E3A4A] hover:text-[#F7F4EF] transition"
            >
              <FiInstagram className="w-5 h-5 shrink-0" />
              @aurepilatesstudio
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/6281370251119"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3 border border-[#2E3A4A] rounded-full text-[#2E3A4A] hover:bg-[#2E3A4A] hover:text-[#F7F4EF] transition"
            >
              <FaWhatsapp className="w-5 h-5 shrink-0" />
              +6281370251119
            </a>

            {/* Email */}
            <a
              href="mailto:aurepilatesstudio1@gmail.com"
              className="flex items-center gap-3 px-5 py-3 border border-[#2E3A4A] rounded-full text-[#2E3A4A] hover:bg-[#2E3A4A] hover:text-[#F7F4EF] transition"
            >
              <FiMail className="w-5 h-5 shrink-0" />
              aurepilatesstudio1@gmail.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
