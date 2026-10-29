export type CalendarOccupiedInterval = {
  startMinutes: number;
  endMinutes: number;
};

export function resolveManualBookingHourStart(
  clickedMinute: number,
  calendarStartMinutes: number,
  calendarEndMinutes: number,
  occupiedIntervals: CalendarOccupiedInterval[],
) {
  let start = Math.max(calendarStartMinutes, Math.floor(clickedMinute / 60) * 60);
  if (start >= calendarEndMinutes) return null;

  const occupied = occupiedIntervals
    .filter((interval) => interval.endMinutes > interval.startMinutes)
    .sort((left, right) => left.startMinutes - right.startMinutes);

  for (const interval of occupied) {
    if (interval.startMinutes <= start && start < interval.endMinutes) {
      start = interval.endMinutes;
      if (start >= calendarEndMinutes) return null;
    }
  }

  return start;
}
