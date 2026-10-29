"use client";

import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import type { TrainingCalendarSession } from "@/lib/training";

import { AdminAutoTextarea } from "@/components/admin-auto-textarea";
import { AdminBookingServiceLabel, Chevron, TrackDot } from "@/components/admin-overview";
import { AdminEditorSheet } from "@/components/admin-editor-sheet";
import { AdminListPagination } from "@/components/admin-list-pagination";
import { AdminSearchInput } from "@/components/admin-search-input";
import { AdminSelectField, AdminSelectMenu, type AdminSelectOption } from "@/components/admin-select-menu";
import { AdminTemporalInput } from "@/components/admin-temporal-input";
import { adminButtonClass, AdminDangerButton, adminFieldClass, adminHeadingClass } from "@/components/admin-ui";
import { AdminWeekCalendar, type AdminWeekCalendarBlock, type AdminWeekCalendarBooking } from "@/components/admin-week-calendar";
import { useHorizontalSwipe } from "@/components/use-horizontal-swipe";
import {
  adminBookingNeedsAttention,
  buildBookingCalendarDays,
  buildBookingMonthOptions,
  buildPreviousLashBookingDaysById,
  clampScheduleExceptionDateToMonth,
  formatBookingCalendarDate,
  formatBookingPart,
  getGuestBookingHistory,
  isLashExtensionBooking,
  isUnacknowledgedGuestCancellation,
  isOverdueAdminBooking,
  normalizeBookingSearch,
  scheduleExceptionIncludesDate,
  scheduleExceptionIntersectsMonth,
  shiftBookingMonthKey,
  sortAdminBookings,
  type AdminBooking,
  type BookingDateDraft,
  type BookingPageSize,
  type BookingStatusFilter,
  type BookingViewMode,
} from "@/lib/admin-bookings";
import { bookingStatusLabels, getBookingStatusBadgeClass, getBookingStatusDotClass, type BookingStatus } from "@/lib/booking-status";
import type { AdminDraft } from "@/lib/admin-studio-draft";
import { getAdminViewDirection, type AdminViewDirection } from "@/lib/admin-navigation";
import type { ScheduleException, ScheduleExceptionKind } from "@/lib/scheduling";
import styles from "./admin-studio.module.css";

const inputClassName = `${adminFieldClass} mt-1`;
const textareaClassName = `${inputClassName} py-1.5`;
const sectionTitleClassName = adminHeadingClass;

const bookingStatusFilterOptions = [
  { value: "all", label: "Minden állapot", shortLabel: "Mind" },
  { value: "new", label: "Új", shortLabel: "Új" },
  { value: "confirmed", label: "Megerősítve", shortLabel: "Meger." },
  { value: "completed", label: "Teljesítve", shortLabel: "Kész" },
  { value: "cancelled", label: "Általam lemondva", shortLabel: "Általam" },
  { value: "guest_cancelled", label: "Vendég mondta le", shortLabel: "Vendég" },
] satisfies readonly AdminSelectOption<BookingStatusFilter>[];

const bookingPageSizeOptions = [
  { value: 10, label: "10 rekord", triggerLabel: "10" },
  { value: 20, label: "20 rekord", triggerLabel: "20" },
  { value: 50, label: "50 rekord", triggerLabel: "50" },
  { value: "all", label: "Összes rekord" },
] satisfies readonly AdminSelectOption<BookingPageSize>[];

const bookingStatusOptions = Object.entries(bookingStatusLabels).map(([value, label]) => ({
  value: value as BookingStatus,
  label,
})) satisfies readonly AdminSelectOption<BookingStatus>[];

const manualBookingStatusOptions = (["confirmed", "completed", "no_show", "guest_cancelled", "cancelled"] as const).map((value) => ({
  value,
  label: bookingStatusLabels[value],
})) satisfies readonly AdminSelectOption<BookingStatus>[];

function statusOptionsForBooking(booking: AdminBooking, _nowTimestamp: number) {
  const options = booking.source === "manual" ? manualBookingStatusOptions : bookingStatusOptions;
  return options.filter((option) =>
    option.value !== "no_show" && !(booking.source === "manual" && option.value === "cancelled"),
  );
}

function BookingPaymentField({ booking, saving, onSave }: {
  booking: AdminBooking;
  saving: boolean;
  onSave: (booking: AdminBooking, amountHuf: number | null) => Promise<void>;
}) {
  const [error, setError] = useState("");

  async function save(rawValue: string) {
    const text = rawValue.trim();
    const amount = text === "" ? null : Number(text);
    if (text !== "" && (!/^\d+$/.test(text) || !Number.isSafeInteger(amount) || (amount !== null && amount > 100_000_000))) {
      setError("0 és 100 000 000 Ft közötti egész összeget adj meg.");
      return;
    }
    if (amount === booking.paidAmountHuf || saving) return;
    try {
      await onSave(booking, amount);
      setError("");
    } catch {
      setError("A mentés nem sikerült. Próbáld újra.");
    }
  }

  const inputId = `booking-payment-${booking.id}`;
  return (
    <div className="min-w-0">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <label htmlFor={inputId} className="text-[0.64rem] font-bold text-ink-muted">Fizetett összeg</label>
        <span className="ml-auto flex min-w-0 items-center gap-1.5">
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            defaultValue={booking.paidAmountHuf ?? ""}
            onInput={() => setError("")}
            onBlur={(event) => void save(event.currentTarget.value)}
            onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            disabled={saving}
            placeholder="—"
            className={`${adminFieldClass} w-24 max-w-24 text-right text-xs`}
          />
          <span className="shrink-0 text-[0.65rem] font-semibold text-ink-muted">Ft</span>
        </span>
      </div>
      {saving ? <p className="mt-1 text-right text-[0.6rem] text-gold-dark">Mentés…</p> : null}
      {error ? <p id={`${inputId}-error`} role="alert" className="mt-1 text-[0.6rem] text-admin-danger">{error}</p> : null}
    </div>
  );
}

const bookingCalendarWeekdays = ["H", "K", "Sze", "Cs", "P", "Szo", "V"] as const;
const bookingViewOrder: readonly BookingViewMode[] = ["list", "calendar", "week"];
const calendarExceptionLabels = {
  vacation: "Szabadság",
  blocked: "Kieső idő",
  "custom-hours": "Egyedi nyitvatartás",
  personal: "Saját emlékeztető",
} as const;

type CalendarSelection = { monthKey: string; selectedDate: string };

