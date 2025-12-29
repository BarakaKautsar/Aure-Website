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

    // Verify webhook authenticity
    if (
      !verifyWebhookCallback(callbackToken, process.env.XENDIT_WEBHOOK_TOKEN!)
    ) {
      console.error("Invalid webhook token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle invoice paid event
    if (body.status === "PAID") {
      let metadata: any = {};
      const externalId = body.external_id || "";

      try {
        const parts = externalId.split("_");
        const base64Part = parts.slice(0, -1).join("_");
        const decoded = Buffer.from(base64Part, "base64").toString("utf-8");
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
      } catch (error) {
        console.error("Failed to decode metadata:", error);
      }

      const type = metadata.type;

      if (!metadata || !type) {
        return NextResponse.json({
          received: true,
          message: "No metadata to process",
        });
      }

      if (type === "package_purchase") {
        await handlePackagePurchase({
          userId: metadata.userId,
          packageTypeId: metadata.packageTypeId,
          invoiceId: body.id,
          amount: body.amount,
          paidAt: body.paid_at,
        });
      } else if (type === "single_class_payment") {
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
      let metadata: any = {};
      const externalId = body.external_id || "";

      try {
        const parts = externalId.split("_");
        const base64Part = parts.slice(0, -1).join("_");
        const decoded = Buffer.from(base64Part, "base64").toString("utf-8");
        const shortData = JSON.parse(decoded);

        if (shortData.t === "cls") {
          metadata = { bookingId: shortData.b };
        }
      } catch (error) {
        console.error("Failed to decode metadata:", error);
      }

      if (metadata.bookingId) {
        await supabase
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", metadata.bookingId);
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
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
        type: "package",
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
    const { error } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        payment_status: "paid",
        payment_id: invoiceId,
      })
      .eq("id", bookingId);

    if (error) {
      console.error("Error updating booking:", error);
    }
  } catch (error) {
    console.error("Error handling single class payment:", error);
  }
}
