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
    const invoice = await Invoice.createInvoice({
      data: {
        externalId: `package-${userId}-${Date.now()}`,
        amount: amount,
        payerEmail: userEmail,
        description: `Pembelian ${packageName} - Aure Pilates`,
        invoiceDuration: 86400, // 24 hours in seconds
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
        metadata: {
          userId,
          packageTypeId,
          packageName,
          type: "package_purchase",
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
    const invoice = await Invoice.createInvoice({
      data: {
        externalId: `class-${bookingId}-${Date.now()}`,
        amount: amount,
        payerEmail: userEmail,
        description: `${className} - ${classDate}`,
        invoiceDuration: 3600, // 1 hour in seconds
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
        metadata: {
          userId,
          classId,
          bookingId,
          className,
          classDate,
          type: "single_class_payment",
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
  webhookToken: string
): boolean {
  return callbackToken === webhookToken;
}
