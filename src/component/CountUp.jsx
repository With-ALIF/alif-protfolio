"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const numberFormatter = new Intl.NumberFormat("en-US");

export default function CountUp({ value }) {
  const match = String(value ?? "")
    .trim()
    .match(/^([^\d-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
  const prefix = match?.[1] ?? "";
  const rawNumber = match?.[2] ?? "";
  const suffix = match?.[3] ?? "";
  const numericValue = match ? Number(rawNumber.replace(/,/g, "")) : null;
  const decimals = rawNumber.includes(".") ? rawNumber.split(".")[1].length : 0;

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const shouldReduceMotion = useReducedMotion();
  const hasValue = numericValue !== null && Number.isFinite(numericValue);
  const [display, setDisplay] = useState(hasValue ? numericValue : 0);

  useEffect(() => {
    if (!hasValue || !inView) return undefined;
    if (shouldReduceMotion) {
      setDisplay(numericValue);
      return undefined;
    }

    let frame;
    const duration = 1100;
    const startedAt = performance.now();
    setDisplay(0);

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(numericValue * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [hasValue, inView, numericValue, shouldReduceMotion]);

  if (!hasValue) return <>{value}</>;

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : numberFormatter.format(Math.round(display));

  return (
    <span ref={ref}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
