// app/api/cron/mark-completed-classes/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This endpoint should be called by Vercel Cron every hour
// to mark classes as "completed" after they finish

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

    // Get current time
    const now = new Date().toISOString();

    // Find all classes that have ended and are still marked as "scheduled" or "delayed"
    const { data: classesToComplete, error: fetchError } = await supabase
      .from("classes")
      .select("id, title, end_time")
      .in("status", ["scheduled", "delayed"])
      .lt("end_time", now); // end_time is less than now

    if (fetchError) {
      console.error("Error fetching classes:", fetchError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!classesToComplete || classesToComplete.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No classes to mark as completed",
        marked: 0,
      });
    }

    // Update all these classes to "completed" status
    const classIds = classesToComplete.map((cls) => cls.id);

    const { error: updateError } = await supabase
      .from("classes")
      .update({ status: "completed" })
      .in("id", classIds);

    if (updateError) {
      console.error("Error updating classes:", updateError);
      return NextResponse.json(
        { error: "Failed to update classes" },
        { status: 500 }
      );
    }

    console.log(`Marked ${classesToComplete.length} classes as completed`);

    return NextResponse.json({
      success: true,
      marked: classesToComplete.length,
      classes: classesToComplete.map((cls) => ({
        id: cls.id,
        title: cls.title,
        endTime: cls.end_time,
      })),
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
