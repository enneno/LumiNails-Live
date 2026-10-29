import { useRef, type ComponentPropsWithRef, type RefObject } from "react";

import { AdminIcon } from "@/components/admin-icon";
import { adminSearchFieldClass } from "@/components/admin-ui";
import styles from "./admin-search-input.module.css";

type AdminSearchInputProps = Omit<ComponentPropsWithRef<"input">, "value" | "onChange" | "ref"> & {
  value: string;
  onValueChange: (value: string) => void;
  ref?: RefObject<HTMLInputElement | null>;
  containerClassName?: string;
  clearLabel?: string;
};

export function AdminSearchInput({ value, onValueChange, ref, containerClassName = "", className = "", clearLabel = "Keresés törlése", type = "search", disabled, readOnly, ...props }: AdminSearchInputProps) {
  const localRef = useRef<HTMLInputElement>(null);
  const inputRef = ref ?? localRef;

  return (
    <span className={`relative block min-w-0 ${containerClassName}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 fill-none stroke-gold-dark stroke-[1.8]">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
      <input {...props} ref={inputRef} type={type} value={value} onChange={(event) => onValueChange(event.target.value)} disabled={disabled} readOnly={readOnly} className={`${adminSearchFieldClass} ${styles.input} ${className}`} />
      {value && !readOnly ? (
        <button
          type="button"
          aria-label={clearLabel}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            onValueChange("");
            inputRef.current?.focus({ preventScroll: true });
          }}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-ink-muted transition-colors hover:bg-admin-raised hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-dark disabled:opacity-50"
        >
          <AdminIcon name="close" className="size-3.5" />
        </button>
      ) : null}
    </span>
  );
}
