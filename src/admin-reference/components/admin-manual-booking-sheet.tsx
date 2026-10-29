"use client";

import { useEffect, useId, useRef, useState } from "react";

import { AdminEditorSheet } from "@/components/admin-editor-sheet";
import { AdminIcon } from "@/components/admin-icon";
import { AdminSearchInput } from "@/components/admin-search-input";
import { AdminTemporalInput } from "@/components/admin-temporal-input";
import { adminFieldClass, adminPrimaryButtonClass } from "@/components/admin-ui";
import { formatAdminServiceLabel, getManualBookingGuestSuggestions, getTimeDifferenceMinutes, normalizeBookingSearch, type AdminBooking, type ManualBookingDraft, type ManualBookingGuest } from "@/lib/admin-bookings";
import type { CatalogBookingService } from "@/lib/service-catalog";

type AdminManualBookingSheetProps = {
  open: boolean;
  creating: boolean;
  draft: ManualBookingDraft;
  services: CatalogBookingService[];
  bookings: AdminBooking[];
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: Exclude<keyof ManualBookingDraft, "serviceIds">, value: string) => void;
  onToggleService: (serviceId: string) => void;
  onSelectGuest: (guest: ManualBookingGuest) => void;
};

const inputClassName = `${adminFieldClass} mt-1`;

