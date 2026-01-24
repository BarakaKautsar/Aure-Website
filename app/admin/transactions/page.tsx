// app/admin/transactions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  FiSearch,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
} from "react-icons/fi";

type Transaction = {
  id: string;
  created_at: string;
  amount: number;
  payment_status: string;
  paid_at: string | null;
  type: string;
  user: {
    full_name: string;
    email: string;
  } | null;
  booking: {
    id: string;
    class: {
      title: string;
      class_type: string;
      start_time: string;
    } | null;
  } | null;
  package_type: {
    name: string;
    class_credits: number;
  } | null;
  package: {
    total_credits: number;
    remaining_credits: number;
  } | null;
};

const ITEMS_PER_PAGE = 20;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterClassType, setFilterClassType] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Summary stats
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    transactions,
    searchQuery,
    filterStatus,
    filterClassType,
    filterDateFrom,
    filterDateTo,
  ]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
    setCurrentPage(1);

    // Calculate total revenue from filtered paid transactions
    const revenue = filteredTransactions
      .filter((t) => t.payment_status === "paid")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    setTotalRevenue(revenue);
  }, [filteredTransactions]);

  const loadTransactions = async () => {
    setLoading(true);

    try {
      // First, get all transactions
      const { data: transactionsData, error: transactionsError } =
        await supabase
          .from("transactions")
          .select(
            `
          id,
          created_at,
          amount,
          payment_status,
          paid_at,
          type,
          user_id,
          booking_id,
          package_type_id
        `,
          )
          .order("created_at", { ascending: false });

      if (transactionsError) {
        console.error("Transactions query error:", transactionsError);
        throw transactionsError;
      }

      // Now enrich each transaction with related data
      const enrichedTransactions = await Promise.all(
        (transactionsData || []).map(async (t: any) => {
          let user = null;
          let booking = null;
          let packageType = null;
          let packageData = null;

          // Get user info
          if (t.user_id) {
            const { data: userData } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", t.user_id)
              .single();
            user = userData;
          }

          // Get booking and class info
          if (t.booking_id) {
            const { data: bookingData } = await supabase
              .from("bookings")
              .select("id, class_id")
              .eq("id", t.booking_id)
              .single();

            if (bookingData?.class_id) {
              const { data: classData } = await supabase
                .from("classes")
                .select("title, class_type, start_time")
                .eq("id", bookingData.class_id)
                .single();

              booking = {
                id: bookingData.id,
                class: classData,
              };
            }
          }

          // Get package type info
          if (t.package_type_id) {
            const { data: pkgTypeData } = await supabase
              .from("package_types")
              .select("id, name, class_credits")
              .eq("id", t.package_type_id)
              .single();
            packageType = pkgTypeData;

            // Get package usage if this is a package purchase
            if (t.user_id && pkgTypeData) {
              const { data: pkgData } = await supabase
                .from("packages")
                .select("total_credits, remaining_credits")
                .eq("user_id", t.user_id)
                .eq("package_type_id", t.package_type_id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();
              packageData = pkgData;
            }
          }

          return {
            ...t,
            user,
            booking,
            package_type: packageType,
            package: packageData,
          };
        }),
      );

      setTransactions(enrichedTransactions as Transaction[]);
      setFilteredTransactions(enrichedTransactions as Transaction[]);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search filter (customer name or email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.user?.full_name?.toLowerCase().includes(query) ||
          t.user?.email?.toLowerCase().includes(query),
      );
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter((t) => t.payment_status === filterStatus);
    }

    // Class type filter
    if (filterClassType) {
      filtered = filtered.filter(
        (t) => t.booking?.class?.class_type === filterClassType,
      );
    }

    // Date range filter (based on paid_at or created_at)
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((t) => {
        const date = new Date(t.paid_at || t.created_at);
        return date >= fromDate;
      });
    }

    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((t) => {
        const date = new Date(t.paid_at || t.created_at);
        return date <= toDate;
      });
    }

    setFilteredTransactions(filtered);
  };

  const exportToCSV = () => {
    const headers = [
      "No Invoice#",
      "Customer",
      "Email",
      "Status",
      "Tanggal Bayar",
      "Tanggal Kelas",
      "Gross Total",
      "Kelas",
      "Package",
      "Terpakai",
    ];

    const rows = filteredTransactions.map((t, index) => {
      const invoiceNumber = filteredTransactions.length - index;
      const paymentDate = t.paid_at
        ? new Date(t.paid_at).toLocaleDateString("en-CA")
        : "-";
      const classDate = t.booking?.class?.start_time
        ? new Date(t.booking.class.start_time).toLocaleDateString("en-CA")
        : "-";

      let packageName = "-";
      let usage = "-";

      if (t.package_type) {
        packageName =
          t.package_type.name || `Bundling ${t.package_type.class_credits}x`;
        if (t.package) {
          const used = t.package.total_credits - t.package.remaining_credits;
          usage = `${used}/${t.package.total_credits}`;
        }
      } else if (t.type === "single_class") {
        packageName = "Visit";
        usage = "1";
      }

      return [
        invoiceNumber,
        t.user?.full_name || "-",
        t.user?.email || "-",
        t.payment_status?.toUpperCase() || "-",
        paymentDate,
        classDate,
        t.amount || 0,
        t.booking?.class?.class_type?.replace("_", " ") || "-",
        packageName,
        usage,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const dateRange =
      filterDateFrom && filterDateTo
        ? `${filterDateFrom}_to_${filterDateTo}`
        : new Date().toISOString().split("T")[0];

    link.setAttribute("href", url);
    link.setAttribute("download", `transactions-${dateRange}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const getClassTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      reformer: "bg-blue-100 text-blue-700",
      spine_corrector: "bg-purple-100 text-purple-700",
      matt: "bg-green-100 text-green-700",
    };
    return styles[type] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-600 mt-1">
            {filteredTransactions.length} transactions
            {filterDateFrom &&
              filterDateTo &&
              ` from ${filterDateFrom} to ${filterDateTo}`}
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredTransactions.length === 0}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiDownload size={20} />
          Export to CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
          <p className="text-3xl font-bold text-gray-900">
            {filteredTransactions.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Paid Transactions</p>
          <p className="text-3xl font-bold text-green-600">
            {
              filteredTransactions.filter((t) => t.payment_status === "paid")
                .length
            }
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-gray-500" />
          <h3 className="font-medium text-gray-700">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-3">
            <div className="relative">
              <FiSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by customer name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Class Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kelas (Class Type)
            </label>
            <select
              value={filterClassType}
              onChange={(e) => setFilterClassType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
            >
              <option value="">All Classes</option>
              <option value="reformer">Reformer</option>
              <option value="spine_corrector">Spine Corrector</option>
              <option value="matt">Matt</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Bayar From
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Bayar To
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("");
                setFilterClassType("");
                setFilterDateFrom("");
                setFilterDateTo("");
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  No Invoice#
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Tanggal Bayar
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Tanggal Kelas
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Gross Total
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Kelas
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Package
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Terpakai
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTransactions.map((t, index) => {
                const invoiceNumber =
                  filteredTransactions.length -
                  ((currentPage - 1) * ITEMS_PER_PAGE + index);

                let packageName = "-";
                let usage = "-";

                if (t.package_type) {
                  packageName =
                    t.package_type.name ||
                    `Bundling ${t.package_type.class_credits}x`;
                  if (t.package) {
                    const used =
                      t.package.total_credits - t.package.remaining_credits;
                    usage = `${used}/${t.package.total_credits}`;
                  }
                } else if (t.type === "single_class") {
                  packageName = "Visit";
                  usage = "1";
                }

                return (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {invoiceNumber}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {t.user?.full_name || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t.user?.email || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full uppercase ${getStatusBadge(
                          t.payment_status,
                        )}`}
                      >
                        {t.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {t.paid_at
                        ? new Date(t.paid_at).toLocaleDateString("en-CA")
                        : "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {t.booking?.class?.start_time
                        ? new Date(
                            t.booking.class.start_time,
                          ).toLocaleDateString("en-CA")
                        : "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 text-right font-medium">
                      {t.amount ? t.amount.toLocaleString("id-ID") : "-"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {t.booking?.class?.class_type ? (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getClassTypeBadge(
                            t.booking.class.class_type,
                          )}`}
                        >
                          {t.booking.class.class_type.replace("_", " ")}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {packageName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 text-center">
                      {usage}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {paginatedTransactions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No transactions found matching your filters
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(
                currentPage * ITEMS_PER_PAGE,
                filteredTransactions.length,
              )}{" "}
              of {filteredTransactions.length} results
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft size={20} />
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        currentPage === pageNum
                          ? "bg-[#2E3A4A] text-white"
                          : "border border-gray-300 hover:bg-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
