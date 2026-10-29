import type { AdminSelectOption } from "@/components/admin-select-menu";
import type { BookingStatus } from "@/lib/booking-status";
import { parseHungarianPhone } from "./hungarian-phone.ts";
import type { ScheduleException } from "@/lib/scheduling";

export type BookingPageSize = 10 | 20 | 50 | "all";
export type BookingStatusFilter = BookingStatus | "all";
export type BookingViewMode = "list" | "calendar" | "week";

export type AdminBookingServiceGroup = {
  label: string;
  names: string[];
};

export type AdminBooking = {
  id: number;
  updatedAt: string;
  startsAt: string;
  endsAt: string;
  date: string;
  time: string;
  endTime: string;
  dateInput: string;
  timeInput: string;
  trackId: "lashes" | "laser" | "mixed";
  trackLabel: string;
  serviceLabel: string;
  serviceGroups: AdminBookingServiceGroup[];
  serviceIds: string[];
  guestName: string;
  createdBy: string | null;
  phone: string;
  email: string;
  note: string;
  adminComment: string;
  paidAmountHuf: number | null;
  status: BookingStatus;
  cancelledAt: string | null;
  cancellationAcknowledgedAt: string | null;
  source: "online" | "manual";
  confirmationCode: string;
};

export type ManualBookingDraft = {
  serviceIds: string[];
  date: string;
  time: string;
  endTime: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
};

export type ManualBookingGuest = Pick<AdminBooking, "guestName" | "email" | "phone">;

export type BookingDateDraft = {
  date: string;
  time: string;
  endTime: string;
  note: string;
};

export type BookingQueryRecord = {
  id: number;
  updated_at: string;
  starts_at: string;
  ends_at: string;
  service_id: string;
  track: string;
  guest_name: string;
  created_by: string | null;
  guest_phone: string;
  guest_email: string | null;
  guest_note: string;
  status: string;
  cancelled_at: string | null;
  cancellation_admin_acknowledged_at: string | null;
  booking_source: string;
  confirmation_code: string;
  booking_admin_comments: { comment: string } | null;
  booking_admin_payments: { amount_huf: number } | null;
  services: { name: string; category: string } | null;
  booking_services: Array<{
    service_id: string;
    service_name: string;
    service_category: string;
    service_track: string | null;
    position: number;
  }>;
};

export function toAdminBooking(booking: BookingQueryRecord): AdminBooking {
  const serviceGroups = getAdminServiceGroups(booking.track, booking.services, booking.booking_services);
  return {
    id: booking.id,
    updatedAt: booking.updated_at,
    startsAt: booking.starts_at,
    endsAt: booking.ends_at,
    date: formatBookingPart(booking.starts_at, "date"),
    time: formatBookingPart(booking.starts_at, "time"),
    endTime: formatBookingPart(booking.ends_at, "time"),
    dateInput: formatBookingInputPart(booking.starts_at, "date"),
    timeInput: formatBookingInputPart(booking.starts_at, "time"),
    trackId: booking.track as "lashes" | "laser" | "mixed",
    trackLabel: booking.track === "lashes"
      ? "Műszempilla"
      : booking.track === "laser"
        ? "Lézer"
        : "Pilla + lézer",
    serviceLabel: formatAdminServiceLabelFromGroups(serviceGroups),
    serviceGroups,
    serviceIds: booking.booking_services.length
      ? [...booking.booking_services].sort((left, right) => left.position - right.position).map((item) => item.service_id)
      : [booking.service_id],
    guestName: booking.guest_name.trim() || "Névtelen vendég",
    createdBy: booking.created_by,
    phone: booking.guest_phone,
    email: booking.guest_email ?? "",
    note: booking.guest_note,
    adminComment: booking.booking_admin_comments?.comment ?? "",
    paidAmountHuf: booking.booking_admin_payments?.amount_huf ?? null,
    status: booking.status as BookingStatus,
    cancelledAt: booking.cancelled_at,
    cancellationAcknowledgedAt: booking.cancellation_admin_acknowledged_at,
    source: booking.booking_source === "manual" ? "manual" : "online",
    confirmationCode: booking.confirmation_code,
  };
}

export function createManualBookingDraft(serviceId = "", durationMinutes = 60): ManualBookingDraft {
  const step = 5 * 60 * 1000;
  const nextStart = new Date(Math.ceil((Date.now() + 30 * 60 * 1000) / step) * step);
  const iso = nextStart.toISOString();
  const time = formatBookingInputPart(iso, "time");
  return {
    serviceIds: serviceId ? [serviceId] : [],
    date: formatBookingInputPart(iso, "date"),
    time,
    endTime: addMinutesToTime(time, durationMinutes),
    guestName: "",
    guestEmail: "",
    guestPhone: "",
  };
}

