"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  FiX,
  FiUsers,
  FiClock,
  FiMapPin,
  FiDollarSign,
  FiEdit2,
  FiCheck,
  FiMail,
  FiPhone,
  FiAlertCircle,
} from "react-icons/fi";

type ClassData = {
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
    id: string;
    name: string;
  } | null;
  bookings: {
    id: string;
    status: string;
    payment_method: string;
    profile: {
      id: string;
      full_name: string;
      email: string;
      phone_number: string | null;
    };
  }[];
};

type Props = {
  classData: ClassData;
  onClose: () => void;
  onUpdate: () => void;
};

export default function ClassDetailModal({
  classData,
  onClose,
  onUpdate,
}: Props) {
  const [activeTab, setActiveTab] = useState<"details" | "attendees">(
    "attendees"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    title: classData.title,
    capacity: classData.capacity,
    price: classData.price,
    original_price: classData.original_price || 0,
    status: classData.status,
  });

  const confirmedAttendees = classData.bookings.filter(
    (b) => b.status === "confirmed"
  );
  const waitlistAttendees = classData.bookings.filter(
    (b) => b.status === "waitlist"
  );

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("classes")
      .update({
        title: editForm.title,
        capacity: editForm.capacity,
        price: editForm.price,
        original_price: editForm.original_price || null,
        status: editForm.status,
      })
      .eq("id", classData.id);

    setSaving(false);

    if (!error) {
      setIsEditing(false);
      onUpdate();
    } else {
      alert("Failed to update class");
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (!error) {
      onUpdate();
    } else {
      alert("Failed to cancel booking");
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "bg-green-100 text-green-700 border-green-300",
      delayed: "bg-yellow-100 text-yellow-700 border-yellow-300",
      cancelled: "bg-red-100 text-red-700 border-red-300",
      completed: "bg-gray-100 text-gray-700 border-gray-300",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 text-gray-700 border-gray-300"
    );
  };

  const getPaymentMethodColor = (method: string) => {
    const colors = {
      package: "bg-purple-100 text-purple-700",
      single_visit: "bg-blue-100 text-blue-700",
      cash: "bg-green-100 text-green-700",
    };
    return colors[method as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const startTime = new Date(classData.start_time);
  const endTime = new Date(classData.end_time);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-[#2E3A4A] to-[#3d4f61] px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {classData.title}
            </h2>
            <p className="text-white/70 text-sm">
              {startTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("attendees")}
              className={`py-3 px-4 font-medium transition-all relative ${
                activeTab === "attendees"
                  ? "text-[#2E3A4A] border-b-2 border-[#2E3A4A]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center gap-2">
                <FiUsers size={18} />
                Attendees ({confirmedAttendees.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`py-3 px-4 font-medium transition-all relative ${
                activeTab === "details"
                  ? "text-[#2E3A4A] border-b-2 border-[#2E3A4A]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center gap-2">
                <FiEdit2 size={18} />
                Class Details
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "attendees" ? (
            <div className="space-y-6">
              {/* Confirmed Attendees */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Confirmed ({confirmedAttendees.length}/{classData.capacity})
                </h3>

                {confirmedAttendees.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FiUsers className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-gray-500">No confirmed attendees yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {confirmedAttendees.map((booking, index) => (
                      <div
                        key={booking.id}
                        className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-[#2E3A4A] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#2E3A4A] to-[#3d4f61] text-white flex items-center justify-center font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {booking.profile.full_name}
                              </p>
                              <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <FiMail size={14} />
                                  {booking.profile.email}
                                </span>
                                {booking.profile.phone_number && (
                                  <span className="flex items-center gap-1">
                                    <FiPhone size={14} />
                                    {booking.profile.phone_number}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(
                                booking.payment_method
                              )}`}
                            >
                              {booking.payment_method.replace("_", " ")}
                            </span>
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Waitlist */}
              {waitlistAttendees.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    Waitlist ({waitlistAttendees.length})
                  </h3>

                  <div className="space-y-3">
                    {waitlistAttendees.map((booking, index) => (
                      <div
                        key={booking.id}
                        className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {booking.profile.full_name}
                              </p>
                              <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <FiMail size={14} />
                                  {booking.profile.email}
                                </span>
                              </div>
                            </div>
                          </div>

                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            Waitlist
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Class Info Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <FiClock className="text-blue-600 mb-2" size={20} />
                  <p className="text-xs text-blue-600 font-medium mb-1">Time</p>
                  <p className="font-semibold text-blue-900">
                    {startTime.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>

                <div className="bg-linear-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <FiMapPin className="text-purple-600 mb-2" size={20} />
                  <p className="text-xs text-purple-600 font-medium mb-1">
                    Location
                  </p>
                  <p className="font-semibold text-purple-900 text-sm">
                    {classData.location.replace("Aure Pilates Studio ", "")}
                  </p>
                </div>

                <div className="bg-linear-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <FiUsers className="text-green-600 mb-2" size={20} />
                  <p className="text-xs text-green-600 font-medium mb-1">
                    Coach
                  </p>
                  <p className="font-semibold text-green-900">
                    {classData.coach?.name || "TBA"}
                  </p>
                </div>

                <div className="bg-linear-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                  <FiDollarSign className="text-orange-600 mb-2" size={20} />
                  <p className="text-xs text-orange-600 font-medium mb-1">
                    Price
                  </p>
                  <p className="font-semibold text-orange-900">
                    Rp {classData.price.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* Edit Form */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit Class Details
                  </h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-[#2E3A4A] text-white px-4 py-2 rounded-lg hover:bg-[#3d4f61] transition-colors"
                    >
                      <FiEdit2 size={16} />
                      Edit
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3A4A] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity
                      </label>
                      <input
                        type="number"
                        value={editForm.capacity}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            capacity: parseInt(e.target.value),
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3A4A] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3A4A] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="delayed">Delayed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (Rp)
                      </label>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            price: parseInt(e.target.value),
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3A4A] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Original Price (Rp) - Optional
                      </label>
                      <input
                        type="number"
                        value={editForm.original_price}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            original_price: parseInt(e.target.value),
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3A4A] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        <FiCheck size={18} />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            title: classData.title,
                            capacity: classData.capacity,
                            price: classData.price,
                            original_price: classData.original_price || 0,
                            status: classData.status,
                          });
                        }}
                        disabled={saving}
                        className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Warning if capacity reduced */}
              {isEditing && editForm.capacity < confirmedAttendees.length && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <FiAlertCircle
                    className="text-red-600 shrink-0 mt-0.5"
                    size={20}
                  />
                  <div>
                    <p className="font-medium text-red-900">Warning</p>
                    <p className="text-sm text-red-700 mt-1">
                      Reducing capacity below the current number of confirmed
                      attendees ({confirmedAttendees.length}) may cause issues.
                      Please ensure you handle existing bookings appropriately.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
