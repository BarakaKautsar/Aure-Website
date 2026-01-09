"use client";
import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import WaitlistModal, { WaitlistSuccessModal } from "./WaitlistModal";
import { useRouter } from "next/navigation";

const LOCATIONS = [
  "Aure Pilates Studio Tasikmalaya",
  "Aure Pilates Studio KBP",
];

type ClassFromDB = {
  id: string;
  title: string;
  class_type: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  price: number;
  original_price: number | null;
  status: string;
  coach: {
    name: string;
  } | null;
  bookings: { id: string; status: string }[];
};

type ScheduleItem = {
  id: string;
  location: string;
  date: string;
  time: string;
  className: string;
  classType: string;
  classTypeRaw: string;
  coach: string;
  price: number;
  originalPrice?: number;
  capacity: number;
  booked: number;
};

export default function ScheduleSection() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [filters, setFilters] = useState({
    location: "Aure Pilates Studio Tasikmalaya",
    classType: "",
    coach: "",
  });

  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [coaches, setCoaches] = useState<string[]>([]);
  const [classTypes, setClassTypes] = useState<string[]>([]);

  // Booking modal state
  const [selectedClass, setSelectedClass] = useState<ScheduleItem | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showWaitlistSuccessModal, setShowWaitlistSuccessModal] =
    useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Generate array of next 14 days (today + 13 days)
  const dateRange = useMemo(() => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: date.getDate(),
        isToday: i === 0,
      });
    }
    return dates;
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [selectedDate, filters.location]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
  };

  const loadSchedule = async () => {
    setLoading(true);

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    let query = supabase
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
        price,
        original_price,
        status,
        coach:coach_id (name),
        bookings:bookings!class_id (id, status)
      `
      )
      .gte("start_time", startOfDay.toISOString())
      .lte("start_time", endOfDay.toISOString())
      .in("status", ["scheduled", "delayed"])
      .order("start_time", { ascending: true });

    // Only filter by location if not "All Locations"
    if (filters.location !== "All Locations" && filters.location) {
      query = query.eq("location", filters.location);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading schedule:", error);
      setLoading(false);
      return;
    }

    const transformed = (data as unknown as ClassFromDB[]).map((cls) => {
      const startTime = new Date(cls.start_time);
      const endTime = new Date(cls.end_time);

      const timeStr = `${startTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;

      const booked =
        cls.bookings?.filter((b) => b.status === "confirmed").length || 0;

      const classTypeDisplay =
        {
          reformer: "Reformer",
          spine_corrector: "Spine Corrector",
          matt: "Matt",
          aerial: "Aerial",
        }[cls.class_type] || cls.class_type;

      return {
        id: cls.id,
        location: cls.location,
        date: selectedDate,
        time: timeStr,
        className: cls.title,
        classType: classTypeDisplay,
        classTypeRaw: cls.class_type,
        coach: cls.coach?.name || "TBA",
        price: cls.price,
        originalPrice: cls.original_price || undefined,
        capacity: cls.capacity,
        booked: booked,
      };
    });

    setScheduleData(transformed);

    const uniqueCoaches = [
      ...new Set(transformed.map((item) => item.coach)),
    ].filter((c) => c !== "TBA");
    const uniqueClassTypes = [
      ...new Set(transformed.map((item) => item.classType)),
    ];

    setCoaches(uniqueCoaches);
    setClassTypes(uniqueClassTypes);
    setLoading(false);
  };

  const filteredSchedule = useMemo(() => {
    return scheduleData.filter((item) => {
      if (filters.coach && item.coach !== filters.coach) return false;
      if (filters.classType && item.classType !== filters.classType)
        return false;
      return true;
    });
  }, [scheduleData, filters]);

  const handleBookNow = (classItem: ScheduleItem, isFull: boolean) => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent("/schedule")}`);
      return;
    }

    if (isFull) {
      // Still use waitlist modal for full classes
      setSelectedClass(classItem);
      setShowWaitlistModal(true);
    } else {
      // Redirect to booking page with query params
      const params = new URLSearchParams({
        classId: classItem.id,
        title: classItem.className,
        time: classItem.time,
        date: classItem.date,
        coach: classItem.coach,
        price: classItem.price.toString(),
        location: classItem.location,
        classType: classItem.classTypeRaw,
        availableSpots: (classItem.capacity - classItem.booked).toString(),
      });

      // Add original price if exists
      if (classItem.originalPrice) {
        params.append("originalPrice", classItem.originalPrice.toString());
      }

      router.push(`/booking?${params.toString()}`);
    }
  };

  const handleWaitlistSuccess = () => {
    setShowWaitlistModal(false);
    setShowWaitlistSuccessModal(true);
    loadSchedule();
  };

  const handleWaitlistSuccessClose = () => {
    setShowWaitlistSuccessModal(false);
  };

  const selectedDateObj = new Date(selectedDate + "T00:00:00");
  const formattedDate = selectedDateObj.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const classCount = filteredSchedule.length;

  return (
    <section className="bg-[#F7F4EF] py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-light text-[#2E3A4A] mb-12">
          Scheduled Classes
        </h1>

        {/* Scrollable Date Picker */}
        <div className="mb-8 relative">
          <div className="flex items-center gap-4">
            {/* Left Arrow */}
            <button
              className="shrink-0 w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white transition"
              onClick={() => {
                const container = document.getElementById("date-scroll");
                if (container)
                  container.scrollBy({ left: -200, behavior: "smooth" });
              }}
            >
              ←
            </button>

            {/* Scrollable Date Container */}
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

            {/* Right Arrow */}
            <button
              className="shrink-0 w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white transition"
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

        {/* Modern Custom Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Location Filter */}
          <div className="relative">
            <button
              onClick={() => {
                const dropdown = document.getElementById("location-dropdown");
                if (dropdown) {
                  dropdown.classList.toggle("hidden");
                }
              }}
              className="flex items-center gap-2 px-5 py-3 bg-white rounded-full border border-gray-300 hover:border-[#2E3A4A] transition font-medium text-[#2E3A4A]"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>
                {filters.location.replace("Aure Pilates Studio ", "") ||
                  "Location"}
              </span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div
              id="location-dropdown"
              className="hidden absolute top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-[200px] z-10"
            >
              <button
                onClick={() => {
                  setFilters((f) => ({ ...f, location: "All Locations" }));
                  document
                    .getElementById("location-dropdown")
                    ?.classList.add("hidden");
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                All Locations
              </button>
              {LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setFilters((f) => ({ ...f, location: loc }));
                    document
                      .getElementById("location-dropdown")
                      ?.classList.add("hidden");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  {loc.replace("Aure Pilates Studio ", "")}
                </button>
              ))}
            </div>
          </div>

          {/* Class Type Filter */}
          <div className="relative">
            <button
              onClick={() => {
                const dropdown = document.getElementById("class-dropdown");
                if (dropdown) {
                  dropdown.classList.toggle("hidden");
                }
              }}
              className="flex items-center gap-2 px-5 py-3 bg-white rounded-full border border-gray-300 hover:border-[#2E3A4A] transition font-medium text-[#2E3A4A]"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span>{filters.classType || "Classes"}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div
              id="class-dropdown"
              className="hidden absolute top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-[180px] z-10"
            >
              <button
                onClick={() => {
                  setFilters((f) => ({ ...f, classType: "" }));
                  document
                    .getElementById("class-dropdown")
                    ?.classList.add("hidden");
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                All Classes
              </button>
              {classTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilters((f) => ({ ...f, classType: type }));
                    document
                      .getElementById("class-dropdown")
                      ?.classList.add("hidden");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Instructor Filter */}
          <div className="relative">
            <button
              onClick={() => {
                const dropdown = document.getElementById("coach-dropdown");
                if (dropdown) {
                  dropdown.classList.toggle("hidden");
                }
              }}
              className="flex items-center gap-2 px-5 py-3 bg-white rounded-full border border-gray-300 hover:border-[#2E3A4A] transition font-medium text-[#2E3A4A]"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{filters.coach || "Instructor"}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div
              id="coach-dropdown"
              className="hidden absolute top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-[180px] z-10"
            >
              <button
                onClick={() => {
                  setFilters((f) => ({ ...f, coach: "" }));
                  document
                    .getElementById("coach-dropdown")
                    ?.classList.add("hidden");
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                All Instructors
              </button>
              {coaches.map((coach) => (
                <button
                  key={coach}
                  onClick={() => {
                    setFilters((f) => ({ ...f, coach: coach }));
                    document
                      .getElementById("coach-dropdown")
                      ?.classList.add("hidden");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm capitalize"
                >
                  {coach}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters Button (only show if filters are active) */}
          {(filters.classType ||
            filters.coach ||
            filters.location !== "Aure Pilates Studio Tasikmalaya") && (
            <button
              onClick={() =>
                setFilters({
                  location: "Aure Pilates Studio Tasikmalaya",
                  classType: "",
                  coach: "",
                })
              }
              className="px-4 py-2 text-sm text-gray-600 hover:text-[#2E3A4A] underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Selected Date & Class Count */}
        <div className="mb-6">
          <h2 className="text-2xl font-medium text-[#2E3A4A]">
            Today, {formattedDate}
          </h2>
          <p className="text-gray-600">{classCount} classes</p>
        </div>

        {/* Classes List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#2F3E55]">Loading classes...</p>
          </div>
        ) : filteredSchedule.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No classes available for this date.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSchedule.map((item) => {
              const isFull = item.booked >= item.capacity;
              const spotsLeft = item.capacity - item.booked;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Time & Duration */}
                    <div className="shrink-0">
                      <p className="text-xl font-semibold text-[#2E3A4A]">
                        {item.time}
                      </p>
                      <p className="text-sm text-gray-500">50 mins</p>
                    </div>

                    {/* Middle: Class Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-[#2E3A4A]">
                          {item.className}
                        </h3>
                        {item.originalPrice && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                            SALE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 capitalize">
                        {item.coach}
                      </p>
                    </div>

                    {/* Middle-Right: Location */}
                    <div className="shrink-0">
                      <p className="text-sm font-medium text-[#2E3A4A]">
                        {item.location.replace("Aure Pilates Studio ", "")}
                      </p>
                      <p className="text-xs text-gray-500">{spotsLeft} left</p>
                    </div>

                    {/* Right: Capacity & Button */}
                    <div className="flex items-center gap-4 shrink-0">
                      {/* <div className="text-right">
                        <p className="text-sm font-medium text-[#2E3A4A]">
                          {spotsLeft} left
                        </p>
                      </div> */}

                      {isFull ? (
                        <button
                          onClick={() => handleBookNow(item, true)}
                          className="px-6 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition whitespace-nowrap"
                        >
                          Join Waitlist
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBookNow(item, false)}
                          className="px-6 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition whitespace-nowrap"
                        >
                          Book Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showWaitlistModal && selectedClass && (
          <WaitlistModal
            classInfo={{
              id: selectedClass.id,
              title: selectedClass.className,
              time: selectedClass.time,
              date: new Date(selectedClass.date).toLocaleDateString("en-US", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              coach: selectedClass.coach,
              location: selectedClass.location,
              classType: selectedClass.classTypeRaw,
            }}
            onClose={() => setShowWaitlistModal(false)}
            onSuccess={handleWaitlistSuccess}
          />
        )}

        {showWaitlistSuccessModal && (
          <WaitlistSuccessModal onClose={handleWaitlistSuccessClose} />
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
