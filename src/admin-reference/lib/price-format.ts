/** Editable HUF amounts: keep ranges and qualifiers, never store currency in the field. */
export function withoutPriceCurrency(value: string) {
  return value.replace(/\s*(?:Ft|HUF)\b/gi, "");
}

export function formatPriceInput(value: string) {
  return withoutPriceCurrency(value).trim().replace(/\d[\d. \u00a0\u202f]*\d|\d/g, (amount) =>
    amount.replace(/[.\s\u00a0\u202f]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, "."),
  );
}

export function formatPrice(value: string) {
  const amount = formatPriceInput(value);
  if (!amount) return "—";
  if (!/\d/.test(amount)) return amount;
  if (/[-\s]t[óő]l$/i.test(amount)) return amount.replace(/[-\s]+t[óő]l$/i, " Ft-tól");
  return `${amount} Ft`;
}

/** Also accepts legacy booking labels containing multiple named package prices. */
export function formatBookingPrice(value: string) {
  return value.split(" · ").map((part) => {
    const colon = part.lastIndexOf(":");
    return colon < 0
      ? formatPrice(part)
      : `${part.slice(0, colon + 1)} ${formatPrice(part.slice(colon + 1))}`;
  }).join(" · ");
}