export function getTimeDifferenceMinutes(startTime: string, endTime: string) {
  const startMinutes = parseTimeMinutes(startTime);
  const endMinutes = parseTimeMinutes(endTime);
  if (startMinutes === null || endMinutes === null) return null;
  return endMinutes - startMinutes;
}

export function addMinutesToTime(time: string, durationMinutes: number) {
  const startMinutes = parseTimeMinutes(time);
  if (startMinutes === null) return "";
  const endMinutes = (startMinutes + durationMinutes) % (24 * 60);
  return `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
}

function parseTimeMinutes(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function isLashExtensionBooking(booking: Pick<AdminBooking, "serviceGroups">) {
  return booking.serviceGroups.some((group) => {
    const label = group.label.trim();
    return label === "Műszempilla" || label.startsWith("Műszempilla · ");
  });
}

export function buildPreviousLashBookingDaysById(bookings: AdminBooking[]) {
  const result = new Map<number, number>();
  const eligible = bookings
    .filter((booking) =>
      isLashExtensionBooking(booking)
      && booking.email.trim()
      && !["cancelled", "guest_cancelled", "no_show"].includes(booking.status),
    )
    .sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt));

  const latestByEmail = new Map<string, AdminBooking>();
  for (const booking of eligible) {
    const email = booking.email.trim().toLocaleLowerCase("hu-HU");
    const previous = latestByEmail.get(email);
    if (previous) {
      result.set(booking.id, Math.max(0, differenceInBudapestCalendarDays(previous.startsAt, booking.startsAt)));
    }
    latestByEmail.set(email, booking);
  }

  return result;
}

function differenceInBudapestCalendarDays(previousIso: string, currentIso: string) {
  const previousDate = formatBookingInputPart(previousIso, "date");
  const currentDate = formatBookingInputPart(currentIso, "date");
  const previousUtc = Date.parse(`${previousDate}T00:00:00Z`);
  const currentUtc = Date.parse(`${currentDate}T00:00:00Z`);
  return Math.round((currentUtc - previousUtc) / (24 * 60 * 60 * 1000));
}

export function normalizeBookingSearch(value: string) {
  return value
    .toLocaleLowerCase("hu-HU")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9@.]+/g, "");
}

export function formatAdminServiceLabel(
  track: string,
  service: BookingQueryRecord["services"] | { name: string; category?: string },
  snapshots: BookingQueryRecord["booking_services"] = [],
) {
  return formatAdminServiceLabelFromGroups(getAdminServiceGroups(track, service, snapshots));
}

function formatAdminServiceLabelFromGroups(groups: AdminBookingServiceGroup[]) {
  return groups
    .flatMap((group) => group.label ? [`${group.label}: ${group.names[0]}`, ...group.names.slice(1)] : group.names)
    .join("\n");
}

function getAdminServiceGroups(
  track: string,
  service: BookingQueryRecord["services"] | { name: string; category?: string },
  snapshots: BookingQueryRecord["booking_services"] = [],
) {
  const entries = snapshots.length
    ? [...snapshots]
      .sort((left, right) => left.position - right.position)
      .map((snapshot) => formatAdminServiceLabelPart(snapshot.service_track ?? track, snapshot.service_name, snapshot.service_category))
    : [formatAdminServiceLabelPart(track, service?.name, service?.category)];
  const groups = new Map<string, { label: string; names: string[] }>();

  for (const entry of entries) {
    const key = entry.group.toLocaleLowerCase("hu-HU");
    const group = groups.get(key) ?? { label: entry.group, names: [] };
    if (!group.names.includes(entry.name)) group.names.push(entry.name);
    groups.set(key, group);
  }

  return [...groups.values()];
}

function formatAdminServiceLabelPart(track: string, rawName?: string, rawCategory?: string) {
  const rawServiceName = rawName?.trim() || "Kezelés";
  const category = rawCategory?.trim() || "";
  if (!category) return { group: track === "laser" ? "Lézeres kezelés" : "", name: rawServiceName };
  if (category.localeCompare(rawServiceName, "hu-HU", { sensitivity: "base" }) === 0) return { group: "", name: rawServiceName };
  const name = stripAdminServiceCategoryPrefix(rawServiceName, category);
  const group = track === "laser"
    ? /^szőrtelenítés(?:\s*·|$)/iu.test(category)
      ? "Lézeres szőrtelenítés"
      : category
    : category;
  return { group, name };
}

function stripAdminServiceCategoryPrefix(name: string, category: string) {
  if (name.slice(0, category.length).localeCompare(category, "hu-HU", { sensitivity: "base" }) !== 0) return name;
  const remainder = name.slice(category.length).replace(/^\s*[-–—:·]\s*/u, "").trim();
  if (!remainder) return name;
  return `${remainder[0].toLocaleUpperCase("hu-HU")}${remainder.slice(1)}`;
}

export function isUnacknowledgedGuestCancellation(booking: Pick<AdminBooking, "status" | "source" | "cancellationAcknowledgedAt">) {
  return booking.source === "online" && booking.status === "guest_cancelled" && !booking.cancellationAcknowledgedAt;
}

function normalizedGuestEmail(value: string) {
  return value.trim().toLocaleLowerCase("hu-HU");
}

function normalizedGuestPhone(value: string) {
  return parseHungarianPhone(value)?.e164 ?? value.replace(/\D/g, "");
}

export function getManualBookingGuestSuggestions(bookings: AdminBooking[], search: string) {
  const query = normalizeBookingSearch(search);
  if (!query) return [];
  const contacts = new Set<string>();
  return [...bookings]
    .sort((left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt) || right.id - left.id)
    .filter((booking) => {
      const name = normalizeBookingSearch(booking.guestName);
      if (!name.includes(query)) return false;
      // Keep different contacts with the same name separate; repeated appointments need one suggestion.
      const contact = JSON.stringify([name, normalizedGuestEmail(booking.email), normalizedGuestPhone(booking.phone)]);
      if (contacts.has(contact)) return false;
      contacts.add(contact);
      return true;
    })
    .slice(0, 6);
}

export function getGuestBookingHistory(bookings: AdminBooking[], selected: AdminBooking) {
  const email = normalizedGuestEmail(selected.email);
  const phone = normalizedGuestPhone(selected.phone);
  return bookings.filter((booking) => {
    if (selected.id === booking.id) return true;
    if (selected.source === "online" && booking.source === "online" && selected.createdBy && booking.createdBy) {
      return selected.createdBy === booking.createdBy;
    }
    const candidateEmail = normalizedGuestEmail(booking.email);
    if (email && candidateEmail) return email === candidateEmail;
    return phone.length >= 8 && phone === normalizedGuestPhone(booking.phone);
  }).sort((left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt));
}

export type AdminBookingTask = {
  booking: AdminBooking;
  label: string;
  kind: "cancellation" | "overdue" | "new" | "payment";
};

export function getAdminBookingTasks(bookings: AdminBooking[], nowTimestamp: number): AdminBookingTask[] {
  const recentPaymentCutoff = nowTimestamp - 7 * 24 * 60 * 60 * 1000;
  return bookings.flatMap((booking): AdminBookingTask[] => {
    if (isUnacknowledgedGuestCancellation(booking)) {
      return [{ booking, label: "Lemondás nyugtázása", kind: "cancellation" }];
    }
    if (isOverdueAdminBooking(booking, nowTimestamp)) {
      return [{ booking, label: "Időpont lezárása", kind: "overdue" }];
    }
    if (booking.status === "new") {
      return [{ booking, label: "Visszaigazolás", kind: "new" }];
    }
    if (booking.status === "completed" && booking.paidAmountHuf === null
      && Date.parse(booking.endsAt) >= recentPaymentCutoff && Date.parse(booking.endsAt) <= nowTimestamp) {
      return [{ booking, label: "Fizetés rögzítése", kind: "payment" }];
    }
    return [];
  }).sort((left, right) => {
    const priority = { cancellation: 0, overdue: 1, new: 2, payment: 3 };
    return priority[left.kind] - priority[right.kind]
      || Date.parse(left.booking.startsAt) - Date.parse(right.booking.startsAt);
  });
}

export function summarizeMonthlyBookingOutcomes(bookings: AdminBooking[], year: number, month: number) {
  const monthInput = `${year}-${String(month).padStart(2, "0")}`;
  const monthly = bookings.filter((booking) => booking.dateInput.startsWith(`${monthInput}-`));
  const completed = monthly.filter((booking) => booking.status === "completed").length;
  const noShow = monthly.filter((booking) => booking.status === "no_show").length;
  const cancelled = monthly.filter((booking) => booking.status === "cancelled" || booking.status === "guest_cancelled").length;
  const scheduled = monthly.length - completed - noShow - cancelled;
  const weeklyCounts = Array.from({ length: Math.ceil(new Date(Date.UTC(year, month, 0)).getUTCDate() / 7) }, () => 0);
  const trackCounts = { lashes: 0, laser: 0, mixed: 0 };
  for (const booking of monthly) {
    weeklyCounts[Math.floor((Number(booking.dateInput.slice(8, 10)) - 1) / 7)] += 1;
    if (booking.status !== "cancelled" && booking.status !== "guest_cancelled") {
      trackCounts[booking.trackId] += 1;
    }
  }
  return {
    total: monthly.length,
    scheduled,
    completed,
    noShow,
    cancelled,
    noShowPercent: completed + noShow ? Math.round(noShow * 100 / (completed + noShow)) : null,
    weeklyCounts,
    trackCounts,
  };
}

function getAdminBookingSortRank(booking: AdminBooking, nowTimestamp: number) {
  if (isUnacknowledgedGuestCancellation(booking)) return 0;
  if (isOverdueAdminBooking(booking, nowTimestamp)) return 1;
  if (booking.status === "new") return 2;
  if (booking.status === "cancelled" || booking.status === "guest_cancelled" || booking.status === "no_show") return 5;
  if (booking.status === "completed") return 4;
  return 3;
}

export function adminBookingNeedsAttention(booking: AdminBooking, nowTimestamp: number) {
  return getAdminBookingSortRank(booking, nowTimestamp) <= 2;
}

export function sortAdminBookings(a: AdminBooking, b: AdminBooking, nowTimestamp: number) {
  const aRank = getAdminBookingSortRank(a, nowTimestamp);
  const bRank = getAdminBookingSortRank(b, nowTimestamp);
  if (aRank !== bRank) return aRank - bRank;

  return aRank >= 1 && aRank <= 3
    ? Date.parse(a.startsAt) - Date.parse(b.startsAt)
    : Date.parse(b.startsAt) - Date.parse(a.startsAt);
}

export function isOverdueAdminBooking(booking: Pick<AdminBooking, "status" | "endsAt">, nowTimestamp: number) {
  return (booking.status === "new" || booking.status === "confirmed") && Date.parse(booking.endsAt) < nowTimestamp;
}

export function getTodayDateInput() {
  return formatBookingInputPart(new Date().toISOString(), "date");
}

export function shiftBookingMonthKey(monthKey: string, offset: number) {
  const [year = 0, month = 1] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function buildBookingMonthOptions(
  todayDateInput: string,
  bookings: AdminBooking[],
  exceptions: ScheduleException[],
  activeMonthKey: string,
): AdminSelectOption<string>[] {
  const currentMonthKey = todayDateInput.slice(0, 7);
  const monthKeys = new Set<string>([activeMonthKey]);

  for (let offset = -2; offset <= 15; offset += 1) {
    monthKeys.add(shiftBookingMonthKey(currentMonthKey, offset));
  }
  for (const booking of bookings) monthKeys.add(booking.dateInput.slice(0, 7));
  for (const exception of exceptions) {
    monthKeys.add(exception.startDate.slice(0, 7));
    monthKeys.add(exception.endDate.slice(0, 7));
  }

  return [...monthKeys]
    .sort()
    .map((monthKey) => ({ value: monthKey, label: formatBookingCalendarMonth(monthKey) }));
}

export function scheduleExceptionIncludesDate(exception: ScheduleException, dateInput: string) {
  return exception.startDate <= dateInput && exception.endDate >= dateInput;
}

export function scheduleExceptionIntersectsMonth(exception: ScheduleException, monthKey: string) {
  const monthStart = `${monthKey}-01`;
  const nextMonthStart = `${shiftBookingMonthKey(monthKey, 1)}-01`;
  return exception.startDate < nextMonthStart && exception.endDate >= monthStart;
}

export function clampScheduleExceptionDateToMonth(exception: ScheduleException | undefined, monthKey: string) {
  if (!exception) return undefined;
  const monthStart = `${monthKey}-01`;
  return exception.startDate < monthStart ? monthStart : exception.startDate;
}

export function buildBookingCalendarDays(monthKey: string) {
  const [year = 0, month = 1] = monthKey.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const daysFromMonday = (firstDay.getUTCDay() + 6) % 7;
  const calendarStart = new Date(firstDay);
  calendarStart.setUTCDate(firstDay.getUTCDate() - daysFromMonday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setUTCDate(calendarStart.getUTCDate() + index);
    const dateInput = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

    return {
      dateInput,
      dayNumber: date.getUTCDate(),
      isCurrentMonth: dateInput.startsWith(monthKey),
    };
  });
}

function formatBookingCalendarMonth(monthKey: string) {
  return new Intl.DateTimeFormat("hu-HU", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
  }).format(new Date(`${monthKey}-01T12:00:00Z`));
}

export function formatBookingCalendarDate(dateInput: string) {
  return new Intl.DateTimeFormat("hu-HU", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date(`${dateInput}T12:00:00Z`));
}

export function formatBookingPart(value: string, part: "date" | "time") {
  const date = new Date(value);

  if (part === "date") {
    return new Intl.DateTimeFormat("hu-HU", {
      timeZone: "Europe/Budapest",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("hu-HU", {
    timeZone: "Europe/Budapest",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatBookingInputPart(value: string, part: "date" | "time") {
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((item) => [item.type, item.value]));

  return part === "date"
    ? `${values.year}-${values.month}-${values.day}`
    : `${values.hour}:${values.minute}`;
}
