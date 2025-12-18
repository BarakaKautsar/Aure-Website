"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Cabin } from "next/font/google";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

const cabin = Cabin({
  subsets: ["latin"],
  weight: ["400"],
});

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header
      className={`${cabin.className} w-full bg-[#2E3A4A] text-[#F7F4EF] py-3 sticky top-0 z-50`}
    >
      <nav className="mx-auto flex w-full max-w-9xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/Premier-logo.png"
            alt="Aure Pilates Studio"
            width={200}
            height={0}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden gap-12 md:flex text-lg font-medium items-center">
          <Link href="/">Home</Link>
          <Link href="/#schedule">Schedule</Link>
          <Link href="/#classes">Class</Link>
          <Link href="/#packages">Package</Link>
          <Link href="/#coaches">Coaches</Link>

          <div className="h-10 w-px bg-[#F7F4EF]/40" />

          {/* ✅ AUTH BUTTON */}
          {user ? (
            <Link
              href="/account/"
              className="flex items-center gap-2 rounded-full border border-[#F7F4EF] px-6 py-2 hover:bg-[#F7F4EF] hover:text-[#2E3A4A] transition"
            >
              My Account
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-[#F7F4EF] px-6 py-2 hover:bg-[#F7F4EF] hover:text-[#2E3A4A] transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 px-3"
          onClick={() => setOpen(!open)}
        >
          <span
            className={`block h-[3px] w-8 bg-[#F7F4EF] transition ${
              open ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-[3px] w-8 bg-[#F7F4EF] transition ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-[3px] w-8 bg-[#F7F4EF] transition ${
              open ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#2E3A4A] px-6 py-6 text-lg flex flex-col gap-6">
          <Link href="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link href="/#schedule" onClick={() => setOpen(false)}>
            Schedule
          </Link>
          <Link href="/#classes" onClick={() => setOpen(false)}>
            Class
          </Link>
          <Link href="/#packages" onClick={() => setOpen(false)}>
            Package
          </Link>
          <Link href="/#coaches" onClick={() => setOpen(false)}>
            Coaches
          </Link>

          <div className="h-px w-full bg-[#F7F4EF]/30 my-2" />

          {user ? (
            <Link
              href="/account/"
              onClick={() => setOpen(false)}
              className="rounded-full border border-[#F7F4EF] px-6 py-2 w-fit hover:bg-[#F7F4EF] hover:text-[#2E3A4A] transition"
            >
              My Account
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-full border border-[#F7F4EF] px-6 py-2 w-fit hover:bg-[#F7F4EF] hover:text-[#2E3A4A] transition"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
