"use client";

import { FiX, FiCheck } from "react-icons/fi";
import { useState } from "react";

export type Booking = {
  id: string;
  date: string;
  time: string;
  className: string;
  coach: string;
  packageUsed: string;
  paymentMethod: string;
  startTime: Date;
  packageId: string | null;
  packageRemainingCredits: number | null;
};

export function ConfirmCancelModal({
  booking,
  onClose,
  onConfirm,
  isLoading = false,
}: {
  booking: Booking;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  isLoading?: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8 z-10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={isLoading}
        >
          <FiX size={20} />
        </button>

        <h3 className="text-2xl font-medium text-[#2F3E55] mb-4">
          Confirm Cancellation
        </h3>

        <p className="text-sm text-[#2F3E55] mb-6">
          Are you sure you would like to cancel your booking?
          {booking.paymentMethod === "package_credit" && (
            <span className="block mt-2 text-green-600 font-medium">
              ✓ Your package credit will be refunded
            </span>
          )}
          {booking.paymentMethod === "single_payment" && (
            <span className="block mt-2 text-orange-600 font-medium">
              Note: Refunds will be processed manually within 7 business days
            </span>
          )}
        </p>

        <div className="space-y-2 text-sm text-[#2F3E55] mb-6">
          <p>
            <strong>Date:</strong> {booking.date}
          </p>
          <p>
            <strong>Time:</strong> {booking.time}
          </p>
          <p>
            <strong>Class:</strong> {booking.className}
          </p>
          <p>
            <strong>Coach:</strong> {booking.coach}
          </p>
          <p>
            <strong>Payment:</strong> {booking.packageUsed}
          </p>
        </div>

        {/* Cancellation Reason */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#2F3E55] mb-2">
            Reason for cancellation (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Schedule conflict, Not feeling well, Emergency..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#B7C9E5] resize-none"
            rows={3}
            disabled={isLoading}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {reason.length}/500 characters
          </p>
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-[#F7F4EF] px-4 py-3 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={() => onConfirm(reason.trim() || undefined)}
            disabled={isLoading}
            className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Cancelling..." : "Confirm Cancellation"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CancelCompleteModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-10 z-10 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX size={20} />
        </button>

        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white">
          <FiCheck size={36} />
        </div>

        <h3 className="text-2xl font-medium text-[#2F3E55] mb-3">
          Cancellation Complete!
        </h3>

        <p className="text-sm text-[#2F3E55] mb-2">
          Your booking has been cancelled.
        </p>

        <p className="text-sm text-green-600 mb-2">
          If you used a package credit, it has been returned to your account.
        </p>

        <p className="text-sm text-gray-600 mb-6">
          For single payment refunds, our team will process your refund within 7
          business days.
        </p>

        <button
          onClick={onClose}
          className="bg-[#B7C9E5] text-[#2F3E55] px-6 py-3 rounded-xl hover:opacity-90"
        >
          View Schedule
        </button>
      </div>
    </div>
  );
}
