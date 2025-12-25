// app/admin/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  FiDollarSign,
  FiUsers,
  FiCalendar,
  FiPackage,
  FiTrendingUp,
  FiDownload,
} from "react-icons/fi";

type AnalyticsData = {
  totalRevenue: number;
  totalBookings: number;
  totalCustomers: number;
  totalPackagesSold: number;
  revenueGrowth: number;
  bookingGrowth: number;
  popularClasses: {
    title: string;
    bookings: number;
    revenue: number;
  }[];
  packageSales: {
    name: string;
    sold: number;
    revenue: number;
  }[];
  dailyRevenue: {
    date: string;
    revenue: number;
    bookings: number;
  }[];
  customerGrowth: {
    month: string;
    newCustomers: number;
  }[];
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalBookings: 0,
    totalCustomers: 0,
    totalPackagesSold: 0,
    revenueGrowth: 0,
    bookingGrowth: 0,
    popularClasses: [],
    packageSales: [],
    dailyRevenue: [],
    customerGrowth: [],
  });
  const [loading, setLoading] = useState(true);

  // Date filters
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default: last 30 days
    return date.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateFrom, dateTo]);

  const loadAnalytics = async () => {
    setLoading(true);

    try {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);

      // Get all bookings in date range
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select(
          `
          id,
          created_at,
          payment_method,
          status,
          class:class_id (
            title,
            price,
            start_time
          ),
          package:package_id (
            package_type:package_type_id (
              name,
              price
            )
          )
        `
        )
        .gte("created_at", fromDate.toISOString())
        .lte("created_at", toDate.toISOString())
        .in("status", ["confirmed", "completed"]);

      if (bookingsError) throw bookingsError;

      // Calculate total revenue
      let totalRevenue = 0;
      const validBookings = (bookings || []).filter((b) => b.class !== null);

      validBookings.forEach((booking: any) => {
        if (
          booking.payment_method === "single_payment" &&
          booking.class?.price
        ) {
          totalRevenue += booking.class.price;
        }
      });

      // Get package sales in date range
      const { data: packages, error: packagesError } = await supabase
        .from("packages")
        .select(
          `
          id,
          created_at,
          package_type:package_type_id (
            name,
            price
          )
        `
        )
        .gte("created_at", fromDate.toISOString())
        .lte("created_at", toDate.toISOString());

      if (packagesError) throw packagesError;

      // Add package revenue
      const validPackages = (packages || []).filter(
        (p) => p.package_type !== null
      );
      validPackages.forEach((pkg: any) => {
        if (pkg.package_type?.price) {
          totalRevenue += pkg.package_type.price;
        }
      });

      // Get total customers
      const { count: totalCustomers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .neq("role", "admin");

      // Calculate popular classes
      const classBookings: Record<string, { count: number; revenue: number }> =
        {};
      validBookings.forEach((booking: any) => {
        const title = booking.class?.title || "Unknown";
        if (!classBookings[title]) {
          classBookings[title] = { count: 0, revenue: 0 };
        }
        classBookings[title].count++;
        if (
          booking.payment_method === "single_payment" &&
          booking.class?.price
        ) {
          classBookings[title].revenue += booking.class.price;
        }
      });

      const popularClasses = Object.entries(classBookings)
        .map(([title, data]) => ({
          title,
          bookings: data.count,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);

      // Calculate package sales
      const packageSalesMap: Record<
        string,
        { count: number; revenue: number }
      > = {};
      validPackages.forEach((pkg: any) => {
        const name = pkg.package_type?.name || "Unknown";
        if (!packageSalesMap[name]) {
          packageSalesMap[name] = { count: 0, revenue: 0 };
        }
        packageSalesMap[name].count++;
        if (pkg.package_type?.price) {
          packageSalesMap[name].revenue += pkg.package_type.price;
        }
      });

      const packageSales = Object.entries(packageSalesMap)
        .map(([name, data]) => ({
          name,
          sold: data.count,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue);

      // Calculate daily revenue
      const dailyRevenueMap: Record<
        string,
        { revenue: number; bookings: number }
      > = {};

      validBookings.forEach((booking: any) => {
        const date = new Date(booking.created_at).toISOString().split("T")[0];
        if (!dailyRevenueMap[date]) {
          dailyRevenueMap[date] = { revenue: 0, bookings: 0 };
        }
        dailyRevenueMap[date].bookings++;
        if (
          booking.payment_method === "single_payment" &&
          booking.class?.price
        ) {
          dailyRevenueMap[date].revenue += booking.class.price;
        }
      });

      validPackages.forEach((pkg: any) => {
        const date = new Date(pkg.created_at).toISOString().split("T")[0];
        if (!dailyRevenueMap[date]) {
          dailyRevenueMap[date] = { revenue: 0, bookings: 0 };
        }
        if (pkg.package_type?.price) {
          dailyRevenueMap[date].revenue += pkg.package_type.price;
        }
      });

      const dailyRevenue = Object.entries(dailyRevenueMap)
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          bookings: data.bookings,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate growth (compare to previous period)
      const periodLength =
        (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
      const previousFromDate = new Date(fromDate);
      previousFromDate.setDate(previousFromDate.getDate() - periodLength);
      const previousToDate = new Date(fromDate);

      const { data: previousBookings } = await supabase
        .from("bookings")
        .select("id, status")
        .gte("created_at", previousFromDate.toISOString())
        .lte("created_at", previousToDate.toISOString())
        .in("status", ["confirmed", "completed"]);

      const bookingGrowth =
        previousBookings && previousBookings.length > 0
          ? ((validBookings.length - previousBookings.length) /
              previousBookings.length) *
            100
          : 0;

      setAnalytics({
        totalRevenue,
        totalBookings: validBookings.length,
        totalCustomers: totalCustomers || 0,
        totalPackagesSold: validPackages.length,
        revenueGrowth: 0, // Simplified for now
        bookingGrowth,
        popularClasses,
        packageSales,
        dailyRevenue,
        customerGrowth: [], // Simplified for now
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    const headers = ["Metric", "Value"];

    const rows = [
      ["Date Range", `${dateFrom} to ${dateTo}`],
      ["Total Revenue", `Rp.${analytics.totalRevenue.toLocaleString("id-ID")}`],
      ["Total Bookings", analytics.totalBookings],
      ["Total Customers", analytics.totalCustomers],
      ["Packages Sold", analytics.totalPackagesSold],
      ["Booking Growth", `${analytics.bookingGrowth.toFixed(1)}%`],
      ["", ""],
      ["Popular Classes", "Bookings"],
      ...analytics.popularClasses.map((c) => [c.title, c.bookings]),
      ["", ""],
      ["Package Sales", "Units Sold"],
      ...analytics.packageSales.map((p) => [p.name, p.sold]),
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `analytics-${dateFrom}-to-${dateTo}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const setQuickFilter = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);

    setDateTo(to.toISOString().split("T")[0]);
    setDateFrom(from.toISOString().split("T")[0]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
          <p className="text-gray-600 mt-1">Business insights and reports</p>
        </div>
        <button
          onClick={exportAnalytics}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          <FiDownload size={20} />
          Export Report
        </button>
      </div>

      {/* Date Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setQuickFilter(7)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setQuickFilter(30)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setQuickFilter(90)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Last 90 Days
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          icon={<FiDollarSign className="text-green-500" size={24} />}
          title="Total Revenue"
          value={`Rp.${analytics.totalRevenue.toLocaleString("id-ID")}`}
          growth={analytics.revenueGrowth}
          bgColor="bg-green-50"
        />
        <MetricCard
          icon={<FiCalendar className="text-blue-500" size={24} />}
          title="Total Bookings"
          value={analytics.totalBookings}
          growth={analytics.bookingGrowth}
          bgColor="bg-blue-50"
        />
        <MetricCard
          icon={<FiUsers className="text-purple-500" size={24} />}
          title="Total Customers"
          value={analytics.totalCustomers}
          bgColor="bg-purple-50"
        />
        <MetricCard
          icon={<FiPackage className="text-orange-500" size={24} />}
          title="Packages Sold"
          value={analytics.totalPackagesSold}
          bgColor="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Popular Classes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Popular Classes
          </h2>
          {analytics.popularClasses.length === 0 ? (
            <p className="text-gray-500 text-sm">No data available</p>
          ) : (
            <div className="space-y-3">
              {analytics.popularClasses.map((cls, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{cls.title}</p>
                    <p className="text-sm text-gray-500">
                      {cls.bookings} bookings • Rp.
                      {cls.revenue.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-[#B7C9E5] flex items-center justify-center text-[#2F3E55] font-bold">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Package Sales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Package Sales
          </h2>
          {analytics.packageSales.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No packages sold in this period
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.packageSales.map((pkg, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{pkg.name}</p>
                    <p className="text-sm text-gray-500">
                      {pkg.sold} sold • Rp.{pkg.revenue.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#2F3E55]">
                      {pkg.sold}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Daily Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Daily Revenue & Bookings
        </h2>
        {analytics.dailyRevenue.length === 0 ? (
          <p className="text-gray-500 text-sm">No data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Bookings
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {analytics.dailyRevenue.map((day) => (
                  <tr key={day.date} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                      {day.bookings}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                      Rp.{day.revenue.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  title,
  value,
  growth,
  bgColor,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  growth?: number;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white rounded-lg">{icon}</div>
        {growth !== undefined && growth !== 0 && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              growth > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            <FiTrendingUp
              size={16}
              className={growth < 0 ? "rotate-180" : ""}
            />
            {Math.abs(growth).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-gray-600 text-sm mb-1">{title}</p>
      <p className="text-3xl font-semibold text-gray-800">{value}</p>
    </div>
  );
}
