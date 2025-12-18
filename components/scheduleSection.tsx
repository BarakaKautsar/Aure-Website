"use client";
import { useMemo, useState } from "react";

const inputBase =
  "w-full border border-[#D1D5DB] rounded-xl px-4 py-3 bg-white text-[#2F3E55] focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]";

const LOCATIONS = [
  "Aure Pilates Studio Tasikmalaya",
  "Aure Pilates Studio Bandung",
];

const scheduleData = [
  {
    id: 1,
    location: "Aure Pilates Studio Tasikmalaya",
    date: "2025-11-30",
    time: "10:00–11:00",
    timeOfDay: "morning",
    className: "MATRAS (Buy1Get1)",
    coach: "Bila",
    price: 75000,
    originalPrice: 100000,
    capacity: 10,
    booked: 5,
  },
  {
    id: 2,
    location: "Aure Pilates Studio Tasikmalaya",
    date: "2025-11-30",
    time: "10:00–11:00",
    timeOfDay: "morning",
    className: "MATRAS (Buy1Get1)",
    coach: "Bila",
    price: 75000,
    capacity: 10,
    booked: 10,
  },
  {
    id: 3,
    location: "Aure Pilates Studio Tasikmalaya",
    date: "2025-11-30",
    time: "10:00–11:00",
    timeOfDay: "morning",
    className: "MATRAS (Buy1Get1)",
    coach: "Bila",
    price: 75000,
    capacity: 10,
    booked: 9,
  },
];

export default function ScheduleSection() {
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [date, setDate] = useState("2025-11-30");
  const [filters, setFilters] = useState({
    coach: "",
    className: "",
    timeOfDay: "",
    availableOnly: false,
  });

  const filteredSchedule = useMemo(() => {
    return scheduleData.filter((item) => {
      if (item.location !== location) return false;
      if (item.date !== date) return false;
      if (filters.coach && item.coach !== filters.coach) return false;
      if (filters.className && item.className !== filters.className)
        return false;
      if (filters.timeOfDay && item.timeOfDay !== filters.timeOfDay)
        return false;
      if (filters.availableOnly && item.booked >= item.capacity) return false;
      return true;
    });
  }, [location, date, filters]);

  return (
    <section id="schedule" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="mb-10">Check Our Schedule</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${inputBase} appearance-none`}
          />

          <select
            onChange={(e) =>
              setFilters((f) => ({ ...f, timeOfDay: e.target.value }))
            }
            className={`${inputBase} appearance-none`}
          >
            <option value="">All Times</option>
            <option value="morning">Morning</option>
            <option value="noon">Noon</option>
            <option value="afternoon">Afternoon</option>
          </select>

          <label
            className={`${inputBase} flex items-center gap-2 text-sm border rounded-lg px-4 py-3`}
          >
            <input
              type="checkbox"
              onChange={(e) =>
                setFilters((f) => ({ ...f, availableOnly: e.target.checked }))
              }
            />
            Available Only
          </label>
        </div>

        {/* Table */}
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
                const isUnavailable = item.booked < item.capacity && false;

                return (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-4">{item.time}</td>
                    <td className="px-4 py-4">{item.className}</td>
                    <td className="px-4 py-4">{item.coach}</td>
                    <td className="px-4 py-4">
                      {item.originalPrice && (
                        <span className="line-through text-sm mr-2">
                          Rp.{item.originalPrice.toLocaleString("id-ID")}
                        </span>
                      )}
                      Rp.{item.price.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-4">
                      {item.booked}/{item.capacity}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {isFull ? (
                        <button className="bg-gray-400 text-white px-4 py-2 rounded-md text-sm">
                          Join Waitlist
                        </button>
                      ) : (
                        <button className="bg-[#2E3A4A] text-white px-4 py-2 rounded-md text-sm">
                          Book Now
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
