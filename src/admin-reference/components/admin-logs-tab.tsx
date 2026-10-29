// UI from the Szalon reference; data and delivery queues are owned by LumiNails.
import { useState } from 'react';
import { adminButtonClass, adminDescriptionClass, adminHeadingClass } from './admin-ui';
import { copyAdminText } from '../lib/clipboard';
import { formatAdminErrorReport, sourceLabels, type AdminErrorEvent } from '../lib/admin-error-logs';

export function AdminLogsTab({
  events,
  loading,
  error,
  onRefresh,
}: {
  events: AdminErrorEvent[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  const [copyStatus, setCopyStatus] = useState("");
  const formatDate = new Intl.DateTimeFormat("hu-HU", { dateStyle: "medium", timeStyle: "short" });

  async function copyReport() {
    try {
      await copyAdminText(formatAdminErrorReport(events));
      setCopyStatus("A hibalista a vágólapra került. Beillesztheted egy üzenetbe.");
    } catch {
      setCopyStatus("Nem sikerült másolni. Próbáld újra.");
    }
  }

  return (
    <section aria-labelledby="admin-logs-title" className="min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 id="admin-logs-title" className={adminHeadingClass}>Logs</h1>
          <p className={adminDescriptionClass}>Tartós háttérhibák és a 8 próbálkozás után is sikertelen küldések. A maguktól rendeződő hibák eltűnnek.</p>
        </div>
        <button type="button" onClick={() => void copyReport()} disabled={loading || events.length === 0} className={`${adminButtonClass} min-h-11`}>
          Hibalista másolása
        </button>
      </div>

      {copyStatus ? <p role="status" className="mt-3 text-xs text-admin-muted">{copyStatus}</p> : null}
      {error ? <p role="alert" className="mt-4 rounded-xl border border-admin-danger/30 bg-admin-danger/10 p-3 text-xs text-admin-danger">{error}</p> : null}

      <div className="mt-5 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold">Hibák</h2>
        <button type="button" onClick={onRefresh} disabled={loading} className={`${adminButtonClass} min-h-10`}>
          {loading ? "Frissítés…" : "Frissítés"}
        </button>
      </div>

      {loading && events.length === 0 ? <p role="status" className="mt-4 text-xs text-ink-muted">Hibák betöltése…</p> : null}
      {!loading && !error && events.length === 0 ? (
        <div className="mt-4 rounded-xl border border-admin-border/60 bg-admin-surface p-5">
          <p className="text-sm font-semibold">Nincs rögzített hiba.</p>
          <p className="mt-1 text-xs text-ink-muted">Új hiba esetén piros pont jelenik meg a Logs és a Továbbiak ponton.</p>
        </div>
      ) : null}

      {events.length > 0 ? (
        <ol className="mt-4 grid gap-3">
          {events.map((event) => (
            <li key={event.id} className="min-w-0 rounded-xl border border-admin-danger/25 bg-admin-raised p-4">
              <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-ink-muted">
                <span className="rounded-full bg-admin-danger/10 px-2 py-1 font-bold text-admin-danger">Hiba</span>
                <span>{sourceLabels[event.source] ?? event.source}</span>
                <time dateTime={event.occurred_at}>{formatDate.format(new Date(event.occurred_at))}</time>
              </div>
              <h3 className="mt-2 text-sm font-semibold break-words">{event.title}</h3>
              {event.detail ? <p className="mt-1 text-xs leading-relaxed text-ink-muted break-words whitespace-pre-wrap">{event.detail}</p> : null}
              <p className="mt-2 text-[0.65rem] text-ink-muted">Naplóazonosító: {event.id}</p>
            </li>
          ))}
        </ol>
      ) : null}
      {events.length === 200 ? <p className="mt-4 text-xs text-ink-muted">A legutóbbi 200 hiba látható. A másolt lista is ezeket tartalmazza.</p> : null}
    </section>
  );
}
