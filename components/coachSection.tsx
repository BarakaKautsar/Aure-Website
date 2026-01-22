"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { FiInstagram } from "react-icons/fi";
import { useLanguage } from "@/lib/i18n";

const LOCATIONS = [
  "All Locations",
  "Aure Pilates Studio Tasikmalaya",
  "Aure Pilates Studio KBP",
];

type Coach = {
  id: string;
  name: string;
  bio: string;
  instagram_url: string | null;
  image_url: string | null;
  location: string | null;
};

export default function CoachesSection() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<string>("All Locations");
  const { t } = useLanguage();

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    const { data, error } = await supabase
      .from("coaches")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Failed to fetch coaches:", error);
      return;
    }

    setCoaches(data ?? []);
  };

  const filteredCoaches = coaches.filter((coach) => {
    if (selectedLocation === "All Locations") return true;
    return coach.location === selectedLocation;
  });

  return (
    <section id="coaches" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="mb-8">{t.coaches.title}</h2>

        {/* Location Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative">
            <button
              onClick={() => {
                const dropdown = document.getElementById(
                  "coach-location-dropdown"
                );
                if (dropdown) dropdown.classList.toggle("hidden");
              }}
              className="flex items-center gap-2 px-5 py-3 bg-[#F7F4EF] rounded-full border border-gray-300 hover:border-[#2E3A4A] transition font-medium text-[#2E3A4A]"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>
                {selectedLocation === "All Locations"
                  ? t.schedule?.allLocations || "All Locations"
                  : selectedLocation.replace("Aure Pilates Studio ", "")}
              </span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div
              id="coach-location-dropdown"
              className="hidden absolute top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-[200px] z-10"
            >
              {LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setSelectedLocation(loc);
                    document
                      .getElementById("coach-location-dropdown")
                      ?.classList.add("hidden");
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 text-sm ${
                    selectedLocation === loc ? "bg-gray-50 font-medium" : ""
                  }`}
                >
                  {loc === "All Locations"
                    ? t.schedule?.allLocations || "All Locations"
                    : loc.replace("Aure Pilates Studio ", "")}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filter Button */}
          {selectedLocation !== "All Locations" && (
            <button
              onClick={() => setSelectedLocation("All Locations")}
              className="px-4 py-2 text-sm text-gray-600 hover:text-[#2E3A4A] underline"
            >
              {t.schedule?.clearAll || "Clear filter"}
            </button>
          )}
        </div>

        {/* Coach Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredCoaches.length}{" "}
            {filteredCoaches.length === 1 ? "Coach" : "Coaches"}
          </p>
        </div>

        {/* Coaches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredCoaches.map((coach) => (
            <div
              key={coach.id}
              className="bg-[#F7F4EF] group rounded-sm overflow-hidden transition-all duration-300 ease-out
           shadow-sm hover:shadow-lg hover:-translate-y-0.5 min-h-[450px] p-8 flex flex-col"
            >
              {/* Image */}
              <div className="flex justify-center mb-6">
                <img
                  src={coach.image_url || "/images/Coach/placeholder.jpg"}
                  alt={coach.name}
                  className="w-48 h-48 rounded-full object-cover"
                />
              </div>

              {/* Name */}
              <h3 className="text-2xl text-center font-medium text-[#2E3A4A] mb-2 capitalize">
                {coach.name}
              </h3>

              {/* Location Badge */}
              {coach.location && (
                <p className="text-xs text-center text-gray-500 mb-4">
                  {coach.location.replace("Aure Pilates Studio ", "")}
                </p>
              )}

              {/* Bio */}
              <p className="text-[#2E3A4A] text-sm leading-relaxed text-center mb-6">
                {coach.bio}
              </p>

              {/* Social */}
              <div className="mt-auto flex justify-center">
                <a
                  href={coach.instagram_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-[#2E3A4A] flex items-center justify-center text-[#2E3A4A] hover:bg-[#2E3A4A] hover:text-[#FBF8F2] transition"
                >
                  <FiInstagram size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* No Coaches Message */}
        {filteredCoaches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No coaches found for this location.</p>
          </div>
        )}
      </div>
    </section>
  );
}
