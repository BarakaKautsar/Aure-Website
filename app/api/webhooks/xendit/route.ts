// app/api/webhooks/xendit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookCallback } from "@/lib/xendit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const callbackToken = request.headers.get("x-callback-token") || "";

    console.log("=== XENDIT WEBHOOK RECEIVED ===");
    console.log("Status:", body.status);
    console.log("External ID:", body.external_id);
    console.log("Amount:", body.amount);

    // Verify webhook authenticity
    if (
      !verifyWebhookCallback(callbackToken, process.env.XENDIT_WEBHOOK_TOKEN!)
    ) {
      console.error("Invalid webhook token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle invoice paid event
    if (body.status === "PAID") {
      const externalId = body.external_id || "";
      let metadata: any = {};

      // Try to parse the external_id
      // Format 1: Pipe-separated - cls|userId|bookingId|timestamp
      // Format 2: Base64 encoded - {base64}_timestamp

      if (externalId.startsWith("cls|")) {
        // Pipe-separated format for single class
        const parts = externalId.split("|");
        metadata = {
          type: "single_class_payment",
          userId: parts[1],
          bookingId: parts[2],
        };
        console.log("Parsed pipe format metadata:", metadata);
      } else if (externalId.startsWith("pkg|")) {
        // Pipe-separated format for package (if we add it later)
        const parts = externalId.split("|");
        metadata = {
          type: "package_purchase",
          userId: parts[1],
          packageTypeId: parts[2],
        };
        console.log("Parsed pipe format metadata:", metadata);
      } else {
        // Try base64 encoded format
        try {
          const parts = externalId.split("_");
          // Remove the timestamp (last part)
          const base64Part = parts.slice(0, -1).join("_");
          const decoded = Buffer.from(base64Part, "base64").toString("utf-8");
          console.log("Decoded base64:", decoded);

          const shortData = JSON.parse(decoded);

          if (shortData.t === "pkg") {
            metadata = {
              type: "package_purchase",
              userId: shortData.u,
              packageTypeId: shortData.p,
            };
          } else if (shortData.t === "cls") {
            metadata = {
              type: "single_class_payment",
              userId: shortData.u,
              classId: shortData.c,
              bookingId: shortData.b,
            };
          }
          console.log("Parsed base64 metadata:", metadata);
        } catch (error) {
          console.error("Failed to decode base64 metadata:", error);
          console.error("External ID was:", externalId);
        }
      }

      const type = metadata.type;

      if (!metadata || !type) {
        console.error("No valid metadata found in external_id:", externalId);
        return NextResponse.json({
          received: true,
          message: "No metadata to process",
        });
      }

      if (type === "package_purchase") {
        console.log("Processing package purchase...");
        await handlePackagePurchase({
          userId: metadata.userId,
          packageTypeId: metadata.packageTypeId,
          invoiceId: body.id,
          amount: body.amount,
          paidAt: body.paid_at,
        });
      } else if (type === "single_class_payment") {
        console.log("Processing single class payment...");
        await handleSingleClassPayment({
          userId: metadata.userId,
          classId: metadata.classId,
          bookingId: metadata.bookingId,
          invoiceId: body.id,
          amount: body.amount,
          paidAt: body.paid_at,
        });
      }

      return NextResponse.json({ received: true });
    }

    // Handle invoice expired
    if (body.status === "EXPIRED") {
      console.log("Processing EXPIRED invoice...");
      const externalId = body.external_id || "";
      let bookingId: string | null = null;

      // Try pipe format first
      if (externalId.startsWith("cls|")) {
        const parts = externalId.split("|");
        bookingId = parts[2];
      } else {
        // Try base64 format
        try {
          const parts = externalId.split("_");
          const base64Part = parts.slice(0, -1).join("_");
          const decoded = Buffer.from(base64Part, "base64").toString("utf-8");
          const shortData = JSON.parse(decoded);
          if (shortData.t === "cls") {
            bookingId = shortData.b;
          }
        } catch (error) {
          console.error(
            "Failed to decode metadata for expired invoice:",
            error,
          );
        }
      }

      if (bookingId) {
        // Handle multiple booking IDs
        const bookingIds = bookingId.split(",");
        const { error } = await supabase
          .from("bookings")
          .update({ status: "cancelled", payment_status: "expired" })
          .in("id", bookingIds);

        if (error) {
          console.error("Error updating expired bookings:", error);
        } else {
          console.log("Updated expired bookings:", bookingIds);
        }
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function handlePackagePurchase({
  userId,
  packageTypeId,
  invoiceId,
  amount,
  paidAt,
}: {
  userId: string;
  packageTypeId: string;
  invoiceId: string;
  amount: number;
  paidAt: string;
}) {
  try {
    const { data: packageType, error: fetchError } = await supabase
      .from("package_types")
      .select("*")
      .eq("id", packageTypeId)
      .single();

    if (fetchError || !packageType) {
      console.error("Package type not found:", packageTypeId);
      return;
    }

    const purchaseDate = new Date(paidAt);
    const expiryDate = new Date(purchaseDate);
    expiryDate.setDate(expiryDate.getDate() + packageType.validity_days);

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

    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: "package_purchase",
        package_type_id: packageTypeId,
        amount: amount,
        payment_method: "xendit",
        payment_status: "paid",
        payment_id: invoiceId,
        paid_at: paidAt,
      });

    if (transactionError) {
      console.error("Transaction record error:", transactionError);
    }
  } catch (error) {
    console.error("Error handling package purchase:", error);
  }
}

async function handleSingleClassPayment({
  userId,
  classId,
  bookingId,
  invoiceId,
  amount,
  paidAt,
}: {
  userId: string;
  classId: string;
  bookingId: string;
  invoiceId: string;
  amount: number;
  paidAt: string;
}) {
  try {
    // Handle multiple booking IDs (comma-separated)
    const bookingIds = bookingId.split(",");

    // Update all bookings to confirmed
    const { error: bookingError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        payment_status: "paid",
        payment_id: invoiceId,
      })
      .in("id", bookingIds);

    if (bookingError) {
      console.error("Error updating booking:", bookingError);
    }

    // Create transaction record for single class payment
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: "single_class",
        booking_id: bookingIds[0], // Link to first booking
        amount: amount,
        payment_method: "xendit",
        payment_status: "paid",
        payment_id: invoiceId,
        paid_at: paidAt,
      });

    if (transactionError) {
      console.error("Transaction record error:", transactionError);
    }
  } catch (error) {
    console.error("Error handling single class payment:", error);
  }
}
