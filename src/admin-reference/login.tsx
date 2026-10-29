import React, { useLayoutEffect, useRef, useState } from "react";
import { AdminLoginForm } from "./components/admin-login-form";
export function LoginScreen({ error = "" }: { error?: string }) {
  const viewport = useRef<HTMLElement>(null),
    content = useRef<HTMLElement>(null);
  const [scrollable, setScrollable] = useState(false);
  useLayoutEffect(() => {
    const frame = viewport.current,
      section = content.current;
    if (!frame || !section) return;
    const measure = () => {
      const style = getComputedStyle(frame);
      setScrollable(
        section.getBoundingClientRect().height +
          parseFloat(style.paddingTop) +
          parseFloat(style.paddingBottom) >
          frame.clientHeight + 1,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(section);
    measure();
    return () => observer.disconnect();
  }, []);
  return (
    <main
      ref={viewport}
      data-admin-scroll
      className={`grid h-full min-h-0 place-items-center ${scrollable ? "overflow-y-auto" : "overflow-y-hidden"} overscroll-none bg-admin-shell px-4 py-8 text-ink sm:px-6`}
      style={{
        paddingTop: "max(2.5rem, env(safe-area-inset-top))",
        paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))",
      }}
    >
      <section ref={content} className="w-full max-w-xs">
        <div className="mb-5 flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl bg-gold-dark/10 font-display text-xl font-semibold text-gold-dark"
            aria-hidden="true"
          >
            LN
          </div>
          <span className="text-sm font-semibold">LumiNails</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Üdv újra!</h1>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          A szalonod egy helyen. Lépj be a jelszavaddal.
        </p>
        <AdminLoginForm externalError={error} />
      </section>
    </main>
  );
}
