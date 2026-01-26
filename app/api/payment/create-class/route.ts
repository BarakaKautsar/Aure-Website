// app/api/payment/create-class/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSingleClassTransaction } from "@/lib/midtrans";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      userEmail,
      userName,
      userPhone,
      classId,
      className,
      classDate,
      amount,
      bookingIds,
    } = body;

    // Validate required fields
    if (
      !userId ||
      !userEmail ||
      !userName ||
      !classId ||
      !className ||
      !classDate ||
      !amount ||
      !bookingIds ||
      !Array.isArray(bookingIds)
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create Midtrans transaction
    const result = await createSingleClassTransaction({
      userId,
      userEmail,
      userName,
      userPhone,
      className,
      classDate,
      amount,
      classId,
      bookingIds,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      token: result.token,
      redirectUrl: result.redirectUrl,
      orderId: result.orderId,
    });
  } catch (error) {
    console.error("Create class payment error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create payment",
      },
      { status: 500 },
    );
  }
}
