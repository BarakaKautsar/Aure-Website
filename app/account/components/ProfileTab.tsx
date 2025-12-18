"use client";

import { useEffect, useState } from "react";
import { FiEdit2, FiLogOut } from "react-icons/fi";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import EditProfileModal from "./EditProfileModal";

type Profile = {
  full_name: string;
  phone_number: string | null;
};

export default function ProfileTab() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone_number")
        .eq("id", user.id)
        .single();

      // console.log("PROFILE DATA:", data);
      // console.log("PROFILE ERROR:", error);

      if (!error) {
        setProfile(data);
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return <p className="text-[#2F3E55]">Loading profile...</p>;
  }

  if (!user) {
    return <p className="text-red-500">User not found.</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="space-y-4 text-[#2F3E55]">
        <p>
          <strong>Name:</strong> {profile?.full_name ?? "—"}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Phone Number:</strong> {profile?.phone_number ?? "—"}
        </p>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={() => setEditOpen(true)}
          className="flex items-center gap-2 bg-[#F7F4EF] px-5 py-3 rounded-xl hover:opacity-90 transition"
        >
          <FiEdit2 /> Edit Profile
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 text-white px-5 py-3 rounded-xl hover:opacity-90 transition"
        >
          <FiLogOut /> Log Out
        </button>
      </div>
      <EditProfileModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initialName={profile?.full_name ?? ""}
        initialPhone={profile?.phone_number ?? null}
        onSaved={(updated) => {
          setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
        }}
      />
    </div>
  );
}
