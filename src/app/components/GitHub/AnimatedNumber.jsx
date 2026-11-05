"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { formatNumber } from "./utils";

export default function AnimatedNumber({ value, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const shouldReduceMotion = useReducedMotion();
  const normalizedValue = typeof value === "string" ? value.trim() : value;
  const numericValue = Number(normalizedValue);
  const hasValue =
    normalizedValue !== null &&
    normalizedValue !== undefined &&
    normalizedValue !== "" &&
    !(typeof normalizedValue === "number" && !Number.isFinite(normalizedValue));
  const isNumeric = hasValue && Number.isFinite(numericValue);
  const [display, setDisplay] = useState(isNumeric ? numericValue : 0);

  useEffect(() => {
    if (!isNumeric || !inView) return undefined;
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
      setDisplay(Math.round(numericValue * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, isNumeric, numericValue, shouldReduceMotion]);

  if (!hasValue) {
    return <span className={className}>—</span>;
  }

  if (!isNumeric) {
    return (
      <span ref={ref} className={className}>
        {String(normalizedValue)}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {formatNumber(display)}
    </span>
  );
}
