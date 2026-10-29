"use client";

import { Children, isValidElement, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./admin-overlays.module.css";

export type AdminSelectOption<T extends string | number> = { value: T; label: string; shortLabel?: string; triggerLabel?: string; };

export function AdminSelectField({ value, onChange, children, ariaLabel, disabled, className = "" }: {
  value: string | number;
  onChange: (value: string) => void;
  children: ReactNode;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}) {
  const options = Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ value: string | number; children: ReactNode }>(child)) return [];
    return [{ value: String(child.props.value), label: String(child.props.children) }];
  });
  return <div className={className}><AdminSelectMenu value={String(value)} options={options} onChange={onChange} ariaLabel={ariaLabel} disabled={disabled} align="left" buttonClassName="w-full" /></div>;
}
type AdminSelectMenuProps<T extends string | number> = {
  value: T;
  options: readonly AdminSelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  responsiveLabel?: boolean;
  disabled?: boolean;
  buttonClassName?: string;
  menuClassName?: string;
  comfortableOptions?: boolean;
  align?: "left" | "right";
};

export function AdminSelectMenu<T extends string | number>({
  value, options, onChange, ariaLabel, responsiveLabel = false, disabled = false,
  buttonClassName = "", menuClassName = "", comfortableOptions = false, align = "right",
}: AdminSelectMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [portalHost, setPortalHost] = useState<Element | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const selected = options.find((option) => option.value === value) ?? options[0];

  function positionMenu(menu: HTMLDivElement) {
    const anchor = triggerRef.current?.getBoundingClientRect();
    if (!anchor) return;
    const viewport = window.visualViewport;
    const topEdge = viewport?.offsetTop ?? 0;
    const bottomEdge = topEdge + (viewport?.height ?? window.innerHeight);
    const rightEdge = (viewport?.offsetLeft ?? 0) + (viewport?.width ?? window.innerWidth);
    const below = bottomEdge - anchor.bottom - 12;
    const above = anchor.top - topEdge - 12;
    const openAbove = below < Math.min(menu.scrollHeight, 200) && above > below;
    menu.style.maxHeight = `${Math.max(64, Math.min(comfortableOptions ? 320 : 280, openAbove ? above : below))}px`;
    menu.style.minWidth = `${Math.max(anchor.width, 168)}px`;
    const width = menu.getBoundingClientRect().width;
    menu.style.left = `${Math.max(12, Math.min(align === "left" ? anchor.left : anchor.right - width, rightEdge - width - 12))}px`;
    menu.style.top = `${openAbove ? anchor.top - menu.getBoundingClientRect().height - 6 : anchor.bottom + 6}px`;
  }

  useEffect(() => {
    if (!isOpen) return;
    const reposition = () => { if (menuRef.current) positionMenu(menuRef.current); };
    const outside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node) && !menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", reposition);
    document.addEventListener("scroll", reposition, true);
    window.visualViewport?.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", reposition);
      document.removeEventListener("scroll", reposition, true);
      window.visualViewport?.removeEventListener("resize", reposition);
    };
    // Coordinates come from the current DOM, never a saved render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, align]);

  function menuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    let next = current;
    if (event.key === "ArrowDown") next = (current + 1) % buttons.length;
    else if (event.key === "ArrowUp") next = (current - 1 + buttons.length) % buttons.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = buttons.length - 1;
    else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    } else if (event.key === "Tab") {
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    } else return;
    event.preventDefault();
    buttons[next]?.focus();
  }

  function openMenu() {
    setPortalHost(rootRef.current?.closest("dialog") ?? rootRef.current?.closest(".admin-theme") ?? null);
    setIsOpen(true);
  }

  return (
    <div ref={rootRef} className="min-w-0">
      <button ref={triggerRef} type="button" aria-label={selected ? `${ariaLabel}: ${selected.label}` : ariaLabel} aria-haspopup="listbox" aria-expanded={isOpen} aria-controls={isOpen ? menuId : undefined}
        disabled={disabled} onClick={() => { if (isOpen) setIsOpen(false); else openMenu(); }}
        onKeyDown={(event) => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); openMenu(); } }}
        className={`admin-compact-control flex min-h-8 min-w-0 items-center justify-between gap-1.5 rounded-lg bg-admin-raised px-2 font-semibold text-ink transition-[background-color,box-shadow,transform] duration-200 ease-out enabled:hover:bg-admin-field motion-safe:enabled:active:scale-[0.97] disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark ${buttonClassName}`}>
        {responsiveLabel && selected?.shortLabel ? <><span className="min-w-0 truncate sm:hidden">{selected.triggerLabel ?? selected.shortLabel}</span><span className="hidden min-w-0 truncate sm:block">{selected.triggerLabel ?? selected.label}</span></> : <span className="min-w-0 truncate">{selected?.triggerLabel ?? selected?.label}</span>}
        <svg aria-hidden="true" viewBox="0 0 16 16" className={`size-3 shrink-0 fill-none stroke-current text-ink-muted transition-transform duration-200 ease-out ${isOpen ? "rotate-180" : ""}`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m4 6 4 4 4-4" /></svg>
      </button>
      {isOpen && portalHost ? createPortal(
        <div id={menuId} role="listbox" aria-label={ariaLabel} onKeyDown={menuKeyDown} className={`${styles.menu} ${menuClassName}`}
          ref={(node) => { menuRef.current = node; if (node) { positionMenu(node); node.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus({ preventScroll: true }); } }}>
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return <button key={String(option.value)} type="button" role="option" aria-selected={isSelected} tabIndex={isSelected ? 0 : -1}
              onClick={() => { onChange(option.value); setIsOpen(false); triggerRef.current?.focus(); }}
              className={`flex w-full items-center justify-between gap-3 rounded-lg text-left text-xs transition-[background-color,color,transform] duration-150 ease-out motion-safe:hover:translate-x-px focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-dark ${comfortableOptions ? "min-h-13 px-3 py-2" : "min-h-9 px-2.5 py-1.5"} ${comfortableOptions && index > 0 ? "border-t border-gold-line" : ""} ${isSelected ? "bg-gold-dark/10 font-bold text-gold-dark" : "text-ink hover:bg-admin-raised"}`}>
              <span>{option.label}</span>
              {isSelected ? <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 shrink-0 fill-none stroke-current" strokeWidth="1.7"><path d="m3 8 3 3 7-7" /></svg> : null}
            </button>;
          })}
        </div>, portalHost) : null}
    </div>
  );
}
