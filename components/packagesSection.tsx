"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import PurchasePackageModal, {
  PurchaseSuccessModal,
} from "./PurchasePackageModal";

type PackageOption = {
  id: string;
  label: string;
  price: string;
  priceNum: number;
  exp: string;
  credits: number;
  validityDays: number;
};

type PackageGroup = {
  title: string;
  image: string;
  category: string;
  options: PackageOption[];
};

export default function PackagesSection() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageGroup[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    const { data, error } = await supabase
      .from("package_types")
      .select("*")
      .eq("is_active", true)
      .order("class_credits");

    if (error) {
      console.error("Package fetch error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return;
    }

    const grouped: Record<string, PackageGroup> = {
      reformer: {
        title: "Reformer Package",
        image: "/images/Classes/Reformer.jpg",
        category: "reformer",
        options: [],
      },
      spine_corrector: {
        title: "Spine Corrector Package",
        image: "/images/Classes/Spine.jpg",
        category: "spine_corrector",
        options: [],
      },
      matt: {
        title: "Matt Package",
        image: "/images/Classes/Matt.jpg",
        category: "matt",
        options: [],
      },
      aerial: {
        title: "Aerial Package",
        image: "/images/Classes/Aerial.jpeg",
        category: "aerial",
        options: [],
      },
    };

    data.forEach((pkg) => {
      grouped[pkg.category]?.options.push({
        id: pkg.id,
        label: `${pkg.class_credits} Class Pass`,
        price: `Rp. ${pkg.price.toLocaleString("id-ID")}`,
        priceNum: pkg.price,
        exp: `EXP ${pkg.validity_days} Days`,
        credits: pkg.class_credits,
        validityDays: pkg.validity_days,
      });
    });

    setPackages(Object.values(grouped));
  };

  const handleGetPackage = (
    packageOption: PackageOption,
    category: string,
    groupTitle: string
  ) => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent("/#packages")}`);
      return;
    }

    setSelectedPackage(packageOption);
    setSelectedCategory(category);
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = () => {
    setShowPurchaseModal(false);
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push("/account?tab=packages");
  };

  return (
    <section id="packages" className="bg-[#F7F4EF] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-center mb-16">Save More With Packages</h2>

        <div className="space-y-12">
          {packages.map((pkg) => (
            <div
              key={pkg.title}
              className="bg-white shadow-md rounded-lg overflow-hidden"
            >
              {/* Mobile: Vertical Stack */}
              <div className="md:hidden">
                {/* Image */}
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-48 object-cover"
                />

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-medium text-[#2E3A4A] mb-4">
                    {pkg.title}
                  </h3>

                  <div className="space-y-3">
                    {pkg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          handleGetPackage(opt, pkg.category, pkg.title)
                        }
                        className="w-full bg-[#B7C9E5] text-[#2E3A4A] rounded-lg px-4 py-3 hover:shadow-lg transition"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-left">
                            {opt.label}
                          </span>
                          <span className="text-lg font-semibold">
                            {opt.price}
                          </span>
                          <span className="text-sm text-right">{opt.exp}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop: Horizontal Layout */}
              <div className="hidden md:grid md:grid-cols-3 gap-8 p-8 items-center">
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

                  <div className="space-y-3">
                    {pkg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          handleGetPackage(opt, pkg.category, pkg.title)
                        }
                        className="w-full grid grid-cols-3 bg-[#B7C9E5] text-[#2E3A4A] px-4 py-3 text-base hover:shadow-lg hover:-translate-y-0.5 transition cursor-pointer rounded-lg"
                      >
                        <span>{opt.label}</span>
                        <span className="text-center font-medium">
                          {opt.price}
                        </span>
                        <span className="text-right">{opt.exp}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedPackage && (
        <PurchasePackageModal
          packageInfo={{
            id: selectedPackage.id,
            name: selectedPackage.label,
            class_credits: selectedPackage.credits,
            validity_days: selectedPackage.validityDays,
            price: selectedPackage.priceNum,
            category: selectedCategory,
          }}
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <PurchaseSuccessModal onClose={handleSuccessClose} />
      )}
    </section>
  );
}
