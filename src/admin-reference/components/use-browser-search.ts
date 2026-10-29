"use client";

import { useSyncExternalStore } from "react";

function subscribe(changed: () => void) {
  window.addEventListener("popstate", changed);
  return () => window.removeEventListener("popstate", changed);
}

// Build-time HTML has no visitor-specific query. Read it after hydration.
export function useBrowserSearch() {
  return useSyncExternalStore(subscribe, () => window.location.search, () => "");
}
