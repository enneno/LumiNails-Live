import { AdminEditorSheet } from "./components/admin-editor-sheet";
import React, { useState } from "react";
import { api, today } from "./model";
import { AdminTemporalInput } from "./components/admin-temporal-input";
import { useHorizontalSwipe } from "./components/use-horizontal-swipe";
import {
  adminButtonClass,
  adminPrimaryButtonClass,
  adminIconButtonClass,
  AdminDangerButton,
  adminFieldClass,
  adminHeadingClass,
} from "./components/admin-ui";

// Same date + start + end identity as the original LumiNails calendar upsert.
export function scheduleRowsForSave(value: any, existing: any[] = []) {
  const rows = [...value.rows];
  for (const [date, interval] of Object.entries(value.selected || {}) as [
    string,
    any,
  ][]) {
    const index = rows.findIndex(
      (row) =>
        row.work_date === date &&
        row.start_time.slice(0, 5) === interval.start_time &&
        row.end_time.slice(0, 5) === interval.end_time,
    );
    const previous = existing.find(
      (row) =>
        row.work_date === date &&
        row.start_time.slice(0, 5) === interval.start_time &&
        row.end_time.slice(0, 5) === interval.end_time,
    );
    const row = {
      ...(index >= 0 ? rows[index] : previous || {}),
      work_date: date,
      ...interval,
      id:
        index >= 0
          ? rows[index].id
          : previous?.id || interval.id || api().createId(),
      slot_step_minutes: value.step || 30,
      active: true,
    };
    if (index >= 0) rows[index] = row;
    else rows.push(row);
  }
  return rows;
}