export function AdminManualBookingSheet({
  open,
  creating,
  draft,
  services,
  bookings,
  onClose,
  onSubmit,
  onChange,
  onToggleService,
  onSelectGuest,
}: AdminManualBookingSheetProps) {
  const nameId = useId();
  const guestListId = `${nameId}-guests`;
  const guestHelpId = `${nameId}-help`;
  const nameInput = useRef<HTMLInputElement>(null);
  const guestList = useRef<HTMLDivElement>(null);
  const [guestSearchOpen, setGuestSearchOpen] = useState(false);
  const [activeGuestId, setActiveGuestId] = useState<number | null>(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const suggestedGuests = open ? getManualBookingGuestSuggestions(bookings, draft.guestName) : [];
  const showGuestSearch = open && guestSearchOpen && Boolean(normalizeBookingSearch(draft.guestName));
  const showGuestList = showGuestSearch && suggestedGuests.length > 0;
  const activeGuest = showGuestList ? suggestedGuests.find((guest) => guest.id === activeGuestId) : undefined;

  useEffect(() => {
    if (activeGuestId !== null) {
      guestList.current?.querySelector<HTMLElement>(`[data-guest-id="${activeGuestId}"]`)?.scrollIntoView({ block: "nearest" });
    }
  }, [activeGuestId]);

  function closeGuestSearch() {
    setGuestSearchOpen(false);
    setActiveGuestId(null);
  }

  function chooseGuest(guest: ManualBookingGuest) {
    onSelectGuest(guest);
    closeGuestSearch();
    nameInput.current?.focus({ preventScroll: true });
  }

  const selectedServices = services.filter((service) => draft.serviceIds.includes(service.id));
  const normalizedServiceSearch = normalizeBookingSearch(serviceSearch);
  const availableServices = services.filter((service) => !draft.serviceIds.includes(service.id)
    && normalizeBookingSearch(`${formatAdminServiceLabel(service.track, service)} · ${service.durationLabel}`).includes(normalizedServiceSearch));
  const durationMinutes = getTimeDifferenceMinutes(draft.time, draft.endTime);
  const isShorter = Boolean(
    selectedServices.length
    && durationMinutes !== null
    && durationMinutes > 0
    && durationMinutes < selectedServices.reduce((total, service) => total + service.durationMinutes, 0),
  );

  function renderService(service: CatalogBookingService) {
    const isSelected = draft.serviceIds.includes(service.id);
    return (
      <button
        key={service.id}
        data-service-id={service.id}
        type="button"
        aria-pressed={isSelected}
        onClick={() => onToggleService(service.id)}
        className={`min-h-10 rounded-md border px-2 py-1.5 text-left text-[0.64rem] font-bold transition-[background-color,border-color,transform] duration-200 ease-out motion-safe:hover:-translate-y-px motion-safe:active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-dark ${isSelected ? "border-gold-dark bg-gold-soft text-ink" : "border-transparent text-ink-muted hover:border-gold-line hover:bg-admin-raised"}`}
      >
        <span className="flex items-start justify-between gap-2">
          <span className="min-w-0">{formatAdminServiceLabel(service.track, service)} · {service.durationLabel}</span>
          <span aria-hidden="true" className={`flex size-4 shrink-0 items-center justify-center rounded-full border text-[0.55rem] ${isSelected ? "border-gold-dark bg-gold-dark text-white" : "border-gold-line text-transparent"}`}>✓</span>
        </span>
      </button>
    );
  }

  return (
    <AdminEditorSheet
      open={open}
      title="Új kézi időpont"
      description="Telefonon vagy személyesen egyeztetett időpont, illetve saját foglalt idő."
      closeDisabled={creating}
      onClose={() => { closeGuestSearch(); setServiceSearch(""); onClose(); }}
    >
      <form
        className="grid gap-2.5"
        onSubmit={(event) => {
          event.preventDefault();
          closeGuestSearch();
          setServiceSearch("");
          void onSubmit();
        }}
      >
        <div className="rounded-lg bg-gold-soft px-3 py-2 text-[0.66rem] leading-4 text-ink-muted">
          A név vagy megjegyzés, a dátum, a kezdés és a befejezés kötelező. Szolgáltatás nélkül saját foglalt időt is felvehetsz.
        </div>

        <fieldset className="min-w-0 border-0 p-0 text-[0.64rem] font-bold text-ink-muted">
          <legend className="p-0">Kezelések</legend>
          {services.length ? (
            <>
              <AdminSearchInput aria-label="Szolgáltatások keresése" value={serviceSearch} onValueChange={setServiceSearch} placeholder="Kezelés keresése…" containerClassName="mt-1" />
              <div className="mt-1 rounded-lg border border-gold-line bg-admin-field">
                {selectedServices.length ? (
                  <div role="group" aria-label="Kiválasztott kezelések" className="border-b border-gold-line p-1">
                    <p className="px-2 py-1 text-gold-dark">Kiválasztva · {selectedServices.length}</p>
                    <div className="grid gap-1 sm:grid-cols-2">{selectedServices.map(renderService)}</div>
                  </div>
                ) : null}
                <div role="group" aria-label="Választható kezelések" className="max-h-56 overflow-y-auto overscroll-contain p-1">
                  {availableServices.length ? (
                    <div className="grid gap-1 sm:grid-cols-2">{availableServices.map(renderService)}</div>
                  ) : (
                    <p role="status" className="px-2 py-2 font-medium">{normalizedServiceSearch ? "Nincs további kezelés ezzel a névvel." : "Minden kezelés ki van választva."}</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="mt-1 rounded-lg border border-admin-danger/40 bg-admin-danger/10 px-3 py-2 text-admin-danger">
              Jelenleg nincs aktív szolgáltatás; saját foglalt időt felvehetsz.
            </p>
          )}
        </fieldset>

        <label className="min-w-0 text-[0.64rem] font-bold text-ink-muted">
          Dátum
          <AdminTemporalInput
            type="date"
            value={draft.date}
            onChange={(event) => onChange("date", event.target.value)}
            containerClassName="mt-1"
            className="font-normal"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="min-w-0 text-[0.64rem] font-bold text-ink-muted">
            Kezdés
            <AdminTemporalInput
              type="time"
              step={300}
              value={draft.time}
              onChange={(event) => onChange("time", event.target.value)}
              containerClassName="mt-1"
              className="font-normal"
            />
          </label>
          <label className="min-w-0 text-[0.64rem] font-bold text-ink-muted">
            Befejezés
            <AdminTemporalInput
              type="time"
              step={300}
              value={draft.endTime}
              onChange={(event) => onChange("endTime", event.target.value)}
              containerClassName="mt-1"
              className="font-normal"
            />
          </label>
        </div>

        {selectedServices.length && isShorter ? (
          <p role="status" className="-mt-1 rounded-lg bg-gold-soft px-2.5 py-1.5 text-[0.62rem] font-bold leading-4 text-gold-dark">
            A megadott idő rövidebb a szolgáltatás beállított idejénél, de így is elmenthető.
          </p>
        ) : null}

        <div
          className="relative min-w-0"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) closeGuestSearch();
          }}
        >
          {showGuestList ? (
            <div ref={guestList} id={guestListId} role="listbox" aria-label="Korábbi vendégek" className="absolute inset-x-0 bottom-full z-10 mb-1.5 max-h-[min(12rem,calc(var(--admin-viewport-height,100dvh)*0.35))] overflow-y-auto overscroll-contain rounded-lg border border-gold-line bg-admin-field p-1">
              {suggestedGuests.map((guest) => (
                <button
                  key={guest.id}
                  id={`${guestListId}-${guest.id}`}
                  data-guest-id={guest.id}
                  type="button"
                  role="option"
                  aria-selected={activeGuestId === guest.id}
                  tabIndex={-1}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseGuest(guest)}
                  className={`block min-h-11 w-full rounded-md px-2.5 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-dark ${activeGuestId === guest.id ? "bg-gold-soft text-gold-dark" : "text-ink hover:bg-admin-raised"}`}
                >
                  <span className="block break-words text-[0.68rem] font-bold">{guest.guestName}</span>
                  <span className="mt-0.5 block break-all text-[0.62rem] leading-4 text-ink-muted">{[guest.email, guest.phone].filter(Boolean).join(" · ") || "Nincs megadott elérhetőség"}</span>
                </button>
              ))}
            </div>
          ) : null}
          <label htmlFor={nameId} className="text-[0.64rem] font-bold text-ink-muted">
            Név <span className="font-medium text-admin-danger">*</span>
          </label>
          <AdminSearchInput
            ref={nameInput}
            type="text"
            clearLabel="Név törlése"
            id={nameId}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showGuestList}
            aria-controls={showGuestList ? guestListId : undefined}
            aria-activedescendant={activeGuest ? `${guestListId}-${activeGuest.id}` : undefined}
            aria-describedby={guestHelpId}
            value={draft.guestName}
            onFocus={() => { setGuestSearchOpen(true); setActiveGuestId(null); }}
            onValueChange={(value) => {
              onChange("guestName", value);
              setGuestSearchOpen(true);
              setActiveGuestId(null);
            }}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if ((event.key === "ArrowDown" || event.key === "ArrowUp") && suggestedGuests.length) {
                event.preventDefault();
                setGuestSearchOpen(true);
                const current = suggestedGuests.findIndex((guest) => guest.id === activeGuestId);
                const next = event.key === "ArrowDown"
                  ? (current + 1) % suggestedGuests.length
                  : (current <= 0 ? suggestedGuests.length : current) - 1;
                setActiveGuestId(suggestedGuests[next].id);
              } else if (event.key === "Enter" && activeGuest) {
                event.preventDefault();
                chooseGuest(activeGuest);
              } else if (event.key === "Escape" && showGuestSearch) {
                event.preventDefault();
                event.stopPropagation();
                closeGuestSearch();
              } else if (event.key === "Tab") {
                closeGuestSearch();
              }
            }}
            autoComplete="off"
            maxLength={120}
            placeholder="Vendég neve vagy korábbi vendég keresése"
            required
            aria-required="true"
            containerClassName="mt-1"
          />
          <p id={guestHelpId} className="mt-1 text-[0.62rem] leading-4 text-ink-muted">
            Korábbi vendéget választhatsz, vagy új nevet is beírhatsz.
          </p>
          {showGuestSearch && !showGuestList ? (
            <p role="status" className="mt-1.5 rounded-lg bg-admin-raised px-2.5 py-2 text-[0.62rem] leading-4 text-ink-muted">Nincs korábbi vendég ezzel a névvel. Új vendégként felveheted.</p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-2">
          
          
        </div>

        <div className="mt-1 flex items-center justify-between gap-3 border-t border-gold-line pt-3">
          <p className="text-[0.62rem] font-bold text-ink-muted">Állapot: Megerősítve</p>
          <button
            type="submit"
            disabled={creating || !draft.guestName.trim()}
            className={adminPrimaryButtonClass}
          >
            <AdminIcon name="add" className="size-3.5" />
            {creating ? "Mentés…" : "Időpont felvétele"}
          </button>
        </div>
      </form>
    </AdminEditorSheet>
  );
}
