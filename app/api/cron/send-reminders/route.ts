// app/api/cron/send-reminders/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendClassReminder } from "@/lib/email";

// This endpoint should be called by a cron job (Vercel Cron or external)
// Run daily to send reminders for classes happening in 24 hours

export async function GET(request: Request) {
  try {
    // Verify the request is from a cron job (optional security)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get classes happening in 24 hours (with 1 hour buffer)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(tomorrow.getHours() + 23);
    const dayAfter = new Date(now);
    dayAfter.setHours(dayAfter.getHours() + 25);

    // Type for the query result
    type BookingWithDetails = {
      id: string;
      user_id: string;
      class_id: string;
      status: string;
      profiles: {
        email: string;
        full_name: string;
      } | null;
      classes: {
        title: string;
        start_time: string;
        location: string;
        coach_id: string;
        coaches: {
          name: string;
        } | null;
      } | null;
    };

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        user_id,
        class_id,
        status,
        profiles:user_id (
          email,
          full_name
        ),
        classes:class_id (
          title,
          start_time,
          location,
          coach_id,
          coaches:coach_id (
            name
          )
        )
      `
      )
      .eq("status", "confirmed")
      .gte("classes.start_time", tomorrow.toISOString())
      .lte("classes.start_time", dayAfter.toISOString())
      .returns<BookingWithDetails[]>();

    if (error) {
      console.error("Error fetching bookings:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    let sent = 0;
    let failed = 0;

    // Send reminder emails
    for (const booking of bookings || []) {
      if (!booking.profiles?.email || !booking.classes) continue;

      const classDate = new Date(booking.classes.start_time);
      const dateStr = classDate.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const timeStr = classDate.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const result = await sendClassReminder({
        to: booking.profiles.email,
        userName: booking.profiles.full_name || "Member",
        className: booking.classes.title,
        date: dateStr,
        time: timeStr,
        coach: booking.classes.coaches?.name || "TBA",
        location: booking.classes.location,
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
        console.error(`Failed to send reminder to ${booking.profiles?.email}`);
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: bookings?.length || 0,
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
