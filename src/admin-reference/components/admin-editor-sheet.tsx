"use client";

import { type ReactNode, useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { adminIconButtonClass } from "@/components/admin-ui";
import { useDialogAlertVisibility } from "@/components/use-dialog-alert-visibility";
import styles from "./admin-overlays.module.css";

type AdminEditorSheetProps = {
  open: boolean;
  title: ReactNode;
  description?: string;
  closeDisabled?: boolean;
  onClose: () => void;
  children: ReactNode;
};

type SheetSwipe = {
  source: "mouse" | "touch";
  id: number;
  startX: number;
  startY: number;
  startedAt: number;
  distance: number;
  active: boolean;
  fromContent: boolean;
};

function isNestedScrollTarget(target: EventTarget | null, body: HTMLElement) {
  const mainScroller = body.querySelector("[data-admin-scroll]");
  let element = target instanceof Element ? target : null;
  while (element && element !== body) {
    if (element !== mainScroller) {
      const style = getComputedStyle(element);
      if (
        ((style.overflowY === "auto" || style.overflowY === "scroll") && element.scrollHeight > element.clientHeight + 1)
        || ((style.overflowX === "auto" || style.overflowX === "scroll") && element.scrollWidth > element.clientWidth + 1)
      ) return true;
    }
    element = element.parentElement;
  }
  return false;
}

export function AdminEditorSheet({
  open,
  title,
  description,
  closeDisabled = false,
  onClose,
  children,
}: AdminEditorSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useDialogAlertVisibility(dialogRef, open);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeAnimationRef = useRef<Animation | null>(null);
  const reboundAnimationRef = useRef<Animation | null>(null);
  const swipeRef = useRef<SheetSwipe | null>(null);
  const suppressClickUntilRef = useRef(0);
  const [lastContent, setLastContent] = useState({ title, description, children });
  const titleId = useId();
  if (open && (lastContent.title !== title || lastContent.description !== description || lastContent.children !== children)) {
    setLastContent({ title, description, children });
  }
  const visibleContent = open ? { title, description, children } : lastContent;

  const clearSwipe = useCallback(() => {
    swipeRef.current = null;
    reboundAnimationRef.current?.cancel();
    reboundAnimationRef.current = null;
    bodyRef.current?.style.removeProperty("animation");
    bodyRef.current?.style.removeProperty("transform");
    dialogRef.current?.style.removeProperty("--sheet-backdrop-opacity");
    dialogRef.current?.style.removeProperty("--sheet-backdrop-close-start");
    if (dialogRef.current) delete dialogRef.current.dataset.dragging;
  }, []);

  const slideOut = useCallback((afterClose: () => void) => {
    if (closeAnimationRef.current) return;
    const dialog = dialogRef.current;
    const body = bodyRef.current;
    if (!dialog?.open || !body || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (dialog?.open) dialog.close();
      clearSwipe();
      afterClose();
      return;
    }

    const bodyStyle = getComputedStyle(body);
    const currentTransform = bodyStyle.transform;
    const travel = bodyStyle.getPropertyValue("--sheet-travel").trim();
    if (reboundAnimationRef.current) {
      reboundAnimationRef.current.cancel();
      reboundAnimationRef.current = null;
      body.style.transform = currentTransform;
    }
    dialog.dataset.closing = "true";
    const animation = body.animate([
      { transform: currentTransform },
      { transform: `translateY(${travel})` },
    ], { duration: 220, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" });
    closeAnimationRef.current = animation;
    animation.onfinish = () => {
      dialog.close();
      animation.cancel();
      closeAnimationRef.current = null;
      delete dialog.dataset.closing;
      clearSwipe();
      afterClose();
    };
  }, [clearSwipe]);

  const startSwipe = (source: SheetSwipe["source"], id: number, x: number, y: number, target: EventTarget | null) => {
    const body = bodyRef.current;
    const content = body?.querySelector<HTMLElement>("[data-admin-scroll]");
    const fromContent = !!(content && target instanceof Node && content.contains(target));
    if (
      !open || closeDisabled || closeAnimationRef.current || reboundAnimationRef.current
      || !body || !window.matchMedia("(max-width: 639px)").matches
      || isNestedScrollTarget(target, body)
      || (fromContent && content.scrollTop > 0)
    ) return;
    swipeRef.current = { source, id, startX: x, startY: y, startedAt: performance.now(), distance: 0, active: false, fromContent };
  };

  const moveSwipe = (source: SheetSwipe["source"], id: number, x: number, y: number) => {
    const swipe = swipeRef.current;
    const body = bodyRef.current;
    const dialog = dialogRef.current;
    if (!swipe || swipe.source !== source || swipe.id !== id || !body || !dialog) return false;
    const distance = y - swipe.startY;
    if (!swipe.active) {
      if (distance < 12 || distance <= Math.abs(x - swipe.startX) * 1.2) return false;
      const content = body.querySelector<HTMLElement>("[data-admin-scroll]");
      if (swipe.fromContent && content && content.scrollTop > 0) {
        swipeRef.current = null;
        return false;
      }
      swipe.active = true;
      body.style.animation = "none";
      dialog.dataset.dragging = "true";
    }
    swipe.distance = Math.max(0, distance);
    body.style.transform = `translateY(${swipe.distance}px)`;
    dialog.style.setProperty("--sheet-backdrop-opacity", String(Math.max(.18, .65 * (1 - swipe.distance / body.clientHeight))));
    return true;
  };

  const finishSwipe = (source: SheetSwipe["source"], id: number, y: number, cancelled = false) => {
    const swipe = swipeRef.current;
    const body = bodyRef.current;
    const dialog = dialogRef.current;
    if (!swipe || swipe.source !== source || swipe.id !== id || !body || !dialog) return;
    swipeRef.current = null;
    if (!swipe.active) return;
    suppressClickUntilRef.current = performance.now() + 350;

    const distance = cancelled ? swipe.distance : Math.max(swipe.distance, y - swipe.startY);
    const elapsed = Math.max(1, performance.now() - swipe.startedAt);
    const farEnough = distance >= Math.min(120, body.clientHeight * .22);
    const quickEnough = distance >= 48 && distance / elapsed >= .6;
    if ((farEnough || (!cancelled && quickEnough)) && !closeDisabled) {
      dialog.style.setProperty("--sheet-backdrop-close-start", dialog.style.getPropertyValue("--sheet-backdrop-opacity") || ".65");
      delete dialog.dataset.dragging;
      dialog.style.removeProperty("--sheet-backdrop-opacity");
      slideOut(onClose);
      return;
    }

    dialog.style.setProperty("--sheet-backdrop-opacity", ".65");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || distance === 0) {
      body.style.removeProperty("transform");
      dialog.style.removeProperty("--sheet-backdrop-opacity");
      delete dialog.dataset.dragging;
      return;
    }

    const animation = body.animate([
      { transform: getComputedStyle(body).transform },
      { transform: "translateY(0)" },
    ], { duration: 220, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards" });
    reboundAnimationRef.current = animation;
    animation.onfinish = () => {
      animation.cancel();
      reboundAnimationRef.current = null;
      body.style.removeProperty("transform");
      dialog.style.removeProperty("--sheet-backdrop-opacity");
      delete dialog.dataset.dragging;
    };
  };

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      closeAnimationRef.current?.cancel();
      closeAnimationRef.current = null;
      clearSwipe();
      delete dialog.dataset.closing;
      if (!dialog.open) dialog.showModal();
      return;
    }

    if (dialog.open) slideOut(() => {});
  }, [open, clearSwipe, slideOut]);

  useLayoutEffect(() => () => {
    closeAnimationRef.current?.cancel();
    reboundAnimationRef.current?.cancel();
  }, []);

  useLayoutEffect(() => {
    if (!closeDisabled) return;
    closeAnimationRef.current?.cancel();
    closeAnimationRef.current = null;
    clearSwipe();
    if (dialogRef.current) delete dialogRef.current.dataset.closing;
  }, [closeDisabled, clearSwipe]);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const touchFor = (touches: TouchList, id: number) => Array.from(touches).find((touch) => touch.identifier === id);
    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const touch = event.changedTouches[0];
      startSwipe("touch", touch.identifier, touch.clientX, touch.clientY, event.target);
    };
    const onMove = (event: TouchEvent) => {
      const swipe = swipeRef.current;
      if (!swipe || swipe.source !== "touch") return;
      const touch = touchFor(event.touches, swipe.id);
      if (touch && moveSwipe("touch", touch.identifier, touch.clientX, touch.clientY) && event.cancelable) event.preventDefault();
    };
    const onEnd = (event: TouchEvent) => {
      const swipe = swipeRef.current;
      if (!swipe || swipe.source !== "touch") return;
      const touch = touchFor(event.changedTouches, swipe.id);
      if (touch) finishSwipe("touch", touch.identifier, touch.clientY);
    };
    const onCancel = (event: TouchEvent) => {
      const swipe = swipeRef.current;
      if (!swipe || swipe.source !== "touch") return;
      const touch = touchFor(event.changedTouches, swipe.id);
      if (touch) finishSwipe("touch", touch.identifier, touch.clientY, true);
    };
    body.addEventListener("touchstart", onStart, { passive: true });
    body.addEventListener("touchmove", onMove, { passive: false });
    body.addEventListener("touchend", onEnd, { passive: true });
    body.addEventListener("touchcancel", onCancel, { passive: true });
    return () => {
      body.removeEventListener("touchstart", onStart);
      body.removeEventListener("touchmove", onMove);
      body.removeEventListener("touchend", onEnd);
      body.removeEventListener("touchcancel", onCancel);
    };
  });

  const requestClose = () => {
    if (closeDisabled || closeAnimationRef.current) return;
    slideOut(onClose);
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) requestClose();
      }}
      className={styles.sheet}
      aria-labelledby={titleId}
    >
      <div
        ref={bodyRef}
        className={styles.sheetBody}
        onPointerDown={(event) => {
          if (event.pointerType === "touch" || !event.isPrimary || event.button !== 0) return;
          startSwipe("mouse", event.pointerId, event.clientX, event.clientY, event.target);
        }}
        onPointerMove={(event) => {
          if (event.pointerType === "touch") return;
          const wasActive = swipeRef.current?.active;
          if (moveSwipe("mouse", event.pointerId, event.clientX, event.clientY) && !wasActive) {
            event.currentTarget.setPointerCapture(event.pointerId);
          }
        }}
        onPointerUp={(event) => finishSwipe("mouse", event.pointerId, event.clientY)}
        onPointerCancel={(event) => finishSwipe("mouse", event.pointerId, event.clientY, true)}
        onLostPointerCapture={(event) => finishSwipe("mouse", event.pointerId, event.clientY, true)}
        onClickCapture={(event) => {
          if (event.detail > 0 && performance.now() < suppressClickUntilRef.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressClickUntilRef.current = 0;
          }
        }}
      >
        <header
          className={styles.sheetHeader}
          data-swipe-enabled={open && !closeDisabled}
        >
          <div className="min-w-0 flex-1">
            <span className={styles.sheetHandle} aria-hidden="true" />
            <h2 id={titleId} className="text-sm font-bold leading-snug">
              {visibleContent.title}
            </h2>
            {visibleContent.description ? (
              <p className="mt-1 text-[0.68rem] leading-relaxed text-ink-muted">{visibleContent.description}</p>
            ) : null}
          </div>
          <button
            type="button"
            autoFocus
            onClick={requestClose}
            disabled={closeDisabled}
            className={adminIconButtonClass}
            aria-label="Panel bezárása"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 fill-none stroke-current" strokeWidth="1.5" strokeLinecap="round"><path d="m5 5 10 10M15 5 5 15" /></svg>
          </button>
        </header>
        <div data-admin-scroll className={styles.sheetContent}>
          {visibleContent.children}
        </div>
      </div>
    </dialog>
  );
}
