import { NextRequest, NextResponse } from "next/server";
import { reservationSchema } from "@/lib/validations/reservation";
import { createClient } from "@/lib/supabase/server";
import { sendReservationEmail } from "@/lib/email/mailer";

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

  const supabase = await createClient();

  const { error: dbError } = await supabase.from("reservations").insert({
    full_name: fullName,
    email,
    phone,
    subject,
    message,
  });

  if (dbError) {
    return NextResponse.json(
      { error: "Failed to save reservation" },
      { status: 500 }
    );
  }

  try {
    await sendReservationEmail({ fullName, email, phone, subject, message });
  } catch {
    // Email failure is non-blocking — reservation is already saved to DB
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
