// app/admin/customers/components/CustomerDetailsModal.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  FiCalendar,
  FiPackage,
  FiEdit2,
  FiCheck,
  FiX,
  FiAlertTriangle,
} from "react-icons/fi";

type CustomerDetails = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  created_at: string;
  bookings: any[];
  packages: any[];
};

type Props = {
  customer: CustomerDetails;
  onClose: () => void;
  onRefresh: () => void;
};

export default function CustomerDetailsModal({
  customer,
  onClose,
  onRefresh,
}: Props) {
  const [activeTab, setActiveTab] = useState<"bookings" | "packages">(
    "bookings"
  );
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    remaining_credits: 0,
    total_credits: 0,
    expires_at: "",
  });
  const [saving, setSaving] = useState(false);

  const handleEditPackage = (pkg: any) => {
    setEditingPackageId(pkg.id);
    setEditForm({
      remaining_credits: pkg.remaining_credits,
      total_credits: pkg.total_credits,
      expires_at: pkg.expires_at.split("T")[0], // Convert to YYYY-MM-DD format
    });
  };

  const handleCancelEdit = () => {
    setEditingPackageId(null);
    setEditForm({
      remaining_credits: 0,
      total_credits: 0,
      expires_at: "",
    });
  };

  const handleSavePackage = async (packageId: string) => {
    if (editForm.remaining_credits > editForm.total_credits) {
      alert("Remaining credits cannot exceed total credits");
      return;
    }

    if (editForm.remaining_credits < 0 || editForm.total_credits < 0) {
      alert("Credits cannot be negative");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("packages")
      .update({
        remaining_credits: editForm.remaining_credits,
        total_credits: editForm.total_credits,
        expires_at: editForm.expires_at,
      })
      .eq("id", packageId);

    setSaving(false);

    if (error) {
      alert("Failed to update package");
      console.error(error);
      return;
    }

    // Success - refresh the customer data
    setEditingPackageId(null);
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-[#2E3A4A] to-[#3d4f61] p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl border-2 border-white/30">
                {customer.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {customer.full_name}
                </h2>
                <p className="text-white/80">{customer.email}</p>
                <p className="text-white/80">
                  {customer.phone_number || "No phone"}
                </p>
                <p className="text-sm text-white/60 mt-1">
                  Member since{" "}
                  {new Date(customer.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex-1 px-6 py-4 font-medium transition relative ${
              activeTab === "bookings"
                ? "text-[#2F3E55] bg-white border-b-2 border-[#2F3E55]"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <FiCalendar className="inline mr-2" size={18} />
            Bookings ({customer.bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("packages")}
            className={`flex-1 px-6 py-4 font-medium transition relative ${
              activeTab === "packages"
                ? "text-[#2F3E55] bg-white border-b-2 border-[#2F3E55]"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <FiPackage className="inline mr-2" size={18} />
            Packages ({customer.packages.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "bookings" && (
            <div className="space-y-3">
              {customer.bookings.length === 0 ? (
                <div className="text-center py-12">
                  <FiCalendar
                    className="mx-auto text-gray-300 mb-3"
                    size={48}
                  />
                  <p className="text-gray-500">No bookings yet</p>
                </div>
              ) : (
                customer.bookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-[#2E3A4A] hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {booking.class?.title || "Class"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {booking.class?.start_time
                            ? new Date(booking.class.start_time).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "Date TBA"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          Payment: {booking.payment_method?.replace("_", " ")}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "completed"
                            ? "bg-blue-100 text-blue-700"
                            : booking.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "packages" && (
            <div className="space-y-4">
              {customer.packages.length === 0 ? (
                <div className="text-center py-12">
                  <FiPackage className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">No packages purchased yet</p>
                </div>
              ) : (
                customer.packages.map((pkg: any) => {
                  const isActive = pkg.status === "active";
                  const isExpired = new Date(pkg.expires_at) < new Date();
                  const usedCredits = pkg.total_credits - pkg.remaining_credits;
                  const isEditing = editingPackageId === pkg.id;

                  return (
                    <div
                      key={pkg.id}
                      className={`border-2 rounded-xl p-5 transition-all ${
                        isActive && !isExpired
                          ? "border-green-300 bg-linear-to-br from-green-50 to-white"
                          : isExpired
                          ? "border-red-300 bg-linear-to-br from-red-50 to-white"
                          : "border-gray-200 bg-white"
                      } ${isEditing ? "shadow-lg" : ""}`}
                    >
                      {/* Package Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">
                            {pkg.package_type?.name || "Package"}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Purchased{" "}
                            {new Date(pkg.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                              isActive && !isExpired
                                ? "bg-green-100 text-green-700"
                                : isExpired
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {isExpired
                              ? "Expired"
                              : pkg.status === "active"
                              ? "Active"
                              : pkg.status}
                          </span>
                          {!isEditing && (
                            <button
                              onClick={() => handleEditPackage(pkg)}
                              className="p-2 text-[#2E3A4A] hover:bg-[#2E3A4A] hover:text-white rounded-lg transition-colors"
                              title="Edit package"
                            >
                              <FiEdit2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Edit Mode */}
                      {isEditing ? (
                        <div className="space-y-4 bg-gray-50 rounded-lg p-4 border-2 border-[#2E3A4A]">
                          {/* Warning Banner */}
                          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 flex items-start gap-3">
                            <FiAlertTriangle
                              className="text-yellow-600 shrink-0 mt-0.5"
                              size={20}
                            />
                            <div>
                              <p className="text-sm font-medium text-yellow-900">
                                Admin Override
                              </p>
                              <p className="text-xs text-yellow-700 mt-1">
                                You're manually adjusting package details. These
                                changes will be logged.
                              </p>
                            </div>
                          </div>

                          {/* Edit Form */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Total Credits
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={editForm.total_credits}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    total_credits:
                                      parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3A4A] focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Remaining Credits
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={editForm.total_credits}
                                value={editForm.remaining_credits}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    remaining_credits:
                                      parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3A4A] focus:border-transparent"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Expiry Date
                            </label>
                            <input
                              type="date"
                              value={editForm.expires_at}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  expires_at: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3A4A] focus:border-transparent"
                            />
                          </div>

                          {/* Validation Error */}
                          {editForm.remaining_credits >
                            editForm.total_credits && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                              <FiAlertTriangle
                                className="text-red-600 shrink-0"
                                size={16}
                              />
                              <p className="text-sm text-red-700">
                                Remaining credits cannot exceed total credits
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => handleSavePackage(pkg.id)}
                              disabled={
                                saving ||
                                editForm.remaining_credits >
                                  editForm.total_credits ||
                                editForm.remaining_credits < 0 ||
                                editForm.total_credits < 0
                              }
                              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                              <FiCheck size={18} />
                              {saving ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={saving}
                              className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* View Mode */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <p className="text-xs text-gray-600 mb-1">
                                Credits Remaining
                              </p>
                              <p className="text-2xl font-bold text-gray-900">
                                {pkg.remaining_credits}
                                <span className="text-sm text-gray-400 font-normal">
                                  {" "}
                                  / {pkg.total_credits}
                                </span>
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <p className="text-xs text-gray-600 mb-1">
                                Expires On
                              </p>
                              <p className="text-lg font-semibold text-gray-900">
                                {new Date(pkg.expires_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>
                                {usedCredits} used • {pkg.remaining_credits}{" "}
                                remaining
                              </span>
                              <span>
                                {Math.round(
                                  (usedCredits / pkg.total_credits) * 100
                                )}
                                % used
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div
                                className={`h-3 rounded-full transition-all ${
                                  isActive && !isExpired
                                    ? "bg-linear-to-r from-green-500 to-green-600"
                                    : "bg-gray-400"
                                }`}
                                style={{
                                  width: `${
                                    (usedCredits / pkg.total_credits) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-linear-to-r from-[#2E3A4A] to-[#3d4f61] text-white rounded-xl hover:shadow-lg transition-all font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
