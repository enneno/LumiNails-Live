"use client";

import { useRef, type MouseEvent, type TouchEvent } from "react";

type SwipeDirection = "left" | "right";
type SwipeSample = { x: number; at: number };
type SwipeStart = { identifier: number; x: number; y: number; target: EventTarget | null; samples: SwipeSample[] };

const flickWindowMs = 120;
const maxReleasePauseMs = 90;
const minFlickSpeedPxPerMs = 0.45;

function recordSwipePosition(start: SwipeStart, x: number, at: number) {
  const samples = start.samples;
  if (Math.abs(x - samples[samples.length - 1].x) < 3) return;
  samples.push({ x, at });
  while (samples.length > 2 && samples[1].at < at - flickWindowMs) samples.shift();
}

export function useHorizontalSwipe(onSwipe: (direction: SwipeDirection, target: EventTarget | null) => boolean | void) {
  const startRef = useRef<SwipeStart | null>(null);
  const suppressClickRef = useRef<{ until: number; target: EventTarget | null } | null>(null);

  return {
    onTouchStart(event: TouchEvent<HTMLElement>) {
      suppressClickRef.current = null;
      const touch = event.touches.length === 1 ? event.touches.item(0) : null;
      startRef.current = touch
        ? { identifier: touch.identifier, x: touch.clientX, y: touch.clientY, target: event.target, samples: [{ x: touch.clientX, at: performance.now() }] }
        : null;
    },
    onTouchMove(event: TouchEvent<HTMLElement>) {
      const start = startRef.current;
      if (!start || event.touches.length !== 1) {
        startRef.current = null;
        return;
      }
      const touch = event.touches.item(0);
      if (!touch || touch.identifier !== start.identifier) {
        startRef.current = null;
        return;
      }
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      if (Math.abs(deltaY) > 12 && Math.abs(deltaY) > Math.abs(deltaX)) {
        startRef.current = null;
        return;
      }
      recordSwipePosition(start, touch.clientX, performance.now());
    },
    onTouchEnd(event: TouchEvent<HTMLElement>) {
      const start = startRef.current;
      startRef.current = null;
      if (!start || event.touches.length !== 0) return;
      const touch = Array.from(event.changedTouches).find((item) => item.identifier === start.identifier);
      if (!touch) return;
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) return;
      const releasedAt = performance.now();
      recordSwipePosition(start, touch.clientX, releasedAt);
      const samples = start.samples;
      const last = samples[samples.length - 1];
      const recent = samples.find((sample) => sample !== last && sample.at >= last.at - flickWindowMs)
        ?? samples[samples.length - 2];
      if (!recent || releasedAt - last.at > maxReleasePauseMs) return;
      const flickDistance = last.x - recent.x;
      const flickSpeed = Math.abs(flickDistance) / Math.max(1, last.at - recent.at);
      if (Math.sign(flickDistance) !== Math.sign(deltaX) || flickSpeed < minFlickSpeedPxPerMs) return;
      if (onSwipe(deltaX < 0 ? "left" : "right", start.target) === false) return;
      suppressClickRef.current = { until: Date.now() + 350, target: start.target };
      if (event.cancelable) event.preventDefault();
    },
    onTouchCancel() {
      startRef.current = null;
    },
    onClickCapture(event: MouseEvent<HTMLElement>) {
      const swipe = suppressClickRef.current;
      if (!swipe) return;
      if (Date.now() > swipe.until) {
        suppressClickRef.current = null;
        return;
      }
      if (swipe.target instanceof Node && event.target instanceof Node
        && !swipe.target.contains(event.target) && !event.target.contains(swipe.target)) return;
      suppressClickRef.current = null;
      event.preventDefault();
      event.stopPropagation();
    },
  };
}
