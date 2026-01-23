"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";

type BookingHistoryRow = {
  id: string;
  status: string;
  payment_method: string;
  class: {
    title: string;
    start_time: string;
    end_time: string;
    location: string;
    coach: {
      name: string;
    } | null;
  };
  package: {
    package_type: {
      name: string;
    };
  } | null;
};

type DisplayHistory = {
  id: string;
  date: string;
  time: string;
  className: string;
  coach: string;
  location: string;
  packageUsed: string;
  status: string;
  statusBadge: "completed" | "cancelled" | "no-show";
};

export default function BookingHistoryTab() {
  const [history, setHistory] = useState<DisplayHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const now = new Date();

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        payment_method,
        class:class_id!inner (
          title,
          start_time,
          end_time,
          location,
          coach:coach_id (
            name
          )
        ),
        package:package_id (
          package_type:package_type_id (
            name
          )
        )
      `,
      )
      .eq("user_id", user.id)
      .order("class(start_time)", { ascending: false });

    if (error) {
      console.error("Error loading booking history:", error);
      setLoading(false);
      return;
    }

    const locale = language === "id" ? "id-ID" : "en-US";

    const transformed = (data as unknown as BookingHistoryRow[])
      .filter((booking) => {
        if (!booking.class) return false;

        const classEndTime = new Date(booking.class.end_time);

        if (["completed", "cancelled", "no_show"].includes(booking.status)) {
          return true;
        }

        if (
          ["scheduled", "confirmed"].includes(booking.status) &&
          classEndTime < now
        ) {
          return true;
        }

        return false;
      })
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

        let packageUsed = "-";
        if (booking.payment_method === "package_credit" && booking.package) {
          packageUsed = booking.package.package_type.name;
        } else if (booking.payment_method === "single_payment") {
          packageUsed = t.account.manageBooking.singlePayment;
        }

        let statusBadge: "completed" | "cancelled" | "no-show";
        let statusText: string;

        if (booking.status === "cancelled") {
          statusBadge = "cancelled";
          statusText = t.account.bookingHistory.cancelled;
        } else if (booking.status === "no_show") {
          statusBadge = "no-show";
          statusText = t.account.bookingHistory.noShow;
        } else {
          statusBadge = "completed";
          statusText = t.account.bookingHistory.completed;
        }

        return {
          id: booking.id,
          date: dateStr,
          time: timeStr,
          className: booking.class.title,
          coach: booking.class.coach?.name || "TBA",
          location: booking.class.location,
          packageUsed: packageUsed,
          status: statusText,
          statusBadge: statusBadge,
        };
      });

    setHistory(transformed);
    setLoading(false);
  };

  const getStatusBadgeColor = (
    status: "completed" | "cancelled" | "no-show",
  ) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "no-show":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[#2F3E55]">{t.account.bookingHistory.loading}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-light text-[#2F3E55] mb-6">
        {t.account.bookingHistory.title}
      </h2>

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
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr
                key={item.id}
                className="border-b border-[#F7F4EF] hover:bg-gray-50 transition"
              >
                <td className="px-4 py-4 text-sm">{item.date}</td>
                <td className="px-4 py-4 text-sm">{item.time}</td>
                <td className="px-4 py-4 font-medium">{item.className}</td>
                <td className="px-4 py-4 text-sm">
                  {item.location.replace("Aure Pilates Studio ", "")}
                </td>
                <td className="px-4 py-4 capitalize text-sm">{item.coach}</td>
                <td className="px-4 py-4 text-sm">{item.packageUsed}</td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                      item.statusBadge,
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {history.length === 0 && (
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-gray-600 text-lg mb-2">
            {t.account.bookingHistory.noHistory}
          </p>
          <p className="text-gray-500 text-sm">
            {t.account.bookingHistory.noHistoryDesc}
          </p>
        </div>
      )}
    </div>
  );
}
