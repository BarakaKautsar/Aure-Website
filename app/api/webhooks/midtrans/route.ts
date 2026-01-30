// app/api/webhooks/midtrans/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  verifySignatureKey,
  mapTransactionStatus,
  getTransactionStatus,
} from "@/lib/midtrans";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("=== MIDTRANS WEBHOOK RECEIVED ===");
    console.log("Order ID:", body.order_id);
    console.log("Transaction Status:", body.transaction_status);
    console.log("Fraud Status:", body.fraud_status);
    console.log("Payment Type:", body.payment_type);

    // Verify signature key
    const isValid = verifySignatureKey(
      body.order_id,
      body.status_code,
      body.gross_amount,
      body.signature_key,
    );

    if (!isValid) {
      console.error("Invalid signature key");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get full transaction details from Midtrans
    const { success, status: transactionData } = await getTransactionStatus(
      body.order_id,
    );

    if (!success || !transactionData) {
      console.error("Failed to get transaction status");
      return NextResponse.json(
        { error: "Failed to verify transaction" },
        { status: 500 },
      );
    }

    // Extract metadata from custom fields
    const userId = transactionData.custom_field1;
    const transactionType = transactionData.custom_field3; // "package" or "single_class"

    if (!userId || !transactionType) {
      console.error("Missing metadata in transaction");
      return NextResponse.json(
        { error: "Invalid transaction metadata" },
        { status: 400 },
      );
    }

    // Map Midtrans status to our internal status
    const { paymentStatus, bookingStatus } = mapTransactionStatus(
      body.transaction_status,
    );

    console.log("Mapped status:", { paymentStatus, bookingStatus });

    // Handle based on transaction type and status
    if (transactionType === "package") {
      await handlePackageTransaction({
        orderId: body.order_id,
        userId,
        packageTypeId: transactionData.custom_field2,
        transactionStatus: body.transaction_status,
        fraudStatus: body.fraud_status,
        paymentStatus,
        amount: parseFloat(body.gross_amount),
        paymentType: body.payment_type,
        transactionTime: body.transaction_time,
      });
    } else if (transactionType === "single_class") {
      await handleSingleClassTransaction({
        orderId: body.order_id,
        userId,
        bookingIds: transactionData.custom_field2.split(","),
        transactionStatus: body.transaction_status,
        fraudStatus: body.fraud_status,
        paymentStatus,
        bookingStatus,
        amount: parseFloat(body.gross_amount),
        paymentType: body.payment_type,
        transactionTime: body.transaction_time,
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Helper function to upsert transaction manually (works with partial unique index)
async function upsertTransaction(paymentId: string, transactionData: {
  user_id: string;
  type: string;
  package_type_id?: string | null;
  booking_id?: string | null;
  amount: number;
  payment_method: string;
  payment_status: string;
  payment_id: string;
  location: string | null;
  paid_at: string | null;
}) {
  // Check if transaction with this payment_id already exists
  const { data: existing, error: selectError } = await supabase
    .from("transactions")
    .select("id")
    .eq("payment_id", paymentId)
    .maybeSingle();

  if (selectError) {
    console.error("Error checking existing transaction:", selectError);
    throw selectError;
  }

  if (existing) {
    // Update existing record
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        payment_status: transactionData.payment_status,
        paid_at: transactionData.paid_at,
        location: transactionData.location,
      })
      .eq("id", existing.id);

    if (updateError) {
      console.error("Error updating transaction:", updateError);
      throw updateError;
    }
    console.log("Transaction updated successfully (id:", existing.id, ")");
  } else {
    // Insert new record
    const { error: insertError } = await supabase
      .from("transactions")
      .insert(transactionData);

    if (insertError) {
      console.error("Error inserting transaction:", insertError);
      throw insertError;
    }
    console.log("Transaction inserted successfully");
  }
}

async function handlePackageTransaction({
  orderId,
  userId,
  packageTypeId,
  transactionStatus,
  fraudStatus,
  paymentStatus,
  amount,
  paymentType,
  transactionTime,
}: {
  orderId: string;
  userId: string;
  packageTypeId: string;
  transactionStatus: string;
  fraudStatus: string;
  paymentStatus: "pending" | "paid" | "failed" | "expired";
  amount: number;
  paymentType: string;
  transactionTime: string;
}) {
  try {
    console.log("Processing package transaction...");

    // Get package type details (needed for both creating package and getting location)
    const { data: packageType, error: fetchError } = await supabase
      .from("package_types")
      .select("*")
      .eq("id", packageTypeId)
      .single();

    if (fetchError || !packageType) {
      console.error("Package type not found:", packageTypeId);
      return;
    }

    // Only create package if payment is successful and not fraudulent
    if (
      (transactionStatus === "capture" || transactionStatus === "settlement") &&
      fraudStatus === "accept"
    ) {
      // Check if package already exists for this order (idempotency)
      const { data: existingPackage } = await supabase
        .from("packages")
        .select("id")
        .eq("user_id", userId)
        .eq("package_type_id", packageTypeId)
        .gte("created_at", new Date(Date.now() - 60000).toISOString()) // Created within last minute
        .maybeSingle();

      if (!existingPackage) {
        // Calculate expiry date
        const purchaseDate = new Date(transactionTime);
        const expiryDate = new Date(purchaseDate);
        expiryDate.setDate(expiryDate.getDate() + packageType.validity_days);

        // Create package for user
        const { error: packageError } = await supabase.from("packages").insert({
          user_id: userId,
          package_type_id: packageTypeId,
          total_credits: packageType.class_credits,
          remaining_credits: packageType.class_credits,
          expires_at: expiryDate.toISOString(),
          status: "active",
        });

        if (packageError) {
          console.error("Error creating package:", packageError);
          return;
        }

        console.log("Package created successfully");
      } else {
        console.log("Package already exists, skipping creation");
      }
    }

    // Upsert transaction record using manual insert/update
    await upsertTransaction(orderId, {
      user_id: userId,
      type: "package_purchase",
      package_type_id: packageTypeId,
      booking_id: null,
      amount: amount,
      payment_method: "midtrans",
      payment_status: paymentStatus,
      payment_id: orderId,
      location: packageType.location,
      paid_at:
        transactionStatus === "settlement" || transactionStatus === "capture"
          ? transactionTime
          : null,
    });

  } catch (error) {
    console.error("Error handling package transaction:", error);
  }
}

async function handleSingleClassTransaction({
  orderId,
  userId,
  bookingIds,
  transactionStatus,
  fraudStatus,
  paymentStatus,
  bookingStatus,
  amount,
  paymentType,
  transactionTime,
}: {
  orderId: string;
  userId: string;
  bookingIds: string[];
  transactionStatus: string;
  fraudStatus: string;
  paymentStatus: "pending" | "paid" | "failed" | "expired";
  bookingStatus: "pending_payment" | "confirmed" | "cancelled";
  amount: number;
  paymentType: string;
  transactionTime: string;
}) {
  try {
    console.log("Processing single class transaction...");
    console.log("Booking IDs:", bookingIds);

    // Update all bookings
    const { error: bookingError } = await supabase
      .from("bookings")
      .update({
        status: bookingStatus,
        payment_status: paymentStatus,
        payment_id: orderId,
      })
      .in("id", bookingIds);

    if (bookingError) {
      console.error("Error updating bookings:", bookingError);
      return;
    }

    console.log("Bookings updated successfully");

    // Get location from the first booking's class
    let location: string | null = null;
    if (bookingIds.length > 0) {
      const { data: bookingWithClass } = await supabase
        .from("bookings")
        .select(
          `
          class:class_id (
            location
          )
        `,
        )
        .eq("id", bookingIds[0])
        .single();

      if (bookingWithClass?.class) {
        // Handle both array and object response
        const classData = Array.isArray(bookingWithClass.class)
          ? bookingWithClass.class[0]
          : bookingWithClass.class;
        location = classData?.location || null;
      }
    }

    // Upsert transaction record using manual insert/update
    await upsertTransaction(orderId, {
      user_id: userId,
      type: "single_class",
      package_type_id: null,
      booking_id: bookingIds[0],
      amount: amount,
      payment_method: "midtrans",
      payment_status: paymentStatus,
      payment_id: orderId,
      location: location,
      paid_at:
        transactionStatus === "settlement" || transactionStatus === "capture"
          ? transactionTime
          : null,
    });

  } catch (error) {
    console.error("Error handling single class transaction:", error);
  }
}