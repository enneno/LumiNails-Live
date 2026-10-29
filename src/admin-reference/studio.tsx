import { scheduleRowsForSave } from "./schedule-panel";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./components/admin-studio.module.css";
import { AdminBookingsTab } from "./components/admin-bookings-tab";
import { AdminOverview } from "./components/admin-overview";
import { AdminEditorSheet } from "./components/admin-editor-sheet";
import { AdminIcon } from "./components/admin-icon";
import { AdminFeedbackNotice } from "./components/admin-feedback";
import {
  adminButtonClass,
  adminIconButtonClass,
  adminPrimaryButtonClass,
} from "./components/admin-ui";
import { AdminManualBookingSheet } from "./components/admin-manual-booking-sheet";
import {
  getAdminBookingTasks,
  normalizeBookingSearch,
  sortAdminBookings,
} from "./lib/admin-bookings";
import { api, today, effectiveBookings } from "./model";
import { LoginScreen } from "./login";
import { AdminLoadingState } from "./components/admin-loading-state";
import { AdminAppearanceBridge } from "./components/admin-appearance";
import { getAdminViewDirection } from "./lib/admin-navigation";
import {
  PricesPanel,
  GalleryPanel,
  ContentPanel,
  SchedulePanel,
  CouponsPanel,
  GuestsPanel,
  SettingsPanel,
  LogsPanel,
  CalculatorPanel,
  Inbox,
  Publication,
} from "./panels";

