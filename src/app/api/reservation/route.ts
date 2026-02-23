import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { reservationSchema } from "@/lib/validations/reservation";
import { sendReservationEmail } from "@/lib/email/mailer";

// Use service role key — this is server-only code, key is never sent to the browser
function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = reservationSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.issues },
      { status: 400 }
    );
  }

  const { fullName, email, phone, subject, message } = result.data;

  const supabase = createAdminClient();

  const { error: dbError } = await supabase.from("reservations").insert({
    full_name: fullName,
    email,
    phone,
    subject,
    message,
  });

  if (dbError) {
    console.error("[reservation] DB error:", dbError);
    return NextResponse.json(
      { error: "Failed to save reservation" },
      { status: 500 }
    );
  }

  try {
    await sendReservationEmail({ fullName, email, phone, subject, message });
  } catch (err) {
    // Email failure is non-blocking — reservation is already saved to DB
    console.error("[email] Failed to send reservation email:", err);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
