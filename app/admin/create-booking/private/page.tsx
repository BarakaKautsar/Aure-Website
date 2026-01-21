// app/admin/bookings/create/private/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiDollarSign,
} from "react-icons/fi";

export default function PrivateClassBookingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link
        href="/admin/bookings/create"
        className="inline-flex items-center gap-2 text-[#2E3A4A] hover:underline mb-6"
      >
        <FiArrowLeft />
        Back to Booking Types
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Private Class Booking
      </h1>
      <p className="text-gray-600 mb-8">
        Schedule custom private sessions for individual customers
      </p>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Coming Soon Banner */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white shrink-0">
              🚧
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Coming Soon
              </h3>
              <p className="text-purple-800">
                Private class booking feature is under development. This will
                allow you to:
              </p>
            </div>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="space-y-6">
          <div className="border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <FiCalendar className="text-[#2E3A4A] mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Custom Scheduling
                </h4>
                <p className="text-gray-600 text-sm">
                  Create sessions at any time, not limited to pre-scheduled
                  group classes. Perfect for customers who need flexible timing.
                </p>
              </div>
            </div>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <FiClock className="text-[#2E3A4A] mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Flexible Duration
                </h4>
                <p className="text-gray-600 text-sm">
                  Set custom session lengths (30 min, 60 min, 90 min, etc.)
                  based on customer needs and coach availability.
                </p>
              </div>
            </div>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <FiMapPin className="text-[#2E3A4A] mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Location Choice
                </h4>
                <p className="text-gray-600 text-sm">
                  Select from studio locations or mark as "home visit" for
                  private sessions at customer's location.
                </p>
              </div>
            </div>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <FiDollarSign className="text-[#2E3A4A] mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Custom Pricing
                </h4>
                <p className="text-gray-600 text-sm">
                  Set special pricing for private sessions, small groups, or
                  package deals arranged via WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Temporary Solution */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-blue-900 mb-3">
            Temporary Solution
          </h4>
          <p className="text-blue-800 text-sm mb-4">
            For now, you can manually create private bookings by:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm ml-2">
            <li>Creating a custom "Private Session" class in Class Schedule</li>
            <li>Setting capacity to 1 (or small group size)</li>
            <li>Using Walk-in Booking to book the customer for that class</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Link
            href="/admin/classes"
            className="flex-1 border-2 border-[#2E3A4A] text-[#2E3A4A] px-6 py-3 rounded-xl hover:bg-[#2E3A4A] hover:text-white transition text-center font-medium"
          >
            Go to Class Schedule
          </Link>
          <Link
            href="/admin/bookings/create/walk-in"
            className="flex-1 bg-[#2E3A4A] text-white px-6 py-3 rounded-xl hover:opacity-90 transition text-center font-medium"
          >
            Use Walk-in Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