export function SchedulePanel({
  data,
  drafts,
  stage,
  report,
  busy,
  saveAll,
}: any) {
  const draft = drafts.schedule || {};
  const rows = draft.rows || data.windows || [],
    removed = draft.removed || [],
    selected = draft.selected || {};
  const selectedDates = Object.keys(selected).sort();
  const [month, setMonth] = useState(today().slice(0, 7));
  const [selectionMode, setSelectionMode] = useState(false);
  const [panel, setPanel] = useState<"day" | "bulk" | "list" | null>(null);
  const [date, setDate] = useState(today());
  const [start, setStart] = useState("09:00"),
    [end, setEnd] = useState("18:00");
  const step = draft.step ?? 30;
  const update = (changes: any) =>
    stage("schedule", { rows, removed, selected, step, ...changes });
  const [year, number] = month.split("-").map(Number);
  const count = new Date(year, number, 0, 12).getDate(),
    offset = (new Date(year, number - 1, 1, 12).getDay() + 6) % 7;
  function shiftMonth(delta: number) {
    setMonth(
      new Date(year, number - 1 + delta, 1, 12)
        .toLocaleDateString("sv-SE")
        .slice(0, 7),
    );
  }
  const swipe = useHorizontalSwipe((direction) =>
    shiftMonth(direction === "left" ? 1 : -1),
  );
  function toggle(day: string) {
    const next = { ...selected };
    if (next[day]) delete next[day];
    else next[day] = { id: api().createId(), start_time: start, end_time: end };
    update({ selected: next });
  }
  function openDay(day: string) {
    setDate(day);
    setPanel("day");
  }
  function changeRow(id: string, key: string, value: string) {
    update({
      rows: rows.map((row: any) =>
        row.id === id ? { ...row, [key]: value } : row,
      ),
    });
    if (key === "work_date") setDate(value);
  }
  function selectedTime(day: string, key: string, value: string) {
    update({
      selected: { ...selected, [day]: { ...selected[day], [key]: value } },
    });
  }
  const timeField = (
    label: string,
    value: string,
    change: (value: string) => void,
  ) => (
    <label className="min-w-0 text-xs font-bold text-ink-muted">
      {label}
      <AdminTemporalInput
        type="time"
        value={value}
        onChange={(event) => change(event.target.value)}
        containerClassName="mt-1"
      />
    </label>
  );
  const stepField = (
    <label className="block text-xs font-bold text-ink-muted">
      Időpontok sűrűsége
      <input
        type="number"
        min="1"
        step="1"
        value={step}
        className={`${adminFieldClass} mt-1`}
        onChange={(event) => update({ step: Number(event.target.value) })}
      />
    </label>
  );
  const pendingRow = (day: string) => (
    <article
      key={day}
      data-selected-date={day}
      className="grid min-w-0 gap-3 rounded-xl bg-admin-raised p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold">
          {day}
          <span className="ml-2 text-ink-muted">Új idősáv</span>
        </h3>
        <button
          type="button"
          className={`${adminButtonClass} text-admin-danger`}
          aria-label={`${day} kijelölésének törlése`}
          onClick={() => toggle(day)}
        >
          ×
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {timeField("Kezdés", selected[day].start_time, (value) =>
          selectedTime(day, "start_time", value),
        )}
        {timeField("Vége", selected[day].end_time, (value) =>
          selectedTime(day, "end_time", value),
        )}
      </div>
    </article>
  );
  const existingRow = (row: any) => (
    <article
      key={row.id}
      data-window-id={row.id}
      className="grid min-w-0 gap-3 rounded-xl bg-admin-raised p-3"
    >
      <div className="flex items-center gap-2">
        <label className="min-w-0 flex-1 text-xs font-bold">
          Dátum
          <AdminTemporalInput
            type="date"
            value={row.work_date}
            onChange={(event) =>
              changeRow(row.id, "work_date", event.target.value)
            }
            containerClassName="mt-1"
          />
        </label>
        <button
          type="button"
          className={`${adminButtonClass} text-admin-danger`}
          aria-label={`${row.work_date} idősáv törlése`}
          onClick={() => {
            if (
              confirm(
                "Biztosan törlöd ezt a beállított napot? A Mentés véglegesít.",
              )
            )
              update({
                rows: rows.filter((item: any) => item.id !== row.id),
                removed: [...new Set([...removed, row.id])],
              });
          }}
        >
          ×
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {timeField("Kezdés", row.start_time.slice(0, 5), (value) =>
          changeRow(row.id, "start_time", value),
        )}
        {timeField("Vége", row.end_time.slice(0, 5), (value) =>
          changeRow(row.id, "end_time", value),
        )}
      </div>
      <span className="text-xs text-ink-muted">
        {row.slot_step_minutes} perces időpontlépés
      </span>
    </article>
  );
  const dayRows = rows.filter((row: any) => row.work_date === date);
  const sortedRows = [...rows].sort((a: any, b: any) =>
    `${a.work_date}${a.start_time}`.localeCompare(
      `${b.work_date}${b.start_time}`,
    ),
  );
  return (
    <section className="grid min-w-0 max-w-3xl gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className={adminHeadingClass}>Beosztás</h1>
        <button
          type="button"
          className={adminButtonClass}
          aria-pressed={selectionMode}
          onClick={() => setSelectionMode(!selectionMode)}
        >
          {selectionMode ? "Kijelölés befejezése" : "Több nap kijelölése"}
        </button>
      </div>
      <p className="text-xs text-ink-muted">
        {selectionMode
          ? "Jelöld ki a beállítandó napokat, majd nyisd meg a közös beállításokat."
          : "Nyiss meg egy napot az idősávjai szerkesztéséhez."}
      </p>
      <div className="grid gap-3 rounded-xl border border-admin-border/60 bg-admin-surface p-3 sm:p-4">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
          <button
            type="button"
            className={adminIconButtonClass}
            aria-label="Előző hónap"
            onClick={() => shiftMonth(-1)}
          >
            ‹
          </button>
          <label className="min-w-0 text-xs font-bold text-ink-muted">
            Hónap
            <input
              type="month"
              value={month}
              className={`${adminFieldClass} mt-1`}
              onChange={(event) => {
                if (event.target.value) setMonth(event.target.value);
              }}
            />
          </label>
          <button
            type="button"
            className={adminIconButtonClass}
            aria-label="Következő hónap"
            onClick={() => shiftMonth(1)}
          >
            ›
          </button>
        </div>
        <div
          {...swipe}
          className="grid grid-cols-7 gap-1"
          role="group"
          aria-label="Foglalható napok havi naptára"
        >
          {["H", "K", "Sze", "Cs", "P", "Szo", "V"].map((day) => (
            <span
              key={day}
              className="py-1 text-center text-xs font-bold text-ink-muted"
            >
              {day}
            </span>
          ))}
          {Array.from({ length: offset }, (_, i) => (
            <span key={"empty-" + i} />
          ))}
          {Array.from({ length: count }, (_, i) => {
            const day = `${month}-${String(i + 1).padStart(2, "0")}`,
              saved = rows.some(
                (row: any) => row.work_date === day && row.active !== false,
              ),
              pending = Boolean(selected[day]);
            return (
              <button
                key={day}
                type="button"
                data-schedule-date={day}
                aria-label={day}
                aria-pressed={selectionMode ? pending : undefined}
                aria-current={day === today() ? "date" : undefined}
                onClick={() => (selectionMode ? toggle(day) : openDay(day))}
                className={`relative min-h-11 min-w-0 rounded-lg border text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark ${pending ? "border-gold-dark bg-gold-soft text-gold-dark" : saved ? "border-admin-success/30 bg-admin-success/10 text-ink" : "border-admin-border/60 bg-admin-field text-ink"}`}
              >
                {i + 1}
                {saved ? (
                  <span
                    className="absolute bottom-1 left-1/2 size-1 rounded-full bg-admin-success"
                    aria-label="Van mentett idősáv"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.65rem] text-ink-muted">
          <span>● Beállított nap</span>
          <span className="text-gold-dark">● Kijelölt / mentésre vár</span>
        </div>
      </div>
      {selectedDates.length ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`${adminPrimaryButtonClass} min-h-11 flex-1 sm:flex-none`}
            onClick={() => setPanel("bulk")}
          >
            {selectedDates.length} nap beállítása
          </button>
          <button
            type="button"
            className={adminButtonClass}
            onClick={() => update({ selected: {} })}
          >
            Kijelölés törlése
          </button>
        </div>
      ) : null}
      <button
        type="button"
        className={`${adminButtonClass} justify-between gap-3 text-left`}
        onClick={() => setPanel("list")}
      >
        <span>Beállított idősávok</span>
        <span className="text-ink-muted">{rows.length} idősáv · ›</span>
      </button>
      <AdminEditorSheet
        open={Boolean(panel)}
        title={
          panel === "day"
            ? date
            : panel === "bulk"
              ? `${selectedDates.length} nap beállítása`
              : "Beállított idősávok"
        }
        description="A módosításokat a Mentés véglegesíti."
        closeDisabled={busy}
        onClose={() => setPanel(null)}
      >
        <div className="grid min-w-0 gap-4">
          {panel === "day" ? (
            <>
              {!dayRows.length && !selected[date] ? (
                <p className="text-xs text-ink-muted">
                  Ehhez a naphoz még nincs beállított idősáv.
                </p>
              ) : null}
              {dayRows.map(existingRow)}
              {selected[date] ? (
                <>
                  {pendingRow(date)}
                  {stepField}
                </>
              ) : (
                <button
                  type="button"
                  className={adminButtonClass}
                  onClick={() => toggle(date)}
                >
                  + Új idősáv
                </button>
              )}
            </>
          ) : null}
          {panel === "bulk" ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                {timeField("Közös kezdés", start, setStart)}
                {timeField("Közös vége", end, setEnd)}
              </div>
              {stepField}
              <button
                type="button"
                className={adminButtonClass}
                disabled={!selectedDates.length}
                onClick={() => {
                  if (!start || !end || end <= start) {
                    report(
                      "A közös végidő legyen később, mint a kezdés.",
                      "error",
                    );
                    return;
                  }
                  update({
                    selected: Object.fromEntries(
                      selectedDates.map((day) => [
                        day,
                        { ...selected[day], start_time: start, end_time: end },
                      ]),
                    ),
                  });
                }}
              >
                Kijelöltekre beállítom
              </button>
              <details className="rounded-xl bg-admin-raised p-3">
                <summary className="cursor-pointer text-xs font-bold">
                  Naponkénti eltérések · {selectedDates.length} nap
                </summary>
                <div className="mt-3 grid gap-3">
                  {selectedDates.map(pendingRow)}
                </div>
              </details>
            </>
          ) : null}
          {panel === "list" ? (
            <>
              {!rows.length ? (
                <p className="text-xs text-ink-muted">
                  Még nincs megadva foglalható dátum.
                </p>
              ) : null}
              {sortedRows.map((row: any) => (
                <button
                  key={row.id}
                  type="button"
                  className={`${adminButtonClass} min-h-12 justify-between gap-3 text-left`}
                  onClick={() => openDay(row.work_date)}
                >
                  <span>{row.work_date}</span>
                  <span className="text-ink-muted">
                    {row.start_time.slice(0, 5)}–{row.end_time.slice(0, 5)} · ›
                  </span>
                </button>
              ))}
              {stepField}
              <button
                type="button"
                className={adminButtonClass}
                disabled={!rows.length}
                onClick={() =>
                  update({
                    rows: rows.map((row: any) => ({
                      ...row,
                      slot_step_minutes: step,
                    })),
                  })
                }
              >
                Lépés minden napra
              </button>
              <AdminDangerButton
                disabled={!rows.length}
                onClick={() => {
                  if (
                    confirm(
                      "Törlésre jelölöd az összes beállított napot? A meglévő foglalások megmaradnak. A Mentés véglegesít.",
                    )
                  )
                    update({
                      rows: [],
                      selected: {},
                      removed: [
                        ...new Set([
                          ...removed,
                          ...rows.map((row: any) => row.id),
                        ]),
                      ],
                    });
                }}
              >
                Összes nap törlése
              </AdminDangerButton>
            </>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2 border-t border-admin-border/60 pt-3">
            <button
              type="button"
              className={adminButtonClass}
              disabled={busy}
              onClick={() => setPanel(null)}
            >
              Bezárás
            </button>
            <button
              type="button"
              className={adminPrimaryButtonClass}
              disabled={busy || !drafts.schedule}
              onClick={async () => {
                if (await saveAll()) {
                  setPanel(null);
                  setSelectionMode(false);
                }
              }}
            >
              {busy ? "Mentés…" : "Mentés"}
            </button>
          </div>
        </div>
      </AdminEditorSheet>
    </section>
  );
}
