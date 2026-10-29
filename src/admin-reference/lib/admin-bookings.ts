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

export function normalizeBookingSearch(value: string) {
  return value
    .toLocaleLowerCase("hu-HU")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9@.]+/g, "");
}

export function formatAdminServiceLabel(service: {name: string; category?: string}) {
  const name = service.name?.trim() || "Kezelés";
  const category = service.category?.trim() || "";
  if (!category || category.localeCompare(name, "hu-HU", { sensitivity: "base" }) === 0) return name;
  return category + ": " + stripAdminServiceCategoryPrefix(name, category);
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
  return {
    total: monthly.length,
    scheduled,
    completed,
    noShow,
    cancelled,
    noShowPercent: completed + noShow ? Math.round(noShow * 100 / (completed + noShow)) : null,
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
