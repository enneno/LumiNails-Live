function visibleAdminBounds(element: HTMLElement) {
  const scroller = element.closest<HTMLElement>("[data-admin-scroll]");
  if (!scroller) return null;
  const bounds = scroller.getBoundingClientRect();
  const viewport = window.visualViewport;
  const viewportTop = viewport?.offsetTop ?? 0;
  return {
    scroller,
    top: Math.max(bounds.top, viewportTop),
    bottom: Math.min(bounds.bottom, viewportTop + (viewport?.height ?? window.innerHeight)),
  };
}

export type AdminRevealEdge = "top" | "bottom";

export function getAdminElementHiddenEdge(element: HTMLElement): AdminRevealEdge | null {
  const bounds = visibleAdminBounds(element);
  if (!bounds) return null;
  const field = element.getBoundingClientRect();
  return field.top < bounds.top ? "top" : field.bottom > bounds.bottom ? "bottom" : null;
}

/** A captured edge also corrects Safari's native centering of a hidden caret. */
export function revealAdminElement(element: HTMLElement, hiddenEdge?: AdminRevealEdge) {
  const bounds = visibleAdminBounds(element);
  if (!bounds) return;
  const field = element.getBoundingClientRect();
  const edge = hiddenEdge ?? (field.top < bounds.top ? "top" : field.bottom > bounds.bottom ? "bottom" : null);
  if (!edge) return;
  const alignTop = edge === "top" || field.height > bounds.bottom - bounds.top;
  const delta = alignTop ? field.top - bounds.top : field.bottom - bounds.bottom;
  // WebKit rounds scroll offsets to whole pixels. Round toward visibility so
  // a fraction of the field never stays underneath the keyboard.
  const target = bounds.scroller.scrollTop + delta;
  const scrollTop = alignTop ? Math.floor(target) : Math.ceil(target);
  if (scrollTop !== bounds.scroller.scrollTop) bounds.scroller.scrollTo({ top: scrollTop, behavior: "instant" });
}
