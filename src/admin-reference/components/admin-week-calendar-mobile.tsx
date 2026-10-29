"use client";

import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { flushSync } from "react-dom";

import type {
  AdminWeekCalendarBlock,
  AdminWeekCalendarBooking,
  AdminWeekCalendarStatus,
} from "./admin-week-calendar";

type ResolvedMoveTarget = {
  targetDate: string;
  targetStartMinutes: number;
  timeInput: string;
  endTime: string;
};

type ResolvedBlockMoveTarget = {
  targetDate: string;
  targetStartMinutes: number;
  startTime: string;
  endTime: string;
};

type AdminWeekCalendarMobileProps = {
  dates: string[];
  bookings: AdminWeekCalendarBooking[];
  blocks: AdminWeekCalendarBlock[];
  startMinutes: number;
  endMinutes: number;
  hourMarks: number[];
  slotIntervalMinutes: number;
  pixelsPerMinute: number;
  onPixelsPerMinuteChange: (value: number) => void;
  currentClock: { dateInput: string; minutes: number };
  movingBookingId: number | null;
  statusLabels: Record<AdminWeekCalendarStatus, string>;
  statusCardClasses: Record<AdminWeekCalendarStatus, string>;
  trackCardClasses: Record<AdminWeekCalendarBooking["trackId"], string>;
  resolveMove: (
    booking: AdminWeekCalendarBooking,
    targetDate: string,
    desiredStartMinutes: number,
  ) => ResolvedMoveTarget | null;
  onSelectedDateChange: (dateInput: string) => void;
  onOpenBooking: (id: number) => void;
  onOpenException: (id: string) => void;
  onCreateManualBookingAtMinute: (date: string, minute: number) => void;
  resolveBlockMove: (
    block: AdminWeekCalendarBlock,
    targetDate: string,
    desiredStartMinutes: number,
  ) => ResolvedBlockMoveTarget | null;
  onMoveBlock: (
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

type DragPreview =
  | ({ kind: "booking"; bookingId: number } & ResolvedMoveTarget)
  | ({ kind: "block"; blockId: string } & ResolvedBlockMoveTarget);

type DragSubject =
  | { kind: "booking"; id: number }
  | { kind: "block"; id: string };

type DragState = {
  touchIdentifier: number;
  subject: DragSubject;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  grabOffsetMinutes: number;
  grabOffsetY: number;
  cardScreenHeight: number;
  active: boolean;
  holdTimer: ReturnType<typeof setTimeout> | null;
};

// Snug mobile day rail: just wide enough for the longest Hungarian short month label ("Szept.") plus compact padding.
const dayLabelWidth = 42;
const dayRowHeight = 52;
const timeHeaderHeight = 40;
const minPixelsPerMinute = 0.7;
const maxPixelsPerMinute = 2.4;
const dragActivationMs = 350;
const dragMoveTolerance = 10;

export function AdminWeekCalendarMobile(props: AdminWeekCalendarMobileProps) {
  const livePropsRef = useRef(props);
  useLayoutEffect(() => {
    livePropsRef.current = props;
  });

  const stageRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const edgeDirectionRef = useRef(0);
  const edgeFrameRef = useRef(0);
  const pinchRef = useRef<{
    startDistance: number;
    startScale: number;
    focusMinute: number;
  } | null>(null);
  const zoomFrameRef = useRef(0);
  const pendingScaleRef = useRef<number | null>(null);
  const pendingFocusRef = useRef<{ focusMinute: number; centerX: number } | null>(null);
  const initializedWeekRef = useRef<string | null>(null);
  const suppressClickUntilRef = useRef(0);
  const emptyTapRef = useRef<{
    identifier: number;
    startX: number;
    startY: number;
    startScrollLeft: number;
    moved: boolean;
  } | null>(null);

  const timelineWidth = (props.endMinutes - props.startMinutes) * props.pixelsPerMinute;
  const contentWidth = dayLabelWidth + timelineWidth;
  const weekKey = props.dates[0] ?? "";

  function getMinuteAtClientX(clientX: number) {
    const scroller = scrollerRef.current;
    if (!scroller) return null;

    const bounds = scroller.getBoundingClientRect();
    const contentX = scroller.scrollLeft + clientX - bounds.left - dayLabelWidth;
    const live = livePropsRef.current;
    return clamp(
      live.startMinutes + contentX / live.pixelsPerMinute,
      live.startMinutes,
      live.endMinutes,
    );
  }

  function getPointerTarget(
    clientX: number,
    clientY: number,
    drag: Pick<DragState, "grabOffsetMinutes" | "grabOffsetY" | "cardScreenHeight">,
  ) {
    const stage = stageRef.current;
    if (!stage) return null;

    const stageBounds = stage.getBoundingClientRect();
    if (
      clientX < stageBounds.left
      || clientX > stageBounds.right
      || clientY < stageBounds.top
      || clientY > stageBounds.bottom
    ) {
      return null;
    }

    const adjustedCenterY = clientY - drag.grabOffsetY + drag.cardScreenHeight / 2;
    const dayRows = [...stage.querySelectorAll<HTMLElement>("[data-mobile-calendar-day]")];
    const targetRow = dayRows.find((row) => {
      const bounds = row.getBoundingClientRect();
      return adjustedCenterY >= bounds.top && adjustedCenterY <= bounds.bottom;
    });
    const targetDate = targetRow?.dataset.mobileCalendarDay;
    if (!targetDate) return null;

    const pointerMinute = getMinuteAtClientX(clientX);
    if (pointerMinute === null) return null;

    const live = livePropsRef.current;
    const rawStart = pointerMinute - drag.grabOffsetMinutes;
    const desiredStart = Math.round(rawStart / live.slotIntervalMinutes) * live.slotIntervalMinutes;
    return { targetDate, desiredStart };
  }

  function getBookingMoveTarget(
    booking: AdminWeekCalendarBooking,
    clientX: number,
    clientY: number,
    drag: Pick<DragState, "grabOffsetMinutes" | "grabOffsetY" | "cardScreenHeight">,
  ): DragPreview | null {
    const pointer = getPointerTarget(clientX, clientY, drag);
    if (!pointer) return null;

    const resolved = livePropsRef.current.resolveMove(
      booking,
      pointer.targetDate,
      pointer.desiredStart,
    );
    if (!resolved) return null;

    return {
      kind: "booking",
      bookingId: booking.id,
      ...resolved,
    };
  }

  function getBlockMoveTarget(
    block: AdminWeekCalendarBlock,
    clientX: number,
    clientY: number,
    drag: Pick<DragState, "grabOffsetMinutes" | "grabOffsetY" | "cardScreenHeight">,
  ): DragPreview | null {
    const pointer = getPointerTarget(clientX, clientY, drag);
    if (!pointer) return null;

    const resolved = livePropsRef.current.resolveBlockMove(
      block,
      pointer.targetDate,
      pointer.desiredStart,
    );
    if (!resolved) return null;

    return {
      kind: "block",
      blockId: block.id,
      ...resolved,
    };
  }

  function stopEdgeScroll() {
    edgeDirectionRef.current = 0;
    if (edgeFrameRef.current) {
      window.cancelAnimationFrame(edgeFrameRef.current);
      edgeFrameRef.current = 0;
    }
  }

  function syncDragPreview() {
    const drag = dragRef.current;
    if (!drag?.active) return;

    if (drag.subject.kind === "booking") {
      const booking = livePropsRef.current.bookings.find((item) => item.id === drag.subject.id);
      if (!booking) return;
      setDragPreview(getBookingMoveTarget(booking, drag.lastX, drag.lastY, drag));
      return;
    }

    const block = livePropsRef.current.blocks.find((item) => item.id === drag.subject.id);
    if (!block) return;
    setDragPreview(getBlockMoveTarget(block, drag.lastX, drag.lastY, drag));
  }

  function ensureEdgeScroll() {
    if (edgeFrameRef.current) return;

    const tick = () => {
      edgeFrameRef.current = 0;
      const scroller = scrollerRef.current;
      const drag = dragRef.current;
      const direction = edgeDirectionRef.current;
      if (!scroller || !drag?.active || !direction) return;

      const before = scroller.scrollLeft;
      scroller.scrollLeft = clamp(
        before + direction * 8,
        0,
        Math.max(0, scroller.scrollWidth - scroller.clientWidth),
      );
      syncDragPreview();

      if (scroller.scrollLeft !== before) {
        edgeFrameRef.current = window.requestAnimationFrame(tick);
      } else {
        edgeDirectionRef.current = 0;
      }
    };

    edgeFrameRef.current = window.requestAnimationFrame(tick);
  }

  function updateEdgeScroll(clientX: number, clientY: number) {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const bounds = scroller.getBoundingClientRect();
    if (clientY < bounds.top || clientY > bounds.bottom) {
      stopEdgeScroll();
      return;
    }

    const edge = Math.min(52, bounds.width * 0.14);
    const timelineLeft = bounds.left + dayLabelWidth;

    if (clientX <= timelineLeft + edge) {
      edgeDirectionRef.current = -1;
      ensureEdgeScroll();
    } else if (clientX >= bounds.right - edge) {
      edgeDirectionRef.current = 1;
      ensureEdgeScroll();
    } else {
      stopEdgeScroll();
    }
  }

  function cancelDrag() {
    const drag = dragRef.current;
    if (drag?.holdTimer) clearTimeout(drag.holdTimer);
    dragRef.current = null;
    setDragPreview(null);
    stopEdgeScroll();
  }

  const cancelDragEvent = useEffectEvent(cancelDrag);
  const getBookingMoveTargetEvent = useEffectEvent(getBookingMoveTarget);
  const getBlockMoveTargetEvent = useEffectEvent(getBlockMoveTarget);
  const updateEdgeScrollEvent = useEffectEvent(updateEdgeScroll);

  function findTouch(touches: TouchList, identifier: number) {
    for (let index = 0; index < touches.length; index += 1) {
      const touch = touches.item(index);
      if (touch?.identifier === identifier) return touch;
    }
    return null;
  }

  function activateDrag(drag: DragState) {
    dragRef.current = drag;
    drag.holdTimer = setTimeout(() => {
      const current = dragRef.current;
      if (!current || current !== drag) return;
      current.active = true;
      current.holdTimer = null;
      navigator.vibrate?.(12);
      syncDragPreview();
      updateEdgeScroll(current.lastX, current.lastY);
    }, dragActivationMs);
  }

  function startBookingDrag(
    booking: AdminWeekCalendarBooking,
    event: ReactTouchEvent<HTMLButtonElement>,
  ) {
    const live = livePropsRef.current;
    if (!booking.movable || live.movingBookingId === booking.id || event.touches.length !== 1) return;

    const touch = event.touches.item(0);
    if (!touch) return;

    const card = event.currentTarget.closest<HTMLElement>("[data-mobile-booking-card]");
    if (!card) return;

    const pointerMinute = getMinuteAtClientX(touch.clientX);
    const bookingStart = parseTimeMinutes(booking.timeInput) ?? live.startMinutes;
    const duration = getBookingDurationMinutes(booking);
    const bounds = card.getBoundingClientRect();

    activateDrag({
      touchIdentifier: touch.identifier,
      subject: { kind: "booking", id: booking.id },
      startX: touch.clientX,
      startY: touch.clientY,
      lastX: touch.clientX,
      lastY: touch.clientY,
      grabOffsetMinutes: pointerMinute === null
        ? duration
        : clamp(pointerMinute - bookingStart, 0, duration),
      grabOffsetY: clamp(touch.clientY - bounds.top, 0, bounds.height),
      cardScreenHeight: bounds.height,
      active: false,
      holdTimer: null,
    });
  }

  function startBlockDrag(
    block: AdminWeekCalendarBlock,
    event: ReactTouchEvent<HTMLButtonElement>,
  ) {
    if (block.kind !== "blocked" || event.touches.length !== 1) return;

    const touch = event.touches.item(0);
    if (!touch) return;

    const card = event.currentTarget.closest<HTMLElement>("[data-mobile-calendar-block]");
    if (!card) return;

    const pointerMinute = getMinuteAtClientX(touch.clientX);
    const duration = Math.max(1, block.endMinutes - block.startMinutes);
    const bounds = card.getBoundingClientRect();

    activateDrag({
      touchIdentifier: touch.identifier,
      subject: { kind: "block", id: block.id },
      startX: touch.clientX,
      startY: touch.clientY,
      lastX: touch.clientX,
      lastY: touch.clientY,
      grabOffsetMinutes: pointerMinute === null
        ? duration
        : clamp(pointerMinute - block.startMinutes, 0, duration),
      grabOffsetY: clamp(touch.clientY - bounds.top, 0, bounds.height),
      cardScreenHeight: bounds.height,
      active: false,
      holdTimer: null,
    });
  }

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !weekKey || initializedWeekRef.current === weekKey) return;

    const live = livePropsRef.current;
    const currentWeek = live.dates.includes(live.currentClock.dateInput);
    const firstBookingMinute = live.bookings
      .map((booking) => parseTimeMinutes(booking.timeInput))
      .filter((minute): minute is number => minute !== null)
      .sort((left, right) => left - right)[0];
    const targetMinute = currentWeek
      ? live.currentClock.minutes
      : firstBookingMinute ?? 8 * 60;
    const usableViewport = Math.max(0, scroller.clientWidth - dayLabelWidth);
    const targetViewportX = dayLabelWidth + usableViewport * 0.35;
    const targetContentX = dayLabelWidth
      + (targetMinute - live.startMinutes) * live.pixelsPerMinute;

    scroller.scrollLeft = clamp(
      targetContentX - targetViewportX,
      0,
      Math.max(0, scroller.scrollWidth - scroller.clientWidth),
    );
    initializedWeekRef.current = weekKey;
  }, [weekKey]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    function distance(touches: TouchList) {
      const first = touches.item(0);
      const second = touches.item(1);
      if (!first || !second) return 0;
      return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
    }

    function centerX(touches: TouchList) {
      const first = touches.item(0);
      const second = touches.item(1);
      if (!first || !second) return null;
      return (first.clientX + second.clientX) / 2;
    }

    function scheduleZoom(scale: number, focusMinute: number, gestureCenterX: number) {
      pendingScaleRef.current = scale;
      pendingFocusRef.current = { focusMinute, centerX: gestureCenterX };
      if (zoomFrameRef.current) return;

      zoomFrameRef.current = window.requestAnimationFrame(() => {
        zoomFrameRef.current = 0;
        const nextScale = pendingScaleRef.current;
        const pendingFocus = pendingFocusRef.current;
        pendingScaleRef.current = null;
        pendingFocusRef.current = null;
        if (nextScale === null || !pendingFocus) return;

        const live = livePropsRef.current;
        if (Math.abs(nextScale - live.pixelsPerMinute) < 0.002) return;

        // Keep the zoom scale update and its scroll correction in the same
        // animation frame. This prevents Safari from briefly painting the
        // resized timeline at the old scroll position.
        flushSync(() => {
          live.onPixelsPerMinuteChange(nextScale);
        });

        const currentScroller = scrollerRef.current;
        if (!currentScroller) return;

        const bounds = currentScroller.getBoundingClientRect();
        const viewportOffset = pendingFocus.centerX - bounds.left;
        const focusContentX = dayLabelWidth
          + (pendingFocus.focusMinute - live.startMinutes) * nextScale;

        currentScroller.scrollLeft = clamp(
          focusContentX - viewportOffset,
          0,
          Math.max(0, currentScroller.scrollWidth - currentScroller.clientWidth),
        );
      });
    }

    function onTouchStart(event: TouchEvent) {
      if (event.touches.length === 1) {
        const touch = event.touches.item(0);
        emptyTapRef.current = touch ? {
          identifier: touch.identifier,
          startX: touch.clientX,
          startY: touch.clientY,
          startScrollLeft: scroller?.scrollLeft ?? 0,
          moved: false,
        } : null;
        return;
      }
      emptyTapRef.current = null;
      suppressClickUntilRef.current = Date.now() + 450;
      if (event.touches.length !== 2) return;

      cancelDragEvent();
      const startDistance = distance(event.touches);
      const gestureCenterX = centerX(event.touches);
      const focusMinute = gestureCenterX === null ? null : getMinuteAtClientX(gestureCenterX);
      if (!startDistance || gestureCenterX === null || focusMinute === null) return;

      pinchRef.current = {
        startDistance,
        startScale: livePropsRef.current.pixelsPerMinute,
        focusMinute,
      };
      event.preventDefault();
    }

    function onTouchMove(event: TouchEvent) {
      const emptyTap = emptyTapRef.current;
      if (emptyTap) {
        const touch = findTouch(event.touches, emptyTap.identifier);
        if (touch && (
          Math.hypot(touch.clientX - emptyTap.startX, touch.clientY - emptyTap.startY) > dragMoveTolerance
          || Math.abs((scroller?.scrollLeft ?? 0) - emptyTap.startScrollLeft) > 2
        )) {
          emptyTap.moved = true;
        }
      }
      const pinch = pinchRef.current;
      if (pinch && event.touches.length === 2) {
        const currentDistance = distance(event.touches);
        const gestureCenterX = centerX(event.touches);
        if (!currentDistance || gestureCenterX === null) return;

        scheduleZoom(
          clamp(
            pinch.startScale * (currentDistance / pinch.startDistance),
            minPixelsPerMinute,
            maxPixelsPerMinute,
          ),
          pinch.focusMinute,
          gestureCenterX,
        );
        event.preventDefault();
        return;
      }

      const drag = dragRef.current;
      if (!drag || event.touches.length !== 1) return;

      const touch = findTouch(event.touches, drag.touchIdentifier);
      if (!touch) return;

      drag.lastX = touch.clientX;
      drag.lastY = touch.clientY;

      if (!drag.active) {
        const distanceFromStart = Math.hypot(
          touch.clientX - drag.startX,
          touch.clientY - drag.startY,
        );
        if (distanceFromStart > dragMoveTolerance) {
          cancelDragEvent();
        }
        return;
      }

      if (drag.subject.kind === "booking") {
        const booking = livePropsRef.current.bookings.find((item) => item.id === drag.subject.id);
        if (!booking) {
          cancelDragEvent();
          return;
        }
        setDragPreview(getBookingMoveTargetEvent(booking, touch.clientX, touch.clientY, drag));
      } else {
        const block = livePropsRef.current.blocks.find((item) => item.id === drag.subject.id);
        if (!block) {
          cancelDragEvent();
          return;
        }
        setDragPreview(getBlockMoveTargetEvent(block, touch.clientX, touch.clientY, drag));
      }

      updateEdgeScrollEvent(touch.clientX, touch.clientY);
      if (event.cancelable) event.preventDefault();
    }

    function onTouchEnd(event: TouchEvent) {
      const emptyTap = emptyTapRef.current;
      if (emptyTap && findTouch(event.changedTouches, emptyTap.identifier)) {
        if (emptyTap.moved || Math.abs((scroller?.scrollLeft ?? 0) - emptyTap.startScrollLeft) > 2) {
          suppressClickUntilRef.current = Date.now() + 450;
        }
        emptyTapRef.current = null;
      }
      if (event.touches.length < 2) pinchRef.current = null;

      const drag = dragRef.current;
      if (!drag) return;

      const endedTouch = findTouch(event.changedTouches, drag.touchIdentifier);
      if (!endedTouch) return;

      if (drag.holdTimer) {
        clearTimeout(drag.holdTimer);
        drag.holdTimer = null;
      }
      stopEdgeScroll();

      if (drag.active && drag.subject.kind === "booking") {
        const booking = livePropsRef.current.bookings.find((item) => item.id === drag.subject.id);
        if (booking) {
          const target = getBookingMoveTargetEvent(booking, drag.lastX, drag.lastY, drag);
          if (
            target?.kind === "booking"
            && (booking.dateInput !== target.targetDate || booking.timeInput !== target.timeInput)
          ) {
            livePropsRef.current.onSelectedDateChange(target.targetDate);
            void livePropsRef.current.onMoveBooking(
              booking,
              target.targetDate,
              target.timeInput,
              target.endTime,
            );
          }
        }
      } else if (drag.active && drag.subject.kind === "block") {
        const block = livePropsRef.current.blocks.find((item) => item.id === drag.subject.id);
        if (block) {
          const target = getBlockMoveTargetEvent(block, drag.lastX, drag.lastY, drag);
          if (
            target?.kind === "block"
            && (block.dateInput !== target.targetDate || block.startMinutes !== target.targetStartMinutes)
          ) {
            livePropsRef.current.onSelectedDateChange(target.targetDate);
            void livePropsRef.current.onMoveBlock(
              block,
              target.targetDate,
              target.startTime,
              target.endTime,
            );
          }
        }
      }

      if (drag.active) {
        suppressClickUntilRef.current = Date.now() + 450;
        if (event.cancelable) event.preventDefault();
      }

      cancelDragEvent();
    }

    function onTouchCancel(event: TouchEvent) {
      emptyTapRef.current = null;
      suppressClickUntilRef.current = Date.now() + 450;
      if (event.touches.length < 2) pinchRef.current = null;
      cancelDragEvent();
    }

    scroller.addEventListener("touchstart", onTouchStart, { passive: false });
    scroller.addEventListener("touchmove", onTouchMove, { passive: false });
    scroller.addEventListener("touchend", onTouchEnd, { passive: false });
    scroller.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      pinchRef.current = null;
      if (zoomFrameRef.current) {
        window.cancelAnimationFrame(zoomFrameRef.current);
        zoomFrameRef.current = 0;
      }
      scroller.removeEventListener("touchstart", onTouchStart);
      scroller.removeEventListener("touchmove", onTouchMove);
      scroller.removeEventListener("touchend", onTouchEnd);
      scroller.removeEventListener("touchcancel", onTouchCancel);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="relative w-full overflow-hidden rounded-lg border border-admin-border bg-admin-field"
      aria-label="Mobil heti foglalási naptár"
      onClickCapture={(event) => {
        if (
          Date.now() < suppressClickUntilRef.current
          && event.target instanceof Element
          && event.target.closest("[data-mobile-booking-card], [data-mobile-calendar-block]")
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <div
        ref={scrollerRef}
        className="relative w-full overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch]"
        style={{ touchAction: "pan-x pan-y", overscrollBehaviorX: "contain" }}
      >
        <div className="relative" style={{ width: contentWidth, minWidth: "100%" }}>
          {props.dates.includes(props.currentClock.dateInput)
            && props.currentClock.minutes >= props.startMinutes
            && props.currentClock.minutes <= props.endMinutes ? (
              <div
                className="pointer-events-none absolute bottom-0 z-20 w-px bg-admin-danger"
                style={{
                  top: timeHeaderHeight,
                  left: dayLabelWidth
                    + (props.currentClock.minutes - props.startMinutes) * props.pixelsPerMinute,
                }}
                aria-label="Aktuális idő"
              />
            ) : null}

          <div
            className="relative border-b border-admin-border/70 bg-admin-surface"
            style={{ height: timeHeaderHeight }}
          >
            <div
              className="sticky left-0 z-40 flex h-full items-center border-l border-r border-admin-border/70 bg-admin-surface px-1 text-[0.54rem] font-bold uppercase tracking-[0.06em] text-ink-muted"
              style={{ width: dayLabelWidth }}
            >
              Idő
            </div>

            <div
              className="absolute inset-y-0"
              style={{ left: dayLabelWidth, width: timelineWidth }}
            >
              {props.hourMarks.map((minute) => (
                <span
                  key={minute}
                  className="absolute top-1/2 whitespace-nowrap text-[0.52rem] font-semibold text-ink-muted"
                  style={{
                    left: (minute - props.startMinutes) * props.pixelsPerMinute,
                    transform: minute === props.startMinutes
                      ? "translateY(-50%)"
                      : minute === props.endMinutes
                        ? "translate(-100%, -50%)"
                        : "translate(-50%, -50%)",
                  }}
                >
                  {formatGridTime(minute)}
                </span>
              ))}
            </div>
          </div>

          {props.dates.map((dateInput) => {
            const dayBookings = props.bookings.filter((booking) => booking.dateInput === dateInput);
            const dayBlocks = props.blocks.filter((block) => block.dateInput === dateInput);
            const isToday = props.currentClock.dateInput === dateInput;
            const weekend = isWeekend(dateInput);
            const showCurrentTimeMarker = isToday
              && props.currentClock.minutes >= props.startMinutes
              && props.currentClock.minutes <= props.endMinutes;

            return (
              <div
                key={dateInput}
                data-mobile-calendar-day={dateInput}
                className={`relative border-b border-admin-border/70 last:border-b-0 ${weekend ? "bg-admin-weekend" : "bg-admin-field"}`}
                style={{ height: dayRowHeight }}
              >
                <div
                  className={`sticky left-0 z-30 flex h-full flex-col justify-center border-l border-r border-admin-border/70 px-1 ${weekend ? "bg-admin-weekend" : "bg-admin-surface"}`}
                  style={{ width: dayLabelWidth }}
                  aria-current={isToday ? "date" : undefined}
                >
                  <span className="truncate text-[0.48rem] font-bold leading-3 text-ink-muted">
                    {formatWeekdayCompact(dateInput)}
                  </span>
                  <span className={`mt-0.5 truncate text-[0.5rem] font-bold leading-3 ${isToday ? "text-admin-accent" : "text-ink-muted"}`}>
                    {formatMonthShort(dateInput)}
                  </span>
                  <span className={`truncate text-[0.62rem] font-extrabold leading-4 ${isToday ? "text-admin-accent" : "text-ink"}`}>
                    {formatDayNumber(dateInput)}
                  </span>
                </div>

                <div
                  className={`absolute inset-y-0 ${weekend ? "bg-admin-weekend" : ""}`}
                  style={{ left: dayLabelWidth, width: timelineWidth }}
                  onClick={(event) => {
                    if (Date.now() < suppressClickUntilRef.current) return;
                    if (event.target instanceof Element && event.target.closest("[data-mobile-booking-card], [data-mobile-calendar-block]")) return;
                    const minute = getMinuteAtClientX(event.clientX);
                    if (minute === null) return;
                    props.onCreateManualBookingAtMinute(dateInput, minute);
                  }}
                >
                  {props.hourMarks.map((minute) => (
                    <span
                      key={minute}
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 border-l border-admin-border/55"
                      style={{ left: (minute - props.startMinutes) * props.pixelsPerMinute }}
                    />
                  ))}

                  {dayBlocks.map((block) => (
                    <MobileBlockedBlock
                      key={block.id}
                      block={block}
                      startMinutes={props.startMinutes}
                      pixelsPerMinute={props.pixelsPerMinute}
                      dates={props.dates}
                      preview={dragPreview}
                      onOpenException={props.onOpenException}
                      onStartDrag={startBlockDrag}
                    />
                  ))}

                  {showCurrentTimeMarker ? (
                    <span
                      className="pointer-events-none absolute top-1/2 z-30 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-admin-field bg-admin-danger shadow-sm"
                      style={{ left: (props.currentClock.minutes - props.startMinutes) * props.pixelsPerMinute }}
                      aria-label="Aktuális nap és idő"
                    />
                  ) : null}

                  {dayBookings.map((booking) => (
                    <MobileBookingCard
                      key={booking.id}
                      booking={booking}
                      startMinutes={props.startMinutes}
                      pixelsPerMinute={props.pixelsPerMinute}
                      dates={props.dates}
                      moving={props.movingBookingId === booking.id}
                      preview={dragPreview}
                      statusLabels={props.statusLabels}
                      statusCardClasses={props.statusCardClasses}
                      trackCardClasses={props.trackCardClasses}
                      onOpenBooking={props.onOpenBooking}
                      onStartDrag={startBookingDrag}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobileBlockedBlock({
  block,
  startMinutes,
  pixelsPerMinute,
  dates,
  preview,
  onOpenException,
  onStartDrag,
}: {
  block: AdminWeekCalendarBlock;
  startMinutes: number;
  pixelsPerMinute: number;
  dates: string[];
  preview: DragPreview | null;
  onOpenException: (id: string) => void;
  onStartDrag: (
    block: AdminWeekCalendarBlock,
    event: ReactTouchEvent<HTMLButtonElement>,
  ) => void;
}) {
  const left = (block.startMinutes - startMinutes) * pixelsPerMinute;
  const width = Math.max(8, (block.endMinutes - block.startMinutes) * pixelsPerMinute - 2);
  const originalDayIndex = Math.max(0, dates.indexOf(block.dateInput));
  const ownPreview = preview?.kind === "block" && preview.blockId === block.id ? preview : null;
  const targetDayIndex = ownPreview
    ? Math.max(0, dates.indexOf(ownPreview.targetDate))
    : originalDayIndex;
  const translatedX = ownPreview
    ? (ownPreview.targetStartMinutes - block.startMinutes) * pixelsPerMinute
    : 0;
  const translatedY = ownPreview
    ? (targetDayIndex - originalDayIndex) * dayRowHeight
    : 0;
  const canMove = block.kind === "blocked";

  return (
    <article
      data-mobile-calendar-block={block.id}
      data-exception-id={block.exceptionId}
      className={`absolute bottom-1 top-1 z-[5] overflow-hidden rounded-md border text-ink shadow-sm ${block.kind === "training" ? "border-admin-accent/70 bg-admin-accent/20" : block.kind === "personal" ? "border-gold-line bg-gold-soft" : "border-admin-blocked/70 bg-admin-blocked/20"} ${ownPreview ? "z-50 ring-2 ring-admin-blocked/80" : ""}`}
      data-training-calendar={block.kind === "training" ? block.id : undefined}
      style={{
        left,
        width,
        transform: ownPreview ? `translate3d(${translatedX}px, ${translatedY}px, 0)` : undefined,
        transition: ownPreview ? "none" : "border-color 100ms, box-shadow 100ms",
        userSelect: "none",
        WebkitTouchCallout: "none",
      } as CSSProperties}
    >
      <button
        type="button"
        onClick={() => onOpenException(block.exceptionId)}
        onTouchStart={canMove ? (event) => onStartDrag(block, event) : undefined}
        className="block h-full w-full min-w-0 px-1 py-0.5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-admin-blocked"
        style={{ touchAction: "pan-x pan-y" }}
        aria-label={`${block.title || "Kieső idő"}, ${formatGridTime(block.startMinutes)}–${formatGridTime(block.endMinutes)}${block.confirmedNames?.length ? `, ${block.confirmedNames.join(", ")}` : ""}`}
        title={block.confirmedNames?.join(", ") || undefined}
      >
        <span className="block truncate text-[0.46rem] font-bold leading-[0.64rem]">
          {block.title || (block.kind === "vacation" ? "Szabadság" : block.kind === "personal" ? "Emlékeztető" : "Kieső idő")}
        </span>
        {block.confirmedNames?.length ? (
          <span className="block truncate text-[0.44rem] font-semibold leading-[0.6rem]" data-training-participants>{block.confirmedNames.join(", ")}</span>
        ) : null}
        <span className="block truncate text-[0.42rem] font-semibold leading-[0.6rem] text-ink-muted">
          {block.kind === "training" ? `${formatGridTime(block.startMinutes)}–${formatGridTime(block.endMinutes)}` : block.track === "lashes" ? "Szempilla" : block.track === "laser" ? "Lézer" : "Mindkettő"}
        </span>
      </button>
    </article>
  );
}

function MobileBookingCard({
  booking,
  startMinutes,
  pixelsPerMinute,
  dates,
  moving,
  preview,
  statusLabels,
  statusCardClasses,
  trackCardClasses,
  onOpenBooking,
  onStartDrag,
}: {
  booking: AdminWeekCalendarBooking;
  startMinutes: number;
  pixelsPerMinute: number;
  dates: string[];
  moving: boolean;
  preview: DragPreview | null;
  statusLabels: Record<AdminWeekCalendarStatus, string>;
  statusCardClasses: Record<AdminWeekCalendarStatus, string>;
  trackCardClasses: Record<AdminWeekCalendarBooking["trackId"], string>;
  onOpenBooking: (id: number) => void;
  onStartDrag: (
    booking: AdminWeekCalendarBooking,
    event: ReactTouchEvent<HTMLButtonElement>,
  ) => void;
}) {
  const start = parseTimeMinutes(booking.timeInput) ?? startMinutes;
  const duration = getBookingDurationMinutes(booking);
  const left = (start - startMinutes) * pixelsPerMinute;
  // Same movement rules as desktop: manual and online appointments share the
  // exact same interaction model in the weekly view.
  const canMove = booking.movable && !moving;
  // Keep the visible card tied to its real duration so adjacent bookings
  // remain visually separate even at the smallest zoom level.
  const durationWidth = Math.max(1, duration * pixelsPerMinute);
  const width = Math.max(8, durationWidth - 2);
  const originalDayIndex = Math.max(0, dates.indexOf(booking.dateInput));
  const ownPreview = preview?.kind === "booking" && preview.bookingId === booking.id ? preview : null;
  const targetDayIndex = ownPreview
    ? Math.max(0, dates.indexOf(ownPreview.targetDate))
    : originalDayIndex;
  const translatedX = ownPreview
    ? (ownPreview.targetStartMinutes - start) * pixelsPerMinute
    : 0;
  const translatedY = ownPreview
    ? (targetDayIndex - originalDayIndex) * dayRowHeight
    : 0;

  return (
    <article
      data-mobile-booking-card={booking.id}
      data-track={booking.trackId}
      data-status={booking.status}
      data-source={booking.source}
      className={`admin-week-booking absolute top-0.5 z-10 h-[48px] overflow-hidden rounded-md border shadow-sm ${trackCardClasses[booking.trackId]} ${statusCardClasses[booking.status]} ${booking.pendingMove ? "ring-2 ring-inset ring-admin-accent/80" : ""} ${ownPreview ? "z-50 border-admin-accent ring-2 ring-admin-accent/80" : ""}`}
      style={{
        left,
        width,
        transform: ownPreview ? `translate3d(${translatedX}px, ${translatedY}px, 0)` : undefined,
        transition: ownPreview ? "none" : "border-color 100ms, box-shadow 100ms",
        userSelect: "none",
        WebkitTouchCallout: "none",
      } as CSSProperties}
    >
      <button
        type="button"
        onClick={() => onOpenBooking(booking.id)}
        onTouchStart={canMove ? (event) => onStartDrag(booking, event) : undefined}
        className="block h-full w-full min-w-0 px-1.5 py-0.5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-admin-accent"
        style={{ touchAction: "pan-x pan-y" }}
        aria-label={`${booking.guestName}, ${booking.timeInput}–${booking.endTime}, ${statusLabels[booking.status]}`}
      >
        <span className="block truncate text-[0.56rem] font-extrabold leading-[0.68rem] text-ink">
          {booking.guestName}
        </span>
        <span className="mt-px block truncate text-[0.48rem] leading-[0.66rem] text-ink-muted">
          {booking.serviceLabel}
        </span>
        <span className="mt-px block truncate text-[0.46rem] font-semibold leading-[0.64rem] text-ink-muted">
          {booking.timeInput}–{booking.endTime}
        </span>
      </button>

      {booking.pendingMove ? (
        <span
          className="pointer-events-none absolute bottom-1 right-1 z-30 rounded bg-admin-bg/85 px-1 py-0.5 text-[0.42rem] font-extrabold uppercase tracking-[0.04em] text-admin-accent"
          aria-label="Mentésre váró áthelyezés"
        >
          {width >= 92 ? "Mentésre vár" : "!"}
        </span>
      ) : null}
    </article>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isWeekend(dateInput: string) {
  const [year = 1970, month = 1, day = 1] = dateInput.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return weekday === 0 || weekday === 6;
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

function getBookingDurationMinutes(
  booking: Pick<AdminWeekCalendarBooking, "timeInput" | "endTime" | "startsAt" | "endsAt">,
) {
  const start = parseTimeMinutes(booking.timeInput);
  const end = parseTimeMinutes(booking.endTime);
  if (start !== null && end !== null && end > start) return end - start;
  return Math.max(1, Math.round((Date.parse(booking.endsAt) - Date.parse(booking.startsAt)) / 60_000));
}

function formatGridTime(minutes: number) {
  if (minutes === 24 * 60) return "24:00";
  const safe = clamp(minutes, 0, 24 * 60 - 1);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function parseDateInput(dateInput: string) {
  const [year = 1970, month = 1, day = 1] = dateInput.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatWeekdayCompact(dateInput: string) {
  const labels = ["V", "H", "K", "Sze", "Cs", "P", "Szo"];
  return labels[parseDateInput(dateInput).getUTCDay()] ?? "";
}

function formatMonthShort(dateInput: string) {
  const month = new Intl.DateTimeFormat("hu-HU", { month: "short", timeZone: "UTC" })
    .format(parseDateInput(dateInput));
  return month.charAt(0).toUpperCase() + month.slice(1);
}

function formatDayNumber(dateInput: string) {
  return `${parseDateInput(dateInput).getUTCDate()}.`;
}
