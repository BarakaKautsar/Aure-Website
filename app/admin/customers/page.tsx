// app/admin/customers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  FiSearch,
  FiEye,
  FiEdit2,
  FiPackage,
  FiCalendar,
  FiDownload,
} from "react-icons/fi";

type Customer = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  created_at: string;
  role: string;
  total_bookings: number;
  completed_classes: number;
  active_packages: number;
  total_packages_purchased: number;
};

type CustomerDetails = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  created_at: string;
  bookings: any[];
  packages: any[];
};

export default function CustomersManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchQuery, customers]);

  const exportToCSV = () => {
    // Prepare CSV headers
    const headers = [
      "Full Name",
      "Email",
      "Phone Number",
      "Total Bookings",
      "Completed Classes",
      "Active Packages",
      "Total Packages Purchased",
      "Member Since",
    ];

    // Prepare CSV rows
    const rows = customers
      .filter((c) => c.role !== "admin") // Exclude admins
      .map((customer) => [
        customer.full_name,
        customer.email,
        customer.phone_number || "—",
        customer.total_bookings,
        customer.completed_classes,
        customer.active_packages,
        customer.total_packages_purchased,
        new Date(customer.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `customers-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadCustomers = async () => {
    setLoading(true);

    try {
      // Get all profiles (customers) - now including email from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone_number, created_at, role")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get booking counts for each customer
      const customersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Total bookings
          const { count: totalBookings } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.id);

          // Completed classes
          const { count: completedClasses } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.id)
            .eq("status", "completed");

          // Active packages
          const { count: activePackages } = await supabase
            .from("packages")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.id)
            .eq("status", "active")
            .gt("remaining_credits", 0);

          // Total packages purchased
          const { count: totalPackages } = await supabase
            .from("packages")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.id);

          return {
            id: profile.id,
            full_name: profile.full_name || "Unknown",
            email: profile.email || "No email",
            phone_number: profile.phone_number,
            created_at: profile.created_at,
            role: profile.role || "customer",
            total_bookings: totalBookings || 0,
            completed_classes: completedClasses || 0,
            active_packages: activePackages || 0,
            total_packages_purchased: totalPackages || 0,
          };
        })
      );

      setCustomers(customersWithStats);
      setFilteredCustomers(customersWithStats);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        customer.full_name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone_number?.toLowerCase().includes(query)
    );

    setFilteredCustomers(filtered);
  };

  const loadCustomerDetails = async (customerId: string) => {
    try {
      // Get customer profile - now including email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone_number, created_at")
        .eq("id", customerId)
        .single();

      if (profileError) throw profileError;

      // Get bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select(
          `
          id,
          status,
          created_at,
          payment_method,
          class:class_id (
            title,
            start_time
          )
        `
        )
        .eq("user_id", customerId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (bookingsError) throw bookingsError;

      // Get packages
      const { data: packages, error: packagesError } = await supabase
        .from("packages")
        .select(
          `
          id,
          status,
          total_credits,
          remaining_credits,
          expires_at,
          created_at,
          package_type:package_type_id (
            name
          )
        `
        )
        .eq("user_id", customerId)
        .order("created_at", { ascending: false });

      if (packagesError) throw packagesError;

      setSelectedCustomer({
        id: profile.id,
        full_name: profile.full_name || "Unknown",
        email: profile.email || "No email",
        phone_number: profile.phone_number,
        created_at: profile.created_at,
        bookings: bookings || [],
        packages: packages || [],
      });

      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error loading customer details:", error);
      alert("Failed to load customer details");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading customers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your studio members</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          <FiDownload size={20} />
          Export to CSV
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="relative">
          <FiSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Customers</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {customers.filter((c) => c.role !== "admin").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Active Customers</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {customers.filter((c) => c.active_packages > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Bookings</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {customers.reduce((sum, c) => sum + c.total_bookings, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Packages Sold</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {customers.reduce((sum, c) => sum + c.total_packages_purchased, 0)}
          </p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Bookings
                </th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Packages
                </th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Packages
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => {
                if (customer.role === "admin") return null;

                return (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#B7C9E5] flex items-center justify-center text-[#2F3E55] font-semibold">
                          {customer.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-800">
                            {customer.full_name}
                          </p>
                          {customer.role === "admin" && (
                            <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800">{customer.email}</p>
                      <p className="text-sm text-gray-500">
                        {customer.phone_number || "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-gray-800">
                        {customer.total_bookings}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-green-600 font-semibold">
                        {customer.completed_classes}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {customer.active_packages > 0 ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          <FiPackage size={14} />
                          {customer.active_packages}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-600 font-medium">
                        {customer.total_packages_purchased}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(customer.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => loadCustomerDetails(customer.id)}
                        className="inline-flex items-center gap-2 text-[#2F3E55] hover:text-[#2E3A4A] font-medium text-sm"
                      >
                        <FiEye size={16} />
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredCustomers.filter((c) => c.role !== "admin").length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {searchQuery
                ? "No customers found matching your search"
                : "No customers yet"}
            </div>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedCustomer(null);
          }}
          onRefresh={loadCustomers}
        />
      )}
    </div>
  );
}

// Customer Details Modal Component
function CustomerDetailsModal({
  customer,
  onClose,
  onRefresh,
}: {
  customer: CustomerDetails;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"bookings" | "packages">(
    "bookings"
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#B7C9E5] flex items-center justify-center text-[#2F3E55] font-bold text-2xl">
                {customer.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {customer.full_name}
                </h2>
                <p className="text-gray-600">{customer.email}</p>
                <p className="text-gray-600">
                  {customer.phone_number || "No phone"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
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
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex-1 px-6 py-3 font-medium transition ${
              activeTab === "bookings"
                ? "border-b-2 border-[#2F3E55] text-[#2F3E55]"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <FiCalendar className="inline mr-2" />
            Bookings ({customer.bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("packages")}
            className={`flex-1 px-6 py-3 font-medium transition ${
              activeTab === "packages"
                ? "border-b-2 border-[#2F3E55] text-[#2F3E55]"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <FiPackage className="inline mr-2" />
            Packages ({customer.packages.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "bookings" && (
            <div className="space-y-3">
              {customer.bookings.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No bookings yet
                </p>
              ) : (
                customer.bookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">
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
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "packages" && (
            <div className="space-y-3">
              {customer.packages.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No packages purchased yet
                </p>
              ) : (
                customer.packages.map((pkg: any) => {
                  const isActive = pkg.status === "active";
                  const isExpired = new Date(pkg.expires_at) < new Date();
                  const usedCredits = pkg.total_credits - pkg.remaining_credits;

                  return (
                    <div
                      key={pkg.id}
                      className={`border rounded-lg p-4 ${
                        isActive && !isExpired
                          ? "border-green-300 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-gray-800">
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
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isActive && !isExpired
                              ? "bg-green-100 text-green-800"
                              : isExpired
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {isExpired
                            ? "Expired"
                            : pkg.status === "active"
                            ? "Active"
                            : pkg.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Credits: {pkg.remaining_credits} / {pkg.total_credits}
                        </span>
                        <span className="text-gray-600">
                          Expires:{" "}
                          {new Date(pkg.expires_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            isActive && !isExpired
                              ? "bg-green-500"
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
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-[#2F3E55] text-white rounded-lg hover:opacity-90 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
