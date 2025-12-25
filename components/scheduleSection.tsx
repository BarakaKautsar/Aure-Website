"use client";
import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import BookingModal, { BookingSuccessModal } from "./BookingModal";
import WaitlistModal, { WaitlistSuccessModal } from "./WaitlistModal";
import { useRouter } from "next/navigation";

const inputBase =
  "w-full border border-[#D1D5DB] rounded-xl px-4 py-3 bg-white text-[#2F3E55] focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]";

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
  classTypeRaw: string; // database value: 'reformer', 'spine_corrector', 'matt'
  coach: string;
  price: number;
  originalPrice?: number;
  capacity: number;
  booked: number;
};

export default function ScheduleSection() {
  const router = useRouter();
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filters, setFilters] = useState({
    coach: "",
    classType: "",
    availableOnly: false,
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

  useEffect(() => {
    loadSchedule();
  }, [location, date]);

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

    // Get start and end of selected day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
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
        price,
        original_price,
        status,
        coach:coach_id (
          name
        ),
        bookings:bookings!class_id (
          id,
          status
        )
      `
      )
      .eq("location", location)
      .gte("start_time", startOfDay.toISOString())
      .lte("start_time", endOfDay.toISOString())
      .in("status", ["scheduled", "delayed"])
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error loading schedule:", error);
      setLoading(false);
      return;
    }

    // Transform data
    const transformed = (data as unknown as ClassFromDB[]).map((cls) => {
      const startTime = new Date(cls.start_time);
      const endTime = new Date(cls.end_time);

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

      // Count confirmed bookings only (filter client-side)
      const booked =
        cls.bookings?.filter((b) => b.status === "confirmed").length || 0;

      // Map class_type to display name
      const classTypeDisplay =
        {
          reformer: "Reformer",
          spine_corrector: "Spine Corrector",
          matt: "Matt",
        }[cls.class_type] || cls.class_type;

      return {
        id: cls.id,
        location: cls.location,
        date: date,
        time: timeStr,
        className: cls.title,
        classType: classTypeDisplay,
        classTypeRaw: cls.class_type, // Keep raw value for package matching
        coach: cls.coach?.name || "TBA",
        price: cls.price,
        originalPrice: cls.original_price || undefined,
        capacity: cls.capacity,
        booked: booked,
      };
    });

    setScheduleData(transformed);

    // Extract unique coaches and class types for filters
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
      if (filters.availableOnly && item.booked >= item.capacity) return false;
      return true;
    });
  }, [scheduleData, filters]);

  const goToNextDay = () => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    setDate(nextDay.toISOString().split("T")[0]);
  };

  const goToPrevDay = () => {
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);
    setDate(prevDay.toISOString().split("T")[0]);
  };

  const goToToday = () => {
    const today = new Date();
    setDate(today.toISOString().split("T")[0]);
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setShowDatePicker(false);
  };

  const selectedDate = new Date(date + "T00:00:00");
  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleBookNow = (classItem: ScheduleItem, isFull: boolean) => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent("/#schedule")}`);
      return;
    }

    setSelectedClass(classItem);

    if (isFull) {
      setShowWaitlistModal(true);
    } else {
      setShowBookingModal(true);
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setShowSuccessModal(true);
    loadSchedule(); // Refresh schedule to update capacity
  };

  const handleWaitlistSuccess = () => {
    setShowWaitlistModal(false);
    setShowWaitlistSuccessModal(true);
    loadSchedule(); // Refresh schedule
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push("/account?tab=manage-booking");
  };

  const handleWaitlistSuccessClose = () => {
    setShowWaitlistSuccessModal(false);
  };

  const isToday = date === new Date().toISOString().split("T")[0];

  return (
    <section id="schedule" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="mb-10">Check Our Schedule</h2>

        {/* Date Display with Navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-[#F7F4EF] rounded-xl p-4 gap-4">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between w-full">
            <button
              onClick={goToPrevDay}
              className="px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition"
            >
              ← Previous Day
            </button>

            <div className="text-center relative">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="text-2xl font-medium text-[#2F3E55] hover:text-[#2E3A4A] transition flex items-center gap-2"
                >
                  {formattedDate}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>

              {!isToday && (
                <button
                  onClick={goToToday}
                  className="text-sm text-[#2E3A4A] underline mt-1 hover:opacity-70"
                >
                  Jump to Today
                </button>
              )}

              {/* Date Picker Dropdown */}
              {showDatePicker && (
                <div className="absolute top-full mt-2 bg-white rounded-xl shadow-lg p-4 z-10 animate-fadeIn">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="border border-[#D1D5DB] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                    autoFocus
                  />
                </div>
              )}
            </div>

            <button
              onClick={goToNextDay}
              className="px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition"
            >
              Next Day →
            </button>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden w-full">
            <div className="text-center relative mb-3">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="text-xl font-medium text-[#2F3E55] hover:text-[#2E3A4A] transition flex items-center gap-2 mx-auto"
              >
                {formattedDate}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>

              {!isToday && (
                <button
                  onClick={goToToday}
                  className="text-sm text-[#2E3A4A] underline mt-1 hover:opacity-70"
                >
                  Jump to Today
                </button>
              )}

              {/* Mobile Date Picker */}
              {showDatePicker && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-lg p-4 z-10 animate-fadeIn">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="border border-[#D1D5DB] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={goToPrevDay}
                className="flex-1 px-3 py-2 bg-white rounded-lg hover:bg-gray-100 transition text-sm"
              >
                ← Previous
              </button>
              <button
                onClick={goToNextDay}
                className="flex-1 px-3 py-2 bg-white rounded-lg hover:bg-gray-100 transition text-sm"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="relative">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`${inputBase} appearance-none`}
            >
              {LOCATIONS.map((loc) => (
                <option key={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <select
            value={filters.classType}
            onChange={(e) =>
              setFilters((f) => ({ ...f, classType: e.target.value }))
            }
            className={`${inputBase} appearance-none`}
          >
            <option value="">All Class Types</option>
            {classTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={filters.coach}
            onChange={(e) =>
              setFilters((f) => ({ ...f, coach: e.target.value }))
            }
            className={`${inputBase} appearance-none`}
          >
            <option value="">All Coaches</option>
            {coaches.map((coach) => (
              <option key={coach} value={coach}>
                {coach}
              </option>
            ))}
          </select>

          <label
            className={`${inputBase} flex items-center gap-2 text-sm border rounded-lg px-4 py-3`}
          >
            <input
              type="checkbox"
              checked={filters.availableOnly}
              onChange={(e) =>
                setFilters((f) => ({ ...f, availableOnly: e.target.checked }))
              }
            />
            Available Only
          </label>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#2F3E55]">Loading schedule...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#B7C9E5] text-[#2E3A4A]">
                <tr>
                  <th className="text-left px-4 py-3">Time</th>
                  <th className="text-left px-4 py-3">Class</th>
                  <th className="text-left px-4 py-3">Coach</th>
                  <th className="text-left px-4 py-3">Price (Single Visit)</th>
                  <th className="text-left px-4 py-3">Capacity</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedule.map((item) => {
                  const isFull = item.booked >= item.capacity;
                  const spotsLeft = item.capacity - item.booked;

                  return (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-4">{item.time}</td>
                      <td className="px-4 py-4">{item.className}</td>
                      <td className="px-4 py-4 capitalize">{item.coach}</td>
                      <td className="px-4 py-4">
                        {item.originalPrice && (
                          <span className="line-through text-sm text-gray-500 mr-2">
                            Rp.{item.originalPrice.toLocaleString("id-ID")}
                          </span>
                        )}
                        <span
                          className={
                            item.originalPrice ? "text-red-600 font-medium" : ""
                          }
                        >
                          Rp.{item.price.toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`${
                            spotsLeft <= 2 && spotsLeft > 0
                              ? "text-orange-600 font-medium"
                              : ""
                          }`}
                        >
                          {item.booked}/{item.capacity}
                        </span>
                        {spotsLeft <= 2 && spotsLeft > 0 && (
                          <span className="text-xs text-orange-600 ml-2">
                            ({spotsLeft} left!)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {isFull ? (
                          <button
                            onClick={() => handleBookNow(item, true)}
                            className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm hover:opacity-90"
                          >
                            Join Waitlist
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBookNow(item, false)}
                            className="bg-[#2E3A4A] text-white px-4 py-2 rounded-md text-sm hover:opacity-90"
                          >
                            Book Now
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredSchedule.length === 0 && (
              <p className="text-center text-gray-500 py-12">
                No classes found for the selected filters.
              </p>
            )}
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedClass && (
          <BookingModal
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
              price: selectedClass.price,
              location: selectedClass.location,
              classType: selectedClass.classTypeRaw, // Pass raw database value
            }}
            onClose={() => setShowBookingModal(false)}
            onSuccess={handleBookingSuccess}
          />
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <BookingSuccessModal onClose={handleSuccessClose} />
        )}

        {/* Waitlist Modal */}
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
              classType: selectedClass.classTypeRaw, // Pass raw class type for package matching
            }}
            onClose={() => setShowWaitlistModal(false)}
            onSuccess={handleWaitlistSuccess}
          />
        )}

        {/* Waitlist Success Modal */}
        {showWaitlistSuccessModal && (
          <WaitlistSuccessModal onClose={handleWaitlistSuccessClose} />
        )}
      </div>
    </section>
  );
}
