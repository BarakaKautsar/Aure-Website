"use client";

import { FiX, FiCheck } from "react-icons/fi";

export type Booking = {
  id: number;
  date: string;
  time: string;
  className: string;
  coach: string;
};

export function ConfirmCancelModal({
  booking,
  onClose,
  onConfirm,
}: {
  booking: Booking;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX size={20} />
        </button>

        <h3 className="text-2xl font-medium text-[#2F3E55] mb-4">
          Confirm Cancellation
        </h3>

        <p className="text-sm text-[#2F3E55] mb-6">
          Are you sure you would like to cancel your booking?
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
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-[#F7F4EF] px-4 py-3 rounded-xl hover:opacity-90"
          >
            Back
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl hover:opacity-90"
          >
            Confirm Cancellation
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

        <p className="text-sm text-[#2F3E55] mb-6">
          To rejoin this class you would need to re-do the booking process.
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
