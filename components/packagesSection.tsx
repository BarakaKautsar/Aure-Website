"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  FiCheck,
  FiClock,
  FiMapPin,
  FiInstagram,
  FiMail,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "@/lib/i18n";

const inputBase =
  "w-full border border-[#D1D5DB] rounded-xl px-4 py-3 bg-white text-[#2F3E55] focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]";

type PackageType = {
  id: string;
  name: string;
  class_credits: number;
  validity_days: number;
  price: number;
  category: string;
  location: string;
};

const LOCATIONS = ["All Locations", "Tasikmalaya", "KBP"];
const CLASS_TYPES = [
  "All Classes",
  "Reformer",
  "Spine Corrector",
  "Matt",
  "Aerial",
];

// Map database categories to display names
const categoryDisplayMap: Record<string, string> = {
  reformer: "Reformer",
  spine_corrector: "Spine Corrector",
  matt: "Matt",
  aerial: "Aerial",
};

export default function PackagesSection() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedClassType, setSelectedClassType] = useState("All Classes");
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Localized location options
  const locationOptions = [
    { value: "All Locations", label: t.packages.allLocations },
    { value: "Tasikmalaya", label: "Tasikmalaya" },
    { value: "KBP", label: "KBP" },
  ];

  // Localized class type options
  const classTypeOptions = [
    { value: "All Classes", label: t.packages.allClasses },
    { value: "Reformer", label: "Reformer" },
    { value: "Spine Corrector", label: "Spine Corrector" },
    { value: "Matt", label: "Matt" },
    { value: "Aerial", label: "Aerial" },
  ];

  useEffect(() => {
    fetchPackages();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
  };

  const fetchPackages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("package_types")
      .select("*")
      .eq("is_active", true)
      .order("location")
      .order("category")
      .order("class_credits");

    if (error) {
      console.error("Package fetch error:", error);
      setLoading(false);
      return;
    }

    setPackages(data || []);
    setLoading(false);
  };

  // Filter packages and group by location
  const filteredAndGroupedPackages = () => {
    const filtered = packages.filter((pkg) => {
      const locationMatch =
        selectedLocation === "All Locations" ||
        pkg.location === selectedLocation;

      const classTypeMatch =
        selectedClassType === "All Classes" ||
        categoryDisplayMap[pkg.category] === selectedClassType;

      return locationMatch && classTypeMatch;
    });

    const grouped: Record<string, PackageType[]> = {};
    filtered.forEach((pkg) => {
      if (!grouped[pkg.location]) {
        grouped[pkg.location] = [];
      }
      grouped[pkg.location].push(pkg);
    });

    return grouped;
  };

  const packagesByLocation = filteredAndGroupedPackages();
  const locations = Object.keys(packagesByLocation);

  const handleGetPackage = (pkg: PackageType) => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent("/#packages")}`);
      return;
    }

    router.push(`/purchase/${pkg.id}`);
  };

  const formatClassTypes = (category: string) => {
    const categories = category.split(",").map((c) => c.trim());
    return categories.map((c) => categoryDisplayMap[c] || c).join(", ");
  };

  return (
    <section id="packages" className="bg-[#F7F4EF] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-center mb-10">{t.packages.title}</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
          {/* Location Filter */}
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className={`${inputBase} appearance-none cursor-pointer`}
            >
              {locationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FiMapPin
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2F3E55] pointer-events-none"
              size={20}
            />
          </div>

          {/* Class Type Filter */}
          <div className="relative">
            <select
              value={selectedClassType}
              onChange={(e) => setSelectedClassType(e.target.value)}
              className={`${inputBase} appearance-none cursor-pointer`}
            >
              {classTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E3A4A] mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Packages by Location */}
            {locations.length > 0 ? (
              <div className="space-y-16">
                {locations.map((location, locationIndex) => (
                  <div key={location}>
                    {/* Desktop: Horizontal Layout */}
                    <div className="hidden md:grid md:grid-cols-4 gap-8">
                      {/* Location Label - Left Side (Sticky) */}
                      <div className="md:col-span-1">
                        <div className="sticky top-32 bg-[#F7F4EF] z-10 py-4">
                          <h3 className="text-2xl font-semibold text-[#2E3A4A]">
                            {language === "id"
                              ? `Paket untuk ${location}`
                              : `Packages for ${location}`}
                          </h3>
                        </div>
                      </div>

                      {/* Packages Cards - Right Side */}
                      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {packagesByLocation[location].map((pkg) => (
                          <div
                            key={pkg.id}
                            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col min-h-[420px]"
                          >
                            {/* Package Name */}
                            <h3 className="text-xl font-semibold text-[#2E3A4A] mb-4 leading-tight">
                              {pkg.name}
                            </h3>

                            {/* Price */}
                            <div className="mb-6">
                              <div className="text-3xl font-bold text-[#2E3A4A]">
                                Rp. {pkg.price.toLocaleString("id-ID")}
                              </div>
                            </div>

                            {/* Features List */}
                            <div className="space-y-3 mb-6 grow">
                              <div className="flex items-center gap-3">
                                <FiCheck
                                  className="text-green-600 shrink-0"
                                  size={18}
                                />
                                <span className="text-[#2E3A4A] text-sm">
                                  <strong>{pkg.class_credits}</strong>{" "}
                                  {t.packages.credits} {t.packages.forClasses}{" "}
                                  <strong>{formatClassTypes(pkg.category)}</strong>{" "}
                                  {t.packages.classesLabel}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <FiCheck
                                  className="text-green-600 shrink-0"
                                  size={18}
                                />
                                <span className="text-[#2E3A4A] text-sm">
                                  {t.packages.oneTimePayment}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <FiClock
                                  className="text-[#2E3A4A] shrink-0"
                                  size={18}
                                />
                                <span className="text-[#2E3A4A] text-sm">
                                  {t.packages.validFor}{" "}
                                  <strong>{pkg.validity_days}</strong>{" "}
                                  {t.packages.days} {t.packages.fromPurchase}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <FiMapPin
                                  className="text-[#2E3A4A] shrink-0"
                                  size={18}
                                />
                                <span className="text-[#2E3A4A] text-sm">
                                  <strong>{pkg.location}</strong>{" "}
                                  {t.packages.studio}
                                </span>
                              </div>
                            </div>

                            {/* CTA Button */}
                            <button
                              onClick={() => handleGetPackage(pkg)}
                              className="w-full bg-orange-500 text-white py-3 rounded-full font-medium hover:bg-orange-600 transition-all mt-auto"
                            >
                              {t.packages.getPackage}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mobile: Vertical Stack */}
                    <div className="md:hidden space-y-6">
                      {/* Location Header */}
                      {selectedLocation === "All Locations" && (
                        <h3 className="text-xl font-medium text-[#2E3A4A]">
                          {language === "id"
                            ? `Paket untuk ${location}`
                            : `Packages for ${location}`}
                        </h3>
                      )}

                      {/* Packages Grid */}
                      <div className="grid grid-cols-1 gap-6">
                        {packagesByLocation[location].map((pkg) => (
                          <div
                            key={pkg.id}
                            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
                          >
                            {/* Package Name */}
                            <h3 className="text-xl font-semibold text-[#2E3A4A] mb-4 leading-tight">
                              {pkg.name}
                            </h3>

                            {/* Price */}
                            <div className="mb-6">
                              <div className="text-3xl font-bold text-[#2E3A4A]">
                                Rp. {pkg.price.toLocaleString("id-ID")}
                              </div>
                            </div>

                            {/* Features List */}
                            <div className="space-y-3 mb-6 grow">
                              <div className="flex items-center gap-3">
                                <FiCheck
                                  className="text-green-600 shrink-0"
                                  size={18}
                                />
                                <span className="text-[#2E3A4A] text-sm">
                                  <strong>{pkg.class_credits}</strong>{" "}
                                  {t.packages.credits} {t.packages.forClasses}{" "}
                                  <strong>{formatClassTypes(pkg.category)}</strong>{" "}
                                  {t.packages.classesLabel}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <FiCheck
                                  className="text-green-600 shrink-0"
                                  size={18}
                                />
                                <span className="text-[#2E3A4A] text-sm">
                                  {t.packages.oneTimePayment}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <FiClock
                                  className="text-[#2E3A4A] shrink-0"
                                  size={18}
                                />
                                <span className="text-[#2E3A4A] text-sm">
                                  {t.packages.validFor}{" "}
                                  <strong>{pkg.validity_days}</strong>{" "}
                                  {t.packages.days} {t.packages.fromPurchase}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <FiMapPin
                                  className="text-[#2E3A4A] shrink-0"
                                  size={18}
                                />
                                <span className="text-[#2E3A4A] text-sm">
                                  <strong>{pkg.location}</strong>{" "}
                                  {t.packages.studio}
                                </span>
                              </div>
                            </div>

                            {/* CTA Button */}
                            <button
                              onClick={() => handleGetPackage(pkg)}
                              className="w-full bg-orange-500 text-white py-3 rounded-full font-medium hover:bg-orange-600 transition-all"
                            >
                              {t.packages.getPackage}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Divider between locations */}
                    {selectedLocation === "All Locations" &&
                      locationIndex < locations.length - 1 && (
                        <div className="mt-16 border-t border-gray-200" />
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">{t.packages.noPackages}</p>
                <button
                  onClick={() => {
                    setSelectedLocation("All Locations");
                    setSelectedClassType("All Classes");
                  }}
                  className="mt-4 text-[#2E3A4A] underline hover:no-underline"
                >
                  {t.packages.clearFilters}
                </button>
              </div>
            )}
          </>
        )}

        {/* Bottom Info */}
        <div className="mt-20 max-w-4xl mx-auto">
          <p className="text-lg leading-relaxed mb-8">
            {t.packages.contactPrompt}
            <br />
            <span className="font-medium">{t.packages.contactCta}</span>
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
