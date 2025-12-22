"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type PackageRow = {
  id: string;
  total_credits: number;
  remaining_credits: number;
  expires_at: string;
  package_type: {
    name: string;
  };
};

export default function ActivePackagesTab() {
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPackages = async () => {
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
          package_type:package_type_id!inner (
            name
          )
        `
        )
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("expires_at", { ascending: true });

      if (!error && data) {
        setPackages(data as unknown as PackageRow[]);
      }

      setLoading(false);
    };

    loadPackages();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[#2F3E55]">Loading your packages...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-light text-[#2F3E55] mb-6">
        Active Packages
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg) => {
          const used = pkg.total_credits - pkg.remaining_credits;
          const progress = (used / pkg.total_credits) * 100;

          const daysUntilExpiry = Math.ceil(
            (new Date(pkg.expires_at).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          );

          const isExpiringSoon = daysUntilExpiry <= 7;
          const isExpired = daysUntilExpiry < 0;
          const isFullyUsed = pkg.remaining_credits === 0;

          return (
            <div
              key={pkg.id}
              className={`bg-[#FBF8F2] border rounded-2xl p-6 transition ${
                isExpired || isFullyUsed
                  ? "border-gray-300 opacity-60 grayscale"
                  : isExpiringSoon
                  ? "border-yellow-400"
                  : "border-[#E5E7EB]"
              }`}
            >
              <h3 className="text-xl font-medium text-[#2F3E55] mb-2">
                {pkg.package_type.name ?? "Package"}
              </h3>

              {isFullyUsed && !isExpired && (
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  All credits used
                </p>
              )}

              {isExpired && (
                <p className="text-sm text-red-600 mb-2 font-medium">
                  Package expired
                </p>
              )}

              {!isExpired && !isFullyUsed && isExpiringSoon && (
                <p className="text-sm text-yellow-600 mb-2 font-medium">
                  Expiring in {daysUntilExpiry} day{daysUntilExpiry > 1 && "s"}
                </p>
              )}

              <div className="space-y-2 text-sm text-[#2F3E55]">
                <p>
                  <strong>Remaining:</strong> {pkg.remaining_credits} /{" "}
                  {pkg.total_credits}
                </p>
                <p>
                  <strong>Expiry Date:</strong> {pkg.expires_at}
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isFullyUsed
                        ? "bg-gray-400"
                        : isExpired
                        ? "bg-red-400"
                        : "bg-[#B7C9E5]"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {used} of {pkg.total_credits} classes used
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {packages.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-6">
          You have no active packages.
        </p>
      )}
    </div>
  );
}