const tabs = [
  { id: "overview", label: "Áttekintés", icon: "overview" },
  { id: "bookings", label: "Foglalások", icon: "bookings" },
  { id: "schedule", label: "Beosztás", icon: "schedule" },
  { id: "content", label: "Weboldal", icon: "content" },
  { id: "prices", label: "Árlista", icon: "prices" },
  { id: "gallery", label: "Galéria", icon: "gallery" },
  { id: "guests", label: "Vendégek", icon: "approvals" },
  { id: "coupons", label: "Kuponok", icon: "prices" },
  { id: "calculator", label: "Árkalkulátor", icon: "prices" },
  { id: "logs", label: "Logs", icon: "logs" },
  { id: "settings", label: "Beállítások", icon: "notifications" },
];
const emptyManual = () => ({
  serviceIds: [],
  date: today(),
  time: "09:00",
  endTime: "10:00",
  guestName: "",
  guestEmail: "",
  guestPhone: "",
});
export function LumiAdminStudio() {
  const [data, setData] = useState<any>(
    () => api()?.snapshot() || { authorized: false },
  );
  const [tabSlide, setTabSlide] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(() => {
      const requested = new URLSearchParams(location.search).get("tab");
      return tabs.some((tab) => tab.id === requested) ? requested! : "overview";
    }),
    [isMoreOpen, setIsMoreOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(false),
    [notice, setNotice] = useState<any>(null);
  const [statuses, setStatuses] = useState<any>({}),
    [dates, setDates] = useState<any>({}),
    [editing, setEditing] = useState<number | null>(null),
    [savingPayments, setSavingPayments] = useState<number[]>([]);
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState<any>("all"),
    [size, setSize] = useState<any>(10),
    [page, setPage] = useState(1),
    [view, setView] = useState<any>("list"),
    [calendar, setCalendar] = useState({
      monthKey: today().slice(0, 7),
      selectedDate: today(),
    });
  const [drafts, setDrafts] = useState<any>({}),
    [manual, setManual] = useState<any>(null);
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowTimestamp(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const workspace = useRef<HTMLDivElement>(null),
    scroll = useRef(new Map()),
    loaded = useRef(new Set<string>());
  const authorized = Boolean(data.authorized),
    bookings = data.bookings || [],
    effective = effectiveBookings(bookings, statuses, dates),
    upcoming = effective.filter((row: any) => ["new", "confirmed"].includes(row.status) && Date.parse(row.endsAt) >= nowTimestamp).sort((a: any,b: any) => Date.parse(a.startsAt)-Date.parse(b.startsAt));
  const dirty =
    Object.keys(statuses).length > 0 ||
    Object.keys(dates).length > 0 ||
    Object.keys(drafts).length > 0;
  const info = tabs.find((tab) => tab.id === activeTab)!;
  function exportCurrent() {
    let rows = bookings
      .filter(
        (row: any) =>
          (filter === "all" || row.status === filter) &&
          normalizeBookingSearch(
            `${row.guestName} ${row.phone} ${row.email} ${row.confirmationCode} ${row.source === "manual" ? "kézzel felvett kézi időpont" : ""}`,
          ).includes(normalizeBookingSearch(search)),
      )
      .sort((a: any, b: any) => sortAdminBookings(a, b, nowTimestamp));
    if (view === "calendar")
      rows = rows.filter(
        (row: any) => row.dateInput.slice(0, 7) === calendar.monthKey,
      );
    else if (view === "week") {
      const first = new Date(calendar.selectedDate + "T12:00:00");
      first.setDate(first.getDate() - ((first.getDay() + 6) % 7));
      const last = new Date(first);
      last.setDate(last.getDate() + 6);
      rows = rows.filter(
        (row: any) =>
          row.dateInput >= first.toLocaleDateString("sv-SE") &&
          row.dateInput <= last.toLocaleDateString("sv-SE"),
      );
    } else if (size !== "all") {
      const current = Math.min(
        page,
        Math.max(1, Math.ceil(rows.length / size)),
      );
      rows = rows.slice((current - 1) * size, current * size);
    }
    api().exportBookings(rows.map((row: any) => row.id));
  }
  const report = (message: string, tone = "info") =>
    setNotice({ id: Date.now(), message, tone });
  const updateData = (snapshot: any) => setData(snapshot);
  async function run(work: () => Promise<any>, message?: string) {
    setBusy(true);
    try {
      const next = await work();
      if (next?.authorized !== undefined) updateData(next);
      if (message) report(message, "success");
      return true;
    } catch (error) {
      report(
        error instanceof Error ? error.message : "A művelet nem sikerült.",
        "error",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function load(tab: string, force = false) {
    if (!authorized) return;
    if (
      !force &&
      loaded.current.has(tab) &&
      ["prices", "coupons", "content", "gallery", "settings"].includes(tab)
    )
      return;
    setLoading(true);
    try {
      const snapshot = await api().load(tab, force);
      setData(snapshot);
      loaded.current.add(tab);
    } catch (error) {
      report(String(error), "error");
    } finally {
      setLoading(false);
    }
  }
  function navigate(tab: string) {
    scroll.current.set(activeTab, workspace.current?.scrollTop || 0);
    setTabSlide(
      getAdminViewDirection(
        activeTab,
        tab,
        tabs.map((tab) => tab.id),
      ),
    );
    setActiveTab(tab);
    setIsMoreOpen(false);
    setEditing(null);
    requestAnimationFrame(() =>
      workspace.current?.scrollTo({ top: scroll.current.get(tab) || 0 }),
    );
  }
  useEffect(() => api()?.subscribe(() => setData(api().snapshot())), []);
  useEffect(() => {
    const resume = () => {
      if (
        document.visibilityState === "visible" &&
        authorized &&
        !dirty &&
        !busy &&
        ["overview", "bookings"].includes(activeTab)
      )
        void load(activeTab, true);
    };
    document.addEventListener("visibilitychange", resume);
    return () => document.removeEventListener("visibilitychange", resume);
  }, [authorized, dirty, busy, activeTab]);
  useEffect(() => {
    const body = document.body,
      link = document.getElementById(
        "admin-legacy-styles",
      ) as HTMLLinkElement | null;
    body.classList.add("admin-reference-active");
    if (link) link.disabled = true;
    if (!authorized) {
      loaded.current.clear();
      setStatuses({});
      setDates({});
      setDrafts({});
      setManual(null);
      setEditing(null);
      setIsMoreOpen(false);
      setSearch("");
      setFilter("all");
      setPage(1);
      setNotice(null);
      setSavingPayments([]);
    } else load(activeTab);
    return () => {};
  }, [authorized]);
  useEffect(() => {
    if (authorized && !drafts[activeTab]) void load(activeTab);
  }, [activeTab]);
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(
      () => setNotice(null),
      notice.tone === "error" ? 10000 : 5000,
    );
    return () => clearTimeout(timer);
  }, [notice]);
  function stage(scope: string, value: any) {
    setDrafts((previous: any) => ({ ...previous, [scope]: value }));
  }
  function dateChange(id: number, field: string, value: string) {
    const row = bookings.find((row: any) => row.id === id);
    setDates((previous: any) => ({
      ...previous,
      [id]: {
        date: row.dateInput,
        time: row.timeInput,
        endTime: row.endTime,
        note: row.source === "manual" ? row.guestName : "",
        ...previous[id],
        [field]: value,
      },
    }));
  }
  function updateStatus(id: number, status: string) {
    setStatuses((previous: any) => {
      const next = { ...previous },
        original = bookings.find((row: any) => row.id === id);
      if (status === original?.status) delete next[id];
      else next[id] = status;
      return next;
    });
  }
  async function saveBooking(id?: number) {
    const ids = [...new Set([...Object.keys(statuses), ...Object.keys(dates)])]
      .map(Number)
      .filter((key) => id === undefined || key === id);
    if (!ids.length) return true;
    const okay = await run(
      () =>
        api().saveBookings(
          ids.map((id) => {
            const row = bookings.find((row: any) => row.id === id),
              draft = dates[id],
              moved =
                draft &&
                (draft.date !== row.dateInput ||
                  draft.time !== row.timeInput ||
                  draft.endTime !== row.endTime);
            return {
              id,
              status: statuses[id] ?? (moved ? "confirmed" : undefined),
              ...draft,
            };
          }),
        ),
      "Foglalások mentve.",
    );
    if (okay) {
      setStatuses((old: any) =>
        Object.fromEntries(
          Object.entries(old).filter(([key]) => !ids.includes(Number(key))),
        ),
      );
      setDates((old: any) =>
        Object.fromEntries(
          Object.entries(old).filter(([key]) => !ids.includes(Number(key))),
        ),
      );
    }
    return okay;
  }
  async function saveAll() {
    if (!(await saveBooking())) return false;
    for (const scope of Object.keys(drafts)) {
      const value = drafts[scope];
      const fn =
        scope === "prices"
          ? () => api().saveServices(value)
          : scope === "coupons"
            ? () => api().saveCoupons(value)
            : scope === "schedule"
              ? () => { const rows = scheduleRowsForSave(value, data.windows); return api().saveWindows(rows, value.removed.filter((id: string) => !rows.some((row: any) => row.id === id))); }
              : scope === "settings"
                ? () => api().savePhone(value)
                : () => api().saveContent(value);
      if (!(await run(fn, "Mentve."))) return false;
      setDrafts((old: any) => {
        const next = { ...old };
        delete next[scope];
        return next;
      });
    }
    return true;
  }
  async function refresh() {
    if (
      dirty &&
      !confirm(
        "A frissítés eldobja a még nem mentett módosításokat. Folytatod?",
      )
    )
      return;
    setStatuses({});
    setDates({});
    setDrafts({});
    await load(activeTab, true);
  }
  async function newManual(date = today(), time = "09:00", booking?: any) {
    await load("prices");
    const snapshot = api().snapshot();
    if (!snapshot.authorized || !loaded.current.has("prices")) return;
    const currentBooking = booking
      ? snapshot.bookings.find((row: any) => row.id === booking.id)
      : null;
    const requestedIds = currentBooking?.serviceIds?.length
      ? currentBooking.serviceIds
      : booking?.serviceIds || [];
    const selected = (snapshot.services || [])
      .filter(
        (row: any) =>
          requestedIds.includes(row.id) && row.active && row.booking_enabled,
      )
      .slice(0, 1);
    const duration = selected[0]?.duration_minutes || 60;
    const start = Number(time.slice(0, 2)) * 60 + Number(time.slice(3)),
      end = Math.min(1439, start + duration);
    if (!Number.isFinite(start) || end <= start) {
      report(
        "Ehhez a kezdéshez nem adható napon belüli befejezés. Válassz korábbi időpontot.",
        "error",
      );
      return;
    }
    if (!loaded.current.has("bookings")) void load("bookings");
    setManual({
      ...emptyManual(),
      date,
      time,
      endTime:
        String(Math.floor(end / 60)).padStart(2, "0") +
        ":" +
        String(end % 60).padStart(2, "0"),
      guestName: booking?.guestName || "",
      serviceIds: selected.map((row: any) => row.id),
    });
  }
  async function payment(booking: any, amount: number | null) {
    if (dates[booking.id] || statuses[booking.id]) {
      report(
        "Előbb mentsd az időpont vagy állapot függő módosítását.",
        "error",
      );
      return;
    }
    setSavingPayments((old) => [...old, booking.id]);
    try {
      await run(
        () => api().savePayment(booking.id, amount),
        "Fizetett összeg mentve.",
      );
    } finally {
      setSavingPayments((old) => old.filter((id) => id !== booking.id));
    }
  }
  const tasks = useMemo(
    () => getAdminBookingTasks(effective, nowTimestamp),
    [data, statuses, dates, nowTimestamp],
  );
  const pending = effective.filter((row: any) => row.status === "new").length,
    unack = effective.filter(
      (row: any) =>
        row.status === "guest_cancelled" && !row.cancellationAcknowledgedAt,
    ).length;
  const dockIndex =
    activeTab === "overview"
      ? 0
      : activeTab === "bookings"
        ? 1
        : activeTab === "schedule"
          ? 3
          : 4;
  if (!authorized)
    return (
      <div className="admin-theme h-full">
        <AdminAppearanceBridge />
        {data.authError ? (
          <LoginScreen error={data.authError} />
        ) : data.ready && !data.pending ? (
          <LoginScreen />
        ) : (
          <AdminLoadingState
            embedded
            state="loading"
            message="Belépés ellenőrzése…"
          />
        )}
      </div>
    );
  const shared = { data, drafts, stage, run, report, busy, saveAll };
  return (
    <div className="admin-theme h-full">
      <AdminAppearanceBridge />
      <div className={styles.shell} data-admin-shell data-admin-ready>
        {notice ? (
          <div className={styles.toastLayer} style={{ display: "block" }}>
            <AdminFeedbackNotice
              notice={notice}
              onDismiss={() => setNotice(null)}
            />
          </div>
        ) : null}
        <header className={styles.header}>
          <div
            role="toolbar"
            aria-label="Admin műveletek"
            className={styles.toolbar}
          >
            <span
              key={activeTab + loading + busy}
              className={styles.toolbarActivity}
              aria-hidden
            />
            <span
              className={`${styles.brandMark} flex size-8 shrink-0 items-center justify-center rounded-lg bg-gold-dark/10 text-sm font-bold text-gold-dark`}
              aria-hidden
            >
              LN
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold lg:text-sm">LumiNails</p>
              <p className="truncate text-[0.65rem] text-ink-muted lg:hidden">
                {info.label}
              </p>
            </div>
            <span
              className="sr-only max-w-xs truncate text-[0.68rem] text-ink-muted md:not-sr-only"
              role="status"
            >
              {busy ? "Mentés…" : dirty ? "Mentetlen módosítások" : ""}
            </span>
            <Inbox
              data={data}
              run={run}
              onOpenBookings={() => navigate("bookings")}
              onOpenGuests={() => navigate("guests")}
              onOpen={(id: number) => {
                navigate("bookings");
                setEditing(id);
              }}
              onLoad={() => load("notifications")}
              report={report}
            />
            <button
              type="button"
              onClick={refresh}
              disabled={busy || loading}
              aria-label={`${info.label} frissítése`}
              title="Frissítés"
              className={adminIconButtonClass}
            >
              <AdminIcon
                name="refresh"
                className={`size-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            {dirty || busy ? (
              <button
                type="button"
                data-admin-save
                onClick={saveAll}
                disabled={busy}
                className={adminPrimaryButtonClass}
              >
                <AdminIcon name="save" className="size-3.5" />
                {busy ? "Mentés…" : "Mentés"}
                {!busy ? (
                  <span
                    className="size-1.5 rounded-full bg-admin-bg/50"
                    aria-label="Mentetlen módosítás"
                  />
                ) : null}
              </button>
            ) : null}
          </div>
        </header>
        <div className={styles.body}>
          <aside className={styles.sidebar}>
            <nav aria-label="Admin menü" className="grid gap-0.5">
              <button
                type="button"
                onClick={() => newManual()}
                className={`${styles.navItem} mb-2 border border-gold-line text-gold-dark`}
              >
                <AdminIcon name="add" className="size-[1.125rem] shrink-0" />
                <span className="min-w-0 flex-1 truncate">Új időpont</span>
              </button>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => navigate(tab.id)}
                  aria-pressed={activeTab === tab.id}
                  className={styles.navItem}
                >
                  <AdminIcon
                    name={tab.icon as any}
                    className="size-[1.125rem] shrink-0"
                  />
                  <span className="min-w-0 flex-1 truncate">{tab.label}</span>
                  {tab.id === "logs" && data.hasNewLogErrors ? <span className="size-2.5 shrink-0 rounded-full bg-admin-danger" aria-label="Új naplóhiba" /> : null}
                  {tab.id === "bookings" && pending + unack > 0 ? (
                    <span className="rounded-full bg-gold-dark px-1.5 py-0.5 text-[0.6rem] font-bold text-admin-bg">
                      {pending + unack}
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>
            <div className="mt-auto border-t border-admin-border/50 pt-3">
              <button
                type="button"
                onClick={exportCurrent}
                className={styles.navItem}
              >
                Foglalások Excel-exportja
              </button>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.navItem}
              >
                <AdminIcon name="external" className="size-4" />
                Weboldal megnyitása
              </a>
              <button
                type="button"
                onClick={() => api().signOut()}
                className={styles.navItem}
              >
                <AdminIcon name="logout" className="size-4" />
                Kilépés
              </button>
            </div>
          </aside>
          <div ref={workspace} data-admin-scroll className={styles.workspace}>
            <main
              inert={busy}
              className={`${styles.page} ${styles.screenSlide} ${activeTab === "bookings" && view === "list" ? "flex flex-col" : ""}`}
              data-slide={tabSlide ?? undefined}
              onAnimationEnd={(event) => {
                if (event.target === event.currentTarget) setTabSlide(null);
              }}
            >
              {loading ? (
                <p className="py-2 text-xs text-ink-muted" role="status">
                  Adatok betöltése…
                </p>
              ) : null}
              {activeTab === "overview" ? (
                <AdminOverview
                  today={today()}
                  todayBookings={effective
                    .filter(
                      (row: any) =>
                        row.dateInput === today() &&
                        !["cancelled", "guest_cancelled"].includes(row.status),
                    )
                    .sort((a: any, b: any) =>
                      a.startsAt.localeCompare(b.startsAt),
                    )}
                  upcomingBookings={upcoming.slice(0, 5)}
                  pendingCount={pending}
                  weekCount={upcoming.filter((row: any) => Date.parse(row.startsAt) <= nowTimestamp + 7 * 86400000).length}
                  paidBookings={effective}
                  archivedRevenue={[]}
                  tasks={tasks}
                  outcomeBookings={effective}
                  onOpenBooking={(id) => {
                    navigate("bookings");
                    setEditing(id);
                  }}
                  onOpenCalendar={() => {
                    navigate("bookings");
                    setView("calendar");
                  }}
                  onOpenPending={() => {
                    navigate("bookings");
                    setFilter("new");
                  }}
                />
              ) : null}
              {activeTab === "bookings" ? (
                <AdminBookingsTab
                  renderBookingExtras={(booking) => (
                    <>
                      {booking.coupon ? (
                        <p className="text-xs text-ink-muted">
                          <strong>Kupon:</strong> {booking.coupon}
                        </p>
                      ) : null}
                      {booking.nailStyle ? (
                        <p className="text-xs text-ink-muted">
                          <strong>Körömstílus:</strong> {booking.nailStyle}
                        </p>
                      ) : null}
                      {booking.inspirations?.length ? (
                        <section className="rounded-lg border border-gold-line p-3">
                          <h3 className="text-xs font-bold">
                            Inspirációs képek
                          </h3>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {booking.inspirations.map(
                              (image: any, index: number) => (
                                <a
                                  key={index}
                                  href={image.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="min-w-0 overflow-hidden rounded-lg bg-admin-field"
                                >
                                  <img
                                    src={image.url}
                                    alt={image.name || "Inspirációs kép"}
                                    className="aspect-square w-full object-cover"
                                  />
                                </a>
                              ),
                            )}
                          </div>
                          <button
                            type="button"
                            className={`${adminButtonClass} mt-2 text-admin-danger`}
                            onClick={() => {
                              if (confirm("Törlöd az inspirációs képeket?"))
                                void run(
                                  () => api().removeInspirations(booking.id),
                                  "Inspirációs képek törölve.",
                                );
                            }}
                          >
                            Képek törlése
                          </button>
                        </section>
                      ) : null}
                    </>
                  )}
                  draft={{
                    schedule: { exceptions: [], slotIntervalMinutes: 30 },
                  }}
                  bookings={bookings}
                  effectiveBookings={effective}
                  bookingStatusDrafts={statuses}
                  bookingDateDrafts={dates}
                  reschedulingBookingId={null}
                  deletingBookingId={null}
                  acknowledgingBookingId={null}
                  savingBookingCommentId={null}
                  savingBookingPaymentIds={savingPayments}
                  isSaving={busy}
                  editingWeekExceptionId={null}
                  weekExceptionForm={null}
                  weekExceptionError=""
                  bookingSearch={search}
                  bookingStatusFilter={filter}
                  bookingPageSize={size}
                  bookingPage={page}
                  bookingView={view}
                  bookingCalendar={calendar}
                  editingBookingId={editing}
                  nowTimestamp={nowTimestamp}
                  todayDateInput={today()}
                  onBookingSearchChange={setSearch}
                  onBookingStatusFilterChange={setFilter}
                  onBookingPageSizeChange={setSize}
                  onBookingPageChange={setPage}
                  onBookingViewChange={setView}
                  onBookingCalendarChange={setCalendar}
                  onBookingSwapOpenChange={() => {}}
                  onQuickAddCalendarEntry={(_, date) => newManual(date)}
                  onEditingBookingIdChange={setEditing}
                  onOpenWeekExceptionEditor={() => navigate("schedule")}
                  onOpenTraining={() => {}}
                  onCloseWeekExceptionEditor={() => {}}
                  onUpdateWeekExceptionForm={() => {}}
                  onApplyWeekExceptionEdit={() => {}}
                  onRemoveWeekException={() => {}}
                  onStageWeekExceptionMove={() => {}}
                  onUpdateBookingStatus={updateStatus}
                  onDeleteBooking={async (booking) => {
                    if (!confirm("Végleg törlöd ezt az időpontot?")) return;
                    if (
                      await run(
                        () => api().removeBooking(booking.id),
                        "Időpont törölve.",
                      )
                    ) {
                      setEditing(null);
                      setStatuses((old: any) => {
                        const next = { ...old };
                        delete next[booking.id];
                        return next;
                      });
                      setDates((old: any) => {
                        const next = { ...old };
                        delete next[booking.id];
                        return next;
                      });
                    }
                  }}
                  onUpdateBookingAdminComment={() => {}}
                  onSaveBookingAdminComment={async () => {}}
                  onSaveBookingPayment={payment}
                  onAcknowledgeGuestCancellation={(booking) =>
                    run(
                      () => api().acknowledge(booking.id),
                      "Lemondás nyugtázva.",
                    )
                  }
                  onUpdateBookingDateDraft={dateChange}
                  onStageBookingMoveFromWeek={(
                    booking,
                    date,
                    time,
                    endTime,
                  ) => {
                    setDates((old: any) => ({
                      ...old,
                      [booking.id]: {
                        ...old[booking.id],
                        date,
                        time,
                        endTime,
                        note:
                          old[booking.id]?.note ??
                          (booking.source === "manual"
                            ? booking.guestName
                            : ""),
                      },
                    }));
                  }}
                  onRescheduleBooking={(booking) => saveBooking(booking.id)}
                  onRebook={(booking) => newManual(today(), "09:00", booking)}
                  onCreateManualBookingAt={newManual}
                  trainingSessions={[]}
                  trainingCalendarError=""
                />
              ) : null}
              {activeTab === "prices" ? <PricesPanel {...shared} /> : null}
              {activeTab === "gallery" ? <GalleryPanel {...shared} /> : null}
              {activeTab === "content" ? <ContentPanel {...shared} /> : null}
              {activeTab === "schedule" ? <SchedulePanel {...shared} /> : null}
              {activeTab === "coupons" ? <CouponsPanel {...shared} /> : null}
              {activeTab === "guests" ? (
                <GuestsPanel
                  {...shared}
                  bookings={bookings}
                  onLoadHistory={() => load("bookings")}
                  onRebook={(booking: any) =>
                    newManual(today(), "09:00", booking)
                  }
                  onOpen={(id: number) => {
                    navigate("bookings");
                    setEditing(id);
                  }}
                />
              ) : null}
              {activeTab === "settings" ? <SettingsPanel {...shared} /> : null}
              {activeTab === "logs" ? <LogsPanel data={data} loading={loading} onRefresh={() => void load("logs", true)} /> : null}
              {activeTab === "calculator" ? (
                <CalculatorPanel {...shared} />
              ) : null}
              {["content", "gallery", "prices", "settings"].includes(
                activeTab,
              ) ? (
                <Publication data={data} />
              ) : null}
            </main>
          </div>
        </div>
        <AdminEditorSheet
          open={isMoreOpen}
          title="Továbbiak"
          onClose={() => setIsMoreOpen(false)}
        >
          <div className="grid grid-cols-2 gap-2">
            {tabs
              .filter(
                (tab) => !["overview", "bookings", "schedule"].includes(tab.id),
              )
              .map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => navigate(tab.id)}
                  aria-pressed={activeTab === tab.id}
                  className={`${styles.moreItem} relative flex min-h-12 items-center gap-2.5 rounded-xl bg-admin-raised px-3 text-left text-xs font-semibold focus-visible:outline-2 focus-visible:outline-gold-dark`}
                >
                  <AdminIcon name={tab.icon as any} className="size-4" />
                  {tab.label}
                  {tab.id === "logs" && data.hasNewLogErrors ? <span className="ml-auto size-2.5 shrink-0 rounded-full bg-admin-danger" aria-label="Új naplóhiba" /> : null}
                </button>
              ))}
          </div>
          <button
            type="button"
            className={`${adminButtonClass} mt-3 w-full`}
            onClick={exportCurrent}
          >
            Foglalások Excel-exportja
          </button>
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-admin-border/50 pt-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={adminButtonClass}
            >
              <AdminIcon name="external" className="size-3.5" />
              Weboldal
            </a>
            <button
              type="button"
              onClick={() => api().signOut()}
              className={adminButtonClass}
            >
              <AdminIcon name="logout" className="size-3.5" />
              Kilépés
            </button>
          </div>
        </AdminEditorSheet>
        <div data-admin-dock className={styles.dock}>
          <nav aria-label="Mobil admin eszköztár" data-active={dockIndex}>
            <span className={styles.dockSelection} aria-hidden />
            {["overview", "bookings"].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => navigate(id)}
                aria-pressed={activeTab === id && !isMoreOpen}
                className={styles.dockItem}
              >
                <span className="relative">
                  <AdminIcon name={id as any} className="size-5 shrink-0" />
                  {id === "bookings" && pending + unack > 0 ? (
                    <span className="absolute -right-2.5 -top-1 flex min-h-3.5 min-w-3.5 items-center justify-center rounded-full bg-gold-dark px-1 text-[0.55rem] font-bold text-admin-bg">
                      {pending + unack}
                    </span>
                  ) : null}
                </span>
                <span>{id === "overview" ? "Ma" : "Foglalások"}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => newManual()}
              aria-expanded={Boolean(manual)}
              className={`${styles.dockItem} ${styles.dockAction}`}
            >
              <AdminIcon name="add" className="size-5" />
              <span>Új idő</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("schedule")}
              aria-pressed={activeTab === "schedule" && !isMoreOpen}
              className={styles.dockItem}
            >
              <AdminIcon name="schedule" className="size-5" />
              <span>Beosztás</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMoreOpen(true)}
              aria-expanded={isMoreOpen}
              aria-pressed={dockIndex === 4}
              className={styles.dockItem}
            >
              <span className="relative"><AdminIcon name="more" className="size-5" />{data.hasNewLogErrors ? <span className="absolute -right-2 -top-1 size-2.5 rounded-full bg-admin-danger ring-2 ring-admin-bg" aria-label="Új naplóhiba" /> : null}</span>
              <span>Továbbiak</span>
            </button>
          </nav>
        </div>
        <AdminManualBookingSheet
          open={Boolean(manual)}
          creating={busy}
          draft={manual || emptyManual()}
          services={(data.services || [])
            .filter((row: any) => row.active && row.booking_enabled)
            .map((row: any) => ({
              id: row.id,
              track: "lashes",
              category: "Köröm",
              name: row.name,
              durationMinutes: row.duration_minutes,
              priceLabel: row.price_text,
              durationLabel: row.duration_minutes + " perc",
            }))}
          bookings={bookings}
          onClose={() => setManual(null)}
          onSubmit={async () => {
            if (
              await run(
                () => api().createManual(manual),
                "Kézi időpont mentve.",
              )
            )
              setManual(null);
          }}
          onChange={(field, value) =>
            setManual((old: any) => ({ ...old, [field]: value }))
          }
          onToggleService={(id) =>
            setManual((old: any) => {
              const service = data.services.find((row: any) => row.id === id);
              const start =
                Number(old.time.slice(0, 2)) * 60 + Number(old.time.slice(3));
              const end = Math.min(
                1439,
                start + (service?.duration_minutes || 60),
              );
              return {
                ...old,
                serviceIds: old.serviceIds.includes(id) ? [] : [id],
                endTime:
                  String(Math.floor(end / 60)).padStart(2, "0") +
                  ":" +
                  String(end % 60).padStart(2, "0"),
              };
            })
          }
          onSelectGuest={(guest) =>
            setManual((old: any) => ({ ...old, guestName: guest.guestName }))
          }
        />
      </div>
    </div>
  );
}
