import { useState } from "react";
import { adminButtonClass, adminHeadingClass, adminPressableClass } from "@/components/admin-ui";
import { AdminWeekPicker, adminWeekNavigationButtonClass, formatWeekRange } from "@/components/admin-week-picker";
import { bookingStatusLabels, getBookingStatusBadgeClass, type BookingStatus } from "@/lib/booking-status";
import { summarizeMonthlyBookingOutcomes, type AdminBooking, type AdminBookingServiceGroup, type AdminBookingTask } from "@/lib/admin-bookings";
import { getIsoWeek, getIsoWeekStart, summarizePaidRevenue, type ArchivedRevenueDay } from "@/lib/admin-revenue";

type AgendaBooking = {
  id: number;
  startsAt: string;
  time: string;
  endTime: string;
  date: string;
  guestName: string;
  serviceLabel: string;
  serviceGroups: AdminBookingServiceGroup[];
  trackId: "lashes" | "laser" | "mixed";
  status: BookingStatus;
};

export type { AdminBookingServiceGroup } from "@/lib/admin-bookings";

export function AdminBookingServiceLabel({ groups, className }: { groups: AdminBookingServiceGroup[]; className?: string }) {
  return (
    <span className={`block min-w-0 ${className ?? ""}`}>
      {groups.map((group) => {
        const [firstName, ...remainingNames] = group.names;
        const lashLabel = splitLashAdminServiceLabel(group.label);
        return (
          <span
            key={`${group.label}-${group.names.join("|")}`}
            className={`grid min-w-0 ${group.label ? "grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-x-2 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)]" : "grid-cols-1"} ${lashLabel ? "items-end" : ""}`}
          >
            {group.label ? (
              lashLabel ? (
                <span className="min-w-0 font-semibold text-ink">
                  <span className="block">{lashLabel.title}</span>
                  <span className="block whitespace-nowrap">{lashLabel.detail}:</span>
                </span>
              ) : (
                <span className="min-w-0 break-words font-semibold text-ink">{group.label}:</span>
              )
            ) : null}
            <span className={`${group.label ? "col-start-2" : ""} min-w-0 break-words ${lashLabel ? "self-end" : ""}`}>{firstName}</span>
            {remainingNames.map((name) => (
              <span key={name} className={`${group.label ? "col-start-2" : ""} min-w-0 break-words`}>{name}</span>
            ))}
          </span>
        );
      })}
    </span>
  );
}

function splitLashAdminServiceLabel(label: string) {
  const prefix = "Műszempilla · ";
  if (!label.startsWith(prefix)) return null;

  const detail = label.slice(prefix.length).trim();
  return detail ? { title: "Műszempilla", detail } : null;
}

type AdminOverviewProps = {
  today: string;
  todayBookings: AgendaBooking[];
  upcomingBookings: AgendaBooking[];
  pendingCount: number;
  weekCount: number;
  paidBookings: Pick<AdminBooking, "dateInput" | "paidAmountHuf">[];
  archivedRevenue: ArchivedRevenueDay[];
  tasks: AdminBookingTask[];
  outcomeBookings: AdminBooking[];
  onOpenBooking: (id: number) => void;
  onOpenCalendar: () => void;
  onOpenPending: () => void;
};

