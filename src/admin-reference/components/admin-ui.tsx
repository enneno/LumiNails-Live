import type { ComponentPropsWithoutRef } from "react";

const adminFieldBase = "min-w-0 w-full max-w-full rounded-lg border border-admin-border/60 bg-admin-field font-medium text-ink transition-[background-color,border-color,box-shadow] duration-200 placeholder:text-ink-muted focus:border-gold-dark/70 focus:bg-admin-raised focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--admin-accent)_12%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold-dark disabled:opacity-50";
export const adminFieldClass = `admin-compact-control min-h-8 ${adminFieldBase} px-2.5`;
export const adminTightFieldClass = `admin-compact-control min-h-8 ${adminFieldBase} px-0.5`;
export const adminTouchFieldClass = `${adminFieldBase} min-h-11 px-3 text-base`;
export const adminTouchTightFieldClass = `${adminFieldBase} min-h-11 px-2.5 text-base`;
export const adminSearchFieldClass = `admin-compact-control min-h-8 ${adminFieldBase} pl-8 pr-10`;
const adminButtonBase = "inline-flex shrink-0 items-center justify-center rounded-lg bg-admin-raised text-ink transition-[background-color,box-shadow,transform] duration-200 ease-out enabled:hover:bg-admin-field enabled:hover:shadow-[0_3px_10px_rgb(0_0_0_/_0.16)] motion-safe:enabled:hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark";
export const adminButtonClass = `${adminButtonBase} min-h-8 gap-1.5 px-2.5 text-xs font-semibold motion-safe:enabled:active:scale-[0.96]`;
export const adminIconButtonClass = `${adminButtonBase} size-8 enabled:active:bg-admin-accent/25 enabled:active:shadow-[0_0_0_2px_color-mix(in_srgb,var(--admin-accent)_40%,transparent)] motion-safe:enabled:active:scale-[0.88]`;
const adminPrimaryButtonBase = "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-gold-dark px-3 text-xs font-bold text-admin-bg transition-[background-color,box-shadow,transform] duration-200 ease-out enabled:hover:bg-gold-bright enabled:hover:shadow-[0_3px_12px_color-mix(in_srgb,var(--admin-accent)_22%,transparent)] motion-safe:enabled:hover:-translate-y-px motion-safe:enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark";
export const adminPrimaryButtonClass = `${adminPrimaryButtonBase} min-h-9`;
export const adminTouchButtonClass = `${adminButtonBase} min-h-11 gap-1.5 px-3 text-xs font-semibold`;
export const adminTouchPrimaryButtonClass = `${adminPrimaryButtonBase} min-h-11`;
const adminDangerButtonClass = "inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border border-admin-danger/40 bg-admin-danger/10 px-3 text-xs font-bold text-admin-danger transition-colors enabled:hover:bg-admin-danger/15 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-danger";
export function AdminDangerButton({ className = "", type = "button", ...props }: ComponentPropsWithoutRef<"button">) {
  return <button {...props} type={type} className={`${adminDangerButtonClass} ${className}`} />;
}
export const adminPressableClass = "transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out motion-safe:hover:-translate-y-px motion-safe:active:scale-[0.985]";
export const adminHeadingClass = "text-lg font-bold leading-tight tracking-[-0.025em] sm:text-xl";
export const adminDescriptionClass = "mt-1 max-w-2xl text-xs leading-relaxed text-ink-muted";

type AdminSwitchProps = Omit<ComponentPropsWithoutRef<"input">, "type" | "className">;

export function AdminSwitch(props: AdminSwitchProps) {
  return (
    <span className="relative inline-flex h-5 w-8 shrink-0">
      <input {...props} type="checkbox" role="switch" className="peer absolute inset-0 z-10 m-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed" />
      <span className="pointer-events-none block size-full rounded-full bg-admin-border transition-colors duration-200 peer-checked:bg-gold-dark peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-dark peer-disabled:opacity-40" />
      <span className="pointer-events-none absolute left-0.5 top-0.5 size-4 rounded-full bg-admin-text shadow-sm transition-[background-color,transform] duration-200 ease-out peer-checked:translate-x-3 peer-checked:bg-admin-bg peer-disabled:opacity-40" />
    </span>
  );
}
