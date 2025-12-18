"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type PackageOption = {
  label: string;
  price: string;
  exp: string;
};

type PackageGroup = {
  title: string;
  image: string;
  options: PackageOption[];
};

export default function PackagesSection() {
  const [packages, setPackages] = useState<PackageGroup[]>([]);

  useEffect(() => {
    const fetchPackages = async () => {
      const { data, error } = await supabase
        .from("package_types")
        .select("*")
        .eq("is_active", true)
        .order("class_credits");

      if (error) {
        console.error(error);
        return;
      }

      const grouped: Record<string, PackageGroup> = {
        reformer: {
          title: "Reformer Package",
          image: "/images/Classes/Reformer.jpg",
          options: [],
        },
        spine_corrector: {
          title: "Spine Corrector Package",
          image: "/images/Classes/Spine.jpg",
          options: [],
        },
        matt: {
          title: "Matt Package",
          image: "/images/Classes/Matt.jpg",
          options: [],
        },
      };

      data.forEach((pkg) => {
        grouped[pkg.category]?.options.push({
          label: `${pkg.class_credits} Class Pass`,
          price: `Rp. ${pkg.price.toLocaleString("id-ID")}`,
          exp: `EXP ${pkg.validity_days} Days`,
        });
      });

      setPackages(Object.values(grouped));
    };

    fetchPackages();
  }, []);

  const handleGetPackage = () => {
    // if (!user) {
    //   router.push("/login");
    // } else {
    //   router.push("/purchase");
    // }
  };

  return (
    <section id="packages" className="bg-[#F7F4EF] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-center mb-16">Save More With Packages</h2>

        <div className="space-y-12">
          {packages.map((pkg) => (
            <div
              key={pkg.title}
              className="bg-white shadow-md rounded-sm p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
            >
              {/* Image */}
              <div className="md:col-span-1">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>

              {/* Content */}
              <div className="md:col-span-2">
                <h3 className="text-3xl font-medium text-[#2E3A4A] mb-6">
                  {pkg.title}
                </h3>

                <div className="space-y-3 mb-6">
                  {pkg.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-3 bg-[#B7C9E5] text-[#2E3A4A] px-4 py-3 text-sm md:text-base hover:shadow-lg hover:-translate-y-0.5 transition"
                    >
                      <span>{opt.label}</span>
                      <span className="text-center font-medium">
                        {opt.price}
                      </span>
                      <span className="text-right">{opt.exp}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleGetPackage}
                  className="bg-[#2E3A4A] text-white px-6 py-3 rounded-md hover:opacity-90 transition"
                >
                  Get Package ›
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
