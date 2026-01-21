// app/admin/bookings/create/walk-in/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  FiSearch,
  FiCheck,
  FiUser,
  FiPhone,
  FiArrowLeft,
  FiUserPlus,
} from "react-icons/fi";
import Link from "next/link";

type Customer = {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
};

type ClassOption = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  coach: { name: string } | null;
  location: string;
  capacity: number;
  booked: number;
  price: number;
};

export default function WalkInBookingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New customer form
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // Class selection
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassOption | null>(null);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">(
    "cash"
  );
  const [creating, setCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Real-time search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchCustomers();
      } else {
        setSearchResults([]);
        setShowCreateForm(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    if (step === 2) {
      loadClasses();
    }
  }, [step, selectedDate]);

  const searchCustomers = async () => {
    setSearching(true);
    const query = searchQuery.trim().toLowerCase();

    // Search by name, phone, or email
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone_number, email")
      .or(
        `full_name.ilike.%${query}%,phone_number.ilike.%${query}%,email.ilike.%${query}%`
      )
      .neq("role", "admin")
      .limit(5);

    setSearching(false);

    if (!error && data) {
      setSearchResults(data);
      setShowCreateForm(data.length === 0);
    }
  };

  const selectCustomer = (cust: Customer) => {
    setCustomer(cust);
    setSearchResults([]);
    setSearchQuery("");
    setStep(2);
  };

  const createTemporaryCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      alert("Name and phone are required");
      return;
    }

    setSearching(true);

    // Create a temporary email if not provided
    const email =
      newCustomer.email || `${newCustomer.phone}@temp.aurepilates.com`;

    // Create auth user with temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + "Aa1!";

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: tempPassword,
      options: {
        data: {
          full_name: newCustomer.name,
          phone_number: newCustomer.phone,
        },
      },
    });

    if (authError || !authData.user) {
      console.error("Auth creation failed:", authError);
      alert("Failed to create customer. Please try again.");
      setSearching(false);
      return;
    }

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: newCustomer.name,
        phone_number: newCustomer.phone,
        email: email,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Profile update failed:", profileError);
    }

    setCustomer({
      id: authData.user.id,
      full_name: newCustomer.name,
      phone_number: newCustomer.phone,
      email: email,
    });

    setSearching(false);
    setShowCreateForm(false);
    setNewCustomer({ name: "", phone: "", email: "" });
    setStep(2);
  };

  const loadClasses = async () => {
    setLoadingClasses(true);

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("classes")
      .select(
        `
        id,
        title,
        start_time,
        end_time,
        location,
        capacity,
        price,
        coach:coach_id (name),
        bookings:bookings!class_id (id, status)
      `
      )
      .gte("start_time", startOfDay.toISOString())
      .lte("start_time", endOfDay.toISOString())
      .eq("status", "scheduled")
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error loading classes:", error);
      setLoadingClasses(false);
      return;
    }

    const transformed = (data as any[]).map((cls) => ({
      id: cls.id,
      title: cls.title,
      start_time: cls.start_time,
      end_time: cls.end_time,
      location: cls.location,
      capacity: cls.capacity,
      price: cls.price,
      coach: cls.coach,
      booked:
        cls.bookings?.filter((b: any) => b.status === "confirmed").length || 0,
    }));

    setClasses(transformed);
    setLoadingClasses(false);
  };

  const createBooking = async () => {
    if (!customer || !selectedClass) return;

    setCreating(true);

    try {
      const { error: bookingError } = await supabase.from("bookings").insert({
        user_id: customer.id,
        class_id: selectedClass.id,
        package_id: null,
        payment_method: "single_payment",
        payment_status: "paid",
        status: "confirmed",
        booking_notes: `Walk-in booking - ${paymentMethod}`,
      });

      if (bookingError) throw bookingError;

      await supabase.from("transactions").insert({
        user_id: customer.id,
        type: "single_class",
        booking_id: selectedClass.id,
        amount: selectedClass.price,
        payment_method: paymentMethod,
        payment_status: "paid",
      });

      setShowSuccess(true);
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSearchQuery("");
    setCustomer(null);
    setSearchResults([]);
    setShowCreateForm(false);
    setNewCustomer({ name: "", phone: "", email: "" });
    setSelectedClass(null);
    setShowSuccess(false);
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white">
            <FiCheck size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h2>
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <p className="text-gray-700 mb-2">
              <strong>Customer:</strong> {customer?.full_name}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Class:</strong> {selectedClass?.title}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Time:</strong>{" "}
              {new Date(selectedClass?.start_time || "").toLocaleString(
                "en-US",
                {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </p>
            <p className="text-gray-700">
              <strong>Payment:</strong>{" "}
              <span className="capitalize">{paymentMethod}</span> - Rp
              {selectedClass?.price.toLocaleString("id-ID")}
            </p>
          </div>
          <button
            onClick={resetForm}
            className="bg-[#2E3A4A] text-white px-8 py-3 rounded-xl hover:opacity-90 transition font-medium"
          >
            Create Another Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link
        href="/admin/bookings/create"
        className="inline-flex items-center gap-2 text-[#2E3A4A] hover:underline mb-6"
      >
        <FiArrowLeft />
        Back to Booking Types
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Walk-in Booking</h1>
      <p className="text-gray-600 mb-8">
        Book customers for scheduled group classes
      </p>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((num, idx) => (
            <>
              <div
                key={num}
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  step >= num
                    ? "bg-[#2E3A4A] text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {num}
              </div>
              {idx < 2 && (
                <div className="w-16 h-1 bg-gray-300">
                  <div
                    className={`h-full transition-all bg-[#2E3A4A] ${
                      step > num ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* STEP 1: Customer Search */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Step 1: Find or Create Customer
            </h2>

            {!customer ? (
              <div>
                <div className="relative mb-6">
                  <FiSearch
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, phone, or email..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E3A4A] focus:border-transparent text-lg"
                    autoFocus
                  />
                  {searching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-[#2E3A4A] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mb-6 space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      {searchResults.length} customer
                      {searchResults.length !== 1 && "s"} found:
                    </p>
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => selectCustomer(result)}
                        className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-[#2E3A4A] hover:bg-gray-50 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-[#2E3A4A]">
                              {result.full_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {result.phone_number}
                            </p>
                            {result.email && (
                              <p className="text-sm text-gray-500">
                                {result.email}
                              </p>
                            )}
                          </div>
                          <div className="text-[#2E3A4A] opacity-0 group-hover:opacity-100 transition-opacity">
                            →
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Create New Customer */}
                {showCreateForm && searchQuery.length >= 2 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                    <div className="flex items-start gap-3 mb-4">
                      <FiUserPlus className="text-[#2E3A4A] mt-1" size={24} />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          No customers found
                        </h3>
                        <p className="text-sm text-gray-600">
                          Create a new customer profile
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiUser className="inline mr-2" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={newCustomer.name}
                          onChange={(e) =>
                            setNewCustomer({
                              ...newCustomer,
                              name: e.target.value,
                            })
                          }
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E3A4A] focus:border-transparent"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiPhone className="inline mr-2" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={newCustomer.phone}
                          onChange={(e) =>
                            setNewCustomer({
                              ...newCustomer,
                              phone: e.target.value,
                            })
                          }
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E3A4A] focus:border-transparent"
                          placeholder="08123456789"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          value={newCustomer.email}
                          onChange={(e) =>
                            setNewCustomer({
                              ...newCustomer,
                              email: e.target.value,
                            })
                          }
                          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E3A4A] focus:border-transparent"
                          placeholder="john@example.com"
                        />
                      </div>

                      <button
                        onClick={createTemporaryCustomer}
                        disabled={
                          searching || !newCustomer.name || !newCustomer.phone
                        }
                        className="w-full bg-[#2E3A4A] text-white px-6 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 font-medium"
                      >
                        {searching ? "Creating..." : "Create & Continue"}
                      </button>
                    </div>
                  </div>
                )}

                {searchQuery.length < 2 &&
                  searchResults.length === 0 &&
                  !showCreateForm && (
                    <div className="text-center py-12 text-gray-500">
                      <FiSearch className="mx-auto mb-3" size={48} />
                      <p>Start typing to search for customers</p>
                      <p className="text-sm mt-2">
                        Enter at least 2 characters
                      </p>
                    </div>
                  )}
              </div>
            ) : (
              <div>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-green-800 font-semibold mb-3 flex items-center gap-2">
                        <FiCheck />
                        Customer Selected
                      </p>
                      <p className="text-gray-900 mb-1">
                        <strong>Name:</strong> {customer.full_name}
                      </p>
                      <p className="text-gray-900 mb-1">
                        <strong>Phone:</strong> {customer.phone_number}
                      </p>
                      {customer.email && (
                        <p className="text-gray-900">
                          <strong>Email:</strong> {customer.email}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setCustomer(null);
                        setSearchQuery("");
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-[#2E3A4A] text-white px-6 py-3 rounded-xl hover:opacity-90 transition font-medium"
                >
                  Continue to Class Selection
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Class Selection */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Step 2: Select Class
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2E3A4A] focus:border-transparent"
              />
            </div>

            {loadingClasses ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-[#2E3A4A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading classes...</p>
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No classes available for this date</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {classes.map((cls) => {
                  const isFull = cls.booked >= cls.capacity;
                  const isSelected = selectedClass?.id === cls.id;

                  return (
                    <button
                      key={cls.id}
                      onClick={() => !isFull && setSelectedClass(cls)}
                      disabled={isFull}
                      className={`w-full text-left p-4 border-2 rounded-xl transition ${
                        isSelected
                          ? "border-[#2E3A4A] bg-[#F7F4EF]"
                          : isFull
                          ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                          : "border-gray-200 hover:border-[#B7C9E5]"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {cls.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(cls.start_time).toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" }
                            )}{" "}
                            • Coach: {cls.coach?.name || "TBA"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {cls.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            Rp {cls.price.toLocaleString("id-ID")}
                          </p>
                          <p
                            className={`text-sm ${
                              isFull ? "text-red-600" : "text-gray-600"
                            }`}
                          >
                            {cls.booked}/{cls.capacity} {isFull && "(Full)"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border-2 border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedClass}
                className="flex-1 bg-[#2E3A4A] text-white px-6 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 font-medium"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment */}
        {step === 3 && selectedClass && customer && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Step 3: Confirm Payment
            </h2>

            <div className="bg-[#F7F4EF] rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Booking Summary
              </h3>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Customer:</strong> {customer.full_name}
                </p>
                <p>
                  <strong>Phone:</strong> {customer.phone_number}
                </p>
                <p>
                  <strong>Class:</strong> {selectedClass.title}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {new Date(selectedClass.start_time).toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xl font-bold text-gray-900 pt-2">
                  <strong>Amount:</strong> Rp
                  {selectedClass.price.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-[#B7C9E5] transition">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">Cash</span>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-[#B7C9E5] transition">
                  <input
                    type="radio"
                    name="payment"
                    value="transfer"
                    checked={paymentMethod === "transfer"}
                    onChange={() => setPaymentMethod("transfer")}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">
                    Bank Transfer / QR Payment
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                disabled={creating}
                className="flex-1 border-2 border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 transition disabled:opacity-50 font-medium"
              >
                Back
              </button>
              <button
                onClick={createBooking}
                disabled={creating}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50 font-medium"
              >
                {creating ? "Creating Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
