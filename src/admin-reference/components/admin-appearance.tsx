"use client";

import { useEffect, useState } from "react";
import {
  adminAppearanceChangeEvent,
  adminSizeStorageKey,
  adminThemeColors,
  adminThemeStorageKey,
  isAdminSizeMode,
  isAdminThemeMode,
  type AdminSizeMode,
  type AdminThemeMode,
} from "@/lib/admin-appearance";

const themeOptions: readonly { value: AdminThemeMode; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "light", label: "Világos" },
  { value: "dark", label: "Sötét" },
];

const sizeOptions: readonly { value: AdminSizeMode; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "compact", label: "Kompakt" },
  { value: "normal", label: "Normál" },
  { value: "large", label: "Nagy" },
];

function readThemeMode(): AdminThemeMode {
  try {
    const stored = window.localStorage.getItem(adminThemeStorageKey);
    return isAdminThemeMode(stored) ? stored : "auto";
  } catch {
    return "auto";
  }
}

function readSizeMode(): AdminSizeMode {
  try {
    const stored = window.localStorage.getItem(adminSizeStorageKey);
    return isAdminSizeMode(stored) ? stored : "auto";
  } catch {
    return "auto";
  }
}

function applyAdminAppearance(themeMode = readThemeMode(), sizeMode = readSizeMode()) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolvedTheme = themeMode === "auto"
    ? prefersDark ? "dark" : "light"
    : themeMode;

  root.dataset.adminTheme = resolvedTheme;
  root.dataset.adminThemeMode = themeMode;
  root.dataset.adminSize = sizeMode;
  root.style.colorScheme = resolvedTheme;

  const themeColor = adminThemeColors[resolvedTheme];
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = themeColor;
  });
}

function storeThemeMode(value: AdminThemeMode) {
  try {
    window.localStorage.setItem(adminThemeStorageKey, value);
  } catch {}
  window.dispatchEvent(new Event(adminAppearanceChangeEvent));
}

function storeSizeMode(value: AdminSizeMode) {
  try {
    window.localStorage.setItem(adminSizeStorageKey, value);
  } catch {}
  window.dispatchEvent(new Event(adminAppearanceChangeEvent));
}

export function AdminAppearanceBridge() {
  useEffect(() => {
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");

    function syncAppearance() {
      applyAdminAppearance();
    }

    function syncStorage(event: StorageEvent) {
      if (
        event.key === null
        || event.key === adminThemeStorageKey
        || event.key === adminSizeStorageKey
      ) {
        syncAppearance();
      }
    }

    syncAppearance();
    colorScheme.addEventListener("change", syncAppearance);
    window.addEventListener("storage", syncStorage);
    window.addEventListener(adminAppearanceChangeEvent, syncAppearance);

    return () => {
      colorScheme.removeEventListener("change", syncAppearance);
      window.removeEventListener("storage", syncStorage);
      window.removeEventListener(adminAppearanceChangeEvent, syncAppearance);
      const root = document.documentElement;
      delete root.dataset.adminTheme;
      delete root.dataset.adminThemeMode;
      delete root.dataset.adminSize;
      root.style.removeProperty("color-scheme");
    };
  }, []);

  return null;
}

export function AdminAppearanceControls() {
  const [themeMode, setThemeMode] = useState<AdminThemeMode>("auto");
  const [sizeMode, setSizeMode] = useState<AdminSizeMode>("auto");

  useEffect(() => {
    function syncControls() {
      setThemeMode(readThemeMode());
      setSizeMode(readSizeMode());
    }

    syncControls();
    window.addEventListener(adminAppearanceChangeEvent, syncControls);
    window.addEventListener("storage", syncControls);
    return () => {
      window.removeEventListener(adminAppearanceChangeEvent, syncControls);
      window.removeEventListener("storage", syncControls);
    };
  }, []);

  function selectTheme(value: AdminThemeMode) {
    setThemeMode(value);
    storeThemeMode(value);
  }

  function selectSize(value: AdminSizeMode) {
    setSizeMode(value);
    storeSizeMode(value);
  }

  return (
    <div className="mt-3 grid gap-2.5 lg:grid-cols-2">
      <article className="rounded-xl bg-admin-raised p-4">
        <h2 className="text-sm font-bold leading-none">Téma</h2>
        <p className="mt-1 text-[0.66rem] leading-4 text-ink-muted">
          Auto módban a telefon vagy a számítógép világos/sötét beállítását követi.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-admin-surface p-1" role="group" aria-label="Admin téma">
          {themeOptions.map((option) => {
            const selected = themeMode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => selectTheme(option.value)}
                className={`min-h-9 rounded-md px-2 text-[0.68rem] font-bold transition-[background-color,color,box-shadow,transform] duration-200 ease-out motion-safe:aria-pressed:scale-[1.025] motion-safe:active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-dark ${
                  selected
                    ? "bg-gold-dark text-admin-bg shadow-sm"
                    : "text-ink-muted hover:bg-admin-field hover:text-ink"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </article>

      <article className="rounded-xl bg-admin-raised p-4">
        <h2 className="text-sm font-bold leading-none">Felület mérete</h2>
        <p className="mt-1 text-[0.66rem] leading-4 text-ink-muted">
          Auto módban a rendelkezésre álló képernyőmérethez igazodik, eszköztípustól függetlenül.
        </p>
        <div className="mt-3 grid grid-cols-4 gap-1 rounded-lg bg-admin-surface p-1" role="group" aria-label="Admin felület mérete">
          {sizeOptions.map((option) => {
            const selected = sizeMode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => selectSize(option.value)}
                className={`min-h-9 min-w-0 rounded-md px-1 text-[0.64rem] font-bold transition-[background-color,color,box-shadow,transform] duration-200 ease-out motion-safe:aria-pressed:scale-[1.025] motion-safe:active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-dark ${
                  selected
                    ? "bg-gold-dark text-admin-bg shadow-sm"
                    : "text-ink-muted hover:bg-admin-field hover:text-ink"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </article>

      <p className="px-1 text-[0.62rem] leading-4 text-ink-muted lg:col-span-2">
        A megjelenés azonnal változik és ezen az eszközön megmarad; ehhez nem kell a felső Mentés gomb.
      </p>
    </div>
  );
}
