// app/api/send-email/cancellation-confirmation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendCancellationConfirmation } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { to, userName, className, date, time } = body;

    // Validate required fields
    if (!to || !userName || !className || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await sendCancellationConfirmation({
      to,
      userName,
      className,
      date,
      time,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in cancellation confirmation API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
