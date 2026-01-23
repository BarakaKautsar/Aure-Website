"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";

function RescheduleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();

  // Get locked parameters from URL
  const bookingId = searchParams.get("bookingId");
  const lockedClassType = searchParams.get("classType");
  const lockedLocation = searchParams.get("location");
  const originalDate = searchParams.get("originalDate");
  const originalTime = searchParams.get("originalTime");
  const originalClass = searchParams.get("originalClass");

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);

  const dateRange = useMemo(() => {
    const dates = [];
    const today = new Date();
    const locale = language === "id" ? "id-ID" : "en-US";

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString(locale, { weekday: "short" }),
        dayNum: date.getDate(),
        isToday: i === 0,
      });
    }
    return dates;
  }, [language]);

  useEffect(() => {
    if (!bookingId || !lockedClassType || !lockedLocation) {
      router.push("/account?tab=manage-booking");
      return;
    }
    loadSchedule();
  }, [selectedDate, bookingId, lockedClassType, lockedLocation]);

  const loadSchedule = async () => {
    setLoading(true);

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("classes")
      .select(
        `
        id,
        title,
        class_type,
        start_time,
        end_time,
        location,
        capacity,
        coach:coach_id (name),
        bookings:bookings!class_id (id, status)
      `,
      )
      .eq("class_type", lockedClassType)
      .eq("location", lockedLocation)
      .gte("start_time", startOfDay.toISOString())
      .lte("start_time", endOfDay.toISOString())
      .eq("status", "scheduled")
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error loading schedule:", error);
      setLoading(false);
      return;
    }

    const now = new Date();

    const transformed = (data || []).map((cls: any) => {
      const startTime = new Date(cls.start_time);
      const endTime = new Date(cls.end_time);

      const timeStr = `${startTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}–${endTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`;

      const booked =
        cls.bookings?.filter((b: any) => b.status === "confirmed").length || 0;

      const hasStarted = now >= startTime;
      const isFull = booked >= cls.capacity;

      return {
        id: cls.id,
        title: cls.title,
        time: timeStr,
        coach: cls.coach?.name || "TBA",
        capacity: cls.capacity,
        booked: booked,
        startTime: startTime,
        hasStarted: hasStarted,
        isFull: isFull,
      };
    });

    // Filter out classes that have started or are full
    const available = transformed.filter(
      (cls: any) => !cls.hasStarted && !cls.isFull,
    );

    setScheduleData(available);
    setLoading(false);
  };

  const handleReschedule = async (newClassId: string) => {
    if (!bookingId) return;

    setRescheduling(true);

    try {
      // Update the booking with new class_id
      const { error } = await supabase
        .from("bookings")
        .update({ class_id: newClassId })
        .eq("id", bookingId);

      if (error) throw error;

      // Success - redirect back to manage bookings
      router.push("/account?tab=manage-booking");
    } catch (error) {
      console.error("Error rescheduling:", error);
      alert("Failed to reschedule. Please try again.");
      setRescheduling(false);
    }
  };

  const locale = language === "id" ? "id-ID" : "en-US";
  const selectedDateObj = new Date(selectedDate + "T00:00:00");
  const formattedDate = selectedDateObj.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const classTypeDisplay =
    {
      reformer: "Reformer",
      spine_corrector: "Spine Corrector",
      matt: "Matt",
      aerial: "Aerial",
    }[lockedClassType || ""] || lockedClassType;

  return (
    <main className="bg-[#F7F4EF] min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#2E3A4A] hover:opacity-70 transition mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Manage Bookings
          </button>

          <h1 className="text-4xl font-light text-[#2E3A4A] mb-4">
            Reschedule Your Class
          </h1>

          {/* Original Booking Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-3">Original Booking:</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Class</p>
                <p className="font-medium text-[#2E3A4A]">{originalClass}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Date</p>
                <p className="font-medium text-[#2E3A4A]">{originalDate}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Time</p>
                <p className="font-medium text-[#2E3A4A]">{originalTime}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Location</p>
                <p className="font-medium text-[#2E3A4A]">
                  {lockedLocation?.replace("Aure Pilates Studio ", "")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Locked Filters Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium mb-1">
                Showing only {classTypeDisplay} classes at{" "}
                {lockedLocation?.replace("Aure Pilates Studio ", "")}
              </p>
              <p className="text-sm text-blue-700">
                You can only reschedule to the same class type and location as
                your original booking.
              </p>
            </div>
          </div>
        </div>

        {/* Date Picker */}
        <div className="mb-8 relative">
          <div className="flex items-center gap-4">
            <button
              className="shrink-0 w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition"
              onClick={() => {
                const container = document.getElementById("date-scroll");
                if (container)
                  container.scrollBy({ left: -200, behavior: "smooth" });
              }}
            >
              ←
            </button>

            <div
              id="date-scroll"
              className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {dateRange.map((dateItem) => (
                <button
                  key={dateItem.date}
                  onClick={() => setSelectedDate(dateItem.date)}
                  className={`shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl transition ${
                    selectedDate === dateItem.date
                      ? "bg-[#2E3A4A] text-white"
                      : "bg-white text-[#2E3A4A] hover:bg-gray-100"
                  }`}
                >
                  <span className="text-sm font-medium">
                    {dateItem.dayName}
                  </span>
                  <span className="text-2xl font-semibold mt-1">
                    {dateItem.dayNum}
                  </span>
                </button>
              ))}
            </div>

            <button
              className="shrink-0 w-10 h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition"
              onClick={() => {
                const container = document.getElementById("date-scroll");
                if (container)
                  container.scrollBy({ left: 200, behavior: "smooth" });
              }}
            >
              →
            </button>
          </div>
        </div>

        {/* Selected Date Info */}
        <div className="mb-6">
          <h2 className="text-2xl font-medium text-[#2E3A4A]">
            Available classes on {formattedDate}
          </h2>
          <p className="text-gray-600">
            {scheduleData.length}{" "}
            {scheduleData.length === 1 ? "class" : "classes"} available
          </p>
        </div>

        {/* Classes List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#2F3E55]">Loading available classes...</p>
          </div>
        ) : scheduleData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
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
            <p className="text-gray-600 text-lg mb-2">No classes available</p>
            <p className="text-gray-500 text-sm">
              Try selecting a different date
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduleData.map((item) => {
              const spotsLeft = item.capacity - item.booked;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Time */}
                    <div className="shrink-0">
                      <p className="text-xl font-semibold text-[#2E3A4A]">
                        {item.time}
                      </p>
                      <p className="text-sm text-gray-500">50 mins</p>
                    </div>

                    {/* Middle: Class Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-[#2E3A4A] mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {item.coach}
                      </p>
                    </div>

                    {/* Middle-Right: Availability */}
                    <div className="shrink-0">
                      <p className="text-sm font-medium text-[#2E3A4A]">
                        {spotsLeft} spots left
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.booked}/{item.capacity} booked
                      </p>
                    </div>

                    {/* Right: Button */}
                    <div className="shrink-0">
                      <button
                        onClick={() => handleReschedule(item.id)}
                        disabled={rescheduling}
                        className="px-6 py-3 bg-[#2E3A4A] text-white rounded-full font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {rescheduling ? "Rescheduling..." : "Select This Class"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  );
}

export default function ReschedulePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center">
          <p className="text-[#2F3E55]">Loading...</p>
        </div>
      }
    >
      <RescheduleContent />
    </Suspense>
  );
}
