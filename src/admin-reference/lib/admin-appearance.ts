export const adminThemeStorageKey = "lumi-admin-theme";
export const adminSizeStorageKey = "lumi-admin-size";
export const adminAppearanceChangeEvent = "lumi-admin-appearance-change";

export const adminThemeModes = ["auto", "light", "dark"] as const;
export const adminSizeModes = ["auto", "compact", "normal", "large"] as const;

export type AdminThemeMode = (typeof adminThemeModes)[number];
export type AdminSizeMode = (typeof adminSizeModes)[number];

// The same colors are declared as --admin-bg in globals.css for the theme itself.
export const adminThemeColors = {
  light: "#f4f1e9",
  dark: "#0b0f16",
} as const;

export function isAdminThemeMode(value: string | null): value is AdminThemeMode {
  return adminThemeModes.some((mode) => mode === value);
}

export function isAdminSizeMode(value: string | null): value is AdminSizeMode {
  return adminSizeModes.some((mode) => mode === value);
}
