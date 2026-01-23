"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function AccountTabs({ activeTab }: { activeTab: string }) {
  const { t } = useLanguage();

  const tabs = [
    { label: t.account.tabs.profile, value: "profile" },
    { label: t.account.tabs.manageBooking, value: "manage-booking" },
    { label: t.account.tabs.history, value: "history" },
    { label: t.account.tabs.packages, value: "packages" },
  ];

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
