"use client";

import { type ComponentPropsWithoutRef, useState } from "react";
import { formatPriceInput, withoutPriceCurrency } from "@/lib/price-format";

type Props = Omit<ComponentPropsWithoutRef<"input">, "value" | "onChange" | "onBlur" | "onFocus" | "type"> & {
  value: string;
  onChange: (value: string) => void;
};

export function AdminPriceInput({ value, onChange, ...props }: Props) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <input
      {...props}
      type="text"
      spellCheck={false}
      value={draft ?? formatPriceInput(value)}
      onFocus={() => setDraft(formatPriceInput(value))}
      onChange={(event) => {
        const nextValue = withoutPriceCurrency(event.target.value);
        setDraft(nextValue);
        onChange(nextValue);
      }}
      onBlur={() => {
        setDraft(null);
        const formatted = formatPriceInput(draft ?? value);
        if (formatted !== value) onChange(formatted);
      }}
    />
  );
}