type AdminBookingsTabProps = {
  renderBookingExtras?: (booking:AdminBooking) => React.ReactNode;
  trainingSessions: TrainingCalendarSession[];
  trainingCalendarError: string;
  draft: AdminDraft;
  bookings: AdminBooking[];
  effectiveBookings: AdminBooking[];
  bookingStatusDrafts: Record<number, BookingStatus>;
  bookingDateDrafts: Record<number, BookingDateDraft>;
  reschedulingBookingId: number | null;
  deletingBookingId: number | null;
  acknowledgingBookingId: number | null;
  savingBookingCommentId: number | null;
  savingBookingPaymentIds: number[];
  isSaving: boolean;
  editingWeekExceptionId: string | null;
  weekExceptionForm: ScheduleException | null;
  weekExceptionError: string;
  bookingSearch: string;
  bookingStatusFilter: BookingStatusFilter;
  bookingPageSize: BookingPageSize;
  bookingPage: number;
  bookingView: BookingViewMode;
  bookingCalendar: CalendarSelection;
  editingBookingId: number | null;
  nowTimestamp: number;
  todayDateInput: string;
  onBookingSearchChange: (value: string) => void;
  onBookingStatusFilterChange: (value: BookingStatusFilter) => void;
  onBookingPageSizeChange: (value: BookingPageSize) => void;
  onBookingPageChange: Dispatch<SetStateAction<number>>;
  onBookingViewChange: (view: BookingViewMode) => void;
  onBookingCalendarChange: (calendar: CalendarSelection) => void;
  onBookingSwapOpenChange: (open: boolean) => void;
  onQuickAddCalendarEntry: (kind: "blocked" | "personal", date: string) => void;
  onEditingBookingIdChange: (id: number | null) => void;
  onOpenWeekExceptionEditor: (id: string) => void;
  onOpenTraining: () => void;
  onCloseWeekExceptionEditor: () => void;
  onUpdateWeekExceptionForm: <K extends keyof ScheduleException>(field: K, value: ScheduleException[K]) => void;
  onApplyWeekExceptionEdit: () => void;
  onRemoveWeekException: () => void;
  onStageWeekExceptionMove: (block: AdminWeekCalendarBlock, dateInput: string, startTime: string, endTime: string) => void;
  onUpdateBookingStatus: (id: number, status: BookingStatus) => void;
  onDeleteBooking: (booking: AdminBooking) => Promise<void>;
  onUpdateBookingAdminComment: (id: number, comment: string) => void;
  onSaveBookingAdminComment: (booking: AdminBooking) => Promise<void>;
  onSaveBookingPayment: (booking: AdminBooking, amountHuf: number | null) => Promise<void>;
  onAcknowledgeGuestCancellation: (booking: AdminBooking) => Promise<void>;
  onUpdateBookingDateDraft: (id: number, field: keyof BookingDateDraft, value: string) => void;
  onStageBookingMoveFromWeek: (booking: AdminWeekCalendarBooking, dateInput: string, timeInput: string, endTime: string) => void;
  onRescheduleBooking: (booking: AdminBooking) => Promise<void>;
  onRebook: (booking: AdminBooking) => void;
  onCreateManualBookingAt: (date: string, time: string) => void;
};

