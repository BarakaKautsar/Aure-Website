"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import {
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";

type Stats = {
  todayBookings: number;
  todayRevenue: number;
  lastScheduledDate: string;
  totalUsers: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    todayBookings: 0,
    todayRevenue: 0,
    lastScheduledDate: "No classes scheduled",
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's bookings
    const { data: todayBookings } = await supabase
      .from("bookings")
      .select("*")
      .gte("created_at", today.toISOString())
      .eq("status", "confirmed");

    // Last scheduled class date
    const { data: lastClass } = await supabase
      .from("classes")
      .select("start_time")
      .gte("start_time", new Date().toISOString())
      .eq("status", "scheduled")
      .order("start_time", { ascending: false })
      .limit(1)
      .single();

    let lastScheduledDate = "No classes scheduled";
    if (lastClass) {
      const date = new Date(lastClass.start_time);
      lastScheduledDate = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    // Total users
    const { data: users } = await supabase.from("profiles").select("id");

    // Recent bookings
    const { data: recent } = await supabase
      .from("bookings")
      .select(
        `
        id,
        created_at,
        payment_method,
        class:class_id (
          title,
          start_time
        ),
        profile:user_id (
          full_name
        )
      `
      )
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })
      .limit(5);

    setStats({
      todayBookings: todayBookings?.length || 0,
      todayRevenue: 0, // TODO: Calculate from transactions
      lastScheduledDate: lastScheduledDate,
      totalUsers: users?.length || 0,
    });

    setRecentBookings(recent || []);
    setLoading(false);
  };

  const statCards = [
    {
      name: "Today's Bookings",
      value: stats.todayBookings,
      icon: FiUsers,
      color: "bg-blue-500",
    },
    {
      name: "Last Scheduled Class",
      value: stats.lastScheduledDate,
      icon: FiCalendar,
      color: "bg-green-500",
    },
    {
      name: "Total Users",
      value: stats.totalUsers,
      icon: FiTrendingUp,
      color: "bg-purple-500",
    },
    {
      name: "Today's Revenue",
      value: `Rp ${stats.todayRevenue.toLocaleString("id-ID")}`,
      icon: FiDollarSign,
      color: "bg-orange-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow p-6 flex items-center gap-4"
          >
            <div className={`${stat.color} p-3 rounded-lg text-white`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/walk-in"
            className="flex items-center justify-center gap-2 bg-[#2E3A4A] text-white px-6 py-4 rounded-lg hover:opacity-90 transition"
          >
            <FiUsers size={20} />
            Walk-in Booking
          </Link>
          <Link
            href="/admin/classes"
            className="flex items-center justify-center gap-2 bg-[#B7C9E5] text-[#2F3E55] px-6 py-4 rounded-lg hover:opacity-90 transition"
          >
            <FiCalendar size={20} />
            Add Class
          </Link>
          <Link
            href="/admin/bookings"
            className="flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-lg hover:bg-gray-50 transition"
          >
            <FiUsers size={20} />
            View Bookings
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Bookings
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Customer
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Class
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Payment
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Booked At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentBookings.map((booking: any) => (
                <tr key={booking.id}>
                  <td className="px-4 py-3 text-sm">
                    {booking.profile?.full_name || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {booking.class?.title || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">
                    {booking.payment_method?.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(booking.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {recentBookings.length === 0 && (
            <p className="text-center text-gray-500 py-8">No recent bookings</p>
          )}
        </div>
      </div>
    </div>
  );
}
