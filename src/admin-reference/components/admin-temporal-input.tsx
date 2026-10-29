import type { ComponentPropsWithoutRef } from "react";

type AdminTemporalInputProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  type: "date" | "time";
  containerClassName?: string;
  touch?: boolean;
};

export function AdminTemporalInput({
  type,
  containerClassName = "",
  className = "",
  touch = false,
  ...props
}: AdminTemporalInputProps) {
  return (
    <span
      className={`flex ${touch ? "min-h-[44px]" : "min-h-8"} min-w-0 w-full max-w-full items-center overflow-hidden rounded-lg border border-admin-border/60 bg-admin-field px-2.5 transition-colors focus-within:border-gold-dark/70 focus-within:ring-2 focus-within:ring-gold-dark/10 has-[input:disabled]:opacity-60 ${containerClassName}`}
    >
      <input
        {...props}
        type={type}
        className={`min-w-0 w-full max-w-full border-0 bg-transparent p-0 ${touch ? "min-h-[44px] text-[length:max(16px,1rem)]" : "text-xs"} font-medium text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark disabled:cursor-not-allowed ${className}`}
      />
    </span>
  );
}
