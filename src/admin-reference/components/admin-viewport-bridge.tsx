// Viewport/focus effect extracted from the reference AdminPwaBridge.
// LumiNails keeps its existing manifest, service worker, push and zoom policy.
import { useEffect } from "react";
import {
  getAdminElementHiddenEdge,
  revealAdminElement,
  type AdminRevealEdge,
} from "../lib/admin-focus";

export function AdminViewportBridge() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    let settleTimer: ReturnType<typeof setTimeout>;
    let viewportPollTimer: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    let revealOnResize = false;
    let pendingInput: {
      field: HTMLElement;
      edge: AdminRevealEdge | null;
    } | null = null;
    const root = document.documentElement;
    const standalone = window.matchMedia("(display-mode: standalone)");
    function syncDisplayMode() {
      root.toggleAttribute(
        "data-admin-standalone",
        standalone.matches ||
          Boolean(
            (navigator as Navigator & { standalone?: boolean }).standalone,
          ),
      );
    }
    syncDisplayMode();
    standalone.addEventListener("change", syncDisplayMode);

    function activeTextField() {
      const element = document.activeElement;
      return element instanceof HTMLElement &&
        element.matches(
          "textarea, input:not([type='checkbox']):not([type='radio']):not([type='file']):not([type='button']):not([type='submit']), [contenteditable='true']",
        )
        ? element
        : null;
    }

    // iOS keeps the layout viewport behind the keyboard; size the app to
    // the visible viewport so focused fields and sheet actions stay reachable.
    function syncViewport() {
      const viewport = window.visualViewport;
      const field = activeTextField();
      const layoutHeight = window.innerHeight;
      const visibleHeight =
        viewport && Math.abs(viewport.scale - 1) < 0.01
          ? viewport.height
          : layoutHeight;
      const wasKeyboardOpen = root.hasAttribute("data-admin-keyboard");
      const viewportIsContracted = Boolean(
        viewport && layoutHeight - visibleHeight > 120,
      );
      // A focused field may disappear before iOS finishes closing its keyboard.
      // Once keyboard mode has started, keep polling until the visual viewport
      // really reaches its normal height again.
      const keyboardOpen =
        viewportIsContracted && Boolean(field || wasKeyboardOpen);
      root.toggleAttribute("data-admin-keyboard", keyboardOpen);
      clearTimeout(viewportPollTimer);
      // iOS standalone can paint less than 100lvh even without a keyboard.
      // Keep the app and its dock inside that visible viewport. Native browser
      // zoom uses the layout height instead of resizing the app itself.
      root.style.setProperty("--admin-viewport-height", `${visibleHeight}px`);
      if (keyboardOpen && viewport) {
        root.style.setProperty(
          "--admin-viewport-top",
          `${Math.max(0, viewport.offsetTop)}px`,
        );
        // Some iOS standalone versions do not emit the final resize event when
        // the keyboard closes. Poll only while it is open so the normal app
        // height is restored even when WebKit drops that last event.
        viewportPollTimer = setTimeout(syncViewport, 250);
      } else {
        root.style.removeProperty("--admin-viewport-top");
        if (wasKeyboardOpen) {
          requestAnimationFrame(() => {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          });
        }
      }
    }

    function revealFocusedField(hiddenEdge?: AdminRevealEdge) {
      cancelAnimationFrame(frame);
      const field = activeTextField();
      frame = requestAnimationFrame(() => {
        if (field && activeTextField() === field)
          revealAdminElement(field, hiddenEdge);
      });
    }

    function resizeViewport() {
      syncViewport();
      if (revealOnResize) revealFocusedField();
    }

    function focusField() {
      revealOnResize = Boolean(activeTextField());
      settleViewport();
      if (revealOnResize) revealFocusedField();
    }

    function prepareInput() {
      const field = activeTextField();
      // Capture visibility before React updates the form. A visible field
      // must not get a new scrolling correction just because its value changes.
      pendingInput = field
        ? { field, edge: getAdminElementHiddenEdge(field) }
        : null;
      cancelAnimationFrame(frame);
    }

    function editField() {
      const field = activeTextField();
      const hiddenEdge =
        field &&
        (pendingInput?.field === field
          ? pendingInput.edge
          : getAdminElementHiddenEdge(field));
      pendingInput = null;
      cancelAnimationFrame(frame);
      if (hiddenEdge) revealFocusedField(hiddenEdge);
    }

    // Focus and typing may reveal a field as the keyboard opens. A deliberate
    // scroll cancels that assistance; viewport polling must never pull it back.
    function allowManualScroll() {
      revealOnResize = false;
      cancelAnimationFrame(frame);
    }

    function settleViewport() {
      syncViewport();
      clearTimeout(settleTimer);
      // Safari may finish panning after focusout, without a final resize event.
      settleTimer = setTimeout(() => {
        if (!activeTextField()) {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
        syncViewport();
        if (revealOnResize) revealFocusedField();
      }, 350);
    }

    syncViewport();
    window.visualViewport?.addEventListener("resize", resizeViewport);
    window.visualViewport?.addEventListener("scroll", syncViewport);
    window.addEventListener("resize", resizeViewport);
    window.addEventListener("pageshow", settleViewport);
    window.addEventListener("orientationchange", settleViewport);
    document.addEventListener("focusin", focusField);
    document.addEventListener("beforeinput", prepareInput, true);
    document.addEventListener("input", editField);
    document.addEventListener("focusout", settleViewport);
    document.addEventListener("visibilitychange", settleViewport);
    document.addEventListener("touchmove", allowManualScroll, {
      passive: true,
    });
    document.addEventListener("wheel", allowManualScroll, { passive: true });

    return () => {
      window.visualViewport?.removeEventListener("resize", resizeViewport);
      window.visualViewport?.removeEventListener("scroll", syncViewport);
      window.removeEventListener("resize", resizeViewport);
      window.removeEventListener("pageshow", settleViewport);
      window.removeEventListener("orientationchange", settleViewport);
      document.removeEventListener("focusin", focusField);
      document.removeEventListener("beforeinput", prepareInput, true);
      document.removeEventListener("input", editField);
      document.removeEventListener("focusout", settleViewport);
      document.removeEventListener("visibilitychange", settleViewport);
      document.removeEventListener("touchmove", allowManualScroll);
      document.removeEventListener("wheel", allowManualScroll);
      clearTimeout(settleTimer);
      clearTimeout(viewportPollTimer);
      cancelAnimationFrame(frame);
      root.removeAttribute("data-admin-keyboard");
      root.removeAttribute("data-admin-standalone");
      standalone.removeEventListener("change", syncDisplayMode);
      document.documentElement.style.removeProperty("--admin-viewport-height");
      document.documentElement.style.removeProperty("--admin-viewport-top");
    };
  }, []);

  return null;
}
