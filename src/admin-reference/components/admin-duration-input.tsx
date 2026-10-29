"use client";

import type { ComponentPropsWithoutRef, KeyboardEvent } from "react";

import { normalizeDurationMinutes } from "@/lib/service-catalog";

type AdminDurationInputProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "value" | "defaultValue" | "onChange" | "onBlur"
> & {
  value: number;
  onCommit: (value: number) => void;
};

export function AdminDurationInput({
  value,
  onCommit,
  onKeyDown,
  ...props
}: AdminDurationInputProps) {
  function commit(input: HTMLInputElement) {
    const draft = input.value.trim();
    if (!draft) {
      input.value = String(value);
      return;
    }

    const parsed = Number(draft);
    if (!Number.isFinite(parsed)) {
      input.value = String(value);
      return;
    }

    const normalized = normalizeDurationMinutes(parsed);
    input.value = String(normalized);
    if (normalized !== value) onCommit(normalized);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (event.key === "Enter") {
      event.currentTarget.blur();
    }

    if (event.key === "Escape") {
      event.currentTarget.value = String(value);
      event.currentTarget.blur();
    }
  }

  return (
    <input
      {...props}
      key={value}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={3}
      defaultValue={value}
      onInput={(event) => {
        event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 3);
      }}
      onBlur={(event) => commit(event.currentTarget)}
      onKeyDown={handleKeyDown}
    />
  );
}
