// app/admin/create-booking/page.tsx
"use client";

import { useState } from "react";
import { FiUsers, FiUserPlus, FiClock } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function CreateBookingPage() {
  const router = useRouter();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Create Booking
        </h1>
        <p className="text-gray-600">Choose the type of booking to create</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Walk-in Booking Card */}
        <button
          onClick={() => router.push("/admin/create-booking/walk-in")}
          className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left"
        >
          {/* linear Background */}
          <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-blue-600 opacity-90" />

          {/* Content */}
          <div className="relative p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FiUsers size={32} />
              </div>
              <div className="text-white/80 text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
                Quick Booking
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-2">Walk-in Booking</h3>
            <p className="text-white/90 text-sm mb-4">
              Create instant bookings for customers who visit the studio
            </p>

            <div className="space-y-2 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Search existing customers</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Create temporary profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Select from scheduled classes</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Instant payment confirmation</span>
              </div>
            </div>

            <div className="mt-6 flex items-center text-white font-medium">
              <span>Start Walk-in Booking</span>
              <span className="ml-2 transform group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </div>

          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>

        {/* Private Class Booking Card */}
        <button
          onClick={() => router.push("/admin/create-booking/private")}
          className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left"
        >
          {/* linear Background */}
          <div className="absolute inset-0 bg-linear-to-br from-purple-500 to-purple-600 opacity-90" />

          {/* Content */}
          <div className="relative p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FiUserPlus size={32} />
              </div>
              <div className="text-white/80 text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
                Custom Schedule
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-2">Private Class Booking</h3>
            <p className="text-white/90 text-sm mb-4">
              Schedule one-on-one or custom group sessions outside regular
              classes
            </p>

            <div className="space-y-2 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Custom date & time selection</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Choose specific coach</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Set custom pricing</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Flexible scheduling</span>
              </div>
            </div>

            <div className="mt-6 flex items-center text-white font-medium">
              <span>Start Private Booking</span>
              <span className="ml-2 transform group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </div>

          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Booking Activity
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">—</div>
            <div className="text-sm text-gray-600">Today's Bookings</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">—</div>
            <div className="text-sm text-gray-600">Walk-in Today</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">—</div>
            <div className="text-sm text-gray-600">Private Sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
