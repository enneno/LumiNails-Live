"use client";

import {
  type ComponentPropsWithoutRef,
  type InputEvent,
  useLayoutEffect,
  useRef,
} from "react";

type AdminAutoTextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  maxRows?: number;
};

function resizeTextarea(textarea: HTMLTextAreaElement, maxRows: number) {
  textarea.style.height = "auto";

  const styles = window.getComputedStyle(textarea);
  const lineHeight = Number.parseFloat(styles.lineHeight) || 16;
  const verticalChrome =
    Number.parseFloat(styles.paddingTop) +
    Number.parseFloat(styles.paddingBottom) +
    Number.parseFloat(styles.borderTopWidth) +
    Number.parseFloat(styles.borderBottomWidth);
  const minimumHeight = Number.parseFloat(styles.minHeight) || 32;
  const maximumHeight = lineHeight * maxRows + verticalChrome;
  const nextHeight = Math.min(Math.max(textarea.scrollHeight, minimumHeight), maximumHeight);

  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = textarea.scrollHeight > maximumHeight ? "auto" : "hidden";
}

export function AdminAutoTextarea({
  className = "",
  maxRows = 8,
  onInput,
  value,
  ...props
}: AdminAutoTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    resizeTextarea(textarea, maxRows);
    const handleResize = () => resizeTextarea(textarea, maxRows);
    let previousWidth = 0;
    let frame = requestAnimationFrame(handleResize);
    const resizeObserver = new ResizeObserver(([entry]) => {
      const nextWidth = entry.contentRect.width;
      if (Math.abs(nextWidth - previousWidth) < 0.5) return;
      previousWidth = nextWidth;
      // Change height on the next frame, outside ResizeObserver's delivery loop.
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(handleResize);
    });
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) resizeTextarea(textarea, maxRows);
    });

    resizeObserver.observe(textarea);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [maxRows, value]);

  function handleInput(event: InputEvent<HTMLTextAreaElement>) {
    resizeTextarea(event.currentTarget, maxRows);
    onInput?.(event);
  }

  return (
    <textarea
      {...props}
      ref={textareaRef}
      rows={1}
      value={value}
      onInput={handleInput}
      className={`resize-none overflow-y-hidden ${className}`}
    />
  );
}
