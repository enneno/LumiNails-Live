"use client";

import { type RefObject, useEffect } from "react";

// Alerts can be rendered by a child whose state does not rerender the dialog.
// Reveal newly added/changed errors within the native scroll containers, while
// keeping keyboard focus on the control the guest is using.
export function useDialogAlertVisibility(ref: RefObject<HTMLDialogElement | null>, open: boolean) {
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const seen = new Map<Element, string>();
    const reveal = () => {
      for (const alert of dialog.querySelectorAll<HTMLElement>('[role="alert"]')) {
        const message = alert.textContent?.trim() ?? "";
        if (message && seen.get(alert) !== message && alert.getClientRects().length) {
          alert.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
        }
        seen.set(alert, message);
      }
      for (const alert of seen.keys()) if (!dialog.contains(alert)) seen.delete(alert);
    };
    reveal();
    const observer = new MutationObserver(reveal);
    observer.observe(dialog, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [ref, open]);
}
