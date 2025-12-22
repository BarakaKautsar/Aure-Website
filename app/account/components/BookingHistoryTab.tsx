"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type BookingHistoryRow = {
  id: string;
  status: string;
  payment_method: string;
  class: {
    title: string;
    start_time: string;
    end_time: string;
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
  packageUsed: string;
};

export default function BookingHistoryTab() {
  const [history, setHistory] = useState<DisplayHistory[]>([]);
  const [loading, setLoading] = useState(true);

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
          coach:coach_id (
            name
          )
        ),
        package:package_id (
          package_type:package_type_id (
            name
          )
        )
      `
      )
      .eq("user_id", user.id)
      .in("status", ["completed", "cancelled", "no_show"])
      .order("class(start_time)", { ascending: false });

    if (error) {
      console.error("Error loading booking history:", error);
      setLoading(false);
      return;
    }

    // Transform data for display
    const transformed = (data as unknown as BookingHistoryRow[])
      .filter((booking) => booking.class !== null)
      .map((booking) => {
        const startTime = new Date(booking.class.start_time);
        const endTime = new Date(booking.class.end_time);

        // Format date
        const dateStr = startTime.toLocaleDateString("en-US", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        // Format time
        const timeStr = `${startTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}–${endTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}`;

        // Determine package used
        let packageUsed = "-";
        if (booking.payment_method === "package_credit" && booking.package) {
          packageUsed = booking.package.package_type.name;
        }

        return {
          id: booking.id,
          date: dateStr,
          time: timeStr,
          className: booking.class.title,
          coach: booking.class.coach?.name || "TBA",
          packageUsed: packageUsed,
        };
      });

    setHistory(transformed);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[#2F3E55]">Loading your booking history...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-light text-[#2F3E55] mb-6">
        Booking History
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-[#B7C9E5] text-[#2F3E55]">
            <tr>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Time</th>
              <th className="text-left px-4 py-3">Class</th>
              <th className="text-left px-4 py-3">Coach</th>
              <th className="text-left px-4 py-3">Package Used</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} className="border-b border-[#F7F4EF]">
                <td className="px-4 py-4">{item.date}</td>
                <td className="px-4 py-4">{item.time}</td>
                <td className="px-4 py-4">{item.className}</td>
                <td className="px-4 py-4 capitalize">{item.coach}</td>
                <td className="px-4 py-4">{item.packageUsed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {history.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-6">
          You have no booking history yet.
        </p>
      )}
    </div>
  );
}
