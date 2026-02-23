"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  reservationSchema,
  type ReservationInput,
} from "@/lib/validations/reservation";
import FormField from "./FormField";
import ConsentCheckbox from "./ConsentCheckbox";
import { Button } from "@/components/ui/button";

export default function ReservationForm() {
  const t = useTranslations("reservation");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: ReservationInput) {
    const res = await fetch("/api/reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success(t("success"));
      reset();
    } else {
      toast.error(t("error"));
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 w-full max-w-xl"
      noValidate
    >
      <FormField
        id="fullName"
        label={t("fullName")}
        error={errors.fullName}
        registration={register("fullName")}
      />
      <FormField
        id="email"
        label={t("email")}
        type="email"
        error={errors.email}
        registration={register("email")}
      />
      <FormField
        id="phone"
        label={t("phone")}
        type="tel"
        error={errors.phone}
        registration={register("phone")}
      />
      <FormField
        id="subject"
        label={t("subject")}
        error={errors.subject}
        registration={register("subject")}
      />
      <FormField
        id="message"
        label={t("message")}
        multiline
        error={errors.message}
        registration={register("message")}
      />
      <ConsentCheckbox
        label={t("consent")}
        error={errors.consent}
        registration={register("consent")}
      />
      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-[var(--color-caramel)] hover:bg-[var(--color-caramel-deep)] text-white rounded-full px-8 py-3 font-semibold transition-colors self-start"
      >
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
