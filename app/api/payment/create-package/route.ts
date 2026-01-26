// app/api/payment/create-package/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPackageTransaction } from "@/lib/midtrans";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      userEmail,
      userName,
      userPhone,
      packageTypeId,
      packageName,
      amount,
    } = body;

    // Validate required fields
    if (
      !userId ||
      !userEmail ||
      !userName ||
      !packageTypeId ||
      !packageName ||
      !amount
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create Midtrans transaction
    const result = await createPackageTransaction({
      userId,
      userEmail,
      userName,
      userPhone,
      packageName,
      amount,
      packageTypeId,
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
    console.error("Create package payment error:", error);
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
