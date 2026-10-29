export const adminTabIds = [
  "overview",
  "content",
  "services",
  "prices",
  "gallery",
  "questions",
  "training",
  "bookings",
  "schedule",
  "notifications",
  "approvals",
  "bulk-email",
  "logs",
] as const;

export type AdminTab = (typeof adminTabIds)[number];

export type AdminViewDirection = "forward" | "backward";

export function getAdminViewDirection<T extends string>(
  current: T,
  next: T,
  order: readonly T[],
): AdminViewDirection | null {
  const currentIndex = order.indexOf(current);
  const nextIndex = order.indexOf(next);
  if (currentIndex < 0 || nextIndex < 0 || currentIndex === nextIndex) return null;
  return nextIndex > currentIndex ? "forward" : "backward";
}

export function isAdminTab(value: unknown): value is AdminTab {
  return typeof value === "string" && adminTabIds.some((tab) => tab === value);
}
