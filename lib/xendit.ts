// lib/xendit.ts
import Xendit from "xendit-node";

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY!,
});

const { Invoice } = xendit;

export type PaymentMethod =
  | "qris"
  | "ewallet"
  | "virtual_account"
  | "retail_outlet";

// Create invoice for package purchase
export async function createPackageInvoice({
  userId,
  userEmail,
  userName,
  packageName,
  amount,
  packageTypeId,
}: {
  userId: string;
  userEmail: string;
  userName: string;
  packageName: string;
  amount: number;
  packageTypeId: string;
}) {
  try {
    // Encode metadata in externalId (keep it short - 256 char limit!)
    const metadata = {
      t: "pkg",
      u: userId,
      p: packageTypeId,
    };
    const encoded = Buffer.from(JSON.stringify(metadata)).toString("base64");
    const externalId = `${encoded}_${Date.now()}`;

    const invoice = await Invoice.createInvoice({
      data: {
        externalId: externalId,
        amount: amount,
        payerEmail: userEmail,
        description: `Pembelian ${packageName} - Aure Pilates`,
        invoiceDuration: 86400,
        currency: "IDR",
        reminderTime: 1,
        successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`,
        items: [
          {
            name: packageName,
            quantity: 1,
            price: amount,
          },
        ],
        customer: {
          givenNames: userName,
          email: userEmail,
        },
        customerNotificationPreference: {
          invoiceCreated: ["email"],
          invoicePaid: ["email"],
        },
      },
    });

    return {
      success: true,
      invoiceUrl: invoice.invoiceUrl,
      invoiceId: invoice.id,
    };
  } catch (error) {
    console.error("Xendit create invoice error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create invoice",
    };
  }
}

// Create invoice for single class payment
export async function createSingleClassInvoice({
  userId,
  userEmail,
  userName,
  className,
  classDate,
  amount,
  classId,
  bookingId,
}: {
  userId: string;
  userEmail: string;
  userName: string;
  className: string;
  classDate: string;
  amount: number;
  classId: string;
  bookingId: string;
}) {
  try {
    // Use shorter keys and only first part of UUIDs to stay under 256 char limit
    // Format: cls|userId|classId|bookingId
    const shortUserId = userId.split("-")[0]; // First segment of UUID
    const shortClassId = classId.split("-")[0];
    // Keep full bookingId(s) as we need it to update the booking
    const metadata = {
      t: "cls",
      u: userId, // Full userId needed for transaction
      c: shortClassId,
      b: bookingId, // Full bookingId(s) needed to update bookings
    };

    const encoded = Buffer.from(JSON.stringify(metadata)).toString("base64");

    // Check if encoded string is too long (Xendit limit is 256 chars)
    // If so, use a simpler format
    let externalId: string;
    if (encoded.length > 200) {
      // Use pipe-separated format for long booking IDs
      // Format: cls|userId|bookingId|timestamp
      externalId = `cls|${userId}|${bookingId}|${Date.now()}`;
    } else {
      externalId = `${encoded}_${Date.now()}`;
    }

    console.log("Creating invoice with externalId:", externalId);
    console.log("ExternalId length:", externalId.length);

    const invoice = await Invoice.createInvoice({
      data: {
        externalId: externalId,
        amount: amount,
        payerEmail: userEmail,
        description: `${className} - ${classDate}`,
        invoiceDuration: 3600,
        currency: "IDR",
        successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?type=class`,
        failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`,
        items: [
          {
            name: `${className} - ${classDate}`,
            quantity: 1,
            price: amount,
          },
        ],
        customer: {
          givenNames: userName,
          email: userEmail,
        },
        customerNotificationPreference: {
          invoiceCreated: ["email"],
          invoicePaid: ["email"],
        },
      },
    });

    return {
      success: true,
      invoiceUrl: invoice.invoiceUrl,
      invoiceId: invoice.id,
    };
  } catch (error) {
    console.error("Xendit create invoice error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create invoice",
    };
  }
}

// Get invoice details
export async function getInvoice(invoiceId: string) {
  try {
    const invoice = await Invoice.getInvoiceById({
      invoiceId,
    });

    return {
      success: true,
      invoice,
    };
  } catch (error) {
    console.error("Xendit get invoice error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get invoice",
    };
  }
}

// Verify webhook callback authenticity
export function verifyWebhookCallback(
  callbackToken: string,
  webhookToken: string,
): boolean {
  return callbackToken === webhookToken;
}
