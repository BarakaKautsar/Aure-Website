"use client";

import { useState, useEffect } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import { supabase } from "@/lib/supabase/client";

type ClassInfo = {
  id: string;
  title: string;
  time: string;
  date: string;
  coach: string;
  location: string;
  classType: string; // 'reformer', 'spine_corrector', 'matt'
};

type UserPackage = {
  id: string;
  remaining_credits: number;
  expires_at: string;
  package_type: {
    name: string;
    category: string;
  };
};

type Props = {
  classInfo: ClassInfo;
  onClose: () => void;
  onSuccess: () => void;
};

export default function WaitlistModal({
  classInfo,
  onClose,
  onSuccess,
}: Props) {
  const [joining, setJoining] = useState(false);
  const [availablePackages, setAvailablePackages] = useState<UserPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [autoBook, setAutoBook] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPackages();
  }, []);

  const loadUserPackages = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch active packages with remaining credits that match the class type
    const { data, error } = await supabase
      .from("packages")
      .select(
        `
        id,
        remaining_credits,
        expires_at,
        package_type:package_type_id (
          name,
          category
        )
      `
      )
      .eq("user_id", user.id)
      .eq("status", "active")
      .gt("remaining_credits", 0)
      .gte("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: true });

    if (!error && data) {
      // Filter packages by matching category
      const matchingPackages = (data as unknown as UserPackage[]).filter(
        (pkg) => pkg.package_type.category === classInfo.classType
      );

      setAvailablePackages(matchingPackages);

      // Auto-select first matching package if available
      if (matchingPackages.length > 0) {
        setSelectedPackageId(matchingPackages[0].id);
        setAutoBook(true); // Default to auto-book if they have a package
      }
    }

    setLoading(false);
  };

  const handleJoinWaitlist = async () => {
    setJoining(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in to join the waitlist");
        return;
      }

      // Check if already on waitlist
      const { data: existing } = await supabase
        .from("waitlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("class_id", classInfo.id)
        .eq("status", "waiting")
        .single();

      if (existing) {
        alert("You're already on the waitlist for this class!");
        onClose();
        return;
      }

      // Add to waitlist
      const { error } = await supabase.from("waitlist").insert({
        user_id: user.id,
        class_id: classInfo.id,
        status: "waiting",
        auto_book: autoBook,
        package_id: autoBook && selectedPackageId ? selectedPackageId : null,
      });

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error("Waitlist error:", error);
      alert("Failed to join waitlist. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  const canAutoBook = availablePackages.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 z-10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={joining}
        >
          <FiX size={20} />
        </button>

        <h3 className="text-2xl font-medium text-[#2F3E55] mb-2">
          Join Waitlist
        </h3>

        <p className="text-sm text-gray-600 mb-6">
          This class is currently full. Join the waitlist and we'll notify you
          if a spot opens up.
        </p>

        {/* Class Details */}
        <div className="bg-[#F7F4EF] rounded-xl p-4 mb-6">
          <h4 className="font-medium text-[#2F3E55] mb-2">{classInfo.title}</h4>
          <div className="space-y-1 text-sm text-[#2F3E55]">
            <p>
              <strong>Date:</strong> {classInfo.date}
            </p>
            <p>
              <strong>Time:</strong> {classInfo.time}
            </p>
            <p>
              <strong>Coach:</strong> {classInfo.coach}
            </p>
            <p>
              <strong>Location:</strong> {classInfo.location}
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-4">Loading options...</p>
        ) : (
          <>
            {/* Auto-booking Option */}
            {canAutoBook && (
              <div className="mb-6">
                <label className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition hover:border-[#2F3E55]">
                  <input
                    type="checkbox"
                    checked={autoBook}
                    onChange={(e) => setAutoBook(e.target.checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-[#2F3E55]">
                      Auto-book when available
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Automatically book this class using your package credit
                      when a spot opens
                    </p>
                  </div>
                </label>

                {autoBook && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-[#2F3E55] mb-2">
                      Select Package to Use
                    </label>
                    <select
                      value={selectedPackageId}
                      onChange={(e) => setSelectedPackageId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B7C9E5]"
                    >
                      {availablePackages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.package_type.name} - {pkg.remaining_credits}{" "}
                          credits left
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      ✓ Your credit will only be used if a spot becomes
                      available
                    </p>
                  </div>
                )}
              </div>
            )}

            {!canAutoBook && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You don't have a compatible package for
                  this class. We'll notify you when a spot opens, and you can
                  book with single payment.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={joining}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinWaitlist}
                disabled={joining || (autoBook && !selectedPackageId)}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {joining ? "Joining..." : "Join Waitlist"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Success Modal
export function WaitlistSuccessModal({
  onClose,
  autoBooked,
}: {
  onClose: () => void;
  autoBooked?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-10 z-10 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX size={20} />
        </button>

        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white">
          <FiCheck size={36} />
        </div>

        <h3 className="text-2xl font-medium text-[#2F3E55] mb-3">
          {autoBooked ? "Booking Confirmed!" : "Added to Waitlist!"}
        </h3>

        <p className="text-sm text-[#2F3E55] mb-6">
          {autoBooked
            ? "A spot opened up and you've been automatically booked into this class!"
            : "We'll notify you if a spot becomes available for this class."}
        </p>

        <button
          onClick={onClose}
          className="bg-[#B7C9E5] text-[#2F3E55] px-6 py-3 rounded-xl hover:opacity-90 w-full"
        >
          Done
        </button>
      </div>
    </div>
  );
}
