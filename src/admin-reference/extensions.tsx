import React, { useEffect, useState } from "react";
import { AdminEditorSheet } from "./components/admin-editor-sheet";
import { AdminAppearanceControls } from "./components/admin-appearance";
import { AdminSelectMenu } from "./components/admin-select-menu";
import {
  AdminSwitch,
  adminHeadingClass,
  adminButtonClass,
  adminPrimaryButtonClass,
  adminFieldClass,
  adminIconButtonClass,
  adminPressableClass,
} from "./components/admin-ui";
import { api } from "./model";
import { adminNotifications } from "./lib/admin-notifications";

export function SettingsPanel({ data, drafts, stage, run, report }: any) {
  const [password, setPassword] = useState(""),
    [repeat, setRepeat] = useState(""),
    [passwordOpen, setPasswordOpen] = useState(false),
    [saving, setSaving] = useState(false);
  const [push, setPush] = useState(false),
    [pushBusy, setPushBusy] = useState(false),
    [pushMessage, setPushMessage] = useState(""),
    [pushSupported, setPushSupported] = useState(false);
  useEffect(() => {
    let alive = true;
    const pwa = (window as any).LumiPWA;
    void (async () => {
      const supported = Boolean(
        window.isSecureContext && pwa?.supportsNotifications(),
      );
      if (!alive) return;
      setPushSupported(supported);
      if (!supported) {
        setPushMessage(
          "Ezen a helyi kapcsolaton az értesítések nem érhetők el.",
        );
        return;
      }
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (alive) setPush(Boolean(subscription));
        } else if (alive)
          setPushMessage(
            "Az értesítéshez telepített adminalkalmazás szükséges.",
          );
      } catch {
        if (alive)
          setPushMessage("Az eszköz értesítési állapota nem olvasható.");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  async function changePush(checked: boolean) {
    setPushBusy(true);
    try {
      const pwa = (window as any).LumiPWA;
      await (checked ? pwa.enableAdminPush() : pwa.disableAdminPush());
      setPush(checked);
      setPushMessage(
        checked
          ? "Értesítések bekapcsolva ezen az eszközön."
          : "Értesítések kikapcsolva ezen az eszközön.",
      );
    } catch (error) {
      setPushMessage(
        error instanceof Error
          ? error.message
          : "Az értesítés beállítása nem sikerült.",
      );
    } finally {
      setPushBusy(false);
    }
  }
  return (
    <section>
      <h1 className={adminHeadingClass}>Beállítások</h1>
      <div className="mt-3">
        <AdminAppearanceControls />
      </div>
      <section className="mt-4 grid gap-3 rounded-xl bg-admin-raised p-4">
        <label className="flex items-center justify-between gap-3 text-xs font-bold">
          Telefonszám megjelenítése
          <AdminSwitch
            checked={drafts.settings ?? data.phoneVisible}
            onChange={(event: any) => stage("settings", event.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-xs font-bold">
          Értesítések ezen az eszközön
          <AdminSwitch
            checked={push}
            disabled={!pushSupported || pushBusy}
            onChange={(event: any) => void changePush(event.target.checked)}
          />
        </label>
        {pushMessage ? (
          <p role="status" className="text-[0.68rem] text-ink-muted">
            {pushMessage}
          </p>
        ) : null}
        <p className="text-[0.68rem] leading-relaxed text-ink-muted">
          Mobilon a böngésző Megosztás menüjében add az adminoldalt a
          Főképernyőhöz. Az alkalmazásból az értesítéseket is bekapcsolhatod.
        </p>
        <button
          type="button"
          className={adminButtonClass}
          onClick={() => setPasswordOpen(true)}
        >
          Jelszó módosítása
        </button>
      </section>
      <AdminEditorSheet
        open={passwordOpen}
        title="Jelszó módosítása"
        closeDisabled={saving}
        onClose={() => {
          setPasswordOpen(false);
          setPassword("");
          setRepeat("");
        }}
      >
        <form
          className="grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            try {
              if (
                await run(
                  () => api().changePassword(password, repeat),
                  "Jelszó módosítva.",
                )
              ) {
                setPasswordOpen(false);
                setPassword("");
                setRepeat("");
              }
            } finally {
              setSaving(false);
            }
          }}
        >
          <p className="text-xs leading-relaxed text-ink-muted">
            8–128 karakter, legalább egy kisbetű, egy nagybetű és egy szám.
          </p>
          <label className="text-xs font-bold text-ink-muted">
            Új jelszó
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`${adminFieldClass} mt-1`}
            />
          </label>
          <label className="text-xs font-bold text-ink-muted">
            Új jelszó ismét
            <input
              type="password"
              autoComplete="new-password"
              required
              value={repeat}
              onChange={(event) => setRepeat(event.target.value)}
              className={`${adminFieldClass} mt-1`}
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className={adminPrimaryButtonClass}
          >
            {saving ? "Mentés…" : "Jelszó mentése"}
          </button>
        </form>
      </AdminEditorSheet>
    </section>
  );
}

export function CalculatorPanel({ data, run }: any) {
  const calc = data.calculator || {},
    change = (action: string, value?: any) =>
      run(() => api().calculatorChange(action, value));
  return (
    <section>
      <div className="flex items-start justify-between gap-3">
        <h1 className={adminHeadingClass}>Árkalkulátor</h1>
        <button
          type="button"
          className={adminButtonClass}
          onClick={() => change("reset")}
        >
          Új számolás
        </button>
      </div>
      <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="grid min-w-0 gap-3 rounded-xl bg-admin-surface p-3 lg:bg-admin-raised">
          <label className="min-w-0 text-xs font-bold text-ink-muted">
            Szolgáltatás
            <AdminSelectMenu
              ariaLabel="Kalkulátor szolgáltatása"
              value={calc.serviceId || ""}
              options={calc.services || []}
              onChange={(value) => change("service", value)}
              buttonClassName="mt-1 w-full"
            />
          </label>
          <label className="min-w-0 text-xs font-bold text-ink-muted">
            Alapár
            <AdminSelectMenu
              ariaLabel="Kalkulátor alapára"
              value={calc.base || 0}
              options={calc.prices || []}
              onChange={(value) => change("base", value)}
              buttonClassName="mt-1 w-full"
            />
          </label>
          <fieldset className="min-w-0">
            <legend className="mb-2 text-xs font-bold text-ink-muted">
              Díszítések
            </legend>
            <div className="grid gap-2">
              {(calc.decorations || []).map((item: any) => {
                const extra = (calc.extras || []).find(
                  (row: any) => row.id === item.id,
                );
                return (
                  <section
                    key={item.id}
                    className="rounded-lg bg-admin-field p-2"
                  >
                    <label className="flex items-center justify-between gap-2 text-xs font-bold">
                      {item.label}
                      <AdminSwitch
                        checked={Boolean(extra)}
                        onChange={() => change("toggle", item.id)}
                      />
                    </label>
                    {extra ? (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <label className="min-w-0 text-[0.62rem] text-ink-muted">
                          Darab
                          <input
                            type="number"
                            min={1}
                            max={99}
                            value={extra.count}
                            className={`${adminFieldClass} mt-1`}
                            onChange={(event) =>
                              change("extra", {
                                id: item.id,
                                count: event.target.value,
                              })
                            }
                          />
                        </label>
                        <label className="min-w-0 text-[0.62rem] text-ink-muted">
                          Egységár
                          <AdminSelectMenu
                            ariaLabel={item.label + " egységára"}
                            value={extra.price}
                            options={item.prices}
                            onChange={(value) =>
                              change("extra", { id: item.id, price: value })
                            }
                            buttonClassName="mt-1 w-full"
                          />
                        </label>
                      </div>
                    ) : null}
                  </section>
                );
              })}
              {!calc.decorations?.length ? (
                <p className="text-xs text-ink-muted">
                  Nincs aktív díszítés az árlistában.
                </p>
              ) : null}
            </div>
          </fieldset>
          <label className="min-w-0 text-xs font-bold text-ink-muted">
            Kupon
            <AdminSelectMenu
              ariaLabel="Kalkulátor kuponja"
              value={calc.couponId || ""}
              options={calc.coupons || []}
              onChange={(value) => change("coupon", value)}
              buttonClassName="mt-1 w-full"
            />
          </label>
          <p className="text-[0.68rem] leading-relaxed text-ink-muted">
            {calc.hint}
          </p>
        </div>
        <aside className="self-start rounded-xl border border-gold-line bg-gold-soft p-4">
          <h2 className="text-xs font-bold text-ink-muted">Fizetendő</h2>
          <output
            className="mt-1 block text-3xl font-bold text-gold-dark"
            aria-live="polite"
          >
            {calc.total}
          </output>
          <dl className="mt-3 grid gap-2">
            {(calc.breakdown || []).map((row: any, index: number) => (
              <div
                key={index}
                className="flex items-start justify-between gap-2 text-xs"
              >
                <dt className="min-w-0">{row.label}</dt>
                <dd className="shrink-0 font-bold">{row.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}

// The notification layout is copied from AdminNotifications; entries use LumiNails' existing events.
export function Inbox({ data, onOpen, onLoad, onOpenBookings, onOpenGuests, run }: any) {
  const [open, setOpen] = useState(false);
  const [ackBusy, setAckBusy] = useState(false);
  async function saveReading(work: () => Promise<any>, message?: string) {
    setAckBusy(true);
    try {
      return await run(work, message);
    } finally {
      setAckBusy(false);
    }
  }
  const notices = adminNotifications(data),
    attention = notices.filter((row: any) => row.attention).length;
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          void onLoad();
        }}
        aria-label={`Értesítések${attention ? `, ${attention} jelzés` : ""}`}
        className={`${adminIconButtonClass} relative`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4 fill-none stroke-current"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
        {attention > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-gold-dark px-1 text-center text-[9px] font-bold leading-4 text-admin-bg">
            {attention > 99 ? "99+" : attention}
          </span>
        ) : null}
      </button>
      <AdminEditorSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Értesítések"
        description="Új foglalások, vendéglemondások, vendégmódosítások és regisztrációk."
      >
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={ackBusy || !attention}
            className={adminButtonClass}
            onClick={() => saveReading(() => api().markNotificationsRead(notices.map(row => row.id)), "Minden értesítés olvasott.")}
          >
            Mind olvasott
          </button>
        </div>
        <div className="grid gap-2">
          {notices.map((notice: any) => (
            <button
              key={notice.id}
              type="button"
              disabled={ackBusy}
              onClick={async () => {
                if (await saveReading(() => api().markNotificationsRead([notice.id]))) {
                  setOpen(false);
                  if (notice.target === "guests") onOpenGuests();
                  else if (notice.bookingId) onOpen(notice.bookingId);
                  else onOpenBookings();
                }
              }}
              className={`${adminPressableClass} rounded-xl border p-3 text-left hover:border-gold-dark/60 hover:shadow-[0_4px_14px_rgb(0_0_0_/_0.14)] ${notice.attention ? "border-gold-dark/40 bg-admin-field" : "border-transparent bg-admin-raised"}`}
            >
              <p className="text-xs font-bold">
                {notice.attention ? (
                  <span className="mr-2 inline-block size-1.5 rounded-full bg-gold-dark" />
                ) : null}
                {notice.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                {notice.body}
              </p>
              <p className="mt-1 text-[0.6rem] text-ink-muted">
                {new Date(notice.created).toLocaleString("hu-HU")}
              </p>
            </button>
          ))}
          {!notices.length ? (
            <p className="py-6 text-center text-xs text-ink-muted">
              Még nincs értesítés.
            </p>
          ) : null}
        </div>
      </AdminEditorSheet>
    </>
  );
}
