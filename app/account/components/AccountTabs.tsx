"use client";

import Link from "next/link";

const tabs = [
  { label: "Profile", value: "profile" },
  { label: "Manage Booking", value: "manage-booking" },
  { label: "Booking History", value: "history" },
  { label: "Active Packages", value: "packages" },
];

export default function AccountTabs({ activeTab }: { activeTab: string }) {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <Link
            key={tab.value}
            href={`/account?tab=${tab.value}`}
            className={`px-6 py-3 rounded-xl border text-sm font-medium transition
              ${
                isActive
                  ? "bg-[#B7C9E5] border-[#B7C9E5] text-[#2F3E55]"
                  : "border-[#B7C9E5] text-[#2F3E55] hover:bg-[#B7C9E5]/30"
              }
            `}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
