"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";

type PackageRow = {
  id: string;
  total_credits: number;
  remaining_credits: number;
  expires_at: string;
  created_at: string;
  package_type: {
    name: string;
    class_credits: number;
    validity_days: number;
  };
};

export default function ActivePackagesTab() {
  const [activePackages, setActivePackages] = useState<PackageRow[]>([]);
  const [pastPackages, setPastPackages] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("packages")
      .select(
        `
        id,
        total_credits,
        remaining_credits,
        expires_at,
        created_at,
        package_type:package_type_id!inner (
          name,
          class_credits,
          validity_days
        )
      `,
      )
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("expires_at", { ascending: true });

    if (error) {
      console.error("Error loading packages:", error);
      setLoading(false);
      return;
    }

    const now = new Date();
    const active: PackageRow[] = [];
    const past: PackageRow[] = [];

    (data as unknown as PackageRow[]).forEach((pkg) => {
      const expiryDate = new Date(pkg.expires_at);
      const isExpired = expiryDate < now;
      const isFullyUsed = pkg.remaining_credits === 0;

      if (isExpired || isFullyUsed) {
        past.push(pkg);
      } else {
        active.push(pkg);
      }
    });

    setActivePackages(active);
    setPastPackages(past);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === "id" ? "id-ID" : "en-US";
    return date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderPackageCard = (pkg: PackageRow, isPast: boolean = false) => {
    const used = pkg.total_credits - pkg.remaining_credits;
    const progress = (used / pkg.total_credits) * 100;

    const now = new Date();
    const expiryDate = new Date(pkg.expires_at);
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
    const isExpired = daysUntilExpiry < 0;
    const isFullyUsed = pkg.remaining_credits === 0;

    return (
      <div
        key={pkg.id}
        className={`bg-white border rounded-2xl p-6 transition-all ${
          isPast
            ? "border-gray-200 opacity-70"
            : isExpiringSoon
              ? "border-yellow-400 shadow-md"
              : "border-gray-200 hover:shadow-md"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-[#2F3E55] mb-1">
              {pkg.package_type.name ?? "Package"}
            </h3>
            <p className="text-sm text-gray-500">
              {pkg.package_type.class_credits}{" "}
              {t.account.activePackages.classesLabel} •{" "}
              {pkg.package_type.validity_days}{" "}
              {t.account.activePackages.validityDays}
            </p>
          </div>

          {isFullyUsed && (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              {t.account.activePackages.completed}
            </span>
          )}
          {isExpired && !isFullyUsed && (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              {t.account.activePackages.expired}
            </span>
          )}
          {isExpiringSoon && !isFullyUsed && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
              {t.account.activePackages.expiringSoon}
            </span>
          )}
          {!isExpiringSoon && !isExpired && !isFullyUsed && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              {t.account.activePackages.active}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">
              {t.account.activePackages.remaining}
            </p>
            <p className="text-2xl font-bold text-[#2E3A4A]">
              {pkg.remaining_credits}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">
              {t.account.activePackages.used}
            </p>
            <p className="text-2xl font-bold text-gray-400">{used}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{t.account.activePackages.progress}</span>
            <span>
              {used}/{pkg.total_credits} {t.account.activePackages.classesLabel}
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isFullyUsed
                  ? "bg-gray-400"
                  : isExpired
                    ? "bg-red-400"
                    : isExpiringSoon
                      ? "bg-yellow-400"
                      : "bg-[#2E3A4A]"
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">
              {t.account.activePackages.purchased}
            </span>
            <span className="font-medium text-[#2E3A4A]">
              {formatDate(pkg.created_at)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">
              {t.account.activePackages.expires}
            </span>
            <span
              className={`font-medium ${
                isExpired
                  ? "text-red-600"
                  : isExpiringSoon
                    ? "text-yellow-600"
                    : "text-[#2E3A4A]"
              }`}
            >
              {formatDate(pkg.expires_at)}
              {!isExpired && daysUntilExpiry >= 0 && (
                <span className="text-xs ml-1">
                  ({daysUntilExpiry}
                  {t.account.activePackages.daysLeft})
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[#2F3E55]">{t.account.activePackages.loading}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-light text-[#2F3E55]">
            {t.account.activePackages.title}
          </h2>
          {activePackages.length > 0 && (
            <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              {activePackages.length}{" "}
              {t.account.activePackages.active.toLowerCase()}
            </span>
          )}
        </div>

        {activePackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activePackages.map((pkg) => renderPackageCard(pkg, false))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="inline-block p-4 bg-white rounded-full mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <p className="text-gray-600 text-lg mb-2">
              {t.account.activePackages.noActivePackages}
            </p>
            <p className="text-gray-500 text-sm mb-4">
              {t.account.activePackages.noActivePackagesDesc}
            </p>
            <button
              onClick={() => (window.location.href = "/#packages")}
              className="px-6 py-3 bg-[#2E3A4A] text-white rounded-full font-medium hover:opacity-90 transition"
            >
              {t.account.activePackages.browsePackages}
            </button>
          </div>
        )}
      </div>

      {pastPackages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-[#2F3E55]">
              {t.account.activePackages.pastPackages}
            </h2>
            <span className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
              {pastPackages.length}{" "}
              {t.account.activePackages.completed.toLowerCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastPackages.map((pkg) => renderPackageCard(pkg, true))}
          </div>
        </div>
      )}
    </div>
  );
}
