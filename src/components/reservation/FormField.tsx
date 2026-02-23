import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  error?: FieldError;
  multiline?: boolean;
  registration: UseFormRegisterReturn;
  type?: string;
}

export default function FormField({
  id,
  label,
  error,
  multiline = false,
  registration,
  type = "text",
}: FormFieldProps) {
  const inputClass = cn(
    "border-2 border-[var(--color-oatmeal)] bg-[var(--color-warm-white)] px-5 py-4 rounded-xl h-auto",
    "focus:border-[var(--color-caramel)] focus-visible:ring-2 focus-visible:ring-[var(--color-caramel)]/20",
    "hover:border-[var(--color-parchment)] transition-all",
    "placeholder:text-[var(--color-text-muted)]",
    error && "border-red-400 focus:border-red-400"
  );

  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="font-semibold text-sm text-[var(--color-text-secondary)]"
      >
        {label}
      </Label>
      {multiline ? (
        <Textarea
          id={id}
          className={inputClass}
          rows={5}
          {...registration}
        />
      ) : (
        <Input
          id={id}
          type={type}
          className={inputClass}
          {...registration}
        />
      )}
      {error && (
        <p className="text-red-500 text-xs mt-0.5" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
