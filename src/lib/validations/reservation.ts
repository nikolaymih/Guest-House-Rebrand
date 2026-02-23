import { z } from "zod";

// Supports two+ words with Latin or Cyrillic characters, hyphens, apostrophes
const fullNameRegex = /^[\p{L}'-]+(?:\s[\p{L}'-]+)+$/u;
// International phone: starts with + or 00, followed by digits/spaces/dashes
const phoneRegex = /^(\+|00)[1-9][0-9\s\-(). ]{6,20}$/;

export const reservationSchema = z.object({
  fullName: z
    .string()
    .min(1, "fullNameRequired")
    .regex(fullNameRegex, "fullNameInvalid"),
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
  phone: z
    .string()
    .min(1, "phoneRequired")
    .regex(phoneRegex, "phoneInvalid"),
  subject: z.string().min(3, "subjectMin"),
  message: z.string().min(10, "messageMin"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "consentRequired" }),
  }),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
