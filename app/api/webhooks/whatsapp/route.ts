import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = "aure_pilates_webhook_2026"; // You choose this

// GET - Webhook verification
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse("Forbidden", { status: 403 });
  }
}

// POST - Receive incoming messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("Incoming webhook:", JSON.stringify(body, null, 2));

    // Check if this is a message event
    if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from; // sender's phone number
      const text = message.text?.body; // message text

      console.log(`Message from ${from}: ${text}`);

      // TODO: Process the message
      // You can add your logic here to respond, save to database, etc.
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 },
    );
  }
}
