// app/api/create-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSingleClassInvoice } from "@/lib/xendit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    // Validate required fields
    if (
      !userId ||
      !userEmail ||
      !className ||
      !amount ||
      !classId ||
      !bookingId
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create invoice using Xendit
    const invoice = await createSingleClassInvoice({
      userId,
      userEmail,
      userName,
      className,
      classDate,
      amount,
      classId,
      bookingId,
    });

    if (invoice.success) {
      return NextResponse.json({
        success: true,
        invoiceUrl: invoice.invoiceUrl,
        invoiceId: invoice.invoiceId,
      });
    } else {
      return NextResponse.json(
        { success: false, error: invoice.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API create-invoice error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create invoice",
      },
      { status: 500 }
    );
  }
}
