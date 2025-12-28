// app/api/payment/create-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPackageInvoice, createSingleClassInvoice } from "@/lib/xendit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === "package" || !type) {
      // Package purchase
      const {
        userId,
        userEmail,
        userName,
        packageName,
        amount,
        packageTypeId,
      } = body;

      const result = await createPackageInvoice({
        userId,
        userEmail,
        userName,
        packageName,
        amount,
        packageTypeId,
      });

      return NextResponse.json(result);
    } else if (type === "single_class") {
      // Single class payment
      const {
        userId,
        userEmail,
        userName,
        className,
        classDate,
        amount,
        classId,
        bookingId,
      } = body;

      const result = await createSingleClassInvoice({
        userId,
        userEmail,
        userName,
        className,
        classDate,
        amount,
        classId,
        bookingId,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: "Invalid payment type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
