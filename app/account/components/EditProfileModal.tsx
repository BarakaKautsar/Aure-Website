"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { FiX } from "react-icons/fi";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialPhone: string | null;
  onSaved: (updated: {
    full_name: string;
    phone_number: string | null;
  }) => void;
};

export default function EditProfileModal({
  isOpen,
  onClose,
  initialName,
  initialPhone,
  onSaved,
}: Props) {
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [loading, setLoading] = useState(false);

  const nameError =
    fullName.trim().length === 0
      ? "Full name is required"
      : fullName.trim().length < 2
      ? "Full name is too short"
      : null;

  const phoneError =
    phone && !/^[0-9+\s-]+$/.test(phone) ? "Invalid phone number" : null;

  const canSave = !nameError && !phoneError && !loading;
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
      })
      .eq("id", user.id);

    setLoading(false);

    if (!error) {
      onSaved({
        full_name: fullName,
        phone_number: phone || null,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-2xl text-[#2F3E55] mb-6">Edit Profile</h2>

        <div>
          <label className="block text-sm mb-1">Full Name *</label>
          <input
            autoFocus
            className={`w-full border rounded-lg px-3 py-2 ${
              nameError ? "border-red-500" : ""
            }`}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          {nameError && (
            <p className="text-sm text-red-500 mt-1">{nameError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Phone Number</label>
          <input
            className={`w-full border rounded-lg px-3 py-2 ${
              phoneError ? "border-red-500" : ""
            }`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {phoneError && (
            <p className="text-sm text-red-500 mt-1">{phoneError}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
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
