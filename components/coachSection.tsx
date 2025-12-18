"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { FiInstagram } from "react-icons/fi";

type Coach = {
  id: string;
  name: string;
  bio: string;
  instagram_url: string | null;
  image_url: string | null;
};

export default function CoachesSection() {
  const [coaches, setCoaches] = useState<Coach[]>([]);

  useEffect(() => {
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

    fetchCoaches();
  }, []);

  return (
    <section id="coaches" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="mb-12">Meet The Coaches</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {coaches.map((coach) => (
            <div
              key={coach.name}
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
              <h3 className="text-2xl text-center font-medium text-[#2E3A4A] mb-4 capitalize">
                {coach.name}
              </h3>

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
      </div>
    </section>
  );
}
