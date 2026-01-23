"use client";

import { useEffect, useState } from "react";
import { FiEdit2, FiLogOut } from "react-icons/fi";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import EditProfileModal from "./EditProfileModal";

type Profile = {
  full_name: string;
  phone_number: string | null;
  date_of_birth: string | null;
  address: string | null;
};

export default function ProfileTab() {
  const router = useRouter();
  const { t, language } = useLanguage();
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
        .select("full_name, phone_number, date_of_birth, address")
        .eq("id", user.id)
        .single();

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";

    const date = new Date(dateString);
    const locale = language === "id" ? "id-ID" : "en-US";
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <p className="text-[#2F3E55]">{t.account.profile.loading}</p>;
  }

  if (!user) {
    return <p className="text-red-500">{t.account.profile.userNotFound}</p>;
  }

  const isProfileIncomplete =
    !profile?.full_name ||
    !profile?.phone_number ||
    !profile?.date_of_birth ||
    !profile?.address;

  return (
    <div className="max-w-3xl">
      {isProfileIncomplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>⚠️</strong> {t.account.profile.incompleteWarning}
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4 text-[#2F3E55]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {t.account.profile.fullName}
            </p>
            <p className="font-medium">{profile?.full_name || "—"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">
              {t.account.profile.email}
            </p>
            <p className="font-medium">{user.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">
              {t.account.profile.phoneNumber}
            </p>
            <p className="font-medium">{profile?.phone_number || "—"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">
              {t.account.profile.dateOfBirth}
            </p>
            <p className="font-medium">
              {formatDate(profile?.date_of_birth ?? null)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">
            {t.account.profile.address}
          </p>
          <p className="font-medium whitespace-pre-line">
            {profile?.address || "—"}
          </p>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={() => setEditOpen(true)}
          className="flex items-center gap-2 bg-[#F7F4EF] px-5 py-3 rounded-xl hover:opacity-90 transition"
        >
          <FiEdit2 /> {t.account.profile.editProfile}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 text-white px-5 py-3 rounded-xl hover:opacity-90 transition"
        >
          <FiLogOut /> {t.account.profile.logOut}
        </button>
      </div>

      <EditProfileModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initialName={profile?.full_name ?? ""}
        initialPhone={profile?.phone_number ?? null}
        initialDateOfBirth={profile?.date_of_birth ?? null}
        initialAddress={profile?.address ?? null}
        onSaved={(updated) => {
          setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
        }}
      />
    </div>
  );
}
