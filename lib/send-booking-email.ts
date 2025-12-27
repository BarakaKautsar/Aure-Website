// lib/send-booking-email.ts
// Helper function to send booking confirmation email after successful booking

export async function sendBookingEmail({
  userEmail,
  userName,
  className,
  classDate,
  classTime,
  coach,
  location,
}: {
  userEmail: string;
  userName: string;
  className: string;
  classDate: string; // e.g., "2026-01-05"
  classTime: string; // e.g., "08:00-09:00"
  coach: string;
  location: string;
}) {
  try {
    // Format date to Indonesian
    const date = new Date(classDate + "T00:00:00");
    const formattedDate = date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const response = await fetch("/api/send-email/booking-confirmation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: userEmail,
        userName,
        className,
        date: formattedDate,
        time: classTime,
        coach,
        location,
      }),
    });

    if (!response.ok) {
      console.error("Failed to send booking confirmation email");
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending booking email:", error);
    return { success: false };
  }
}

export async function sendCancellationEmail({
  userEmail,
  userName,
  className,
  classDate,
  classTime,
}: {
  userEmail: string;
  userName: string;
  className: string;
  classDate: string;
  classTime: string;
}) {
  try {
    // Format date to Indonesian
    const date = new Date(classDate + "T00:00:00");
    const formattedDate = date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const response = await fetch("/api/send-email/cancellation-confirmation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: userEmail,
        userName,
        className,
        date: formattedDate,
        time: classTime,
      }),
    });

    if (!response.ok) {
      console.error("Failed to send cancellation email");
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    return { success: false };
  }
}

export async function sendWelcomeEmail({
  userEmail,
  userName,
}: {
  userEmail: string;
  userName: string;
}) {
  try {
    const response = await fetch("/api/send-email/welcome", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: userEmail,
        userName,
      }),
    });

    if (!response.ok) {
      console.error("Failed to send welcome email");
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false };
  }
}