export function AdminBookingsTab({
  renderBookingExtras,
  draft,
  bookings,
  effectiveBookings,
  bookingStatusDrafts,
  bookingDateDrafts,
  reschedulingBookingId,
  deletingBookingId,
  acknowledgingBookingId,
  savingBookingCommentId,
  savingBookingPaymentIds,
  isSaving,
  editingWeekExceptionId,
  weekExceptionForm,
  weekExceptionError,
  bookingSearch,
  bookingStatusFilter,
  bookingPageSize,
  bookingPage,
  bookingView,
  bookingCalendar,
  editingBookingId,
  nowTimestamp,
  todayDateInput,
  onBookingSearchChange: setBookingSearch,
  onBookingStatusFilterChange: setBookingStatusFilter,
  onBookingPageSizeChange: setBookingPageSize,
  onBookingPageChange: setBookingPage,
  onBookingViewChange: setBookingView,
  onBookingCalendarChange: setBookingCalendar,
  onBookingSwapOpenChange: setIsBookingSwapOpen,
  onQuickAddCalendarEntry,
  onEditingBookingIdChange: setEditingBookingId,
  onOpenWeekExceptionEditor: openWeekExceptionEditor,
  onOpenTraining,
  onCloseWeekExceptionEditor: closeWeekExceptionEditor,
  onUpdateWeekExceptionForm: updateWeekExceptionForm,
  onApplyWeekExceptionEdit: applyWeekExceptionEdit,
  onRemoveWeekException: removeWeekException,
  onStageWeekExceptionMove: stageWeekExceptionMove,
  onUpdateBookingStatus: updateBookingStatus,
  onDeleteBooking: deleteBooking,
  onUpdateBookingAdminComment: updateBookingAdminComment,
  onSaveBookingAdminComment: saveBookingAdminComment,
  onSaveBookingPayment: saveBookingPayment,
  onAcknowledgeGuestCancellation: acknowledgeGuestCancellation,
  onUpdateBookingDateDraft: updateBookingDateDraft,
  onStageBookingMoveFromWeek: stageBookingMoveFromWeek,
  onRescheduleBooking: rescheduleBooking,
  onRebook,
  onCreateManualBookingAt,
  trainingSessions,
  trainingCalendarError,
}: AdminBookingsTabProps) {
  const selectedBookingViewRef = useRef(bookingView);
  const [viewSlide, setViewSlide] = useState<AdminViewDirection | null>(null);
  const [monthSlide, setMonthSlide] = useState<AdminViewDirection | null>(null);
  const [weekSlide, setWeekSlide] = useState<AdminViewDirection | null>(null);
  const [pageSlide, setPageSlide] = useState<{ page: number; direction: AdminViewDirection } | null>(null);
  const [profileBookingId, setProfileBookingId] = useState<number | null>(null);
  const previousLashBookingDaysById = buildPreviousLashBookingDaysById(bookings);
  const editingBooking = bookings.find((booking) => booking.id === editingBookingId);
  const profileBooking = bookings.find((booking) => booking.id === profileBookingId);
  const guestHistory = profileBooking ? getGuestBookingHistory(bookings, profileBooking) : [];
  const editingBookingDateDraft = editingBooking
    ? bookingDateDrafts[editingBooking.id] ?? {
        date: editingBooking.dateInput,
        time: editingBooking.timeInput,
        endTime: editingBooking.endTime,
        note: editingBooking.source === "manual" ? editingBooking.guestName : "",
      }
    : null;
  const effectiveEditingStatus = editingBooking ? bookingStatusDrafts[editingBooking.id] ?? editingBooking.status : null;
  const editingBookingCanReschedule = effectiveEditingStatus === "new" || effectiveEditingStatus === "confirmed";
  const editingBookingHasDateChanged = Boolean(
    editingBooking &&
    editingBookingDateDraft &&
    (editingBookingDateDraft.date !== editingBooking.dateInput ||
      editingBookingDateDraft.time !== editingBooking.timeInput ||
      editingBookingDateDraft.endTime !== editingBooking.endTime ||
      (editingBooking.source === "manual" ? editingBookingDateDraft.note !== editingBooking.guestName : Boolean(editingBookingDateDraft.note.trim())) || Boolean(bookingStatusDrafts[editingBooking.id])),
  );

  const normalizedBookingSearch = normalizeBookingSearch(bookingSearch);
  const filteredBookings = bookings
    .filter((booking) => {
      if (bookingStatusFilter !== "all" && booking.status !== bookingStatusFilter) return false;
      if (!normalizedBookingSearch) return true;

      const searchable = normalizeBookingSearch(
        `${booking.guestName} ${booking.phone} ${booking.email} ${booking.confirmationCode} ${booking.source === "manual" ? "kézzel felvett kézi időpont" : ""}`,
      );
      return searchable.includes(normalizedBookingSearch);
    })
    .sort((a, b) => sortAdminBookings(a, b, nowTimestamp));
  const calendarVisibleBookings = filteredBookings.filter(
    (booking) => booking.status !== "cancelled" && booking.status !== "guest_cancelled",
  );
  const projectWeekBooking = (booking: AdminBooking): AdminWeekCalendarBooking => {
    const pending = bookingDateDrafts[booking.id];
    const effectiveStatus = bookingStatusDrafts[booking.id] ?? booking.status;
    const movable =
      (effectiveStatus === "new" || effectiveStatus === "confirmed")
      && Date.parse(booking.startsAt) > nowTimestamp;

    return pending
      ? {
          ...booking,
          dateInput: pending.date,
          timeInput: pending.time,
          endTime: pending.endTime,
          movable,
          pendingMove: true,
        }
      : {
          ...booking,
          movable,
          pendingMove: false,
        };
  };
  const weekCalendarBookings = calendarVisibleBookings.map(projectWeekBooking);
  const weekCalendarBlockingBookings = effectiveBookings
    .filter((booking) => booking.status === "new" || booking.status === "confirmed")
    .map(projectWeekBooking);
  const bookingPageCount = bookingPageSize === "all"
    ? 1
    : Math.max(1, Math.ceil(filteredBookings.length / bookingPageSize));
  const visibleBookingPage = Math.min(bookingPage, bookingPageCount);
  const visibleBookings = bookingPageSize === "all"
    ? filteredBookings
    : filteredBookings.slice(
        (visibleBookingPage - 1) * bookingPageSize,
        visibleBookingPage * bookingPageSize,
      );
  const calendarMonthOptions = buildBookingMonthOptions(
    todayDateInput,
    bookings.filter((booking) => booking.status !== "cancelled" && booking.status !== "guest_cancelled"),
    draft.schedule.exceptions,
    bookingCalendar.monthKey,
  );
  const calendarDays = buildBookingCalendarDays(bookingCalendar.monthKey);
  const calendarBookingsByDate = new Map<string, AdminBooking[]>();
  for (const booking of calendarVisibleBookings) {
    const dayBookings = calendarBookingsByDate.get(booking.dateInput) ?? [];
    dayBookings.push(booking);
    calendarBookingsByDate.set(booking.dateInput, dayBookings);
  }
  const calendarMonthBookingCount = calendarVisibleBookings.filter((booking) =>
    booking.dateInput.startsWith(bookingCalendar.monthKey),
  ).length;
  const calendarMonthExceptionCount = draft.schedule.exceptions.filter((item) =>
    scheduleExceptionIntersectsMonth(item, bookingCalendar.monthKey),
  ).length;
  const selectedDateBookings = [...(calendarBookingsByDate.get(bookingCalendar.selectedDate) ?? [])]
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const selectedDateExceptions = draft.schedule.exceptions
    .filter((item) => scheduleExceptionIncludesDate(item, bookingCalendar.selectedDate))
    .sort((left, right) => (left.startTime ?? "00:00").localeCompare(right.startTime ?? "00:00"));
  const selectedDateAgenda = [
    ...selectedDateBookings.map((booking) => ({
      type: "booking" as const,
      id: `booking-${booking.id}`,
      sortTime: booking.timeInput,
      booking,
    })),
    ...selectedDateExceptions.map((exception) => ({
      type: "exception" as const,
      id: `exception-${exception.id}`,
      sortTime: exception.startTime ?? "00:00",
      exception,
    })),
  ].sort((left, right) => left.sortTime.localeCompare(right.sortTime));

  function selectBookingView(view: BookingViewMode) {
    if (selectedBookingViewRef.current === view) return;
    setPageSlide(null);
    setViewSlide(getAdminViewDirection(selectedBookingViewRef.current, view, bookingViewOrder));
    selectedBookingViewRef.current = view;
    setBookingView(view);
  }

  function selectBookingPage(page: number) {
    if (page === visibleBookingPage) return;
    setPageSlide({ page, direction: page > visibleBookingPage ? "forward" : "backward" });
    setBookingPage(page);
  }

  function selectBookingCalendarDate(selectedDate: string) {
    const monthKey = selectedDate.slice(0, 7);
    if (monthKey !== bookingCalendar.monthKey) {
      setMonthSlide(monthKey > bookingCalendar.monthKey ? "forward" : "backward");
    }
    setBookingCalendar({ monthKey, selectedDate });
  }

  function selectBookingCalendarMonth(monthKey: string) {
    if (monthKey !== bookingCalendar.monthKey) {
      setMonthSlide(monthKey > bookingCalendar.monthKey ? "forward" : "backward");
    }
    const firstBooking = calendarVisibleBookings
      .filter((booking) => booking.dateInput.startsWith(monthKey))
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0];
    const firstException = draft.schedule.exceptions
      .filter((item) => scheduleExceptionIntersectsMonth(item, monthKey))
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];

    setBookingCalendar({
      monthKey,
      selectedDate: firstBooking?.dateInput
        ?? clampScheduleExceptionDateToMonth(firstException, monthKey)
        ?? `${monthKey}-01`,
    });
  }

  const viewSwipe = useHorizontalSwipe((direction) => {
    const nextIndex = bookingViewOrder.indexOf(bookingView) + (direction === "left" ? 1 : -1);
    const nextView = bookingViewOrder[nextIndex];
    if (!nextView) return false;
    selectBookingView(nextView);
  });
  const listSwipe = useHorizontalSwipe((direction) => {
    const nextPage = visibleBookingPage + (direction === "left" ? 1 : -1);
    if (nextPage < 1 || nextPage > bookingPageCount) return false;
    selectBookingPage(nextPage);
  });
  const monthSwipe = useHorizontalSwipe((direction) => {
    selectBookingCalendarMonth(shiftBookingMonthKey(bookingCalendar.monthKey, direction === "left" ? 1 : -1));
  });

  return (
    <section aria-labelledby="admin-bookings-title" className={bookingView === "list" ? "flex flex-1 flex-col" : undefined}>
      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <h1 id="admin-bookings-title" className={sectionTitleClassName}>
            Foglalások
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`${styles.segmented} ${styles.bookingViewSwitch} touch-pan-y`} data-view={bookingView} role="group" aria-label="Foglalási nézet" {...viewSwipe}>
            {([
              ["list", "Lista"],
              ["calendar", "Naptár"],
              ["week", "Hét"],
            ] as const).map(([view, label]) => (
              <button
                key={view}
                type="button"
                aria-pressed={bookingView === view}
                onClick={() => selectBookingView(view)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.bookingToolbar}>
        <div className={styles.bookingFilters}>
          <div className="min-w-0">
            <AdminSearchInput
              aria-label="Keresés név, telefonszám, e-mail vagy foglalási azonosító alapján"
              value={bookingSearch}
              onValueChange={(value) => {
                setBookingSearch(value);
                setPageSlide(null);
                setBookingPage(1);
              }}
              placeholder="Név, telefon, kód"
            />
          </div>
          <AdminSelectMenu
            value={bookingStatusFilter}
            options={bookingStatusFilterOptions}
            onChange={(value) => {
              setBookingStatusFilter(value);
              setPageSlide(null);
              setBookingPage(1);
            }}
            ariaLabel="Foglalási állapot szűrő"
            buttonClassName={`w-full ${styles.bookingFilterControl}`}
            menuClassName="w-44"
          />
        </div>

        {bookingView !== "list" ? (
          <div className="mt-2 flex items-center justify-between gap-3 text-[0.62rem] font-semibold text-ink-muted">
            <p className={styles.bookingResultCount}><span aria-hidden="true" />{filteredBookings.length} találat</p>
            {bookingView === "calendar" ? (
              <p>{calendarMonthBookingCount} foglalás · {calendarMonthExceptionCount} bejegyzés</p>
            ) : (
              <p>Heti időrács · húzással áthelyezhető</p>
            )}
          </div>
        ) : null}
      </div>

      {bookingView === "list" ? (
        <div key="list" className={`${styles.screenSlide} touch-pan-y flex-1`} data-slide={viewSlide ?? undefined} {...listSwipe}>
          <div className={styles.bookingListControls}>
            <div className={styles.bookingListSummary}>
              <AdminSelectMenu
                value={bookingPageSize}
                options={bookingPageSizeOptions}
                onChange={(value) => {
                  setBookingPageSize(value);
                  setPageSlide(null);
                  setBookingPage(1);
                }}
                ariaLabel="Megjelenített rekordok száma"
                buttonClassName={styles.bookingSizeControl}
                menuClassName="w-36"
              />
              <p className={styles.bookingResultCount}><span aria-hidden="true" />{filteredBookings.length} találat</p>
            </div>
            {bookingPageCount > 1 ? <AdminListPagination page={visibleBookingPage} pageCount={bookingPageCount} position="top" label="Foglalási lista lapozása" onPageChange={selectBookingPage} /> : null}
          </div>
          {visibleBookings.length ? (
            <div key={visibleBookingPage} className={`mt-2 grid gap-2.5 xl:grid-cols-2 ${styles.bookingList} ${styles.screenSlide}`} data-slide={pageSlide?.page === visibleBookingPage ? pageSlide.direction : undefined}>
              {visibleBookings.map((booking, index) => {
                const pendingStatus = bookingStatusDrafts[booking.id];
                const displayedStatus = pendingStatus ?? booking.status;
                const cancellationNeedsAck = isUnacknowledgedGuestCancellation(booking);
                const bookingOverdue = isOverdueAdminBooking(booking, nowTimestamp);
                const startsRegularBookings = index > 0
                  && adminBookingNeedsAttention(visibleBookings[index - 1], nowTimestamp)
                  && !adminBookingNeedsAttention(booking, nowTimestamp);
                return [
                  startsRegularBookings ? (
                    <div key={`regular-bookings-${booking.id}`} className="col-span-full flex items-center gap-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                      <span aria-hidden="true" className="h-px min-w-0 flex-1 bg-gold-line" />
                      <span>További foglalások</span>
                      <span aria-hidden="true" className="h-px min-w-0 flex-1 bg-gold-line" />
                    </div>
                  ) : null,
                  <article
                    key={booking.id}
                    className={styles.booking}
                    data-status={booking.status}
                    data-pending-status={pendingStatus ?? undefined}
                    data-cancelled={["cancelled", "guest_cancelled"].includes(booking.status)}
                    data-needs-cancellation-ack={cancellationNeedsAck}
                    data-overdue={bookingOverdue}
                    style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
                  >
                    {pendingStatus ? (
                      <svg aria-hidden="true" className={styles.bookingPendingOutline} data-booking-pending-outline>
                        <rect x="1" y="1" width="100%" height="100%" pathLength="100" />
                      </svg>
                    ) : null}
                    {cancellationNeedsAck ? (
                      <div className="flex items-center justify-between gap-2 rounded-t-[0.875rem] border-b border-admin-danger/25 bg-admin-danger/10 px-3 py-2">
                        <span className="min-w-0 text-[0.64rem] font-extrabold text-admin-danger">A vendég lemondta · nyugtázás szükséges</span>
                        <button
                          type="button"
                          onClick={() => void acknowledgeGuestCancellation(booking)}
                          disabled={acknowledgingBookingId === booking.id}
                          className="min-h-7 shrink-0 rounded-lg bg-admin-danger px-2.5 text-[0.6rem] font-extrabold text-admin-bg disabled:opacity-50"
                        >
                          {acknowledgingBookingId === booking.id ? "Nyugtázás…" : "Nyugtázom"}
                        </button>
                      </div>
                    ) : null}
                    {booking.status === "new" ? (
                      <div className="rounded-t-[0.875rem] border-b border-gold-dark/25 bg-gold-dark/10 px-3 py-2 text-[0.64rem] font-extrabold text-gold-dark">
                        {bookingOverdue
                          ? "Jóváhagyásra vár · az időpont véget ért, állítsd be az állapotát"
                          : "Jóváhagyásra vár"}
                      </div>
                    ) : bookingOverdue ? (
                      <div className="rounded-t-[0.875rem] border-b border-gold-dark/25 bg-gold-dark/10 px-3 py-2 text-[0.64rem] font-extrabold text-gold-dark">
                        Az időpont véget ért · állítsd be az állapotát
                      </div>
                    ) : null}
                    <div className={`flex items-center justify-between gap-2 px-3 pb-1 pt-3 ${styles.bookingMeta}`}>
                      <span className="flex min-w-0 flex-1 items-center gap-1.5 text-[0.65rem] text-ink-muted"><TrackDot track={booking.trackId} /><span className="min-w-0 truncate">{booking.trackLabel} · {booking.date}</span></span>
                      <span className={`flex shrink-0 items-center gap-1.5 ${styles.bookingStatus}`}>
                        <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${getBookingStatusDotClass(displayedStatus)}`} />
                        {pendingStatus ? <span className={styles.bookingPendingStatus}>Mentésre vár:</span> : null}
                        <AdminSelectMenu
                          value={displayedStatus}
                          options={statusOptionsForBooking(booking, nowTimestamp)}
                          disabled={isSaving || reschedulingBookingId !== null || acknowledgingBookingId === booking.id}
                          onChange={(value) => updateBookingStatus(booking.id, value)}
                          ariaLabel={`${booking.guestName} foglalási állapota${pendingStatus ? ", mentésre vár" : ""}`}
                          buttonClassName={styles.bookingStatusButton}
                          menuClassName="w-48"
                          comfortableOptions
                        />
                      </span>
                    </div>
                    <button type="button" onClick={() => setEditingBookingId(booking.id)} className={`flex w-full items-center gap-3 px-3 pb-3 pt-2 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-dark ${styles.bookingMain}`}>
                      <span className={`w-12 shrink-0 text-center ${styles.bookingTime}`}>
                        <span className={`block text-sm font-bold tracking-tight ${styles.bookingTimeStart}`}>{booking.time}</span>
                        <span className={`mt-0.5 block text-[0.65rem] text-ink-muted ${styles.bookingTimeEnd}`}>{booking.endTime}-ig</span>
                      </span>
                      <span className={`min-w-0 flex-1 ${styles.bookingDetails}`}>
                        <span className={`flex min-w-0 items-center gap-1.5 text-xs font-bold ${styles.bookingNameRow}`}>
                          <span className="min-w-0 truncate">{booking.guestName}</span>
                          {isLashExtensionBooking(booking) ? (
                            <span
                              className="shrink-0 rounded bg-gold-dark/10 px-1.5 py-0.5 text-[0.5rem] font-extrabold text-gold-dark"
                              title={previousLashBookingDaysById.has(booking.id)
                                ? `Utolsó pillás foglalás óta: ${previousLashBookingDaysById.get(booking.id)} nap`
                                : "Nincs korábbi pillás foglalás"}
                              aria-label={previousLashBookingDaysById.has(booking.id)
                                ? `Utolsó pillás foglalás óta ${previousLashBookingDaysById.get(booking.id)} nap`
                                : "Nincs korábbi pillás foglalás"}
                            >
                              {previousLashBookingDaysById.has(booking.id)
                                ? `${previousLashBookingDaysById.get(booking.id)} nap`
                                : "Első pilla"}
                            </span>
                          ) : null}
                          <span className="shrink-0 rounded bg-admin-field px-1 py-0.5 text-[0.48rem] font-extrabold uppercase tracking-[0.05em] text-ink-muted">
                            {booking.source === "manual" ? "Kézzel felvett" : `#${booking.confirmationCode}`}
                          </span>
                        </span>
                        <AdminBookingServiceLabel groups={booking.serviceGroups} className={`mt-1 text-[0.68rem] leading-4 text-ink-muted ${styles.bookingService}`} />
                        {booking.status === "guest_cancelled" && booking.cancelledAt ? (
                          <time dateTime={booking.cancelledAt} className="mt-1 block text-[0.7rem] font-bold leading-4 text-admin-danger">
                            Vendég lemondta: {formatBookingPart(booking.cancelledAt, "date")} {formatBookingPart(booking.cancelledAt, "time")}
                          </time>
                        ) : null}
                        {booking.note ? <span className={`mt-1 block truncate text-[0.65rem] text-ink-muted ${styles.bookingNote}`}>{booking.note}</span> : null}
                        {booking.adminComment ? (
                          <span className={`mt-1 block truncate text-[0.65rem] font-semibold text-gold-dark ${styles.bookingAdminComment}`}>
                            Saját jegyzet: {booking.adminComment}
                          </span>
                        ) : null}
                      </span>
                      <Chevron />
                    </button>
                  </article>,
                ];
              })}
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-gold-line bg-admin-raised px-4 py-8 text-center">
              <p className="text-xs font-extrabold">{bookings.length ? "Nincs találat." : "Még nincs rögzített foglalás."}</p>
              {bookings.length ? <p className="mt-1 text-[0.66rem] text-ink-muted">Módosítsd a keresést vagy az állapotszűrőt.</p> : null}
            </div>
          )}

          {bookingPageCount > 1 ? <AdminListPagination page={visibleBookingPage} pageCount={bookingPageCount} position="bottom" label="Foglalási lista lapozása" onPageChange={selectBookingPage} /> : null}
        </div>
      ) : bookingView === "calendar" ? (
        <div key="calendar" className={`mt-2 grid min-w-0 gap-2.5 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] ${styles.screenSlide}`} data-slide={viewSlide ?? undefined}>
          <section className="min-w-0 touch-pan-y rounded-xl bg-admin-surface p-3 lg:bg-admin-raised" aria-label="Foglalási naptár" {...monthSwipe}>
            <div className="grid grid-cols-[2rem_minmax(0,1fr)_2rem_2.25rem] items-center gap-1.5 border-b border-gold-line pb-2.5">
              <button
                type="button"
                onClick={() => selectBookingCalendarMonth(shiftBookingMonthKey(bookingCalendar.monthKey, -1))}
                aria-label="Előző hónap"
                className={`grid size-8 place-items-center rounded-lg border border-gold-line bg-admin-field text-base text-gold-dark focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-dark ${styles.bookingCalendarButton}`}
              >
                ‹
              </button>
              <AdminSelectMenu
                value={bookingCalendar.monthKey}
                options={calendarMonthOptions}
                onChange={selectBookingCalendarMonth}
                ariaLabel="Naptár hónapja"
                align="left"
                buttonClassName="w-full justify-center"
                menuClassName="w-44"
              />
              <button
                type="button"
                onClick={() => selectBookingCalendarMonth(shiftBookingMonthKey(bookingCalendar.monthKey, 1))}
                aria-label="Következő hónap"
                className={`grid size-8 place-items-center rounded-lg border border-gold-line bg-admin-field text-base text-gold-dark focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-dark ${styles.bookingCalendarButton}`}
              >
                ›
              </button>
              <button
                type="button"
                onClick={() => selectBookingCalendarDate(todayDateInput)}
                className={`min-h-8 rounded-lg border border-gold-line bg-admin-field px-1.5 text-[0.58rem] font-bold text-gold-dark focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-dark ${styles.bookingCalendarButton}`}
              >
                Ma
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[0.6rem] font-bold uppercase tracking-[0.08em] text-ink-muted" aria-hidden="true">
              {bookingCalendarWeekdays.map((day) => <span key={day}>{day}</span>)}
            </div>
            <div key={bookingCalendar.monthKey} className={`mt-1 grid grid-cols-7 gap-1 ${styles.screenSlide}`} data-slide={monthSlide ?? undefined}>
              {calendarDays.map((day) => {
                const dayBookings = calendarBookingsByDate.get(day.dateInput) ?? [];
                const dayExceptions = draft.schedule.exceptions.filter((item) =>
                  scheduleExceptionIncludesDate(item, day.dateInput),
                );
                const dayItemCount = dayBookings.length + dayExceptions.length;
                const isSelected = day.dateInput === bookingCalendar.selectedDate;
                const isToday = day.dateInput === todayDateInput;
                const hasLashes = dayBookings.some((booking) => booking.trackId === "lashes" || booking.trackId === "mixed");
                const hasLaser = dayBookings.some((booking) => booking.trackId === "laser" || booking.trackId === "mixed");

                return (
                  <button
                    key={day.dateInput}
                    type="button"
                    onClick={() => selectBookingCalendarDate(day.dateInput)}
                    aria-label={`${formatBookingCalendarDate(day.dateInput)}, ${dayBookings.length} foglalás, ${dayExceptions.length} naptárbejegyzés`}
                    aria-pressed={isSelected}
                    className={styles.monthDay}
                    data-today={isToday}
                    data-outside={!day.isCurrentMonth}
                  >
                    <span>{day.dayNumber}</span>
                    {dayItemCount ? (
                      <>
                        <span className={`absolute bottom-1 right-1 text-[0.5rem] font-black leading-none ${isSelected ? "text-admin-bg" : "text-gold-dark"}`}>
                          {dayItemCount}
                        </span>
                        <span className="absolute bottom-1 left-1 flex gap-0.5" aria-hidden="true">
                          {hasLashes ? <span className={`size-1 rounded-full ${isSelected ? "bg-admin-bg" : "bg-gold-dark"}`} /> : null}
                          {hasLaser ? <span className="size-1 rounded-full bg-admin-success" /> : null}
                          {dayExceptions.length ? <span className={`size-1 rounded-[1px] ${isSelected ? "bg-admin-bg" : "bg-admin-danger"}`} /> : null}
                        </span>
                      </>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="min-w-0 rounded-xl bg-admin-surface p-3 lg:bg-admin-raised" aria-labelledby="selected-booking-day-title">
            <div className="flex items-start justify-between gap-3 border-b border-gold-line pb-2.5">
              <div className="min-w-0">
                <h2 id="selected-booking-day-title" className="mt-0.5 truncate text-sm font-extrabold">
                  {formatBookingCalendarDate(bookingCalendar.selectedDate)}
                </h2>
              </div>
              <span className="shrink-0 rounded-md bg-admin-field px-2 py-1 text-[0.58rem] font-bold text-ink-muted">
                {selectedDateAgenda.length} tétel
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => onQuickAddCalendarEntry("blocked", bookingCalendar.selectedDate)} className="min-h-11 rounded-lg border border-gold-line bg-admin-field px-2 text-xs font-bold text-gold-dark focus-visible:outline-2 focus-visible:outline-gold-dark">+ Kézi időpont / kieső idő</button>
            </div>

            {selectedDateAgenda.length ? (
              <div className="divide-y divide-gold-line">
                {selectedDateAgenda.map((agendaItem) => {
                  if (agendaItem.type === "exception") {
                    const exception = agendaItem.exception;
                    const timeLabel = exception.kind === "vacation" || (exception.kind === "personal" && !exception.startTime)
                      ? "Egész nap"
                      : `${exception.startTime ?? "—"}–${exception.endTime ?? "—"}`;
                    const trackLabel = exception.track === "all"
                      ? "Mindkét naptár"
                      : exception.track === "lashes" ? "Műszempilla" : "Lézer";

                    return (
                      <article
                        key={agendaItem.id}
                        className="grid w-full grid-cols-[5rem_minmax(0,1fr)_auto] items-center gap-2 py-2.5"
                      >
                        <span className="text-[0.64rem] font-extrabold text-gold-dark">{timeLabel}</span>
                        <span className="min-w-0">
                          <span className={`block text-[0.68rem] font-extrabold ${exception.kind === "personal" ? "whitespace-pre-wrap break-words" : "truncate"}`}>{exception.title}</span>
                          {exception.kind !== "personal" ? <span className="block text-[0.58rem] leading-3.5 text-ink-muted">{trackLabel}</span> : null}
                        </span>
                        <span className="max-w-[5.5rem] rounded-md bg-admin-danger/10 px-1.5 py-1 text-right text-[0.5rem] font-extrabold leading-3 text-ink-muted">
                          {calendarExceptionLabels[exception.kind]}
                        </span>
                      </article>
                    );
                  }

                  const booking = agendaItem.booking;
                  return (
                    <button
                      key={agendaItem.id}
                      type="button"
                      onClick={() => setEditingBookingId(booking.id)}
                      className={`grid w-full grid-cols-[5rem_minmax(0,1fr)_auto] items-center gap-2 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-dark ${styles.bookingAgendaButton}`}
                    >
                      <span className="text-[0.64rem] font-extrabold text-gold-dark">{booking.time}–{booking.endTime}</span>
                      <span className="min-w-0">
                        <span className="flex min-w-0 items-center gap-1.5 text-[0.68rem] font-extrabold">
                          <span className="min-w-0 truncate">{booking.guestName}</span>
                          <span className="shrink-0 text-[0.48rem] uppercase tracking-[0.05em] text-ink-muted">
                            {booking.source === "manual" ? "Kézzel felvett" : `#${booking.confirmationCode}`}
                          </span>
                        </span>
                        <AdminBookingServiceLabel groups={booking.serviceGroups} className="text-[0.58rem] leading-3.5 text-ink-muted" />
                      </span>
                      <span className={`rounded-md px-1.5 py-1 text-[0.52rem] font-extrabold ${getBookingStatusBadgeClass(booking.status)}`}>
                        {bookingStatusLabels[booking.status]}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-7 text-center">
                <p className="text-xs font-extrabold">Ezen a napon nincs bejegyzés.</p>
                <p className="mt-1 text-[0.64rem] text-ink-muted">A foglalások és a kieső idők is itt jelennek meg.</p>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div key="week" className={`mt-2 min-w-0 ${styles.screenSlide}`} data-slide={viewSlide ?? undefined}>
          {trainingCalendarError ? <p role="alert" className="mb-2 text-xs text-admin-danger">{trainingCalendarError}</p> : null}
          <AdminWeekCalendar
            bookings={weekCalendarBookings}
            blockingBookings={weekCalendarBlockingBookings}
            exceptions={draft.schedule.exceptions}
            trainingSessions={trainingSessions}
            selectedDate={bookingCalendar.selectedDate}
            slideDirection={weekSlide}
            slotIntervalMinutes={draft.schedule.slotIntervalMinutes}
            movingBookingId={reschedulingBookingId}
            onSelectedDateChange={(selectedDate) => {
              if (selectedDate !== bookingCalendar.selectedDate) {
                setWeekSlide(selectedDate > bookingCalendar.selectedDate ? "forward" : "backward");
              }
              setBookingCalendar({ monthKey: selectedDate.slice(0, 7), selectedDate });
            }}
            onOpenBooking={setEditingBookingId}
            onOpenException={(id) => id.startsWith("training/") ? onOpenTraining() : openWeekExceptionEditor(id)}
            onMoveException={stageWeekExceptionMove}
            onMoveBooking={stageBookingMoveFromWeek}
            onCreateManualBookingAt={onCreateManualBookingAt}
          />
        </div>
      )}
      <AdminEditorSheet
        open={Boolean(editingWeekExceptionId && weekExceptionForm)}
        title={weekExceptionForm?.kind === "personal" ? "Emlékeztető szerkesztése" : "Naptárbejegyzés szerkesztése"}
        description={weekExceptionForm
          ? `${calendarExceptionLabels[weekExceptionForm.kind]} · ${weekExceptionForm.startDate}`
          : undefined}
        onClose={closeWeekExceptionEditor}
      >
        {weekExceptionForm ? (
          <div className="grid gap-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {weekExceptionForm.kind !== "personal" ? <label className="text-[0.64rem] font-bold text-ink-muted">
                Típus
                <AdminSelectField
                  ariaLabel="Naptárbejegyzés típusa"
                  value={weekExceptionForm.kind}
                  onChange={(value) => updateWeekExceptionForm("kind", value as ScheduleExceptionKind)}
                  className="mt-1"
                >
                  <option value="blocked">Kieső idő</option>
                  <option value="vacation">Szabadság / zárva</option>
                  <option value="custom-hours">Egyedi nyitvatartás</option>
                  <option value="personal">Saját emlékeztető</option>
                </AdminSelectField>
              </label> : null}
              {weekExceptionForm.kind !== "personal" ? <label className="text-[0.64rem] font-bold text-ink-muted">
                Naptár
                <AdminSelectField
                  ariaLabel="Érintett naptár"
                  value={weekExceptionForm.track}
                  onChange={(value) => updateWeekExceptionForm("track", value as ScheduleException["track"])}
                  className="mt-1"
                >
                  <option value="all">Mindkettő</option>
                  <option value="lashes">Műszempilla</option>
                  <option value="laser">Lézer</option>
                </AdminSelectField>
              </label> : null}
            </div>

            <label className="text-[0.64rem] font-bold text-ink-muted">
              {weekExceptionForm.kind === "personal" ? "Emlékeztető szövege" : "Naptárbejegyzés neve"}
              {weekExceptionForm.kind === "personal" ? <textarea
                value={weekExceptionForm.title}
                onChange={(event) => updateWeekExceptionForm("title", event.target.value)}
                maxLength={1000}
                rows={5}
                className={`${inputClassName} min-h-32 resize-y py-2`}
              /> : <input
                value={weekExceptionForm.title}
                onChange={(event) => updateWeekExceptionForm("title", event.target.value)}
                maxLength={120}
                className={inputClassName}
              />}
            </label>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-[0.64rem] font-bold text-ink-muted">
                {weekExceptionForm.kind === "vacation" ? "Első nap" : "Nap"}
                <AdminTemporalInput
                  type="date"
                  value={weekExceptionForm.startDate}
                  onChange={(event) => updateWeekExceptionForm("startDate", event.target.value)}
                  containerClassName="mt-1"
                  className="font-normal"
                />
              </label>
              {weekExceptionForm.kind === "vacation" ? (
                <label className="text-[0.64rem] font-bold text-ink-muted">
                  Utolsó nap
                  <AdminTemporalInput
                    type="date"
                    value={weekExceptionForm.endDate}
                    min={weekExceptionForm.startDate}
                    onChange={(event) => updateWeekExceptionForm("endDate", event.target.value)}
                    containerClassName="mt-1"
                    className="font-normal"
                  />
                </label>
              ) : null}
            </div>

            {weekExceptionForm.kind !== "vacation" && weekExceptionForm.kind !== "personal" ? (
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[0.64rem] font-bold text-ink-muted">
                  Kezdés
                  <AdminTemporalInput
                    type="time"
                    step={300}
                    value={weekExceptionForm.startTime ?? ""}
                    onChange={(event) => updateWeekExceptionForm("startTime", event.target.value)}
                    containerClassName="mt-1"
                    className="font-normal"
                  />
                </label>
                <label className="text-[0.64rem] font-bold text-ink-muted">
                  Befejezés
                  <AdminTemporalInput
                    type="time"
                    step={300}
                    value={weekExceptionForm.endTime ?? ""}
                    onChange={(event) => updateWeekExceptionForm("endTime", event.target.value)}
                    containerClassName="mt-1"
                    className="font-normal"
                  />
                </label>
              </div>
            ) : null}

            {weekExceptionError ? (
              <p role="alert" className="text-[0.64rem] font-semibold text-admin-danger">
                {weekExceptionError}
              </p>
            ) : null}

            <button
              type="button"
              onClick={applyWeekExceptionEdit}
              disabled={isSaving}
              className="min-h-9 w-full rounded-lg bg-gold-dark px-3 text-xs font-extrabold text-admin-bg disabled:opacity-45"
            >
              Módosítás alkalmazása
            </button>
            <AdminDangerButton
              onClick={removeWeekException}
              disabled={isSaving}
              className="w-full"
            >
              Bejegyzés törlése
            </AdminDangerButton>
            <p className="text-center text-[0.62rem] text-ink-muted">
              A módosítások a felső Mentés gombbal kerülnek véglegesen a naptárba.
            </p>
          </div>
        ) : null}
      </AdminEditorSheet>

      <AdminEditorSheet
        open={Boolean(editingBooking || profileBooking)}
        title={profileBooking ? "Vendégprofil" : editingBooking ? <AdminBookingServiceLabel groups={editingBooking.serviceGroups} /> : "Foglalás"}
        description={profileBooking ? profileBooking.guestName : editingBooking ? `${editingBooking.guestName} · ${editingBooking.date} ${editingBooking.time}–${editingBooking.endTime}` : undefined}
        onClose={() => { setEditingBookingId(null); setProfileBookingId(null); }}
      >
        {editingBooking && editingBookingDateDraft ? (
          <div className="grid gap-2.5">
            <div className="rounded-lg bg-gold-soft px-3 py-2 text-[0.68rem]">
              <p className="font-bold">{editingBooking.guestName}</p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-ink-muted">
                {editingBooking.phone ? (
                  <a href={`tel:${editingBooking.phone}`} className="font-semibold underline-offset-4 hover:underline">
                    {editingBooking.phone}
                  </a>
                ) : null}
                {editingBooking.email ? (
                  <a href={`mailto:${editingBooking.email}`} className="min-w-0 truncate font-semibold underline-offset-4 hover:underline">
                    {editingBooking.email}
                  </a>
                ) : null}
              </div>
              <button type="button" onClick={() => { setProfileBookingId(editingBooking.id); setEditingBookingId(null); }}
                className="mt-2 min-h-8 rounded-lg border border-gold-line px-2.5 text-[0.68rem] font-bold text-gold-dark focus-visible:outline-2 focus-visible:outline-gold-dark">
                Vendégprofil és előzmények
              </button>
              {editingBooking.note ? (
                <div className="mt-2">
                  <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.08em] text-ink-muted">Vendég megjegyzése</p>
                  <p className="mt-1 leading-5 text-ink-muted">{editingBooking.note}</p>
                </div>
              ) : null}
              
            </div>

            {renderBookingExtras?.(editingBooking)}
            <BookingPaymentField key={`${editingBooking.id}-${editingBooking.paidAmountHuf}`} booking={editingBooking} saving={savingBookingPaymentIds.includes(editingBooking.id)} onSave={saveBookingPayment} />
            <div className={styles.bookingStatusEditor} data-pending-status={bookingStatusDrafts[editingBooking.id] ?? undefined}>
              {bookingStatusDrafts[editingBooking.id] ? <span className={styles.bookingPendingStatus}>Mentésre vár:</span> : null}
              <AdminSelectMenu ariaLabel={`Foglalás állapota${bookingStatusDrafts[editingBooking.id] ? ", mentésre vár" : ""}`} value={bookingStatusDrafts[editingBooking.id] ?? editingBooking.status} options={statusOptionsForBooking(editingBooking, nowTimestamp)}
                onChange={(value) => updateBookingStatus(editingBooking.id, value)} disabled={isSaving || reschedulingBookingId !== null} buttonClassName="w-full" menuClassName="w-48" comfortableOptions />
            </div>
            <fieldset
              disabled={!editingBookingCanReschedule || isSaving || reschedulingBookingId === editingBooking.id}
              className="min-w-0"
            >
              <legend className="mb-1.5 text-[0.64rem] font-bold uppercase tracking-[0.1em] text-gold-dark">Időpont és időtartam</legend>
              <div className="grid min-w-0 grid-cols-2 gap-2">
                <label className="col-span-2 min-w-0 text-[0.64rem] font-bold text-ink-muted">
                  Dátum
                  <AdminTemporalInput
                    type="date"
                    value={editingBookingDateDraft.date}
                    onChange={(event) => updateBookingDateDraft(editingBooking.id, "date", event.target.value)}
                    containerClassName="mt-1"
                    className="font-normal"
                  />
                </label>
                <label className="min-w-0 text-[0.64rem] font-bold text-ink-muted">
                  Kezdés
                  <AdminTemporalInput
                    type="time"
                    step={300}
                    value={editingBookingDateDraft.time}
                    onChange={(event) => updateBookingDateDraft(editingBooking.id, "time", event.target.value)}
                    containerClassName="mt-1"
                    className="font-normal"
                  />
                </label>
                <label className="min-w-0 text-[0.64rem] font-bold text-ink-muted">
                  Befejezés
                  <AdminTemporalInput type="time" step={60} value={editingBookingDateDraft.endTime}
                    onChange={(event) => updateBookingDateDraft(editingBooking.id, "endTime", event.target.value)} containerClassName="mt-1" className="font-normal" />
                </label>
              </div>
              <p className="mt-2 text-[0.62rem] font-semibold leading-4 text-ink-muted">
                {editingBooking.source === "manual"
                  ? "Az időpont módosítása automatikusan megerősítve tartja a bejegyzést. Ha van vendég e-mail, a módosításról értesítést kap."
                  : "Az időpont módosítása automatikusan megerősíti a foglalást, és egyetlen módosítási e-mailt küld."}
              </p>
            </fieldset>
              <label className="mt-2 block text-[0.64rem] font-bold text-ink-muted">
                {editingBooking.source === "manual" && !editingBooking.email
                  ? "Név / megjegyzés"
                  : "Üzenet a vendégnek (nem kötelező, az e-mailben jelenik meg)"}
                <AdminAutoTextarea rows={2} maxLength={1000} disabled={isSaving || reschedulingBookingId !== null || effectiveEditingStatus === "completed" || effectiveEditingStatus === "guest_cancelled"} className={textareaClassName} value={editingBookingDateDraft.note}
                  onChange={(event) => updateBookingDateDraft(editingBooking.id, "note", event.target.value)} />
              </label>
              <button
                type="button"
                onClick={() => void rescheduleBooking(editingBooking)}
                disabled={!editingBookingHasDateChanged || isSaving || reschedulingBookingId !== null}
                className="mt-2 min-h-9 w-full rounded-lg bg-gold-dark px-3 text-xs font-extrabold text-admin-bg disabled:cursor-not-allowed disabled:opacity-45"
              >
                {reschedulingBookingId === editingBooking.id ? "Mentés…" : "Módosítás mentése"}
              </button>
              {!editingBookingCanReschedule ? (
                <p className="mt-2 text-xs font-semibold text-ink-muted">
                  Teljesített vagy lemondott foglalás időpontja nem módosítható.
                </p>
              ) : null}

            <div className="flex justify-end border-t border-gold-line pt-3">
              <AdminDangerButton
                onClick={() => void deleteBooking(editingBooking)}
                disabled={deletingBookingId !== null || reschedulingBookingId !== null}
              >
                {deletingBookingId === editingBooking.id ? "Törlés…" : "Végleges törlés"}
              </AdminDangerButton>
            </div>
          </div>
        ) : profileBooking ? (
          <div className="grid min-w-0 gap-3">
            <div className="rounded-lg bg-gold-soft px-3 py-3 text-xs">
              <p className="font-bold">{profileBooking.guestName}</p>
              <div className="mt-2 flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-ink-muted">
                {profileBooking.phone ? <a href={`tel:${profileBooking.phone}`} className="font-semibold underline-offset-4 hover:underline">{profileBooking.phone}</a> : null}
                {profileBooking.email ? <a href={`mailto:${profileBooking.email}`} className="min-w-0 break-all font-semibold underline-offset-4 hover:underline">{profileBooking.email}</a> : null}
              </div>
              <p className="mt-2 text-[0.62rem] text-ink-muted">Az egyező fiók, e-mail vagy telefonszám alapján összetartozó időpontok. </p>
            </div>
            <button type="button" onClick={() => { setProfileBookingId(null); onRebook(profileBooking); }} className="min-h-9 w-full rounded-lg bg-gold-dark px-3 text-xs font-bold text-admin-bg focus-visible:outline-2 focus-visible:outline-gold-dark">
              Új időpont ezzel a vendéggel
            </button>
            <section aria-labelledby="guest-booking-history-title">
              <h3 id="guest-booking-history-title" className="mb-2 text-xs font-bold">Időpontok · {guestHistory.length}</h3>
              <div className="grid gap-2">
                {guestHistory.map((booking) => (
                  <article key={booking.id} className="min-w-0 rounded-lg border border-admin-border/60 bg-admin-field p-3">
                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                      <span className="text-[0.68rem] font-bold">{booking.date} · {booking.time}–{booking.endTime}</span>
                      <span className={`rounded-md px-1.5 py-1 text-[0.6rem] font-bold ${getBookingStatusBadgeClass(booking.status)}`}>{bookingStatusLabels[booking.status]}</span>
                    </div>
                    <AdminBookingServiceLabel groups={booking.serviceGroups} className="mt-1 text-[0.68rem] leading-4 text-ink-muted" />
                    {booking.adminComment ? <p className="mt-2 break-words border-t border-admin-border/50 pt-2 text-[0.68rem] text-ink-muted"><span className="font-bold text-ink">Saját jegyzet: </span>{booking.adminComment}</p> : null}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" onClick={() => { setProfileBookingId(null); setEditingBookingId(booking.id); }} className="min-h-8 rounded-lg border border-admin-border px-2.5 text-[0.68rem] font-semibold focus-visible:outline-2 focus-visible:outline-gold-dark">Foglalás megnyitása</button>
                      <button type="button" onClick={() => { setProfileBookingId(null); onRebook(booking); }} className="min-h-8 rounded-lg border border-gold-line px-2.5 text-[0.68rem] font-semibold text-gold-dark focus-visible:outline-2 focus-visible:outline-gold-dark">Újra foglalás</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </AdminEditorSheet>
    </section>
  );
}
