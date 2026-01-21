"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import {
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiMapPin,
  FiEdit,
} from "react-icons/fi";
import ClassDetailModal from "./components/ClassDetailModal";

type Stats = {
  todayBookings: number;
  todayRevenue: number;
  lastScheduledDate: string;
  totalUsers: number;
};

type TodayClass = {
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    todayBookings: 0,
    todayRevenue: 0,
    lastScheduledDate: "No classes scheduled",
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<TodayClass | null>(null);
  const [showClassModal, setShowClassModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's bookings count
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

    // Today's scheduled classes with bookings
    const { data: classes } = await supabase
      .from("classes")
      .select(
        `
        id,
        title,
        class_type,
        start_time,
        end_time,
        location,
        capacity,
        price,
        original_price,
        status,
        coach:coach_id (
          id,
          name
        ),
        bookings:bookings!class_id (
          id,
          status,
          payment_method,
          profile:user_id (
            id,
            full_name,
            email,
            phone_number
          )
        )
      `
      )
      .gte("start_time", today.toISOString())
      .lt("start_time", tomorrow.toISOString())
      .order("start_time", { ascending: true });

    setStats({
      todayBookings: todayBookings?.length || 0,
      todayRevenue: 0, // TODO: Calculate from transactions
      lastScheduledDate: lastScheduledDate,
      totalUsers: users?.length || 0,
    });

    setTodayClasses((classes as unknown as TodayClass[]) || []);
    setLoading(false);
  };

  const handleClassClick = (classItem: TodayClass) => {
    setSelectedClass(classItem);
    setShowClassModal(true);
  };

  const handleClassUpdated = () => {
    loadDashboardData();
    setShowClassModal(false);
  };

  const statCards = [
    {
      name: "Today's Bookings",
      value: stats.todayBookings,
      icon: FiUsers,
      color: "bg-linear-to-br from-blue-500 to-blue-600",
    },
    {
      name: "Last Scheduled Class",
      value: stats.lastScheduledDate,
      icon: FiCalendar,
      color: "bg-linear-to-br from-green-500 to-green-600",
    },
    {
      name: "Total Users",
      value: stats.totalUsers,
      icon: FiTrendingUp,
      color: "bg-linear-to-br from-purple-500 to-purple-600",
    },
    {
      name: "Today's Revenue",
      value: `Rp ${stats.todayRevenue.toLocaleString("id-ID")}`,
      icon: FiDollarSign,
      color: "bg-linear-to-br from-orange-500 to-orange-600",
    },
  ];

  const getClassTypeColor = (type: string) => {
    const colors = {
      reformer: "bg-blue-100 text-blue-700 border-blue-200",
      spine_corrector: "bg-purple-100 text-purple-700 border-purple-200",
      matt: "bg-green-100 text-green-700 border-green-200",
      aerial: "bg-pink-100 text-pink-700 border-pink-200",
    };
    return (
      colors[type as keyof typeof colors] ||
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "bg-green-100 text-green-700",
      delayed: "bg-yellow-100 text-yellow-700",
      cancelled: "bg-red-100 text-red-700",
      completed: "bg-gray-100 text-gray-700",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2E3A4A] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className={`${stat.color} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">
                {stat.name}
              </p>
              <p className="text-white text-3xl font-bold tracking-tight">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <FiCalendar className="text-[#2E3A4A]" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/walk-in"
            className="group flex items-center justify-center gap-3 bg-linear-to-r from-[#2E3A4A] to-[#3d4f61] text-white px-6 py-5 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <FiUsers size={22} />
            <span className="font-medium">Walk-in Booking</span>
          </Link>
          <Link
            href="/admin/classes"
            className="group flex items-center justify-center gap-3 bg-linear-to-r from-[#B7C9E5] to-[#a0b5d8] text-[#2F3E55] px-6 py-5 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <FiCalendar size={22} />
            <span className="font-medium">Add Class</span>
          </Link>
          <Link
            href="/admin/bookings"
            className="group flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 px-6 py-5 rounded-xl hover:border-[#2E3A4A] hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <FiUsers size={22} />
            <span className="font-medium">View Bookings</span>
          </Link>
        </div>
      </div>

      {/* Today's Scheduled Classes */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-linear-to-r from-[#2E3A4A] to-[#3d4f61] px-6 py-5">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <FiCalendar size={24} />
            Today's Scheduled Classes
          </h2>
          <p className="text-white/70 text-sm mt-1">
            {todayClasses.length}{" "}
            {todayClasses.length === 1 ? "class" : "classes"} scheduled
          </p>
        </div>

        <div className="p-6">
          {todayClasses.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 text-lg">
                No classes scheduled for today
              </p>
              <Link
                href="/admin/classes"
                className="inline-block mt-4 text-[#2E3A4A] hover:underline"
              >
                Schedule a class →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {todayClasses.map((classItem) => {
                const startTime = new Date(classItem.start_time);
                const confirmedBookings = classItem.bookings.filter(
                  (b) => b.status === "confirmed"
                ).length;
                const spotsLeft = classItem.capacity - confirmedBookings;

                return (
                  <div
                    key={classItem.id}
                    onClick={() => handleClassClick(classItem)}
                    className="group bg-linear-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-5 cursor-pointer hover:border-[#2E3A4A] hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Time */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="bg-linear-to-br from-[#2E3A4A] to-[#3d4f61] text-white px-4 py-3 rounded-lg text-center min-w-20">
                          <FiClock className="mx-auto mb-1" size={18} />
                          <p className="text-lg font-bold">
                            {startTime.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Class Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {classItem.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getClassTypeColor(
                              classItem.class_type
                            )}`}
                          >
                            {classItem.class_type.replace("_", " ")}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              classItem.status
                            )}`}
                          >
                            {classItem.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FiUsers size={16} />
                            Coach: {classItem.coach?.name || "TBA"}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiMapPin size={16} />
                            {classItem.location.replace(
                              "Aure Pilates Studio ",
                              ""
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Capacity & Action */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Capacity</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {confirmedBookings}
                            <span className="text-base text-gray-400">
                              /{classItem.capacity}
                            </span>
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              spotsLeft === 0
                                ? "text-red-600 font-medium"
                                : spotsLeft <= 3
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {spotsLeft === 0
                              ? "Full"
                              : `${spotsLeft} spot${
                                  spotsLeft !== 1 ? "s" : ""
                                } left`}
                          </p>
                        </div>

                        <button className="flex items-center gap-2 bg-[#2E3A4A] text-white px-4 py-3 rounded-lg hover:bg-[#3d4f61] transition-colors group-hover:shadow-lg">
                          <FiEdit size={18} />
                          <span className="hidden sm:inline">Manage</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Class Detail Modal */}
      {showClassModal && selectedClass && (
        <ClassDetailModal
          classData={selectedClass}
          onClose={() => setShowClassModal(false)}
          onUpdate={handleClassUpdated}
        />
      )}
    </div>
  );
}
