import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    // Check if env vars exist
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
      return NextResponse.json(
        {
          error: "Server configuration error",
          emailExists: false,
          phoneExists: false,
        },
        { status: 500 },
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json(
        {
          error: "Server configuration error",
          emailExists: false,
          phoneExists: false,
        },
        { status: 500 },
      );
    }

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const { email, phone } = await req.json();

    const result: { emailExists: boolean; phoneExists: boolean } = {
      emailExists: false,
      phoneExists: false,
    };

    // Normalize phone number
    const normalizePhone = (phoneNum: string): string => {
      let normalized = phoneNum.replace(/[\s\-\(\)]/g, "");

      if (normalized.startsWith("+62")) {
        normalized = "0" + normalized.slice(3);
      } else if (normalized.startsWith("62") && normalized.length > 10) {
        normalized = "0" + normalized.slice(2);
      }

      return normalized;
    };

    // Check email
    if (email) {
      const emailToCheck = email.toLowerCase().trim();
      const { data: emailData, error: emailError } = await supabaseAdmin
        .from("profiles")
        .select("id, email")
        .not("email", "is", null);

      if (emailError) {
        console.error("Email check error:", emailError);
      } else {
        result.emailExists =
          emailData?.some(
            (profile) => profile.email?.toLowerCase().trim() === emailToCheck,
          ) ?? false;
      }
    }

    // Check phone
    if (phone) {
      const normalizedPhone = normalizePhone(phone);
      const { data: phoneData, error: phoneError } = await supabaseAdmin
        .from("profiles")
        .select("id, phone_number")
        .not("phone_number", "is", null);

      if (phoneError) {
        console.error("Phone check error:", phoneError);
      } else {
        result.phoneExists =
          phoneData?.some((profile) => {
            if (!profile.phone_number) return false;
            return normalizePhone(profile.phone_number) === normalizedPhone;
          }) ?? false;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Check duplicate error:", error);
    return NextResponse.json(
      {
        error: "Failed to check duplicates",
        emailExists: false,
        phoneExists: false,
      },
      { status: 500 },
    );
  }
}
