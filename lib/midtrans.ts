// lib/midtrans.ts
import midtransClient from "midtrans-client";
import crypto from "crypto";

// Initialize Snap API client
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

// Initialize Core API client (for transaction status checks)
const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export type PaymentMethod =
  | "qris"
  | "gopay"
  | "shopeepay"
  | "bca_va"
  | "bni_va"
  | "bri_va"
  | "permata_va"
  | "other_va"
  | "indomaret"
  | "alfamart";

// Create transaction for package purchase
export async function createPackageTransaction({
  userId,
  userEmail,
  userName,
  userPhone,
  packageName,
  amount,
  packageTypeId,
}: {
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  packageName: string;
  amount: number;
  packageTypeId: string;
}) {
  try {
    // Create order ID with metadata
    // Format: PKG_packageTypeId_userId_timestamp
    const orderId = `PKG_${packageTypeId.substring(0, 8)}_${userId.substring(0, 8)}_${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: [
        {
          id: packageTypeId,
          price: amount,
          quantity: 1,
          name: packageName,
          category: "Package",
        },
      ],
      customer_details: {
        first_name: userName,
        email: userEmail,
        phone: userPhone || "",
      },
      custom_field1: userId, // Store userId for webhook processing
      custom_field2: packageTypeId, // Store packageTypeId
      custom_field3: "package", // Transaction type
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?type=package`,
        error: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`,
      },
      expiry: {
        unit: "hours",
        duration: 24,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return {
      success: true,
      token: transaction.token, // Snap token for frontend
      redirectUrl: transaction.redirect_url, // Direct redirect URL
      orderId: orderId,
    };
  } catch (error) {
    console.error("Midtrans create transaction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create transaction",
    };
  }
}

// Create transaction for single class payment
export async function createSingleClassTransaction({
  userId,
  userEmail,
  userName,
  userPhone,
  className,
  classDate,
  amount,
  classId,
  bookingIds,
}: {
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  className: string;
  classDate: string;
  amount: number;
  classId: string;
  bookingIds: string[]; // Array of booking IDs
}) {
  try {
    // Create order ID with metadata
    // Format: CLS_classId_userId_timestamp
    const orderId = `CLS_${classId.substring(0, 8)}_${userId.substring(0, 8)}_${Date.now()}`;

    // Store booking IDs in custom field (Midtrans allows up to 255 chars per field)
    const bookingIdsStr = bookingIds.join(",");

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: [
        {
          id: classId,
          price: amount,
          quantity: 1,
          name: `${className} - ${classDate}`,
          category: "Class",
        },
      ],
      customer_details: {
        first_name: userName,
        email: userEmail,
        phone: userPhone || "",
      },
      custom_field1: userId, // Store userId
      custom_field2: bookingIdsStr, // Store comma-separated booking IDs
      custom_field3: "single_class", // Transaction type
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?type=class`,
        error: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending`,
      },
      expiry: {
        unit: "hours",
        duration: 1, // 1 hour for single class
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return {
      success: true,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      orderId: orderId,
    };
  } catch (error) {
    console.error("Midtrans create transaction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create transaction",
    };
  }
}

// Get transaction status
export async function getTransactionStatus(orderId: string) {
  try {
    // Call the status method with proper typing
    const apiResponse = await (coreApi as any).transaction.status(orderId);

    return {
      success: true,
      status: apiResponse,
    };
  } catch (error) {
    console.error("Midtrans get status error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get transaction status",
    };
  }
}

// Verify notification authenticity using signature key
export function verifySignatureKey(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string,
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const hash = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");

  return hash === signatureKey;
}

// Map Midtrans transaction status to our internal status
export function mapTransactionStatus(transactionStatus: string): {
  paymentStatus: "pending" | "paid" | "failed" | "expired";
  bookingStatus: "pending_payment" | "confirmed" | "cancelled";
} {
  switch (transactionStatus) {
    case "capture":
    case "settlement":
      return {
        paymentStatus: "paid",
        bookingStatus: "confirmed",
      };
    case "pending":
      return {
        paymentStatus: "pending",
        bookingStatus: "pending_payment",
      };
    case "deny":
    case "cancel":
    case "failure":
      return {
        paymentStatus: "failed",
        bookingStatus: "cancelled",
      };
    case "expire":
      return {
        paymentStatus: "expired",
        bookingStatus: "cancelled",
      };
    default:
      return {
        paymentStatus: "pending",
        bookingStatus: "pending_payment",
      };
  }
}
