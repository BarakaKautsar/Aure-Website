// app/api/send-email/booking-confirmation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmation } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { to, userName, className, date, time, coach, location } = body;

    // Validate required fields
    if (
      !to ||
      !userName ||
      !className ||
      !date ||
      !time ||
      !coach ||
      !location
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await sendBookingConfirmation({
      to,
      userName,
      className,
      date,
      time,
      coach,
      location,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in booking confirmation API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
