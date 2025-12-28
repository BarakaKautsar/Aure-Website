// app/api/webhooks/xendit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookCallback } from "@/lib/xendit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const callbackToken = request.headers.get("x-callback-token") || "";

    console.log("🔔 Webhook received:", {
      status: body.status,
      id: body.id,
      hasMetadata: !!body.metadata,
      metadata: body.metadata,
    });

    // Verify webhook authenticity
    if (
      !verifyWebhookCallback(callbackToken, process.env.XENDIT_WEBHOOK_TOKEN!)
    ) {
      console.error("❌ Invalid webhook token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle invoice paid event
    if (body.status === "PAID") {
      const metadata = body.metadata || {};
      const type = metadata.type;

      console.log("💰 Payment received:", { type, metadata });

      // Check if metadata exists
      if (!metadata || !type) {
        console.error(
          "⚠️ No metadata in webhook - this is likely a test webhook"
        );
        return NextResponse.json({
          received: true,
          message: "Test webhook - no metadata to process",
        });
      }

      if (type === "package_purchase") {
        console.log("📦 Processing package purchase...");
        await handlePackagePurchase({
          userId: metadata.userId,
          packageTypeId: metadata.packageTypeId,
          invoiceId: body.id,
          amount: body.amount,
          paidAt: body.paid_at,
        });
      } else if (type === "single_class_payment") {
        console.log("🎫 Processing single class payment...");
        await handleSingleClassPayment({
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
      const metadata = body.metadata || {};

      console.log("⏰ Invoice expired:", metadata);

      if (metadata.type === "single_class_payment") {
        // Cancel the pending booking
        await supabase
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", metadata.bookingId);

        console.log("❌ Cancelled expired booking:", metadata.bookingId);
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("💥 Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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
    console.log("📦 Creating package for user:", userId);

    // Get package type details
    const { data: packageType, error: fetchError } = await supabase
      .from("package_types")
      .select("*")
      .eq("id", packageTypeId)
      .single();

    if (fetchError || !packageType) {
      console.error("❌ Package type not found:", packageTypeId, fetchError);
      return;
    }

    console.log("✅ Package type found:", packageType.name);

    // Calculate expiry date
    const purchaseDate = new Date(paidAt);
    const expiryDate = new Date(purchaseDate);
    expiryDate.setDate(expiryDate.getDate() + packageType.validity_days);

    // Create package
    const { data: newPackage, error: packageError } = await supabase
      .from("packages")
      .insert({
        user_id: userId,
        package_type_id: packageTypeId,
        total_credits: packageType.class_credits,
        remaining_credits: packageType.class_credits,
        purchase_date: paidAt,
        expires_at: expiryDate.toISOString(),
        status: "active",
      })
      .select()
      .single();

    if (packageError) {
      console.error("❌ Error creating package:", packageError);
      return;
    }

    console.log("✅ Package created successfully:", newPackage.id);

    // Create transaction record
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type: "package",
        package_type_id: packageTypeId,
        amount: amount,
        payment_method: "xendit",
        payment_status: "paid",
        payment_id: invoiceId,
        paid_at: paidAt,
      });

    if (transactionError) {
      console.error("⚠️ Transaction record error:", transactionError);
    } else {
      console.log("✅ Transaction recorded");
    }
  } catch (error) {
    console.error("💥 Error handling package purchase:", error);
  }
}

async function handleSingleClassPayment({
  bookingId,
  invoiceId,
  amount,
  paidAt,
}: {
  bookingId: string;
  invoiceId: string;
  amount: number;
  paidAt: string;
}) {
  try {
    console.log("🎫 Updating booking:", bookingId);

    // Update booking to confirmed
    const { error } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        payment_status: "paid",
        paid_at: paidAt,
        payment_id: invoiceId,
      })
      .eq("id", bookingId);

    if (error) {
      console.error("❌ Error updating booking:", error);
      return;
    }

    console.log("✅ Booking confirmed:", bookingId);
  } catch (error) {
    console.error("💥 Error handling single class payment:", error);
  }
}
