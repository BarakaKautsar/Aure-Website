"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { FiX } from "react-icons/fi";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialPhone: string | null;
  initialDateOfBirth: string | null;
  initialAddress: string | null;
  onSaved: (updated: {
    full_name: string;
    phone_number: string | null;
    date_of_birth: string | null;
    address: string | null;
  }) => void;
};

export default function EditProfileModal({
  isOpen,
  onClose,
  initialName,
  initialPhone,
  initialDateOfBirth,
  initialAddress,
  onSaved,
}: Props) {
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(initialDateOfBirth ?? "");
  const [address, setAddress] = useState(initialAddress ?? "");
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setFullName(initialName);
      setPhone(initialPhone ?? "");
      setDateOfBirth(initialDateOfBirth ?? "");
      setAddress(initialAddress ?? "");
    }
  }, [isOpen, initialName, initialPhone, initialDateOfBirth, initialAddress]);

  // Validation
  const nameError =
    fullName.trim().length === 0
      ? "Full name is required"
      : fullName.trim().length < 2
      ? "Full name is too short"
      : null;

  const phoneError =
    phone && !/^[0-9+\s-]+$/.test(phone) ? "Invalid phone number" : null;

  const dobError =
    dateOfBirth.length > 0
      ? (() => {
          const dob = new Date(dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();

          if (isNaN(dob.getTime())) return "Invalid date";
          if (dob > today) return "Date cannot be in the future";
          if (age < 13) return "You must be at least 13 years old";
          if (age > 120) return "Please enter a valid date of birth";

          return null;
        })()
      : null;

  const addressError =
    address.trim().length > 0 && address.trim().length < 10
      ? "Address must be at least 10 characters"
      : null;

  const canSave =
    !nameError && !phoneError && !dobError && !addressError && !loading;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone_number: phone || null,
        date_of_birth: dateOfBirth || null,
        address: address || null,
      })
      .eq("id", user.id);

    setLoading(false);

    if (!error) {
      onSaved({
        full_name: fullName,
        phone_number: phone || null,
        date_of_birth: dateOfBirth || null,
        address: address || null,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-2xl text-[#2F3E55] mb-6">Edit Profile</h2>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Full Name */}
          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              Full Name *
            </label>
            <input
              autoFocus
              className={`w-full border rounded-lg px-3 py-2 ${
                nameError ? "border-red-500" : "border-gray-300"
              }`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {nameError && (
              <p className="text-xs text-red-500 mt-1">{nameError}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              Phone Number
            </label>
            <input
              className={`w-full border rounded-lg px-3 py-2 ${
                phoneError ? "border-red-500" : "border-gray-300"
              }`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {phoneError && (
              <p className="text-xs text-red-500 mt-1">{phoneError}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">
              Date of Birth
            </label>
            <input
              type="date"
              max={new Date().toISOString().split("T")[0]}
              className={`w-full border rounded-lg px-3 py-2 ${
                dobError ? "border-red-500" : "border-gray-300"
              }`}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
            {dobError && (
              <p className="text-xs text-red-500 mt-1">{dobError}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm mb-1 text-[#2F3E55]">Address</label>
            <textarea
              rows={3}
              className={`w-full border rounded-lg px-3 py-2 resize-none ${
                addressError ? "border-red-500" : "border-gray-300"
              }`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full Address"
            />
            {addressError && (
              <p className="text-xs text-red-500 mt-1">{addressError}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`px-5 py-2 rounded-lg text-white transition ${
              canSave
                ? "bg-[#2F3E55] hover:opacity-90"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
