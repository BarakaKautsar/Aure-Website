"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { FiSearch, FiCheck, FiUser, FiPhone } from "react-icons/fi";

type Customer = {
  id: string;
  full_name: string;
  phone_number: string;
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
  const [phone, setPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);

  // New customer form
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
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

  useEffect(() => {
    if (step === 2) {
      loadClasses();
    }
  }, [step, selectedDate]);

  const searchCustomer = async () => {
    if (!phone || phone.length < 8) {
      alert("Please enter a valid phone number");
      return;
    }

    setSearching(true);

    // Clean phone number: remove spaces, dashes, parentheses
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

    // Try multiple formats
    const phoneVariants = [
      cleanPhone,
      cleanPhone.replace(/^0/, "+62"), // Convert 08xxx to +628xxx
      cleanPhone.replace(/^\+62/, "0"), // Convert +628xxx to 08xxx
    ];

    let foundCustomer = null;

    // Try each variant
    for (const variant of phoneVariants) {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone_number")
        .eq("phone_number", variant)
        .single();

      if (data) {
        foundCustomer = data;
        break;
      }
    }

    setSearching(false);

    if (foundCustomer) {
      setCustomer(foundCustomer);
      setStep(2);
    } else {
      // Customer not found - prepare to create new
      setNewCustomer({ name: "", phone: cleanPhone });
    }
  };

  const createNewCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      alert("Name and phone are required");
      return;
    }

    setSearching(true);

    // Create auth user without password (they can set it later)
    // Use phone as temporary email
    const randomPassword = Math.random().toString(36).slice(-8);
    const tempEmail = `${newCustomer.phone}@walkin.temp`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: tempEmail,
      password: randomPassword,
    });

    if (authError || !authData.user) {
      console.error("Auth creation failed:", authError);
      alert("Failed to create customer. Please try again.");
      setSearching(false);
      return;
    }

    // Update profile with name and phone
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: newCustomer.name,
        phone_number: newCustomer.phone,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Profile update failed:", profileError);
      alert("Failed to update customer profile. Please try again.");
      setSearching(false);
      return;
    }

    setCustomer({
      id: authData.user.id,
      full_name: newCustomer.name,
      phone_number: newCustomer.phone,
    });

    setSearching(false);
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
      // Create booking
      const { error: bookingError } = await supabase.from("bookings").insert({
        user_id: customer.id,
        class_id: selectedClass.id,
        package_id: null, // Explicitly set to null for walk-in payments
        payment_method: "single_payment",
        payment_status: "paid", // Marked as paid since admin collected
        status: "confirmed",
        booking_notes: `Walk-in booking - ${paymentMethod}`,
      });

      if (bookingError) throw bookingError;

      // Create transaction record
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
    setPhone("");
    setCustomer(null);
    setNewCustomer({ name: "", phone: "" });
    setSelectedClass(null);
    setShowSuccess(false);
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 text-center">
          <div className="mx-auto mb-4 w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-500 flex items-center justify-center text-white">
            <FiCheck size={32} className="md:w-10 md:h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600 mb-2">
            <strong>{customer?.full_name}</strong> has been booked for:
          </p>
          <p className="text-base md:text-lg text-gray-800 mb-4">
            {selectedClass?.title} -{" "}
            {new Date(selectedClass?.start_time || "").toLocaleTimeString(
              "en-US",
              { hour: "2-digit", minute: "2-digit" }
            )}
          </p>
          <p className="text-gray-600 mb-6">
            Payment: <strong className="capitalize">{paymentMethod}</strong> -
            Rp.{selectedClass?.price.toLocaleString("id-ID")}
          </p>
          <button
            onClick={resetForm}
            className="bg-[#2E3A4A] text-white px-6 md:px-8 py-3 rounded-lg hover:opacity-90 transition w-full md:w-auto"
          >
            Book Another Walk-in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Walk-in Booking
      </h1>

      {/* Progress Steps - More Compact on Mobile */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center gap-2 md:gap-4">
          <div
            className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-sm md:text-base ${
              step >= 1
                ? "bg-[#2E3A4A] text-white"
                : "bg-gray-300 text-gray-600"
            }`}
          >
            1
          </div>
          <div className="w-8 md:w-16 h-1 bg-gray-300">
            <div
              className={`h-full transition-all ${
                step >= 2 ? "bg-[#2E3A4A] w-full" : "w-0"
              }`}
            />
          </div>
          <div
            className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-sm md:text-base ${
              step >= 2
                ? "bg-[#2E3A4A] text-white"
                : "bg-gray-300 text-gray-600"
            }`}
          >
            2
          </div>
          <div className="w-8 md:w-16 h-1 bg-gray-300">
            <div
              className={`h-full transition-all ${
                step >= 3 ? "bg-[#2E3A4A] w-full" : "w-0"
              }`}
            />
          </div>
          <div
            className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-sm md:text-base ${
              step >= 3
                ? "bg-[#2E3A4A] text-white"
                : "bg-gray-300 text-gray-600"
            }`}
          >
            3
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 md:p-8">
        {/* STEP 1: Customer Search/Create */}
        {step === 1 && (
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6">
              Step 1: Find or Create Customer
            </h2>

            {!customer && !newCustomer.phone ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Phone Number
                </label>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08123456789 or +628123456789"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                  />
                  <button
                    onClick={searchCustomer}
                    disabled={searching}
                    className="bg-[#2E3A4A] text-white px-6 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <FiSearch />
                    {searching ? "Searching..." : "Search"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Tip: You can enter with or without spaces, dashes, or country
                  code
                </p>
              </div>
            ) : !customer ? (
              <div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
                  <p className="text-sm md:text-base text-yellow-800">
                    Customer not found. Please create a new customer profile.
                  </p>
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
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                      placeholder="08123456789"
                    />
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 pt-4">
                    <button
                      onClick={() => {
                        setPhone("");
                        setNewCustomer({ name: "", phone: "" });
                      }}
                      className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={createNewCustomer}
                      disabled={searching}
                      className="flex-1 bg-[#2E3A4A] text-white px-6 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                      {searching ? "Creating..." : "Create & Continue"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {customer && (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 md:p-6 mb-4 md:mb-6">
                  <p className="text-green-800 font-medium mb-2 text-sm md:text-base">
                    ✓ Customer Found
                  </p>
                  <p className="text-gray-800 text-sm md:text-base">
                    <strong>Name:</strong> {customer.full_name}
                  </p>
                  <p className="text-gray-800 text-sm md:text-base">
                    <strong>Phone:</strong> {customer.phone_number}
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <button
                    onClick={resetForm}
                    className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    Change Customer
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-[#2E3A4A] text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
                  >
                    Continue to Class Selection
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Class Selection */}
        {step === 2 && (
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6">
              Step 2: Select Class
            </h2>

            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full md:w-auto border border-gray-300 rounded-lg px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
              />
            </div>

            {loadingClasses ? (
              <p className="text-center py-8 text-gray-600 text-sm md:text-base">
                Loading classes...
              </p>
            ) : classes.length === 0 ? (
              <p className="text-center py-8 text-gray-500 text-sm md:text-base">
                No classes available for this date
              </p>
            ) : (
              <div className="space-y-3 mb-4 md:mb-6">
                {classes.map((cls) => {
                  const isFull = cls.booked >= cls.capacity;
                  const isSelected = selectedClass?.id === cls.id;

                  return (
                    <button
                      key={cls.id}
                      onClick={() => !isFull && setSelectedClass(cls)}
                      disabled={isFull}
                      className={`w-full text-left p-3 md:p-4 border-2 rounded-lg transition ${
                        isSelected
                          ? "border-[#2E3A4A] bg-[#F7F4EF]"
                          : isFull
                          ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                          : "border-gray-200 hover:border-[#B7C9E5]"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm md:text-base">
                            {cls.title}
                          </p>
                          <p className="text-xs md:text-sm text-gray-600">
                            {new Date(cls.start_time).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}{" "}
                            - Coach: {cls.coach?.name || "TBA"}
                          </p>
                          <p className="text-xs md:text-sm text-gray-600">
                            {cls.location}
                          </p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="font-bold text-gray-800 text-sm md:text-base">
                            Rp.{cls.price.toLocaleString("id-ID")}
                          </p>
                          <p
                            className={`text-xs md:text-sm ${
                              isFull ? "text-red-600" : "text-gray-600"
                            }`}
                          >
                            {cls.booked}/{cls.capacity} {isFull ? "(Full)" : ""}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedClass}
                className="flex-1 bg-[#2E3A4A] text-white px-6 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment */}
        {step === 3 && selectedClass && customer && (
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6">
              Step 3: Confirm Payment
            </h2>

            <div className="bg-[#F7F4EF] rounded-lg p-4 md:p-6 mb-4 md:mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 md:mb-4 text-sm md:text-base">
                Booking Summary
              </h3>
              <div className="space-y-1 md:space-y-2 text-gray-700 text-xs md:text-sm">
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
                <p>
                  <strong>Amount:</strong> Rp.
                  {selectedClass.price.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 md:p-4 border-2 rounded-lg cursor-pointer hover:border-[#B7C9E5] transition">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                  />
                  <span className="font-medium text-sm md:text-base">Cash</span>
                </label>
                <label className="flex items-center gap-3 p-3 md:p-4 border-2 rounded-lg cursor-pointer hover:border-[#B7C9E5] transition">
                  <input
                    type="radio"
                    name="payment"
                    value="transfer"
                    checked={paymentMethod === "transfer"}
                    onChange={() => setPaymentMethod("transfer")}
                  />
                  <span className="font-medium text-sm md:text-base">
                    Bank Transfer / QR Payment
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={() => setStep(2)}
                disabled={creating}
                className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={createBooking}
                disabled={creating}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
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
