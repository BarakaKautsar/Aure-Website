"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

type BookingRow = {
  id: string;
  status: string;
  payment_method: string;
  package_id: string | null;
  class: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    status: string;
    location: string;
    class_type: string;
    coach: {
      name: string;
    } | null;
  };
  package: {
    id: string;
    remaining_credits: number;
    package_type: {
      name: string;
    };
  } | null;
};

type DisplayBooking = {
  id: string;
  date: string;
  time: string;
  className: string;
  coach: string;
  location: string;
  classType: string;
  packageUsed: string;
  status: "scheduled" | "delayed" | "cancelled";
  startTime: Date;
  paymentMethod: string;
  packageId: string | null;
};

export default function ManageBookingTab() {
  const [bookings, setBookings] = useState<DisplayBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t, language } = useLanguage();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        payment_method,
        package_id,
        class:class_id!inner (
          id,
          title,
          start_time,
          end_time,
          status,
          location,
          class_type,
          coach:coach_id (
            name
          )
        ),
        package:package_id (
          id,
          remaining_credits,
          package_type:package_type_id (
            name
          )
        )
      `,
      )
      .eq("user_id", user.id)
      .eq("status", "confirmed")
      .gte("class.start_time", new Date().toISOString())
      .order("class(start_time)", { ascending: true });

    if (error) {
      console.error("Error loading bookings:", error);
      setLoading(false);
      return;
    }

    const locale = language === "id" ? "id-ID" : "en-US";

    const transformed = (data as unknown as BookingRow[])
      .filter((booking) => booking.class !== null)
      .map((booking) => {
        const startTime = new Date(booking.class.start_time);
        const endTime = new Date(booking.class.end_time);

        const dateStr = startTime.toLocaleDateString(locale, {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const timeStr = `${startTime.toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}–${endTime.toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}`;

        let displayStatus: "scheduled" | "delayed" | "cancelled" = "scheduled";
        if (booking.class.status === "cancelled") {
          displayStatus = "cancelled";
        } else if (booking.class.status === "delayed") {
          displayStatus = "delayed";
        }

        let packageUsed = t.account.manageBooking.singlePayment;
        if (booking.payment_method === "package_credit" && booking.package) {
          packageUsed = booking.package.package_type.name;
        }

        return {
          id: booking.id,
          date: dateStr,
          time: timeStr,
          className: booking.class.title,
          coach: booking.class.coach?.name || "TBA",
          location: booking.class.location,
          classType: booking.class.class_type,
          packageUsed: packageUsed,
          status: displayStatus,
          startTime: startTime,
          paymentMethod: booking.payment_method,
          packageId: booking.package_id,
        };
      });

    setBookings(transformed);
    setLoading(false);
  };

  const getStatusBadgeColor = (
    status: "scheduled" | "delayed" | "cancelled",
  ) => {
    switch (status) {
      case "scheduled":
        return "bg-green-100 text-green-700";
      case "delayed":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: "scheduled" | "delayed" | "cancelled") => {
    switch (status) {
      case "scheduled":
        return t.account.manageBooking.onTime;
      case "delayed":
        return t.account.manageBooking.delayed;
      case "cancelled":
        return t.account.manageBooking.cancelled;
      default:
        return status;
    }
  };

  const handleReschedule = (booking: DisplayBooking) => {
    const params = new URLSearchParams({
      bookingId: booking.id,
      classType: booking.classType,
      location: booking.location,
      originalDate: booking.date,
      originalTime: booking.time,
      originalClass: booking.className,
    });

    router.push(`/reschedule?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[#2F3E55]">{t.account.manageBooking.loading}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-light text-[#2F3E55] mb-4">
        {t.account.manageBooking.title}
      </h2>

      <p className="text-sm text-gray-600 mb-6">
        {t.account.manageBooking.description}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-[#B7C9E5] text-[#2F3E55]">
            <tr>
              <th className="text-left px-4 py-3">{t.common.date}</th>
              <th className="text-left px-4 py-3">{t.common.time}</th>
              <th className="text-left px-4 py-3">{t.common.class}</th>
              <th className="text-left px-4 py-3">{t.common.location}</th>
              <th className="text-left px-4 py-3">{t.common.coach}</th>
              <th className="text-left px-4 py-3">
                {t.account.manageBooking.paymentMethod}
              </th>
              <th className="text-left px-4 py-3">{t.common.status}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const now = new Date();
              const hoursDiff =
                (b.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
              const canReschedule = hoursDiff >= 12 && b.status !== "cancelled";
              const hoursLeft = Math.floor(hoursDiff);

              return (
                <tr
                  key={b.id}
                  className="border-b border-[#F7F4EF] hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-4 text-sm">{b.date}</td>
                  <td className="px-4 py-4 text-sm">{b.time}</td>
                  <td className="px-4 py-4 font-medium">{b.className}</td>
                  <td className="px-4 py-4 text-sm">
                    {b.location.replace("Aure Pilates Studio ", "")}
                  </td>
                  <td className="px-4 py-4 capitalize text-sm">{b.coach}</td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`${
                        b.packageUsed === t.account.manageBooking.singlePayment
                          ? "text-gray-600"
                          : "text-[#2F3E55] font-medium"
                      }`}
                    >
                      {b.packageUsed}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        b.status,
                      )}`}
                    >
                      {getStatusText(b.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {b.status !== "cancelled" && (
                      <>
                        {canReschedule ? (
                          <button
                            onClick={() => handleReschedule(b)}
                            className="bg-[#2E3A4A] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition"
                          >
                            {t.account.manageBooking.reschedule}
                          </button>
                        ) : (
                          <div className="text-right">
                            <button
                              disabled
                              className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm cursor-not-allowed"
                            >
                              {t.account.manageBooking.noChanges}
                            </button>
                            {hoursLeft > 0 && hoursLeft < 12 && (
                              <p className="text-xs text-gray-500 mt-1">
                                {t.account.manageBooking.startsIn} {hoursLeft}h
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 text-lg mb-2">
            {t.account.manageBooking.noBookings}
          </p>
          <p className="text-gray-500 text-sm">
            {t.account.manageBooking.noBookingsDesc}
          </p>
        </div>
      )}
    </div>
  );
}
