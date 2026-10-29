"use client";

import {
  DndContext,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { bookingStatusLabels, type BookingStatus } from "@/lib/booking-status";
import type { AdminViewDirection } from "@/lib/admin-navigation";
import { resolveManualBookingHourStart } from "@/lib/admin-week-calendar-time";
import type { TrainingCalendarSession } from "@/lib/training";

import { AdminWeekCalendarMobile } from "./admin-week-calendar-mobile";
import { AdminWeekPicker, adminWeekNavigationButtonClass as navigationButtonClass } from "./admin-week-picker";
import styles from "./admin-studio.module.css";

export type AdminWeekCalendarStatus = BookingStatus;

export type AdminWeekCalendarBooking = {
  id: number;
  startsAt: string;
  endsAt: string;
  dateInput: string;
  timeInput: string;
  endTime: string;
  guestName: string;
  serviceLabel: string;
  trackId: "lashes" | "laser" | "mixed";
  status: AdminWeekCalendarStatus;
  source: "online" | "manual";
  movable: boolean;
  pendingMove?: boolean;
};

export type AdminWeekCalendarException = {
  id: string;
  title: string;
  kind: "vacation" | "blocked" | "custom-hours" | "personal";
  track: "lashes" | "laser" | "all";
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
};

export type AdminWeekCalendarBlock = {
  id: string;
  exceptionId: string;
  dateInput: string;
  title: string;
  confirmedNames?: string[];
  kind: "vacation" | "blocked" | "personal" | "training";
  track: "lashes" | "laser" | "all";
  startMinutes: number;
  endMinutes: number;
};

type AdminWeekCalendarProps = {
  bookings: AdminWeekCalendarBooking[];
  blockingBookings: AdminWeekCalendarBooking[];
  exceptions: AdminWeekCalendarException[];
  trainingSessions: TrainingCalendarSession[];
  selectedDate: string;
  slideDirection: AdminViewDirection | null;
  slotIntervalMinutes: number;
  movingBookingId: number | null;
  onSelectedDateChange: (dateInput: string) => void;
  onOpenBooking: (id: number) => void;
  onOpenException: (id: string) => void;
  onCreateManualBookingAt: (date: string, time: string) => void;
  onMoveException: (
    block: AdminWeekCalendarBlock,
    dateInput: string,
    startTime: string,
    endTime: string,
  ) => Promise<void> | void;
  onMoveBooking: (
    booking: AdminWeekCalendarBooking,
    dateInput: string,
    timeInput: string,
    endTime: string,
  ) => Promise<void> | void;
};

const calendarStartMinutes = 6 * 60;
const calendarEndMinutes = 22 * 60;
const defaultPixelsPerMinute = 1;

const statusCardClasses: Record<AdminWeekCalendarStatus, string> = {
  new: "",
  confirmed: "",
  completed: "",
  no_show: "opacity-60",
  cancelled: "opacity-60",
  guest_cancelled: "opacity-60",
};

const trackCardClasses: Record<AdminWeekCalendarBooking["trackId"], string> = {
  lashes: "border-admin-lashes/70 bg-admin-lashes/20",
  laser: "border-admin-laser/70 bg-admin-laser/20",
  mixed: "border-admin-accent/70 bg-admin-accent/20",
};

export function AdminWeekCalendar({
  bookings,
  blockingBookings,
  exceptions,
  trainingSessions,
  selectedDate,
  slideDirection,
  slotIntervalMinutes,
  movingBookingId,
  onSelectedDateChange,
  onOpenBooking,
  onOpenException,
  onCreateManualBookingAt,
  onMoveException,
  onMoveBooking,
}: AdminWeekCalendarProps) {
  const [now, setNow] = useState(() => new Date());
  const [pixelsPerMinute, setPixelsPerMinute] = useState(defaultPixelsPerMinute);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 200, tolerance: 7 },
    }),
  );
  const intervalMinutes = clampSlotInterval(slotIntervalMinutes);
  const weekStart = startOfWeek(selectedDate);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );
  const weekEnd = weekDays[6];
  const weekBookings = useMemo(
    () => bookings.filter((booking) => booking.dateInput >= weekStart && booking.dateInput <= weekEnd),
    [bookings, weekEnd, weekStart],
  );
  const weekNotes = exceptions.filter((exception) =>
    exception.kind === "personal" && exception.startDate >= weekStart && exception.startDate <= weekEnd,
  );
  const visibleTraining = trainingSessions.filter((session) => session.session_date >= weekStart && session.session_date <= weekEnd);
  const startMinutes = Math.min(calendarStartMinutes, ...visibleTraining.map((session) => Math.floor((parseTimeMinutes(session.start_time ?? "") ?? calendarStartMinutes) / 60) * 60));
  const endMinutes = Math.max(calendarEndMinutes, ...visibleTraining.map((session) => Math.ceil((parseTimeMinutes(session.end_time ?? "") ?? calendarEndMinutes) / 60) * 60));
  const weekBlocks = useMemo(
    () => [...buildWeekBlocks(exceptions, weekDays, startMinutes, endMinutes),
      ...trainingSessions.filter((session) => weekDays.includes(session.session_date)).map((session): AdminWeekCalendarBlock => ({
        id: `training/${session.id}`, exceptionId: `training/${session.id}`, dateInput: session.session_date,
        title: `Oktatás · ${session.title}`, kind: "training", track: "all",
        confirmedNames: session.confirmedNames,
        startMinutes: parseTimeMinutes(session.start_time ?? "") ?? startMinutes,
        endMinutes: parseTimeMinutes(session.end_time ?? "") ?? endMinutes,
      }))],
    [exceptions, startMinutes, endMinutes, weekDays, trainingSessions],
  );
  const gridHeight = (endMinutes - startMinutes) * pixelsPerMinute;
  const slots = useMemo(
    () => buildSlots(startMinutes, endMinutes, intervalMinutes),
    [endMinutes, intervalMinutes, startMinutes],
  );
  const hourMarks = useMemo(
    () => buildHourMarks(startMinutes, endMinutes),
    [endMinutes, startMinutes],
  );
  const currentClock = getBudapestClock(now);

  function openManualBookingAtHour(dateInput: string, clickedMinute: number) {
    const occupiedBookings = [
      ...blockingBookings,
      ...weekBookings.filter((booking) => booking.status !== "new" && booking.status !== "confirmed"),
    ];
    const occupiedIntervals = [
      ...occupiedBookings
        .filter((booking) => booking.dateInput === dateInput)
        .map((booking) => ({
          startMinutes: parseTimeMinutes(booking.timeInput) ?? 0,
          endMinutes: parseTimeMinutes(booking.endTime) ?? 0,
        })),
      ...weekBlocks
        .filter((block) => block.dateInput === dateInput)
        .map((block) => ({ startMinutes: block.startMinutes, endMinutes: block.endMinutes })),
    ];
    const start = resolveManualBookingHourStart(clickedMinute, startMinutes, endMinutes, occupiedIntervals);
    if (start !== null) onCreateManualBookingAt(dateInput, formatGridTime(start));
  }

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  function shiftWeek(offset: number) {
    const nextDate = addDays(selectedDate, offset * 7);
    onSelectedDateChange(nextDate);
  }

  function resolveMoveTarget(
    booking: AdminWeekCalendarBooking,
    targetDate: string,
    desiredStartMinutes: number,
  ) {
    const durationMinutes = getBookingDurationMinutes(booking);
    if (durationMinutes <= 0) return null;

    const targetStartMinutes = resolveNonOverlappingStart(
      booking,
      targetDate,
      desiredStartMinutes,
      durationMinutes,
      blockingBookings,
      weekBlocks,
    );
    if (targetStartMinutes === null) return null;

    const targetEndMinutes = targetStartMinutes + durationMinutes;
    if (targetEndMinutes > calendarEndMinutes) return null;

    return {
      targetDate,
      targetStartMinutes,
      timeInput: minutesToTime(targetStartMinutes),
      endTime: minutesToTime(targetEndMinutes),
    };
  }

  function resolveExceptionMove(
    block: AdminWeekCalendarBlock,
    targetDate: string,
    desiredStartMinutes: number,
  ) {
    const durationMinutes = Math.max(1, block.endMinutes - block.startMinutes);
    const targetStartMinutes = resolveNonOverlappingBlockStart(
      block,
      targetDate,
      desiredStartMinutes,
      durationMinutes,
      blockingBookings,
      weekBlocks,
    );
    if (targetStartMinutes === null) return null;

    const targetEndMinutes = targetStartMinutes + durationMinutes;
    if (targetEndMinutes > endMinutes) return null;

    return {
      targetDate,
      targetStartMinutes,
      startTime: minutesToTime(targetStartMinutes),
      endTime: minutesToTime(targetEndMinutes),
    };
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!event.over) return;

    const target = parseSlotDropId(String(event.over.id));
    if (!target) return;

    const desiredStartMinutes = parseTimeMinutes(target.timeInput);
    if (desiredStartMinutes === null) return;

    const activeId = String(event.active.id);
    const blockId = parseBlockDragId(activeId);
    if (blockId !== null) {
      const block = weekBlocks.find((candidate) => candidate.id === blockId);
      if (!block || block.kind !== "blocked") return;

      const resolved = resolveExceptionMove(block, target.dateInput, desiredStartMinutes);
      if (!resolved) return;
      if (
        block.dateInput === resolved.targetDate
        && block.startMinutes === resolved.targetStartMinutes
      ) {
        return;
      }

      onSelectedDateChange(resolved.targetDate);
      void onMoveException(block, resolved.targetDate, resolved.startTime, resolved.endTime);
      return;
    }

    const bookingId = parseBookingDragId(activeId);
    if (bookingId === null) return;

    const booking = bookings.find((candidate) => candidate.id === bookingId);
    if (!booking) return;

    const resolved = resolveMoveTarget(booking, target.dateInput, desiredStartMinutes);
    if (!resolved) return;
    if (booking.dateInput === resolved.targetDate && booking.timeInput === resolved.timeInput) return;

    onSelectedDateChange(resolved.targetDate);
    void onMoveBooking(booking, resolved.targetDate, resolved.timeInput, resolved.endTime);
  }

  return (
    <DndContext
      sensors={sensors}
      autoScroll={false}
      collisionDetection={pointerWithin}
      onDragEnd={handleDragEnd}
      accessibility={{
        screenReaderInstructions: {
          draggable: "Tartsd lenyomva röviden a foglalást, majd húzd egy másik idősávra.",
        },
      }}
    >
      <section className="min-w-0 rounded-xl bg-admin-surface p-2.5 lg:bg-admin-raised lg:p-3" aria-label="Heti időrácsos foglalási naptár">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-admin-border/70 pb-2.5">
          <div className="flex shrink-0 items-center gap-1.5">
            <button type="button" onClick={() => shiftWeek(-1)} aria-label="Előző hét" className={navigationButtonClass}>
              ‹
            </button>
            <button
              type="button"
              onClick={() => onSelectedDateChange(getBudapestClock(new Date()).dateInput)}
              className="min-h-8 rounded-lg border border-admin-border bg-admin-field px-2.5 text-[0.64rem] font-bold text-admin-accent hover:border-admin-accent focus-visible:outline-2 focus-visible:outline-admin-accent"
            >
              Ma
            </button>
            <button type="button" onClick={() => shiftWeek(1)} aria-label="Következő hét" className={navigationButtonClass}>
              ›
            </button>
          </div>
          <div className="ml-auto min-w-0 max-w-full text-right">
            <AdminWeekPicker selectedDate={selectedDate} weekStart={weekStart} weekEnd={weekEnd} today={currentClock.dateInput} onSelect={onSelectedDateChange} />
            <p className="mt-0.5 text-[0.58rem] text-ink-muted">{weekBookings.length} foglalás ezen a héten</p>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[0.56rem] font-semibold text-ink-muted" aria-label="Naptár jelmagyarázata">
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-sm border border-admin-lashes/70 bg-admin-lashes/35" aria-hidden="true" />
            Köröm
          </span>
          {weekBookings.some((booking) => booking.trackId === "mixed") ? (
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-sm border border-admin-accent/70 bg-admin-accent/35" aria-hidden="true" />
              Pilla + lézer
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-sm border border-admin-blocked/70 bg-admin-blocked/35" aria-hidden="true" />
            Kieső idő
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2 rounded-sm border border-admin-border bg-admin-weekend" aria-hidden="true" />
            Hétvége
          </span>
          <span className="ml-auto text-[0.56rem]">
            <span className="sm:hidden">Két ujjal nagyíts · hosszan nyomva húzd</span>
            <span className="hidden sm:inline">Hosszan nyomva húzd</span>
          </span>
        </div>

        {weekNotes.length ? (
          <div className="mt-2 grid gap-1.5" aria-label="Heti emlékeztetők">
            {weekNotes.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => onOpenException(note.id)}
                className="w-full rounded-lg border border-gold-line bg-gold-soft px-3 py-2 text-left text-xs text-ink focus-visible:outline-2 focus-visible:outline-gold-dark"
              >
                <span className="block text-[0.62rem] font-extrabold text-gold-dark">{note.startDate} · Emlékeztető</span>
                <span className="mt-1 block whitespace-pre-wrap break-words font-semibold">{note.title}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div key={`mobile-${weekStart}`} className={`mt-2 sm:hidden ${styles.screenSlide}`} data-slide={slideDirection ?? undefined}>
          <AdminWeekCalendarMobile
            dates={weekDays}
            bookings={weekBookings}
            blocks={weekBlocks}
            startMinutes={startMinutes}
            endMinutes={endMinutes}
            hourMarks={hourMarks}
            slotIntervalMinutes={intervalMinutes}
            pixelsPerMinute={pixelsPerMinute}
            onPixelsPerMinuteChange={setPixelsPerMinute}
            currentClock={currentClock}
            movingBookingId={movingBookingId}
            statusLabels={bookingStatusLabels}
            statusCardClasses={statusCardClasses}
            trackCardClasses={trackCardClasses}
            resolveMove={resolveMoveTarget}
            onSelectedDateChange={onSelectedDateChange}
            onOpenBooking={onOpenBooking}
            onOpenException={onOpenException}
            onCreateManualBookingAtMinute={openManualBookingAtHour}
            resolveBlockMove={resolveExceptionMove}
            onMoveBlock={onMoveException}
            onMoveBooking={onMoveBooking}
          />
        </div>

        <div key={`desktop-${weekStart}`} className={`mt-2 hidden sm:block ${styles.screenSlide}`} data-slide={slideDirection ?? undefined}>
          <TimeGrid
            dates={weekDays}
            bookings={weekBookings}
            blocks={weekBlocks}
            slots={slots}
            hourMarks={hourMarks}
            startMinutes={startMinutes}
            endMinutes={endMinutes}
            gridHeight={gridHeight}
            pixelsPerMinute={pixelsPerMinute}
            currentClock={currentClock}
            movingBookingId={movingBookingId}
            trackCardClasses={trackCardClasses}
            onOpenBooking={onOpenBooking}
            onOpenException={onOpenException}
            onCreateManualBookingAtMinute={openManualBookingAtHour}
          />
        </div>
      </section>
    </DndContext>
  );
}

function TimeGrid({
  dates,
  bookings,
  blocks,
  slots,
  hourMarks,
  startMinutes,
  endMinutes,
  gridHeight,
  pixelsPerMinute,
  currentClock,
  movingBookingId,
  trackCardClasses,
  onOpenBooking,
  onOpenException,
  onCreateManualBookingAtMinute,
}: {
  dates: string[];
  bookings: AdminWeekCalendarBooking[];
  blocks: AdminWeekCalendarBlock[];
  slots: string[];
  hourMarks: number[];
  startMinutes: number;
  endMinutes: number;
  gridHeight: number;
  pixelsPerMinute: number;
  currentClock: { dateInput: string; minutes: number };
  movingBookingId: number | null;
  trackCardClasses: Record<AdminWeekCalendarBooking["trackId"], string>;
  onOpenBooking: (id: number) => void;
  onOpenException: (id: string) => void;
  onCreateManualBookingAtMinute: (date: string, minute: number) => void;
}) {
  const columns = `3.25rem repeat(${dates.length}, minmax(0, 1fr))`;
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [columnWidth, setColumnWidth] = useState(0);
  const currentDayIndex = dates.indexOf(currentClock.dateInput);
  const showCurrentTimeLine = currentDayIndex >= 0
    && currentClock.minutes >= startMinutes
    && currentClock.minutes <= endMinutes;

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const observer = new ResizeObserver(() => {
      const dayColumn = grid.querySelector<HTMLElement>("[data-week-day-column]");
      setColumnWidth(dayColumn?.offsetWidth ?? 0);
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, [dates.length]);

  return (
    <div className="relative min-w-0 rounded-lg border border-admin-border bg-admin-field [touch-action:pan-y]">
      <div
        data-week-day-header
        className="sticky top-0 z-30 grid border-b border-admin-border/70 bg-admin-surface shadow-[0_5px_12px_rgba(0,0,0,0.18)]"
        style={{ gridTemplateColumns: columns }}
      >
        <div className="border-r border-admin-border/70" aria-hidden="true" />
        {dates.map((dateInput) => (
          <div
            key={dateInput}
            className={`min-w-0 border-r border-admin-border/70 px-1.5 py-2 text-center last:border-r-0 ${isWeekend(dateInput) ? "bg-admin-weekend" : ""}`}
          >
            <p className="text-[0.54rem] font-bold uppercase tracking-[0.06em] text-ink-muted">{formatWeekdayLong(dateInput)}</p>
            <p className="mt-0.5 truncate text-[0.68rem] font-extrabold text-ink">{formatDayHeading(dateInput)}</p>
          </div>
        ))}
      </div>

      <div ref={gridRef} className="relative grid" style={{ gridTemplateColumns: columns }}>
        {showCurrentTimeLine ? (
          <div
            className="pointer-events-none absolute right-0 z-20 h-px bg-admin-danger"
            style={{
              top: (currentClock.minutes - startMinutes) * pixelsPerMinute,
              left: "3.25rem",
            }}
            aria-label="Aktuális idő"
          >
            <span
              className="absolute top-1/2 z-30 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-admin-field bg-admin-danger shadow-sm"
              style={{
                left: `${((currentDayIndex + 0.5) / dates.length) * 100}%`,
              }}
              aria-label="Aktuális nap"
            />
          </div>
        ) : null}

        <div className="relative border-r border-admin-border/70 bg-admin-surface" style={{ height: gridHeight }}>
          {hourMarks.map((minute) => (
            <span
              key={minute}
              className="absolute right-1.5 -translate-y-1/2 text-[0.52rem] font-semibold text-ink-muted"
              style={{ top: (minute - startMinutes) * pixelsPerMinute }}
            >
              {formatGridTime(minute)}
            </span>
          ))}
        </div>

        {dates.map((dateInput) => {
          const dayBookings = bookings.filter((booking) => booking.dateInput === dateInput);
          const dayBlocks = blocks.filter((block) => block.dateInput === dateInput);
          const weekend = isWeekend(dateInput);

          return (
            <div
              key={dateInput}
              data-week-day-column={dateInput}
              className={`relative min-w-0 border-r border-admin-border/70 last:border-r-0 ${weekend ? "bg-admin-weekend" : "bg-admin-field"}`}
              style={{ height: gridHeight }}
              onClick={(event) => {
                if (event.target instanceof Element && event.target.closest(".admin-week-booking, [data-week-exception]")) return;
                const minute = startMinutes + (event.clientY - event.currentTarget.getBoundingClientRect().top) / pixelsPerMinute;
                onCreateManualBookingAtMinute(dateInput, minute);
              }}
            >
              {hourMarks.map((minute) => (
                <span
                  key={minute}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 border-t border-admin-border/55"
                  style={{ top: (minute - startMinutes) * pixelsPerMinute }}
                />
              ))}

              {dayBlocks.map((block) => (
                <WeekBlockedBlock
                  key={block.id}
                  block={block}
                  startMinutes={startMinutes}
                  pixelsPerMinute={pixelsPerMinute}
                  columnWidth={columnWidth}
                  slotIntervalMinutes={slots.length > 1
                    ? Math.max(5, (parseTimeMinutes(slots[1]) ?? 0) - (parseTimeMinutes(slots[0]) ?? 0))
                    : 30}
                  onOpenException={onOpenException}
                />
              ))}

              {slots.map((timeInput) => (
                <WeekDropSlot
                  key={timeInput}
                  dateInput={dateInput}
                  timeInput={timeInput}
                  startMinutes={startMinutes}
                  pixelsPerMinute={pixelsPerMinute}
                  slotMinutes={slots.length > 1
                    ? Math.max(5, (parseTimeMinutes(slots[1]) ?? 0) - (parseTimeMinutes(slots[0]) ?? 0))
                    : 30}
                />
              ))}

              {dayBookings.map((booking) => (
                <WeekBookingBlock
                  key={booking.id}
                  booking={booking}
                  startMinutes={startMinutes}
                  pixelsPerMinute={pixelsPerMinute}
                  columnWidth={columnWidth}
                  slotIntervalMinutes={slots.length > 1
                    ? Math.max(5, (parseTimeMinutes(slots[1]) ?? 0) - (parseTimeMinutes(slots[0]) ?? 0))
                    : 30}
                  moving={movingBookingId === booking.id}
                  trackCardClasses={trackCardClasses}
                  onOpenBooking={onOpenBooking}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekBlockedBlock({
  block,
  startMinutes,
  pixelsPerMinute,
  columnWidth,
  slotIntervalMinutes,
  onOpenException,
}: {
  block: AdminWeekCalendarBlock;
  startMinutes: number;
  pixelsPerMinute: number;
  columnWidth: number;
  slotIntervalMinutes: number;
  onOpenException: (id: string) => void;
}) {
  const canMove = block.kind === "blocked";
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: makeBlockDragId(block.id),
    disabled: !canMove,
    data: { exceptionId: block.exceptionId },
  });
  const top = (block.startMinutes - startMinutes) * pixelsPerMinute;
  const height = Math.max((block.endMinutes - block.startMinutes) * pixelsPerMinute, 18);
  const snapPixels = Math.max(1, slotIntervalMinutes * pixelsPerMinute);
  const translatedX = transform
    ? (columnWidth ? Math.round(transform.x / columnWidth) * columnWidth : transform.x)
    : 0;
  const translatedY = transform
    ? Math.round(transform.y / snapPixels) * snapPixels
    : 0;
  const transformStyle = transform
    ? `translate3d(${translatedX}px, ${translatedY}px, 0)`
    : undefined;
  const trackClass = block.track === "lashes"
    ? "left-1 right-[51%]"
    : block.track === "laser"
      ? "left-[51%] right-1"
      : "left-1 right-1";

  return (
    <article
      ref={setNodeRef}
      {...(canMove ? attributes : {})}
      {...(canMove ? listeners : {})}
      className={`absolute z-[5] overflow-hidden rounded-md border text-[0.48rem] font-bold leading-3 text-ink shadow-sm ${block.kind === "training" ? "border-admin-accent/70 bg-admin-accent/20" : block.kind === "personal" ? "border-gold-line bg-gold-soft" : "border-admin-blocked/70 bg-admin-blocked/20"} ${trackClass} ${canMove ? "cursor-grab active:cursor-grabbing" : ""} ${isDragging ? "z-40 ring-2 ring-admin-blocked/80" : ""}`}
      style={{ top, height, transform: transformStyle, touchAction: canMove ? "none" : undefined } as CSSProperties}
      data-week-exception={block.exceptionId}
      data-training-calendar={block.kind === "training" ? block.id : undefined}
    >
      <button
        type="button"
        onClick={(event) => {
          if (isDragging) {
            event.preventDefault();
            return;
          }
          onOpenException(block.exceptionId);
        }}
        className="block h-full w-full min-w-0 px-1 py-0.5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-admin-blocked"
        aria-label={`${block.title || "Kieső idő"}, ${minutesToTime(block.startMinutes)}–${minutesToTime(block.endMinutes)}${block.confirmedNames?.length ? `, ${block.confirmedNames.join(", ")}` : ""}`}
        title={block.confirmedNames?.join(", ") || undefined}
      >
        <span className="block truncate">{block.title || (block.kind === "vacation" ? "Szabadság" : block.kind === "personal" ? "Emlékeztető" : "Kieső idő")}</span>
        {block.confirmedNames?.length ? (
          <span className="block break-words font-semibold" data-training-participants>{block.confirmedNames.join(", ")}</span>
        ) : null}
        {height >= 34 ? (
          <span className="block truncate text-[0.44rem] font-semibold text-ink-muted">
            {block.kind === "training" ? `${minutesToTime(block.startMinutes)}–${minutesToTime(block.endMinutes)}` : block.track === "lashes" ? "Szempilla" : block.track === "laser" ? "Lézer" : "Mindkettő"}
          </span>
        ) : null}
      </button>
    </article>
  );
}

function WeekDropSlot({
  dateInput,
  timeInput,
  startMinutes,
  slotMinutes,
  pixelsPerMinute,
}: {
  dateInput: string;
  timeInput: string;
  startMinutes: number;
  slotMinutes: number;
  pixelsPerMinute: number;
}) {
  const id = makeSlotDropId(dateInput, timeInput);
  const { setNodeRef } = useDroppable({ id });
  const minute = parseTimeMinutes(timeInput) ?? startMinutes;

  return (
    <div
      ref={setNodeRef}
      className="absolute inset-x-0 z-0 border-t border-transparent"
      style={{
        top: (minute - startMinutes) * pixelsPerMinute,
        height: Math.max(slotMinutes * pixelsPerMinute, 8),
      }}
      aria-hidden="true"
    />
  );
}

function WeekBookingBlock({
  booking,
  startMinutes,
  pixelsPerMinute,
  columnWidth,
  slotIntervalMinutes,
  moving,
  trackCardClasses,
  onOpenBooking,
}: {
  booking: AdminWeekCalendarBooking;
  startMinutes: number;
  pixelsPerMinute: number;
  columnWidth: number;
  slotIntervalMinutes: number;
  moving: boolean;
  trackCardClasses: Record<AdminWeekCalendarBooking["trackId"], string>;
  onOpenBooking: (id: number) => void;
}) {
  // Movement eligibility is prepared by the admin workspace and deliberately
  // does not depend on booking source: manual and online appointments behave
  // identically in the weekly calendar.
  const canMove = booking.movable && !moving;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: makeBookingDragId(booking.id),
    disabled: !canMove,
    data: { bookingId: booking.id },
  });
  const start = parseTimeMinutes(booking.timeInput) ?? startMinutes;
  const duration = Math.max(1, getBookingDurationMinutes(booking));
  const top = (start - startMinutes) * pixelsPerMinute;
  const height = Math.max(duration * pixelsPerMinute, 22);
  const snapPixels = Math.max(1, slotIntervalMinutes * pixelsPerMinute);
  const translatedX = transform
    ? (columnWidth ? Math.round(transform.x / columnWidth) * columnWidth : transform.x)
    : 0;
  const translatedY = transform
    ? Math.round(transform.y / snapPixels) * snapPixels
    : 0;

  const transformStyle = transform
    ? `translate3d(${translatedX}px, ${translatedY}px, 0)`
    : undefined;

  useEffect(() => {
    if (!isDragging) return;
    navigator.vibrate?.(12);
  }, [isDragging]);

  return (
    <article
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`admin-week-booking absolute left-1 right-1 overflow-hidden rounded-md border shadow-sm transition-[border-color,box-shadow] duration-100 ${canMove ? "cursor-grab active:cursor-grabbing" : ""} ${trackCardClasses[booking.trackId]} ${statusCardClasses[booking.status]} ${booking.pendingMove ? "ring-2 ring-inset ring-admin-accent/80" : ""} ${isDragging ? "z-40 border-admin-accent ring-2 ring-admin-accent/80" : "z-10"}`}
      style={{ top, height, transform: transformStyle, touchAction: canMove ? "none" : undefined } as CSSProperties}
      data-status={booking.status}
      data-track={booking.trackId}
      data-source={booking.source}
      data-week-drag-card={canMove || undefined}
    >
      <button
        type="button"
        onClick={(event) => {
          if (isDragging) {
            event.preventDefault();
            return;
          }
          onOpenBooking(booking.id);
        }}
        className="block h-full w-full min-w-0 px-1.5 py-1 pr-6 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-admin-accent"
        aria-label={`${booking.guestName}, ${booking.timeInput}–${booking.endTime}, ${bookingStatusLabels[booking.status]}`}
      >
        <span className="block truncate text-[0.6rem] font-extrabold leading-3 text-ink">{booking.guestName}</span>
        {height >= 34 ? (
          <span className="mt-0.5 block truncate text-[0.52rem] leading-3 text-ink-muted">{booking.serviceLabel}</span>
        ) : null}
        {height >= 48 ? (
          <span className="mt-0.5 block text-[0.5rem] font-semibold leading-3 text-ink-muted">{booking.timeInput}–{booking.endTime}</span>
        ) : null}
      </button>

      {booking.pendingMove ? (
        <span
          className="pointer-events-none absolute bottom-1 right-1 z-30 rounded bg-admin-bg/85 px-1 py-0.5 text-[0.42rem] font-extrabold uppercase tracking-[0.04em] text-admin-accent"
          aria-label="Mentésre váró áthelyezés"
        >
          {height >= 34 ? "Mentésre vár" : "!"}
        </span>
      ) : null}
    </article>
  );
}

function clampSlotInterval(value: number) {
  if (!Number.isFinite(value)) return 30;
  return Math.min(60, Math.max(5, Math.round(value / 5) * 5));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildSlots(startMinutes: number, endMinutes: number, intervalMinutes: number) {
  const slots: string[] = [];
  for (let minute = startMinutes; minute < endMinutes; minute += intervalMinutes) slots.push(minutesToTime(minute));
  return slots;
}

function buildHourMarks(startMinutes: number, endMinutes: number) {
  const firstHour = Math.ceil(startMinutes / 60) * 60;
  const marks: number[] = [];
  for (let minute = firstHour; minute <= endMinutes; minute += 60) marks.push(minute);
  return marks;
}

function parseTimeMinutes(value: string) {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours === 24 && minutes === 0) return 24 * 60;
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function formatGridTime(minutes: number) {
  return minutes === 24 * 60 ? "24:00" : minutesToTime(minutes);
}

function minutesToTime(minutes: number) {
  const safe = Math.max(0, Math.min(24 * 60 - 1, minutes));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function getBookingDurationMinutes(booking: Pick<AdminWeekCalendarBooking, "timeInput" | "endTime" | "startsAt" | "endsAt">) {
  const start = parseTimeMinutes(booking.timeInput);
  const end = parseTimeMinutes(booking.endTime);
  if (start !== null && end !== null && end > start) return end - start;
  return Math.max(1, Math.round((Date.parse(booking.endsAt) - Date.parse(booking.startsAt)) / 60_000));
}

function resolveNonOverlappingStart(
  booking: AdminWeekCalendarBooking,
  targetDate: string,
  desiredStart: number,
  duration: number,
  blockingBookings: AdminWeekCalendarBooking[],
  blockingIntervals: AdminWeekCalendarBlock[],
) {
  const maxStart = Math.max(calendarStartMinutes, calendarEndMinutes - duration);
  const desired = clamp(desiredStart, calendarStartMinutes, maxStart);
  const bookingBlockers = blockingBookings
    .filter((other) =>
      other.id !== booking.id
      && other.dateInput === targetDate
      && (other.status === "new" || other.status === "confirmed"),
    )
    .map((other) => ({
      start: parseTimeMinutes(other.timeInput) ?? 0,
      end: parseTimeMinutes(other.endTime) ?? 0,
    }));

  const exceptionBlockers = blockingIntervals
    .filter((block) =>
      block.dateInput === targetDate
      && tracksOverlap(block.track, booking.trackId),
    )
    .map((block) => ({ start: block.startMinutes, end: block.endMinutes }));

  const blockers = [...bookingBlockers, ...exceptionBlockers]
    .filter((other) => other.end > other.start)
    .sort((left, right) => left.start - right.start);

  function isFree(start: number) {
    if (start < calendarStartMinutes || start > maxStart) return false;
    const end = start + duration;
    return blockers.every((other) => end <= other.start || start >= other.end);
  }

  if (isFree(desired)) return desired;

  const candidates = new Set<number>([calendarStartMinutes, maxStart]);
  for (const blocker of blockers) {
    candidates.add(blocker.start - duration);
    candidates.add(blocker.end);
  }

  const valid = [...candidates]
    .filter(isFree)
    .sort((left, right) => {
      const leftDistance = Math.abs(left - desired);
      const rightDistance = Math.abs(right - desired);
      if (leftDistance !== rightDistance) return leftDistance - rightDistance;
      return left - right;
    });

  return valid[0] ?? null;
}

function tracksOverlap(
  left: AdminWeekCalendarBlock["track"],
  right: AdminWeekCalendarBlock["track"] | AdminWeekCalendarBooking["trackId"],
) {
  return left === "all" || right === "all" || right === "mixed" || left === right;
}

function resolveNonOverlappingBlockStart(
  block: AdminWeekCalendarBlock,
  targetDate: string,
  desiredStart: number,
  duration: number,
  blockingBookings: AdminWeekCalendarBooking[],
  blockingIntervals: AdminWeekCalendarBlock[],
) {
  const maxStart = Math.max(calendarStartMinutes, calendarEndMinutes - duration);
  const desired = clamp(desiredStart, calendarStartMinutes, maxStart);

  const bookingBlockers = blockingBookings
    .filter((booking) =>
      booking.dateInput === targetDate
      && (booking.status === "new" || booking.status === "confirmed")
      && tracksOverlap(block.track, booking.trackId),
    )
    .map((booking) => ({
      start: parseTimeMinutes(booking.timeInput) ?? 0,
      end: parseTimeMinutes(booking.endTime) ?? 0,
    }));

  const exceptionBlockers = blockingIntervals
    .filter((other) =>
      other.exceptionId !== block.exceptionId
      && other.dateInput === targetDate
      && tracksOverlap(block.track, other.track),
    )
    .map((other) => ({
      start: other.startMinutes,
      end: other.endMinutes,
    }));

  const blockers = [...bookingBlockers, ...exceptionBlockers]
    .filter((other) => other.end > other.start)
    .sort((left, right) => left.start - right.start);

  function isFree(start: number) {
    if (start < calendarStartMinutes || start > maxStart) return false;
    const end = start + duration;
    return blockers.every((other) => end <= other.start || start >= other.end);
  }

  if (isFree(desired)) return desired;

  const candidates = new Set<number>([calendarStartMinutes, maxStart]);
  for (const blocker of blockers) {
    candidates.add(blocker.start - duration);
    candidates.add(blocker.end);
  }

  const valid = [...candidates]
    .filter(isFree)
    .sort((left, right) => {
      const leftDistance = Math.abs(left - desired);
      const rightDistance = Math.abs(right - desired);
      if (leftDistance !== rightDistance) return leftDistance - rightDistance;
      return left - right;
    });

  return valid[0] ?? null;
}

function makeBlockDragId(id: string) {
  return `block:${id}`;
}

function parseBlockDragId(value: string) {
  return value.startsWith("block:") ? value.slice("block:".length) : null;
}

function makeBookingDragId(id: number) {
  return `booking:${id}`;
}

function parseBookingDragId(value: string) {
  if (!value.startsWith("booking:")) return null;
  const id = Number(value.slice("booking:".length));
  return Number.isInteger(id) ? id : null;
}

function makeSlotDropId(dateInput: string, timeInput: string) {
  return `slot:${dateInput}:${timeInput}`;
}

function parseSlotDropId(value: string) {
  const match = /^slot:(\d{4}-\d{2}-\d{2}):(\d{2}:\d{2})$/.exec(value);
  return match ? { dateInput: match[1], timeInput: match[2] } : null;
}

function buildWeekBlocks(
  exceptions: AdminWeekCalendarException[],
  dates: string[],
  startMinutes: number,
  endMinutes: number,
) {
  const blocks: AdminWeekCalendarBlock[] = [];

  for (const exception of exceptions) {
    if (exception.kind === "custom-hours" || exception.kind === "personal") continue;

    for (const dateInput of dates) {
      if (dateInput < exception.startDate || dateInput > exception.endDate) continue;

      const rawStart = exception.kind === "vacation"
        ? startMinutes
        : parseTimeMinutes(exception.startTime ?? "") ?? startMinutes;
      const rawEnd = exception.kind === "vacation"
        ? endMinutes
        : parseTimeMinutes(exception.endTime ?? "") ?? endMinutes;
      const blockStart = clamp(rawStart, startMinutes, endMinutes);
      const blockEnd = clamp(rawEnd, startMinutes, endMinutes);
      if (blockEnd <= blockStart) continue;

      blocks.push({
        id: `${exception.id}:${dateInput}`,
        exceptionId: exception.id,
        dateInput,
        title: exception.title,
        kind: exception.kind,
        track: exception.track,
        startMinutes: blockStart,
        endMinutes: blockEnd,
      });
    }
  }

  return blocks;
}

function isWeekend(dateInput: string) {
  const day = parseDateInput(dateInput).getUTCDay();
  return day === 0 || day === 6;
}

function startOfWeek(dateInput: string) {
  const date = parseDateInput(dateInput);
  const mondayOffset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - mondayOffset);
  return formatUtcDateInput(date);
}

function addDays(dateInput: string, amount: number) {
  const date = parseDateInput(dateInput);
  date.setUTCDate(date.getUTCDate() + amount);
  return formatUtcDateInput(date);
}

function parseDateInput(dateInput: string) {
  const [year = 1970, month = 1, day = 1] = dateInput.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatUtcDateInput(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function formatWeekdayLong(dateInput: string) {
  return new Intl.DateTimeFormat("hu-HU", { weekday: "long", timeZone: "UTC" }).format(parseDateInput(dateInput));
}

function formatDayHeading(dateInput: string) {
  return new Intl.DateTimeFormat("hu-HU", { month: "short", day: "numeric", timeZone: "UTC" }).format(parseDateInput(dateInput));
}

function getBudapestClock(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const hours = Number(values.hour ?? "0");
  const minutes = Number(values.minute ?? "0");
  return {
    dateInput: `${values.year}-${values.month}-${values.day}`,
    minutes: hours * 60 + minutes,
  };
}
