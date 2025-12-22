"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  ConfirmCancelModal,
  CancelCompleteModal,
  Booking,
} from "./CancelBookingModal";

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
  packageUsed: string;
  status: "on-time" | "delayed" | "cancelled";
  startTime: Date;
  paymentMethod: string;
  packageId: string | null;
  packageRemainingCredits: number | null;
};

const statusDot = {
  "on-time": "bg-green-500",
  delayed: "bg-yellow-400",
  cancelled: "bg-red-500",
};

export default function ManageBookingTab() {
  const [bookings, setBookings] = useState<DisplayBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [cancelling, setCancelling] = useState(false);

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
      `
      )
      .eq("user_id", user.id)
      .in("status", ["confirmed"])
      .gte("class.start_time", new Date().toISOString())
      .order("class(start_time)", { ascending: true });

    if (error) {
      console.error("Error loading bookings:", error);
      setLoading(false);
      return;
    }

    // Filter out bookings with null classes and transform data for display
    const transformed = (data as unknown as BookingRow[])
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

        // Map class status to display status
        let displayStatus: "on-time" | "delayed" | "cancelled" = "on-time";
        if (booking.class.status === "cancelled") {
          displayStatus = "cancelled";
        } else if (booking.class.status === "delayed") {
          displayStatus = "delayed";
        }

        // Determine package used
        let packageUsed = "Single Payment";
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
          status: displayStatus,
          startTime: startTime,
          paymentMethod: booking.payment_method,
          packageId: booking.package_id,
          packageRemainingCredits: booking.package?.remaining_credits || null,
        };
      });

    setBookings(transformed);
    setLoading(false);
  };

  const confirmCancel = async () => {
    if (!selectedBooking) return;

    // Check if class is less than 1 hour away
    const now = new Date();
    const startTime = selectedBooking.startTime;
    const hoursDiff = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 1) {
      alert(
        "Cannot cancel: Class starts in less than 1 hour. Cancellations must be made at least 1 hour before class time."
      );
      setSelectedBooking(null);
      return;
    }

    setCancelling(true);

    try {
      // 1. Cancel the booking
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", selectedBooking.id);

      if (error) throw error;

      // 2. If booking was paid with package credit, refund the credit
      if (
        selectedBooking.paymentMethod === "package_credit" &&
        selectedBooking.packageId
      ) {
        const { error: refundError } = await supabase
          .from("packages")
          .update({
            remaining_credits:
              (selectedBooking.packageRemainingCredits || 0) + 1,
          })
          .eq("id", selectedBooking.packageId);

        if (refundError) {
          console.error("Error refunding package credit:", refundError);
          alert(
            "Booking cancelled but there was an issue refunding your credit. Please contact support."
          );
        }
      }

      // 3. Process waitlist - auto-book first eligible user
      await processWaitlist(selectedBooking.id);

      // Remove from list
      setBookings((prev) => prev.filter((b) => b.id !== selectedBooking.id));
      setSelectedBooking(null);
      setShowComplete(true);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const processWaitlist = async (cancelledBookingId: string) => {
    try {
      // Get the class_id from the cancelled booking
      const { data: cancelledBooking } = await supabase
        .from("bookings")
        .select("class_id, class:class_id(class_type)")
        .eq("id", cancelledBookingId)
        .single();

      if (!cancelledBooking) return;

      // Find first waitlisted user with auto_book enabled
      const { data: waitlistEntries, error: waitlistError } = await supabase
        .from("waitlist")
        .select(
          `
          id,
          user_id,
          class_id,
          package_id,
          auto_book,
          package:package_id (
            id,
            remaining_credits
          )
        `
        )
        .eq("class_id", cancelledBooking.class_id)
        .eq("status", "waiting")
        .eq("auto_book", true)
        .not("package_id", "is", null)
        .order("created_at", { ascending: true })
        .limit(1);

      if (waitlistError || !waitlistEntries || waitlistEntries.length === 0) {
        console.log("No eligible waitlist entries for auto-booking");
        return;
      }

      const waitlistEntry = waitlistEntries[0] as any;

      // Create booking for waitlisted user
      const { error: bookingError } = await supabase.from("bookings").insert({
        user_id: waitlistEntry.user_id,
        class_id: waitlistEntry.class_id,
        package_id: waitlistEntry.package_id,
        payment_method: "package_credit",
        payment_status: "paid",
        status: "confirmed",
      });

      if (bookingError) {
        console.error("Error creating auto-booking:", bookingError);
        return;
      }

      // Deduct package credit
      if (waitlistEntry.package) {
        await supabase
          .from("packages")
          .update({
            remaining_credits: waitlistEntry.package.remaining_credits - 1,
          })
          .eq("id", waitlistEntry.package_id);
      }

      // Update waitlist status
      await supabase
        .from("waitlist")
        .update({ status: "offered" })
        .eq("id", waitlistEntry.id);

      console.log("Successfully auto-booked waitlisted user");

      // TODO: Send notification to user
    } catch (error) {
      console.error("Error processing waitlist:", error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[#2F3E55]">Loading your bookings...</p>
      </div>
    );
  }

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
              <th className="text-left px-4 py-3">Package Used</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              // Check if cancellation is allowed (1 hour before class)
              const now = new Date();
              const hoursDiff =
                (b.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
              const canCancel = hoursDiff >= 1;
              const minutesLeft = Math.floor(hoursDiff * 60);

              return (
                <tr key={b.id} className="border-b border-[#F7F4EF]">
                  <td className="px-4 py-4">{b.date}</td>
                  <td className="px-4 py-4">{b.time}</td>
                  <td className="px-4 py-4">{b.className}</td>
                  <td className="px-4 py-4 capitalize">{b.coach}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`text-sm ${
                        b.packageUsed === "Single Payment"
                          ? "text-gray-600"
                          : "text-[#2F3E55] font-medium"
                      }`}
                    >
                      {b.packageUsed}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        statusDot[b.status]
                      }`}
                    />
                  </td>
                  <td className="px-4 py-4 text-right">
                    {b.status !== "cancelled" && (
                      <>
                        {canCancel ? (
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
                          >
                            Cancel Booking
                          </button>
                        ) : (
                          <div className="text-right">
                            <button
                              disabled
                              className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm cursor-not-allowed"
                              title="Cannot cancel within 1 hour of class start"
                            >
                              Non-refundable
                            </button>
                            {minutesLeft > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                Starts in {minutesLeft}min
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
        <p className="text-center text-sm text-gray-500 mt-6">
          You have no upcoming bookings.
        </p>
      )}

      {selectedBooking && (
        <ConfirmCancelModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onConfirm={confirmCancel}
          isLoading={cancelling}
        />
      )}

      {showComplete && (
        <CancelCompleteModal onClose={() => setShowComplete(false)} />
      )}
    </div>
  );
}
