// app/admin/customers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { FiSearch, FiEye, FiPackage, FiDownload } from "react-icons/fi";
import CustomerDetailsModal from "./components/CustomerDetailsModal";

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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2E3A4A] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-2">Manage your studio members</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-linear-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-medium"
        >
          <FiDownload size={20} />
          Export to CSV
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
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
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3A4A] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm font-medium">Total Customers</p>
          <p className="text-4xl font-bold mt-2">
            {customers.filter((c) => c.role !== "admin").length}
          </p>
        </div>
        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <p className="text-green-100 text-sm font-medium">Active Customers</p>
          <p className="text-4xl font-bold mt-2">
            {customers.filter((c) => c.active_packages > 0).length}
          </p>
        </div>
        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <p className="text-purple-100 text-sm font-medium">Total Bookings</p>
          <p className="text-4xl font-bold mt-2">
            {customers.reduce((sum, c) => sum + c.total_bookings, 0)}
          </p>
        </div>
        <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
          <p className="text-orange-100 text-sm font-medium">
            Total Packages Sold
          </p>
          <p className="text-4xl font-bold mt-2">
            {customers.reduce((sum, c) => sum + c.total_packages_purchased, 0)}
          </p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="text-center px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Total Bookings
                </th>
                <th className="text-center px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Completed
                </th>
                <th className="text-center px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Active Packages
                </th>
                <th className="text-center px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Total Packages
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => {
                if (customer.role === "admin") return null;

                return (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#B7C9E5] to-[#a0b5d8] flex items-center justify-center text-[#2F3E55] font-bold text-lg shadow-sm">
                          {customer.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold text-gray-900">
                            {customer.full_name}
                          </p>
                          {customer.role === "admin" && (
                            <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full mt-1">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{customer.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {customer.phone_number || "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-gray-900">
                        {customer.total_bookings}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-green-600">
                        {customer.completed_classes}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {customer.active_packages > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                          <FiPackage size={16} />
                          {customer.active_packages}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-lg">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-gray-700">
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
                        className="inline-flex items-center gap-2 bg-[#2E3A4A] text-white px-4 py-2 rounded-lg hover:bg-[#3d4f61] transition-colors font-medium"
                      >
                        <FiEye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredCustomers.filter((c) => c.role !== "admin").length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <FiSearch className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-lg">
                {searchQuery
                  ? "No customers found matching your search"
                  : "No customers yet"}
              </p>
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
