"use client";

import { useState } from "react";
import {
  ConfirmCancelModal,
  CancelCompleteModal,
  Booking,
} from "./CancelBookingModal";

const bookings = [
  {
    id: 1,
    date: "Sun 30 Nov 2025",
    time: "10:00–11:00",
    className: "MATRAS (Buy1Get1)",
    coach: "Bila",
    status: "on-time", // on-time | delayed | cancelled
  },
  {
    id: 2,
    date: "Sun 30 Nov 2025",
    time: "10:00–11:00",
    className: "MATRAS (Buy1Get1)",
    coach: "Bila",
    status: "on-time",
  },
  {
    id: 3,
    date: "Sun 30 Nov 2025",
    time: "10:00–11:00",
    className: "MATRAS (Buy1Get1)",
    coach: "Bila",
    status: "on-time",
  },
];

const statusDot = {
  "on-time": "bg-green-500",
  delayed: "bg-yellow-400",
  cancelled: "bg-red-500",
};

export default function ManageBookingTab() {
  const [items, setItems] = useState(bookings);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  const confirmCancel = () => {
    setItems((prev) => prev.filter((b) => b.id !== selectedBooking?.id));
    setSelectedBooking(null);
    setShowComplete(true);
  };

  return (
    <div>
      <h2 className="text-3xl font-light text-[#2F3E55] mb-4">
        Upcoming Classes
      </h2>

      {/* Legend */}
      <div className="flex gap-6 text-sm mb-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" /> Class On-time
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-400" /> Class Delayed
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" /> Class Cancelled
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-[#B7C9E5] text-[#2F3E55]">
            <tr>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Time</th>
              <th className="text-left px-4 py-3">Class</th>
              <th className="text-left px-4 py-3">Coach</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id} className="border-b border-[#F7F4EF]">
                <td className="px-4 py-4">{b.date}</td>
                <td className="px-4 py-4">{b.time}</td>
                <td className="px-4 py-4">{b.className}</td>
                <td className="px-4 py-4">{b.coach}</td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      statusDot[b.status as keyof typeof statusDot]
                    }`}
                  />
                </td>
                <td className="px-4 py-4 text-right">
                  {b.status !== "cancelled" && (
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
                    >
                      Cancel Booking
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-6">
          You have no upcoming bookings.
        </p>
      )}

      {selectedBooking && (
        <ConfirmCancelModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onConfirm={confirmCancel}
        />
      )}

      {showComplete && (
        <CancelCompleteModal onClose={() => setShowComplete(false)} />
      )}
    </div>
  );
}
