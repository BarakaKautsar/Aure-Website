"use client";

import { useSearchParams } from "next/navigation";
import AccountTabs from "./components/AccountTabs";
import ProfileTab from "./components/ProfileTab";
import ManageBookingTab from "./components/ManageBookingTab";
import BookingHistoryTab from "./components/BookingHistoryTab";
import ActivePackagesTab from "./components/ActivePackagesTab";

export default function AccountPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "profile";

  const renderTab = () => {
    switch (tab) {
      case "manage-booking":
        return <ManageBookingTab />;
      case "history":
        return <BookingHistoryTab />;
      case "packages":
        return <ActivePackagesTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <div
        className="h-64 w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/images/account.jpg')" }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-light text-center text-[#2F3E55] mb-10">
          My Aure Account
        </h1>

        {/* Tabs */}
        <AccountTabs activeTab={tab} />

        {/* Content */}
        <div className="mt-10">{renderTab()}</div>
      </div>
    </main>
  );
}
