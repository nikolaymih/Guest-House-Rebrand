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
      <label className="flex items-start gap-3 cursor-pointer group">
        {/* Hidden native checkbox — drives peer state */}
        <div className="relative flex-shrink-0 mt-0.5 w-5 h-5">
          <input
            type="checkbox"
            className="peer sr-only"
            {...registration}
          />
          {/* Custom box — matches FormField input style */}
          <div className="w-5 h-5 rounded-md border-2 border-[var(--color-oatmeal)] bg-[var(--color-warm-white)]
            peer-checked:bg-[var(--color-caramel)] peer-checked:border-[var(--color-caramel)]
            peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-caramel)]/20 peer-focus-visible:ring-offset-1
            group-hover:border-[var(--color-parchment)]
            transition-all" />
          {/* Checkmark — visible only when checked */}
          <svg
            className="absolute inset-0 w-full h-full p-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
            viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          >
            <polyline points="2,8 6,12 14,4" />
          </svg>
        </div>
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
