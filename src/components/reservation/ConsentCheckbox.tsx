import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface ConsentCheckboxProps {
  label: string;
  error?: FieldError;
  registration: UseFormRegisterReturn;
}

export default function ConsentCheckbox({
  label,
  error,
  registration,
}: ConsentCheckboxProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 w-4 h-4 accent-[var(--color-caramel)] cursor-pointer"
          {...registration}
        />
        <span className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {label}
        </span>
      </label>
      {error && (
        <p className="text-red-500 text-xs" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
