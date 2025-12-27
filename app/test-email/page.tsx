"use client";

import { useState } from "react";

export default function TestEmailPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const sendTestEmail = async () => {
    setSending(true);
    const res = await fetch("/api/send-email/booking-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        userName: "Test User",
        className: "Reformer Class",
        date: "Senin, 5 Januari 2026",
        time: "08:00",
        coach: "Sofie",
        location: "Aure Pilates Studio Tasikmalaya",
      }),
    });
    const data = await res.json();
    alert(data.success ? "Email sent!" : "Failed: " + data.error);
    setSending(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Test Email</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="border p-2 mr-2"
      />
      <button
        onClick={sendTestEmail}
        disabled={sending}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {sending ? "Sending..." : "Send Test Email"}
      </button>
    </div>
  );
}