export function AdminOverview({ today, todayBookings, upcomingBookings, pendingCount, weekCount, paidBookings, archivedRevenue, tasks, outcomeBookings, onOpenBooking, onOpenCalendar, onOpenPending }: AdminOverviewProps) {
  const [activeRevenueCard, setActiveRevenueCard] = useState<"week" | "month" | null>(null);
  const [weekSelection, setWeekSelection] = useState<string | null>(null);
  const [monthSelection, setMonthSelection] = useState<{ year: number; month: number } | null>(null);
  const [yearPageEnd, setYearPageEnd] = useState<number | null>(null);
  const [outcomeMonthSelection, setOutcomeMonthSelection] = useState<{ year: number; month: number } | null>(null);
  const [outcomeYearPageEnd, setOutcomeYearPageEnd] = useState<number | null>(null);
  const [isOutcomeMonthPickerOpen, setIsOutcomeMonthPickerOpen] = useState(false);
  const next = upcomingBookings[0];
  const dateLabel = new Intl.DateTimeFormat("hu-HU", { month: "long", day: "numeric", weekday: "long", timeZone: "UTC" }).format(new Date(`${today}T12:00:00Z`));
  const currentMonth = { year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) };
  const nextMonthInput = new Date(Date.UTC(currentMonth.year, currentMonth.month, 1, 12)).toISOString().slice(0, 7);
  const latestOutcomeMonthInput = outcomeBookings.reduce((latest, booking) => {
    const bookingMonth = booking.dateInput.slice(0, 7);
    return bookingMonth > latest ? bookingMonth : latest;
  }, nextMonthInput);
  const latestOutcomeMonth = { year: Number(latestOutcomeMonthInput.slice(0, 4)), month: Number(latestOutcomeMonthInput.slice(5, 7)) };
  const earliestOutcomeDate = new Date(Date.UTC(currentMonth.year, currentMonth.month - 6, 1, 12));
  const earliestOutcomeMonth = { year: earliestOutcomeDate.getUTCFullYear(), month: earliestOutcomeDate.getUTCMonth() + 1 };
  const selectedWeekDate = weekSelection ?? today;
  const selectedWeek = getIsoWeek(selectedWeekDate);
  const selectedMonth = monthSelection ?? currentMonth;
  const selectedOutcomeMonth = outcomeMonthSelection ?? currentMonth;
  const outcomes = summarizeMonthlyBookingOutcomes(outcomeBookings, selectedOutcomeMonth.year, selectedOutcomeMonth.month);
  const maxWeeklyCount = Math.max(1, ...outcomes.weeklyCounts);
  const daysInSelectedMonth = new Date(Date.UTC(selectedOutcomeMonth.year, selectedOutcomeMonth.month, 0)).getUTCDate();
  const weekStart = getIsoWeekStart(selectedWeek.year, selectedWeek.week);
  const weekEnd = new Date(`${weekStart}T12:00:00Z`);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const weekEndInput = weekEnd.toISOString().slice(0, 10);
  const monthlyDate = `${String(selectedMonth.year).padStart(4, "0")}-${String(selectedMonth.month).padStart(2, "0")}-01`;
  const weeklyRevenue = summarizePaidRevenue(paidBookings, weekStart, archivedRevenue);
  const monthlyRevenue = summarizePaidRevenue(paidBookings, monthlyDate, archivedRevenue);
  const monthFormatter = new Intl.DateTimeFormat("hu-HU", { month: "long", timeZone: "UTC" });
  const monthOptions = Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: monthFormatter.format(new Date(Date.UTC(2024, index, 1, 12))) }));
  const selectedMonthLabel = monthOptions[selectedMonth.month - 1].label;
  const selectedOutcomeMonthLabel = monthOptions[selectedOutcomeMonth.month - 1].label;
  const revenueTrend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(selectedOutcomeMonth.year, selectedOutcomeMonth.month - 6 + index, 1, 12));
    const monthInput = date.toISOString().slice(0, 10);
    return {
      monthInput,
      label: `${date.getUTCFullYear()}. ${monthFormatter.format(date)}`,
      amount: summarizePaidRevenue(paidBookings, monthInput, archivedRevenue).monthHuf,
    };
  });
  const maxTrendAmount = Math.max(1, ...revenueTrend.map(({ amount }) => amount));

  return (
    <section aria-labelledby="admin-overview-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 id="admin-overview-title" className={adminHeadingClass}>A szalon ma</h1>
          <p className="mt-1 text-xs text-ink-muted first-letter:uppercase">{dateLabel}</p>
        </div>
        <button type="button" onClick={onOpenCalendar} className={adminButtonClass}>Naptár <Chevron /></button>
      </div>

      <section aria-labelledby="admin-revenue-title" className="mt-5 rounded-xl border border-admin-border/60 bg-admin-surface p-3 lg:bg-admin-raised">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 id="admin-revenue-title" className="text-xs font-bold">Rögzített bevétel</h2>
          <p className="text-[0.64rem] text-ink-muted">Az időpont dátuma szerinti fizetett összegek</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { period: "week" as const, label: weekSelection ? formatWeekRange(weekStart, weekEndInput) : "Ezen a héten", amount: weeklyRevenue.weekHuf, count: weeklyRevenue.weekCount },
            { period: "month" as const, label: monthSelection ? `${selectedMonth.year}. ${selectedMonthLabel}` : "Ebben a hónapban", amount: monthlyRevenue.monthHuf, count: monthlyRevenue.monthCount },
          ].map(({ period, label, amount, count }) => (
            <button key={period} type="button" aria-expanded={activeRevenueCard === period} aria-controls={activeRevenueCard === period ? "admin-revenue-period-controls" : undefined}
              onClick={() => setActiveRevenueCard(activeRevenueCard === period ? null : period)}
              className={`${adminPressableClass} min-w-0 rounded-lg border px-3 py-2.5 text-left hover:bg-admin-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark ${activeRevenueCard === period ? "border-gold-dark/60 bg-admin-raised" : "border-transparent bg-admin-field"}`}>
              <span className="block text-[0.65rem] font-semibold text-ink-muted">{label}</span>
              <span className="mt-1 block break-words text-lg font-bold tabular-nums text-gold-dark">{new Intl.NumberFormat("hu-HU").format(amount)} Ft</span>
              <span className="block text-[0.62rem] text-ink-muted">{count} rögzített összeg · időszak választása</span>
            </button>
          ))}
        </div>
        {activeRevenueCard ? (
          <div id="admin-revenue-period-controls" className="mt-2 rounded-lg border border-admin-border/60 bg-admin-field p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold">{activeRevenueCard === "week" ? "Heti bevétel" : "Havi bevétel"}</h3>
              <button type="button" onClick={() => {
                if (activeRevenueCard === "week") setWeekSelection(null);
                else { setMonthSelection(null); setYearPageEnd(null); }
              }} className="text-[0.68rem] font-semibold text-gold-dark underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-gold-dark">
                {activeRevenueCard === "week" ? "Aktuális hét" : "Aktuális hónap"}
              </button>
            </div>
            {activeRevenueCard === "week" ? (
              <div className="mt-2">
                <AdminWeekPicker key={weekSelection ? "selected" : "current"} inline selectedDate={selectedWeekDate}
                  weekStart={weekStart} weekEnd={weekEndInput} today={today} onSelect={setWeekSelection}
                  hint="Válassz egy napot a hét bevételének megtekintéséhez" />
              </div>
            ) : (
              <AdminMonthPicker ariaLabel="Bevételi" selectedMonth={selectedMonth} latestMonth={currentMonth}
                yearPageEnd={yearPageEnd} onYearPageEndChange={setYearPageEnd} onSelect={setMonthSelection} monthOptions={monthOptions} />
            )}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="admin-tasks-title" className="mt-5 rounded-xl border border-admin-border/60 bg-admin-surface p-3 lg:bg-admin-raised">
        <div className="flex items-center justify-between gap-2">
          <h2 id="admin-tasks-title" className="text-xs font-bold">Teendők</h2>
          <span className="rounded-md bg-admin-field px-2 py-1 text-[0.62rem] font-bold text-gold-dark">{tasks.length}</span>
        </div>
        {tasks.length ? (
          <div className="mt-2 divide-y divide-admin-border/50">
            {tasks.slice(0, 6).map(({ booking, label, kind }) => (
              <button key={booking.id} type="button" onClick={() => onOpenBooking(booking.id)} className={`${adminPressableClass} flex min-h-11 w-full min-w-0 items-center gap-2 rounded-lg py-2 text-left hover:bg-admin-field focus-visible:outline-2 focus-visible:outline-gold-dark`}>
                <span className={`size-1.5 shrink-0 rounded-full ${kind === "cancellation" ? "bg-admin-danger" : "bg-gold-dark"}`} aria-hidden="true" />
                <span className="min-w-0 flex-1"><span className="block truncate text-[0.7rem] font-bold">{booking.guestName}</span><span className="block truncate text-[0.62rem] text-ink-muted">{booking.date} · {booking.time}</span></span>
                <span className="max-w-[45%] text-right text-[0.62rem] font-semibold text-gold-dark">{label}</span>
                <Chevron />
              </button>
            ))}
            {tasks.length > 6 ? <p className="pt-2 text-[0.62rem] text-ink-muted">További {tasks.length - 6} teendő a Foglalások között.</p> : null}
          </div>
        ) : <p className="mt-2 text-[0.68rem] text-ink-muted">Most nincs intézendő foglalás.</p>}
      </section>

      <div className="my-5 flex divide-x divide-admin-border/60">
        {[
          { count: todayBookings.length, label: "ma", action: onOpenCalendar },
          { count: pendingCount, label: "visszaigazolás", action: onOpenPending },
          { count: weekCount, label: "7 napon belül", action: onOpenCalendar },
        ].map(({ count, label, action }) => (
          <button key={label} type="button" onClick={action} className={`${adminPressableClass} flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1 text-center hover:bg-admin-raised focus-visible:outline-2 focus-visible:outline-gold-dark sm:flex-row sm:justify-center sm:gap-2`}>
            <span className={`text-xl font-semibold leading-none tracking-tight ${label === "visszaigazolás" && count > 0 ? "text-gold-dark" : "text-ink"}`}>{count}</span>
            <span className="text-[0.65rem] text-ink-muted">{label}</span>
          </button>
        ))}
      </div>

      {next ? (
        <button type="button" onClick={() => onOpenBooking(next.id)} className={`${adminPressableClass} group mt-5 mb-5 flex w-full items-center gap-2 rounded-2xl bg-admin-raised px-3 py-3.5 text-left hover:bg-admin-field hover:shadow-[0_5px_16px_rgb(0_0_0_/_0.16)] focus-visible:outline-2 focus-visible:outline-gold-dark sm:gap-3 sm:px-4`}>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold-dark/10 text-sm font-semibold text-gold-dark sm:size-10" aria-hidden="true">{initials(next.guestName)}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.65rem] text-ink-muted">Következő vendég · {next.date}</span>
            <span className="mt-0.5 block truncate text-sm font-bold">{next.guestName}</span>
            <AdminBookingServiceLabel groups={next.serviceGroups} className="mt-0.5 text-xs leading-4 text-ink-muted" />
          </span>
          <span className="shrink-0 text-right">
            <span className="block text-base font-semibold tracking-tight text-gold-dark">{next.time}</span>
            <span className="block text-[0.65rem] text-ink-muted">{next.endTime}-ig</span>
          </span>
          <span className="hidden sm:inline-flex"><Chevron /></span>
        </button>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <section aria-labelledby="today-bookings-title">
          <div className="mb-2 flex items-center justify-between">
            <h2 id="today-bookings-title" className="text-sm font-bold">Mai időpontok</h2>
            <span className="text-[0.65rem] text-ink-muted">{todayBookings.length} vendég</span>
          </div>
          {todayBookings.length ? (
            <div className="divide-y divide-admin-border/50">
              {todayBookings.map((booking) => (
                <button key={booking.id} type="button" onClick={() => onOpenBooking(booking.id)} className={`${adminPressableClass} group grid w-full grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-2 rounded-lg py-3 text-left hover:bg-admin-raised focus-visible:outline-2 focus-visible:outline-gold-dark sm:gap-3`}>
                  <span className="text-right text-xs font-semibold">{booking.time}<span className="mt-1 block text-[0.65rem] font-normal text-ink-muted">{booking.endTime}</span></span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold">{booking.guestName}</span>
                    <span className="mt-1 flex min-w-0 items-start gap-1.5 text-[0.68rem] leading-4 text-ink-muted"><TrackDot track={booking.trackId} /><AdminBookingServiceLabel groups={booking.serviceGroups} className="text-[0.68rem] leading-4 text-ink-muted" /></span>
                  </span>
                  <span className={`rounded-md px-2 py-1 text-[0.6rem] font-semibold ${getBookingStatusBadgeClass(booking.status)}`}>{bookingStatusLabels[booking.status]}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-admin-surface px-4 py-7 text-center lg:bg-admin-raised">
              <p className="text-xs font-semibold">Ma nincs rögzített időpont.</p>
              <button type="button" onClick={onOpenCalendar} className="mt-2 text-xs font-semibold text-gold-dark underline-offset-4 hover:underline">Naptár megnyitása</button>
            </div>
          )}
        </section>
        <section aria-labelledby="upcoming-bookings-title">
          <h2 id="upcoming-bookings-title" className="mb-2 text-sm font-bold">Következő vendégek</h2>
          <div className="divide-y divide-admin-border/50">
            {upcomingBookings.slice(0, 5).map((booking) => {
              const date = new Date(booking.startsAt);
              return (
                <button key={booking.id} type="button" onClick={() => onOpenBooking(booking.id)} className={`${adminPressableClass} flex w-full items-center gap-3 rounded-lg py-3 text-left hover:bg-admin-raised focus-visible:outline-2 focus-visible:outline-gold-dark`}>
                  <span className="flex w-9 shrink-0 flex-col items-center text-ink-muted"><span className="text-[0.6rem]">{new Intl.DateTimeFormat("hu-HU", { month: "short", timeZone: "Europe/Budapest" }).format(date)}</span><span className="text-base font-semibold text-ink">{new Intl.DateTimeFormat("hu-HU", { day: "numeric", timeZone: "Europe/Budapest" }).format(date)}</span></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">{booking.guestName}</span><AdminBookingServiceLabel groups={booking.serviceGroups} className="mt-0.5 text-[0.68rem] leading-4 text-ink-muted" /></span>
                  <span className="text-[0.68rem] font-semibold">{booking.time}</span><Chevron />
                </button>
              );
            })}
          </div>
          {!upcomingBookings.length ? <p className="py-5 text-xs text-ink-muted">Nincs közelgő aktív foglalás.</p> : null}
        </section>
      </div>
      <p className="mt-8 border-t border-admin-border/60 pt-5 text-sm font-bold">Statisztikák</p>

      <div className="mt-3 grid items-start gap-5 lg:grid-cols-2">
      <section aria-labelledby="admin-outcomes-title" className="rounded-xl border border-admin-border/60 bg-admin-surface p-3 lg:bg-admin-raised">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="admin-outcomes-title" className="text-xs font-bold">Foglalások alakulása</h2>
          <button type="button" aria-expanded={isOutcomeMonthPickerOpen} aria-controls={isOutcomeMonthPickerOpen ? "admin-outcomes-period-controls" : undefined}
            onClick={() => setIsOutcomeMonthPickerOpen(!isOutcomeMonthPickerOpen)}
            className={`${adminButtonClass} min-h-10 text-gold-dark`}>
            {selectedOutcomeMonth.year}. {selectedOutcomeMonthLabel} <span aria-hidden="true" className="rotate-90"><Chevron /></span>
          </button>
        </div>
        {isOutcomeMonthPickerOpen ? (
          <div id="admin-outcomes-period-controls" className="mt-2 rounded-lg border border-admin-border/60 bg-admin-field p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold">Hónap kiválasztása</h3>
              <button type="button" onClick={() => { setOutcomeMonthSelection(null); setOutcomeYearPageEnd(null); }}
                className="text-[0.68rem] font-semibold text-gold-dark underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-gold-dark">
                Aktuális hónap
              </button>
            </div>
            <AdminMonthPicker ariaLabel="Foglalási" selectedMonth={selectedOutcomeMonth} latestMonth={latestOutcomeMonth} earliestMonth={earliestOutcomeMonth}
              yearPageEnd={outcomeYearPageEnd} onYearPageEndChange={setOutcomeYearPageEnd} onSelect={setOutcomeMonthSelection} monthOptions={monthOptions} />
          </div>
        ) : null}
        <div className="mt-3 flex items-end justify-between gap-3 rounded-lg bg-admin-field px-3 py-2.5">
          <span><span className="block text-[0.65rem] font-semibold text-ink-muted">Havi időpontok</span><span className="block text-[0.62rem] text-ink-muted">{outcomes.scheduled} nyitott foglalás</span></span>
          <strong className="text-2xl leading-none tabular-nums text-gold-dark">{outcomes.total}</strong>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Teljesítve", count: outcomes.completed },
            { label: "Nem jelent meg", count: outcomes.noShow },
            { label: "Lemondva", count: outcomes.cancelled },
          ].map(({ label, count }) => (
            <div key={label} className="min-w-0 rounded-lg bg-admin-field px-1.5 py-2">
              <span className="block text-base font-bold tabular-nums text-gold-dark">{count}</span>
              <span className="block break-words text-[0.6rem] text-ink-muted">{label}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[0.62rem] text-ink-muted">{outcomes.noShowPercent === null ? "Még nincs lezárt, nem lemondott időpont." : `Meg nem jelenés: ${outcomes.noShowPercent}% a teljesített és meg nem jelent időpontokból.`}</p>
      </section>

      <section aria-labelledby="admin-revenue-trend-title" className="rounded-xl border border-admin-border/60 bg-admin-surface p-3 lg:bg-admin-raised">
        <h2 id="admin-revenue-trend-title" className="text-xs font-bold">Bevétel alakulása</h2>
        <p className="mt-0.5 text-[0.62rem] text-ink-muted">Hat naptári hónap · az időpont dátuma szerinti rögzített összegek</p>
        <div className="mt-3 grid gap-2.5">
          {revenueTrend.map(({ monthInput, label, amount }) => (
            <div key={monthInput}>
              <div className="flex items-center justify-between gap-2 text-[0.65rem]">
                <span className="min-w-0 truncate text-ink-muted">{label}</span>
                <span className="shrink-0 font-semibold tabular-nums text-gold-dark">{new Intl.NumberFormat("hu-HU").format(amount)} Ft</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-admin-field" aria-hidden="true">
                <span className="block h-full rounded-full bg-gold-dark" style={{ width: `${amount / maxTrendAmount * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="admin-distribution-title" className="rounded-xl border border-admin-border/60 bg-admin-surface p-3 lg:col-span-2 lg:bg-admin-raised">
        <h2 id="admin-distribution-title" className="text-xs font-bold">Havi megoszlás · {selectedOutcomeMonthLabel}</h2>
        <div className="mt-3 grid gap-5 md:grid-cols-2">
          <div>
            <h3 className="text-[0.68rem] font-semibold">Időpontok hetenként</h3>
            <p className="mt-0.5 text-[0.62rem] text-ink-muted">Az időpont dátuma szerint, a lemondásokkal együtt.</p>
            {outcomes.total ? (
              <div className="mt-3 grid grid-cols-5 gap-2" aria-label="Heti időpontok">
                {outcomes.weeklyCounts.map((count, index) => {
                  const firstDay = index * 7 + 1;
                  const lastDay = Math.min(firstDay + 6, daysInSelectedMonth);
                  return (
                    <div key={firstDay} className="flex min-w-0 flex-col items-center gap-1 text-center">
                      <span className="text-[0.65rem] font-bold tabular-nums text-gold-dark">{count}</span>
                      <div className="flex h-20 w-full items-end border-b border-admin-border/60 px-1" aria-hidden="true">
                        <span className="w-full rounded-t-sm bg-gold-dark/85" style={{ height: count ? `${Math.max(8, count / maxWeeklyCount * 100)}%` : 0 }} />
                      </div>
                      <span className="text-[0.58rem] tabular-nums text-ink-muted">{firstDay}–{lastDay}</span>
                    </div>
                  );
                })}
              </div>
            ) : <p className="mt-3 text-[0.68rem] text-ink-muted">Ebben a hónapban nincs rögzített időpont.</p>}
          </div>
          <div>
            <h3 className="text-[0.68rem] font-semibold">Szolgáltatási területek</h3>
            <p className="mt-0.5 text-[0.62rem] text-ink-muted">Nem lemondott foglalások alapján.</p>
            <div className="mt-3 grid gap-3">
              {([
                { key: "lashes" as const, label: "Műszempilla" },
                { key: "laser" as const, label: "Lézer" },
                { key: "mixed" as const, label: "Pilla + lézer" },
              ]).map(({ key, label }) => {
                const count = outcomes.trackCounts[key];
                const total = outcomes.total - outcomes.cancelled;
                return (
                  <div key={key}>
                    <div className="flex justify-between gap-2 text-[0.65rem]"><span>{label}</span><span className="font-semibold tabular-nums text-gold-dark">{count}</span></div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-admin-field" aria-hidden="true">
                      <span className="block h-full rounded-full bg-gold-dark" style={{ width: total ? `${count / total * 100}%` : 0 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <p className="mt-3 text-[0.6rem] text-ink-muted">A foglalási statisztikák a jelenleg tárolt időpontokból készülnek.</p>
      </section>
      </div>

    </section>
  );
}

function AdminMonthPicker({ ariaLabel, selectedMonth, latestMonth, earliestMonth, yearPageEnd, onYearPageEndChange, onSelect, monthOptions }: {
  ariaLabel: string;
  selectedMonth: { year: number; month: number };
  latestMonth: { year: number; month: number };
  earliestMonth?: { year: number; month: number };
  yearPageEnd: number | null;
  onYearPageEndChange: (year: number) => void;
  onSelect: (selection: { year: number; month: number }) => void;
  monthOptions: { value: number; label: string }[];
}) {
  const visibleYearEnd = yearPageEnd ?? latestMonth.year;
  const yearOptions = Array.from({ length: 6 }, (_, index) => visibleYearEnd - index).filter((year) => year >= (earliestMonth?.year ?? 1));

  return (
    <div className="mt-2">
      {yearOptions.length === 1 ? (
        <p className="mx-auto mb-3 max-w-76 text-center text-xs font-bold tabular-nums">{yearOptions[0]}</p>
      ) : <div role="group" aria-label={`${ariaLabel} évek`} className="mx-auto max-w-76">
        <p className="mb-1 text-[0.65rem] font-semibold text-ink-muted">Év</p>
        <div className="mb-2 flex items-center justify-between gap-2">
          <button type="button" aria-label="Korábbi évek" disabled={visibleYearEnd - 6 < (earliestMonth?.year ?? 1)}
            onClick={() => onYearPageEndChange(visibleYearEnd - 6)}
            className={`${adminWeekNavigationButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}>‹</button>
          <span className="text-xs font-bold tabular-nums">{yearOptions[yearOptions.length - 1]}–{yearOptions[0]}</span>
          <button type="button" aria-label="Újabb évek" disabled={visibleYearEnd >= latestMonth.year}
            onClick={() => onYearPageEndChange(Math.min(visibleYearEnd + 6, latestMonth.year))}
            className={`${adminWeekNavigationButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}>›</button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {yearOptions.map((year) => (
            <button key={year} type="button" aria-pressed={selectedMonth.year === year}
              onClick={() => onSelect({ year, month: Math.min(selectedMonth.month, year === latestMonth.year ? latestMonth.month : 12) })}
              className={`min-h-9 rounded-lg px-1.5 text-xs font-bold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-gold-dark ${selectedMonth.year === year ? "bg-gold-dark text-admin-bg" : "bg-admin-raised text-ink hover:bg-admin-surface"}`}>
              {year}
            </button>
          ))}
        </div>
      </div>}
      <div className="mx-auto mt-3 max-w-76">
        <p className="mb-1 text-[0.65rem] font-semibold text-ink-muted">Hónap</p>
        <div role="group" className="grid grid-cols-3 gap-1.5" aria-label={`${ariaLabel} hónapok`}>
          {monthOptions.map(({ value, label }) => (
            <button key={value} type="button" aria-pressed={selectedMonth.month === value}
              disabled={(selectedMonth.year === latestMonth.year && value > latestMonth.month)
                || (selectedMonth.year === earliestMonth?.year && value < earliestMonth.month)}
              onClick={() => onSelect({ year: selectedMonth.year, month: value })}
              className={`min-h-9 min-w-0 rounded-lg px-1.5 text-[0.68rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-gold-dark disabled:cursor-not-allowed disabled:opacity-35 ${selectedMonth.month === value ? "bg-gold-dark text-admin-bg" : "bg-admin-raised text-ink hover:bg-admin-surface"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TrackDot({ track }: { track: "lashes" | "laser" | "mixed" }) {
  const dotClass = track === "lashes"
    ? "bg-admin-lashes"
    : track === "laser"
      ? "bg-admin-laser"
      : "bg-admin-accent";
  return <span aria-hidden="true" className={`inline-block size-1.5 shrink-0 rounded-full ${dotClass}`} />;
}

export function Chevron() {
  return <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 shrink-0 fill-none stroke-current text-ink-muted" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 4 4 4-4 4" /></svg>;
}

function initials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join(""); }
