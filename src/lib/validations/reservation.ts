import { z } from "zod";

export function makeReservationSchema(msgs: {
  fullNameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  phoneRequired: string;
  subjectRequired: string;
  messageRequired: string;
  consentRequired: string;
}) {
  return z.object({
    fullName: z.string().min(1, msgs.fullNameRequired),
    email: z.string().min(1, msgs.emailRequired).email(msgs.emailInvalid),
    phone: z.string().min(1, msgs.phoneRequired),
    subject: z.string().min(1, msgs.subjectRequired),
    message: z.string().min(1, msgs.messageRequired),
    consent: z.literal(true, { error: msgs.consentRequired }),
  });
}

// Server-side schema (API route) — messages are keys, not displayed to users
export const reservationSchema = makeReservationSchema({
  fullNameRequired: "fullNameRequired",
  emailRequired: "emailRequired",
  emailInvalid: "emailInvalid",
  phoneRequired: "phoneRequired",
  subjectRequired: "subjectRequired",
  messageRequired: "messageRequired",
  consentRequired: "consentRequired",
});

export type ReservationInput = z.infer<typeof reservationSchema>;
