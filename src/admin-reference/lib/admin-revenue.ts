import type { AdminBooking } from "@/lib/admin-bookings";

type PaidBooking = Pick<AdminBooking, "dateInput" | "paidAmountHuf">;

export type ArchivedRevenueDay = {
  bookingDate: string;
  totalHuf: number;
  paymentCount: number;
};

export function getIsoWeek(dateInput: string) {
  const thursday = new Date(`${dateInput}T12:00:00Z`);
  thursday.setUTCDate(thursday.getUTCDate() + 3 - (thursday.getUTCDay() + 6) % 7);
  const year = thursday.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(year, 0, 4, 12));
  firstThursday.setUTCDate(firstThursday.getUTCDate() + 3 - (firstThursday.getUTCDay() + 6) % 7);
  return { year, week: 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / 604_800_000) };
}

export function getIsoWeekStart(year: number, week: number) {
  const monday = new Date(Date.UTC(year, 0, 4, 12));
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7 + (week - 1) * 7);
  return monday.toISOString().slice(0, 10);
}

export function getIsoWeeksInYear(year: number) {
  return getIsoWeek(`${year}-12-28`).week;
}

export function summarizePaidRevenue(
  bookings: readonly PaidBooking[],
  today: string,
  archivedDays: readonly ArchivedRevenueDay[] = [],
) {
  const date = new Date(`${today}T12:00:00Z`);
  const dayFromMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayFromMonday);
  const weekStart = date.toISOString().slice(0, 10);
  date.setUTCDate(date.getUTCDate() + 7);
  const weekEnd = date.toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  const total = bookings.reduce((total, booking) => {
    if (booking.paidAmountHuf === null) return total;
    if (booking.dateInput >= weekStart && booking.dateInput < weekEnd) {
      total.weekHuf += booking.paidAmountHuf;
      total.weekCount += 1;
    }
    if (booking.dateInput.startsWith(month)) {
      total.monthHuf += booking.paidAmountHuf;
      total.monthCount += 1;
    }
    return total;
  }, { weekHuf: 0, weekCount: 0, monthHuf: 0, monthCount: 0 });

  for (const day of archivedDays) {
    if (day.bookingDate >= weekStart && day.bookingDate < weekEnd) {
      total.weekHuf += day.totalHuf;
      total.weekCount += day.paymentCount;
    }
    if (day.bookingDate.startsWith(month)) {
      total.monthHuf += day.totalHuf;
      total.monthCount += day.paymentCount;
    }
  }
  return total;
}
