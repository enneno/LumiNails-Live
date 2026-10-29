// UI shape for LumiNails' existing services; no reference-project catalog expansion.
export type CatalogBookingService = {
  id: string;
  category: string;
  name: string;
  durationMinutes: number;
  durationLabel: string;
  priceLabel: string;
};

export function normalizeDurationMinutes(value: unknown, fallback = 60) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(480, Math.max(5, Math.round(value)));
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value.replace(/\D+/g, ""), 10);
    if (Number.isFinite(parsed)) return Math.min(480, Math.max(5, parsed));
  }

  return fallback;
}
