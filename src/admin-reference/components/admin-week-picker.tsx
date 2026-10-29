"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { buildBookingCalendarDays, shiftBookingMonthKey } from "@/lib/admin-bookings";
import { useHorizontalSwipe } from "./use-horizontal-swipe";

export const adminWeekNavigationButtonClass = "grid size-8 place-items-center rounded-lg border border-admin-border bg-admin-field text-base text-admin-accent hover:border-admin-accent focus-visible:outline-2 focus-visible:outline-admin-accent";

const weekdays = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];
const dateFormatter = new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long", day: "numeric", weekday: "long", timeZone: "UTC" });
const monthFormatter = new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long", timeZone: "UTC" });

function parseDateInput(dateInput: string) {
  return new Date(`${dateInput}T12:00:00Z`);
}

export function formatWeekRange(startDate: string, endDate: string) {
  const startLabel = new Intl.DateTimeFormat("hu-HU", { month: "short", day: "numeric", timeZone: "UTC" }).format(parseDateInput(startDate));
  const endLabel = new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(parseDateInput(endDate));
  return `${startLabel} – ${endLabel}`;
}

export function AdminWeekPicker({ selectedDate, weekStart, weekEnd, today, onSelect, inline = false, hint = "Válassz egy napot a hét megnyitásához" }: {
  selectedDate: string;
  weekStart: string;
  weekEnd: string;
  today: string;
  onSelect: (dateInput: string) => void;
  inline?: boolean;
  hint?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => selectedDate.slice(0, 7));
  const [portalHost, setPortalHost] = useState<Element | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const days = buildBookingCalendarDays(visibleMonth);
  const monthSwipe = useHorizontalSwipe((direction) => {
    setVisibleMonth((current) => shiftBookingMonthKey(current, direction === "left" ? 1 : -1));
  });

  useEffect(() => {
    if (!isOpen || inline) return;

    function positionPanel() {
      const anchor = triggerRef.current?.getBoundingClientRect();
      const panel = panelRef.current;
      if (!anchor || !panel) return;
      const viewport = window.visualViewport;
      const leftEdge = viewport?.offsetLeft ?? 0;
      const topEdge = viewport?.offsetTop ?? 0;
      const rightEdge = leftEdge + (viewport?.width ?? window.innerWidth);
      const bottomEdge = topEdge + (viewport?.height ?? window.innerHeight);
      const { width, height } = panel.getBoundingClientRect();
      const below = bottomEdge - anchor.bottom;
      const above = anchor.top - topEdge;
      const openAbove = below < height + 8 && above > below;
      panel.style.left = `${Math.max(leftEdge + 12, Math.min(anchor.right - width, rightEdge - width - 12))}px`;
      panel.style.top = `${Math.max(topEdge + 12, Math.min(openAbove ? anchor.top - height - 8 : anchor.bottom + 8, bottomEdge - height - 12))}px`;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!triggerRef.current?.contains(event.target as Node) && !panelRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    }

    positionPanel();
    window.addEventListener("resize", positionPanel);
    window.addEventListener("scroll", positionPanel, true);
    window.visualViewport?.addEventListener("resize", positionPanel);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", positionPanel);
      window.removeEventListener("scroll", positionPanel, true);
      window.visualViewport?.removeEventListener("resize", positionPanel);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, visibleMonth, inline]);

  useEffect(() => {
    if (isOpen) panelRef.current?.querySelector<HTMLButtonElement>('[data-selected-day="true"]')?.focus({ preventScroll: true });
  }, [isOpen]);

  const panel = (
    <div id={panelId} ref={panelRef} role={inline ? "group" : "dialog"} aria-label="Hét kiválasztása"
      className={inline
        ? "mx-auto w-full max-w-76 touch-pan-y rounded-xl border border-admin-border bg-admin-raised p-3 text-ink"
        : "fixed z-50 max-h-[calc(100dvh-1.5rem)] w-[min(19rem,calc(100vw-1.5rem))] touch-pan-y overflow-y-auto rounded-xl border border-admin-border bg-admin-raised p-3 text-ink shadow-xl"}
      {...monthSwipe}>
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => setVisibleMonth(shiftBookingMonthKey(visibleMonth, -1))} aria-label="Előző hónap" className={adminWeekNavigationButtonClass}>‹</button>
        <p className="text-center text-xs font-extrabold capitalize">{monthFormatter.format(parseDateInput(`${visibleMonth}-01`))}</p>
        <button type="button" onClick={() => setVisibleMonth(shiftBookingMonthKey(visibleMonth, 1))} aria-label="Következő hónap" className={adminWeekNavigationButtonClass}>›</button>
      </div>
      <div className="mt-2 grid grid-cols-7 text-center text-[0.6rem] font-bold text-ink-muted" aria-hidden="true">
        {weekdays.map((day) => <span key={day} className="py-1">{day}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map(({ dateInput, isCurrentMonth, dayNumber }) => {
          const isSelectedWeek = dateInput >= weekStart && dateInput <= weekEnd;
          return (
            <button key={dateInput} type="button" data-selected-day={dateInput === selectedDate}
              aria-label={`${dateFormatter.format(parseDateInput(dateInput))} hetének kiválasztása`}
              aria-pressed={isSelectedWeek} aria-current={dateInput === today ? "date" : undefined}
              onClick={() => {
                onSelect(dateInput);
                if (inline) setVisibleMonth(dateInput.slice(0, 7));
                else { setIsOpen(false); triggerRef.current?.focus(); }
              }}
              className={`grid min-h-9 place-items-center rounded-md text-[0.68rem] font-bold transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-admin-accent ${isSelectedWeek ? "bg-admin-accent/20 text-admin-accent" : isCurrentMonth ? "text-ink hover:bg-admin-field" : "text-ink-muted hover:bg-admin-field"} ${dateInput === today ? "ring-1 ring-inset ring-admin-accent" : ""}`}>
              {dayNumber}
            </button>
          );
        })}
      </div>
      <p className="mt-2 border-t border-admin-border pt-2 text-center text-[0.58rem] text-ink-muted">{hint}</p>
    </div>
  );

  return (
    <>
      {!inline ? (
        <button ref={triggerRef} type="button" aria-label={`Hét kiválasztása, jelenleg ${formatWeekRange(weekStart, weekEnd)}`}
          aria-haspopup="dialog" aria-expanded={isOpen} aria-controls={isOpen ? panelId : undefined}
          onClick={() => {
            if (isOpen) { setIsOpen(false); return; }
            setVisibleMonth(selectedDate.slice(0, 7));
            setPortalHost(triggerRef.current?.closest(".admin-theme") ?? null);
            setIsOpen(true);
          }}
          className="ml-auto flex min-h-8 max-w-full items-center justify-end gap-1 rounded-lg px-1.5 text-right text-xs font-extrabold text-ink hover:bg-admin-field focus-visible:outline-2 focus-visible:outline-admin-accent">
          <span className="min-w-0">{formatWeekRange(weekStart, weekEnd)}</span>
          <svg aria-hidden="true" viewBox="0 0 16 16" className={`size-3 shrink-0 fill-none stroke-current text-admin-accent transition-transform ${isOpen ? "rotate-180" : ""}`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 4 4 4-4" /></svg>
        </button>
      ) : null}
      {inline ? panel : isOpen && portalHost ? createPortal(panel, portalHost) : null}
    </>
  );
}
