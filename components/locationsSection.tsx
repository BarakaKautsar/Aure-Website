import { FiMapPin, FiPhone, FiNavigation } from "react-icons/fi";

const locations = [
  {
    name: "Aure Pilates Studio Tasikmalaya",
    shortName: "Aure Pilates Studio Tasikmalaya",
    address:
      "Jl. Sutisna Senjaya No.57, Empangsari, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46122",
    phone: "+6281370251119",
    phoneDisplay: "+62 813-7025-1119",
    mapLink: "https://maps.app.goo.gl/jSRH6wySTe6Lrip59",
    image: "/images/login.jpg",
    isOpen: true,
  },
  {
    name: "Aure Pilates Studio KBP",
    shortName: "Aure Pilates Studio KBP",
    address: "-",
    phone: null,
    phoneDisplay: null,
    mapLink: null,
    image: "images/account.jpg", // Add image to public/images/
    isOpen: false,
    comingSoon: true,
  },
];

export default function LocationsSection() {
  return (
    <section id="locations" className="w-full bg-[#F7F4EF] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h2 className="text-center mb-16 text-[#2E3A4A]">Our Studios</h2>

        {/* Location Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {locations.map((location) => (
            <div
              key={location.name}
              className={`group bg-white rounded-2xl overflow-hidden transition-all duration-300 ease-out shadow-sm hover:shadow-lg hover:-translate-y-0.5 ${
                location.comingSoon ? "relative" : ""
              }`}
            >
              {/* Coming Soon Badge */}
              {location.comingSoon && (
                <div className="absolute top-4 right-4 z-10 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Coming Soon
                </div>
              )}

              {/* Image */}
              <div className="h-64 relative overflow-hidden">
                <img
                  src={location.image}
                  alt={location.name}
                  className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                    location.comingSoon ? "opacity-60" : ""
                  }`}
                />
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Name */}
                <h3 className="text-2xl font-semibold text-[#2E3A4A] mb-4">
                  {location.shortName}
                </h3>

                {/* Address */}
                <div className="flex items-start gap-3 mb-3">
                  <FiMapPin
                    className="text-[#2E3A4A] shrink-0 mt-1"
                    size={20}
                  />
                  <p className="text-[#2E3A4A] text-sm leading-relaxed">
                    {location.address}
                  </p>
                </div>

                {/* Phone */}
                {location.phone && (
                  <div className="flex items-center gap-3 mb-6">
                    <FiPhone className="text-[#2E3A4A] shrink-0" size={20} />
                    <a
                      href={`tel:${location.phone}`}
                      className="text-[#2E3A4A] text-sm hover:underline"
                    >
                      {location.phoneDisplay}
                    </a>
                  </div>
                )}

                {/* CTA Button */}
                {location.isOpen && location.mapLink ? (
                  <a
                    href={location.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#2E3A4A] text-white px-6 py-3 rounded-full hover:opacity-90 transition font-medium"
                  >
                    <FiNavigation size={18} />
                    Get Directions
                  </a>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center gap-2 bg-gray-300 text-gray-500 px-6 py-3 rounded-full cursor-not-allowed font-medium"
                  >
                    Opening Soon
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
