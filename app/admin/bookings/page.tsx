// app/admin/bookings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  FiSearch,
  FiDownload,
  FiEye,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

type Booking = {
  id: string;
  created_at: string;
  status: string;
  payment_method: string;
  payment_status: string;
  user: {
    full_name: string;
    email: string;
    phone_number: string | null;
  };
  class: {
    title: string;
    start_time: string;
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

type BookingDetails = Booking & {
  booking_notes: string | null;
  cancelled_at: string | null;
  class: {
    title: string;
    start_time: string;
    location: string;
    price: number;
    coach: {
      name: string;
    } | null;
  };
  package: {
    created_at: string;
    package_type: {
      name: string;
    };
  } | null;
};

const ITEMS_PER_PAGE = 20;

export default function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Modal
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    bookings,
    searchQuery,
    filterStatus,
    filterPaymentMethod,
    filterDateFrom,
    filterDateTo,
  ]);

  useEffect(() => {
    // Update total pages when filtered bookings change
    setTotalPages(Math.ceil(filteredBookings.length / ITEMS_PER_PAGE));
    setCurrentPage(1); // Reset to first page when filters change
  }, [filteredBookings]);

  const loadBookings = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          created_at,
          status,
          payment_method,
          payment_status,
          user:user_id (
            full_name,
            email,
            phone_number
          ),
          class:class_id (
            title,
            start_time,
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
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter out bookings with null classes (in case class was deleted)
      const validBookings = (data as unknown as Booking[]).filter(
        (booking) => booking.class !== null && booking.user !== null
      );

      setBookings(validBookings);
      setFilteredBookings(validBookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Search filter (customer name or email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.user?.full_name.toLowerCase().includes(query) ||
          booking.user?.email.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter((booking) => booking.status === filterStatus);
    }

    // Payment method filter
    if (filterPaymentMethod) {
      filtered = filtered.filter(
        (booking) => booking.payment_method === filterPaymentMethod
      );
    }

    // Date range filter (based on class start time)
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(
        (booking) => new Date(booking.class.start_time) >= fromDate
      );
    }

    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (booking) => new Date(booking.class.start_time) <= toDate
      );
    }

    setFilteredBookings(filtered);
  };

  const exportToCSV = () => {
    // Export only filtered results
    const headers = [
      "Booking ID",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Class",
      "Class Date",
      "Class Time",
      "Location",
      "Coach",
      "Payment Method",
      "Payment Status",
      "Package Used",
      "Status",
      "Booked At",
    ];

    const rows = filteredBookings.map((booking) => [
      booking.id,
      booking.user?.full_name || "—",
      booking.user?.email || "—",
      booking.user?.phone_number || "—",
      booking.class?.title || "—",
      new Date(booking.class.start_time).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      new Date(booking.class.start_time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      booking.class?.location || "—",
      booking.class?.coach?.name || "TBA",
      booking.payment_method?.replace("_", " ") || "—",
      booking.payment_status || "—",
      booking.package?.package_type?.name || "Single Payment",
      booking.status,
      new Date(booking.created_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bookings-filtered-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadBookingDetails = async (bookingId: string) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          created_at,
          status,
          payment_method,
          payment_status,
          booking_notes,
          cancelled_at,
          user:user_id (
            full_name,
            email,
            phone_number
          ),
          class:class_id (
            title,
            start_time,
            location,
            price,
            coach:coach_id (
              name
            )
          ),
          package:package_id (
            created_at,
            package_type:package_type_id (
              name
            )
          )
        `
        )
        .eq("id", bookingId)
        .single();

      if (error) throw error;

      setSelectedBooking(data as unknown as BookingDetails);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error loading booking details:", error);
      alert("Failed to load booking details");
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (error) throw error;

      // Reload bookings
      loadBookings();
      setShowDetailsModal(false);
      alert("Booking cancelled successfully");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking");
    }
  };

  // Get paginated bookings
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Bookings</h1>
          <p className="text-gray-600 mt-1">
            Manage all class bookings ({filteredBookings.length} results)
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredBookings.length === 0}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiDownload size={20} />
          Export to CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-3">
            <div className="relative">
              <FiSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by customer name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
            >
              <option value="">All Methods</option>
              <option value="single_payment">Single Payment</option>
              <option value="package_credit">Package Credit</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Date From
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Date To
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("");
                setFilterPaymentMethod("");
                setFilterDateFrom("");
                setFilterDateTo("");
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Class
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Date & Time
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Payment
                </th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.user?.full_name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.user?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.class?.title || "—"}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {booking.class?.coach?.name || "TBA"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(booking.class.start_time).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(booking.class.start_time).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 capitalize">
                      {booking.payment_method?.replace("_", " ")}
                    </div>
                    {booking.package && (
                      <div className="text-xs text-gray-500">
                        {booking.package.package_type.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : booking.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : booking.status === "no_show"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => loadBookingDetails(booking.id)}
                      className="inline-flex items-center gap-2 text-[#2F3E55] hover:text-[#2E3A4A] font-medium text-sm"
                    >
                      <FiEye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginatedBookings.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {filteredBookings.length === 0
                ? "No bookings found matching your filters"
                : "No bookings on this page"}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)}{" "}
              of {filteredBookings.length} results
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft size={20} />
              </button>

              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        currentPage === pageNum
                          ? "bg-[#2E3A4A] text-white"
                          : "border border-gray-300 hover:bg-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
          }}
          onCancel={handleCancelBooking}
          onRefresh={loadBookings}
        />
      )}
    </div>
  );
}

// Booking Details Modal Component
function BookingDetailsModal({
  booking,
  onClose,
  onCancel,
  onRefresh,
}: {
  booking: BookingDetails;
  onClose: () => void;
  onCancel: (bookingId: string) => void;
  onRefresh: () => void;
}) {
  const canCancel =
    booking.status === "confirmed" || booking.status === "pending";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Booking Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Customer Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <strong>Name:</strong> {booking.user?.full_name || "Unknown"}
              </p>
              <p className="text-sm">
                <strong>Email:</strong> {booking.user?.email || "—"}
              </p>
              <p className="text-sm">
                <strong>Phone:</strong> {booking.user?.phone_number || "—"}
              </p>
            </div>
          </div>

          {/* Class Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Class Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <strong>Class:</strong> {booking.class?.title || "—"}
              </p>
              <p className="text-sm">
                <strong>Date:</strong>{" "}
                {new Date(booking.class.start_time).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </p>
              <p className="text-sm">
                <strong>Time:</strong>{" "}
                {new Date(booking.class.start_time).toLocaleTimeString(
                  "en-US",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </p>
              <p className="text-sm">
                <strong>Location:</strong> {booking.class?.location || "—"}
              </p>
              <p className="text-sm">
                <strong>Coach:</strong> {booking.class?.coach?.name || "TBA"}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Payment Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm capitalize">
                <strong>Method:</strong>{" "}
                {booking.payment_method?.replace("_", " ") || "—"}
              </p>
              <p className="text-sm capitalize">
                <strong>Status:</strong> {booking.payment_status || "—"}
              </p>

              {/* Show class price for single payments */}
              {booking.payment_method === "single_payment" &&
                booking.class?.price && (
                  <p className="text-sm">
                    <strong>Amount:</strong> Rp.
                    {booking.class.price.toLocaleString("id-ID")}
                  </p>
                )}

              {/* Show package info for package credits */}
              {booking.package && (
                <>
                  <p className="text-sm">
                    <strong>Package:</strong>{" "}
                    {booking.package.package_type.name}
                  </p>
                  <p className="text-sm">
                    <strong>Package Purchased:</strong>{" "}
                    {new Date(booking.package.created_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Booking Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Booking Status
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <strong>Status:</strong>{" "}
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                    booking.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : booking.status === "completed"
                      ? "bg-blue-100 text-blue-800"
                      : booking.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {booking.status}
                </span>
              </p>
              <p className="text-sm">
                <strong>Booked At:</strong>{" "}
                {new Date(booking.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {booking.cancelled_at && (
                <p className="text-sm">
                  <strong>Cancelled At:</strong>{" "}
                  {new Date(booking.cancelled_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              {booking.booking_notes && (
                <p className="text-sm">
                  <strong>Notes:</strong> {booking.booking_notes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-white transition"
          >
            Close
          </button>
          {canCancel && (
            <button
              onClick={() => {
                onCancel(booking.id);
              }}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
